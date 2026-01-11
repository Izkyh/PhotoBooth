import bcrypt from "bcryptjs";
import { Pool } from "pg";
import sharp from 'sharp';

// Gunakan Env Variable agar fleksibel (Local vs Docker)
const pool = new Pool({
  user: process.env.DB_USER || "user",
  host: process.env.DB_HOST || "db", // 'db' jika di docker, 'localhost' jika di local
  database: process.env.DB_NAME || "photobooth",
  password: process.env.DB_PASSWORD || "password",
  port: parseInt(process.env.DB_PORT || "5432"),
});

const saltRounds = 10;

// === 1. INITIALIZATION ===
const createTables = async () => {
  const client = await pool.connect();
  try {
    // Tabel Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);
    
    // Tabel Frame (Struktur Baru)
    // - bg_image_data menyimpan base64 dari gambar background original
    // - thumbnail_url menyimpan base64 dari thumbnail yang di-generate
    await client.query(`
      CREATE TABLE IF NOT EXISTS frames (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        bg_image_data TEXT NOT NULL, 
        thumbnail_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabel Slots (Struktur Baru dengan float/relative)
    await client.query(`
      CREATE TABLE IF NOT EXISTS frame_slots (
        id SERIAL PRIMARY KEY,
        frame_id INT REFERENCES frames(id) ON DELETE CASCADE,
        relative_x FLOAT NOT NULL,
        relative_y FLOAT NOT NULL,
        relative_width FLOAT NOT NULL,
        relative_height FLOAT NOT NULL
      );
    `);
  } finally {
    client.release();
  }
};

const seedSuperAdmin = async () => {
  const client = await pool.connect();
  try {
    const hashedPassword = await bcrypt.hash("superadmin", saltRounds);
    await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING",
      ["superadmin", hashedPassword]
    );
  } finally {
    client.release();
  }
};

export const initDb = async () => {
  await createTables();
  await seedSuperAdmin();
};

// === 2. AUTHENTICATION ===
export const authenticateUser = async (username: string, password: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return false;
    const user = result.rows[0];
    return await bcrypt.compare(password, user.password);
  } finally {
    client.release();
  }
};


// === Helper Functions ===
const generateThumbnail = async (base64Data: string): Promise<string> => {
  const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
  const thumbnailBuffer = await sharp(buffer)
    .resize(200) // Resize to a width of 200px, height will be auto-scaled
    .jpeg({ quality: 80 })
    .toBuffer();
  return `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
};


// === 3. FRAME OPERATIONS (NEW) ===

// Mengambil semua frame untuk list
// Hanya mengambil thumbnail untuk efisiensi
export const getFrames = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        f.id, 
        f.name, 
        f.bg_image_data as "bgImageData", -- Ambil gambar asli, bukan thumbnail, biar tajam
        f.created_at as "createdAt",
        -- Ambil data slots sebagai JSON array
        COALESCE(
          json_agg(
            json_build_object(
              'relativeX', s.relative_x,
              'relativeY', s.relative_y,
              'relativeWidth', s.relative_width,
              'relativeHeight', s.relative_height
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as slots
      FROM frames f 
      LEFT JOIN frame_slots s ON f.id = s.frame_id 
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `);
    return result.rows;
  } finally {
    client.release();
  }
};

// Mengambil 1 frame detail beserta slots-nya (untuk Edit atau dipakai Booth)
export const getFrameById = async (id: number) => {
    const client = await pool.connect();
    try {
        const frameRes = await client.query(`
          SELECT 
            id, 
            name, 
            bg_image_data as "bgImageData",
            created_at as "createdAt"
          FROM frames WHERE id = $1
        `, [id]);

        if (frameRes.rows.length === 0) return null;

        const slotsRes = await client.query(`
          SELECT 
            id,
            relative_x as "relativeX",
            relative_y as "relativeY",
            relative_width as "relativeWidth",
            relative_height as "relativeHeight"
          FROM frame_slots 
          WHERE frame_id = $1
        `, [id]);
        
        return {
            ...frameRes.rows[0],
            slots: slotsRes.rows
        };
    } finally {
        client.release();
    }
}

// Tipe untuk slot
export interface FrameSlotData {
  relativeX: number;
  relativeY: number;
  relativeWidth: number;
  relativeHeight: number;
}

// Menyimpan Frame Baru + Slots (Transaction)
export const createFrameWithSlots = async (
  name: string,
  bgImageData: string,
  slots: FrameSlotData[]
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Mulai Transaksi
    
    // Generate thumbnail
    const thumbnailUrl = await generateThumbnail(bgImageData);

    // 1. Insert Frame Header
    const frameRes = await client.query(
      "INSERT INTO frames (name, bg_image_data, thumbnail_url) VALUES ($1, $2, $3) RETURNING id",
      [name, bgImageData, thumbnailUrl]
    );
    const frameId = frameRes.rows[0].id;

    // 2. Insert Slots (Looping)
    for (const slot of slots) {
      await client.query(
        "INSERT INTO frame_slots (frame_id, relative_x, relative_y, relative_width, relative_height) VALUES ($1, $2, $3, $4, $5)",
        [frameId, slot.relativeX, slot.relativeY, slot.relativeWidth, slot.relativeHeight]
      );
    }

    await client.query('COMMIT'); // Simpan permanen
    return { success: true, frameId };
  } catch (e) {
    await client.query('ROLLBACK'); // Batalkan jika error
    console.error("Failed to create frame:", e);
    throw e;
  } finally {
    client.release();
  }
};


// Mengupdate Frame + Slots (Transaction)
export const updateFrameWithSlots = async (
  id: number,
  name: string,
  bgImageData: string,
  slots: FrameSlotData[]
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Mulai Transaksi
    
    // Generate thumbnail
    const thumbnailUrl = await generateThumbnail(bgImageData);

    // 1. Update Frame Header
    await client.query(
      "UPDATE frames SET name = $1, bg_image_data = $2, thumbnail_url = $3 WHERE id = $4",
      [name, bgImageData, thumbnailUrl, id]
    );

    // 2. Hapus slot lama
    await client.query("DELETE FROM frame_slots WHERE frame_id = $1", [id]);

    // 3. Insert slot baru
    for (const slot of slots) {
      await client.query(
        "INSERT INTO frame_slots (frame_id, relative_x, relative_y, relative_width, relative_height) VALUES ($1, $2, $3, $4, $5)",
        [id, slot.relativeX, slot.relativeY, slot.relativeWidth, slot.relativeHeight]
      );
    }

    await client.query('COMMIT'); // Simpan permanen
    return { success: true, frameId: id };
  } catch (e) {
    await client.query('ROLLBACK'); // Batalkan jika error
    console.error("Failed to update frame:", e);
    throw e;
  } finally {
    client.release();
  }
};


export const deleteFrame = async (id: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query("DELETE FROM frames WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
};