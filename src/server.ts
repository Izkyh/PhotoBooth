import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { 
    initDb, 
    authenticateUser, 
    getFrames, 
    createFrameWithSlots,
    updateFrameWithSlots,
    deleteFrame,
    getFrameById
} from './db/database';

const app = express();
const port = 3001;

app.use(cors());
// Perbesar limit karena kita mengirim gambar base64 yang besar
app.use(bodyParser.json({ limit: '50mb' })); 

// Auth
app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const isAuthenticated = await authenticateUser(username, password);
  if (isAuthenticated) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get All Frames (List)
app.get('/frames', async (_req: Request, res: Response) => {
  try {
      const frames = await getFrames();
      res.json(frames);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching frames" });
  }
});

// Get Single Frame Detail (For editing or booth)
app.get('/frames/:id', async (req: Request, res: Response) => {
    try {
        const frame = await getFrameById(parseInt(req.params.id));
        if (frame) {
            res.json(frame);
        } else {
            res.status(404).json({ message: "Frame not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching frame detail" });
    }
});

// Create New Frame (From Editor)
app.post('/frames', async (req: Request, res: Response) => {
    try {
        // Payload dari AdminFrameEditor.tsx (sudah diupdate)
        const { name, bgImageData, slots } = req.body;
        
        // Validasi simpel
        if (!name || !bgImageData || !slots) {
            return res.status(400).json({ message: "Missing required fields: name, bgImageData, slots" });
        }

        const result = await createFrameWithSlots(name, bgImageData, slots);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create frame" });
    }
});

// Update Frame
app.put('/frames/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, bgImageData, slots } = req.body;

        if (!name || !bgImageData || !slots) {
            return res.status(400).json({ message: "Missing required fields: name, bgImageData, slots" });
        }

        const result = await updateFrameWithSlots(parseInt(id), name, bgImageData, slots);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update frame" });
    }
});


// Delete Frame
app.delete('/frames/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const success = await deleteFrame(parseInt(id));
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ message: 'Frame not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete frame' });
    }
});

initDb().then(() => {
    console.log("Database initialized");
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(console.error);