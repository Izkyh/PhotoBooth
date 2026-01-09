import { useRef, useState, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: 'user' 
        },
        audio: false,
      });
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
      console.error(err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // ✅ FIX MIRROR: Flip horizontal untuk undo selfie mirror effect
    ctx.save();
    ctx.scale(-1, 1); // Flip horizontal
    ctx.drawImage(
      videoRef.current, 
      -canvas.width, // Start dari kanan
      0, 
      canvas.width, 
      canvas.height
    );
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  return {
    videoRef,
    stream,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  };
};
