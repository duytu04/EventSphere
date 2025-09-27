import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import QRCode from "qrcode";

interface QRCodeViewerProps {
  open: boolean;
  onClose: () => void;
  registrationId: number;
  eventId: number;
  eventName: string;
  eventImageUrl?: string;
}

export default function QRCodeViewer({ open, onClose, registrationId, eventId, eventName, eventImageUrl }: QRCodeViewerProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shortCode, setShortCode] = useState<string>("");

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a short, simple QR code content
      // Format: EVT:eventId:SHORT (backend expects eventId, not registrationId)
      const qrContent = `EVT:${eventId}:${Date.now().toString(36).toUpperCase()}`;
      setShortCode(qrContent);
      
      // Generate QR code with higher error correction for logo
      const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: 'H', // High error correction for logo
      });
      
      // Create canvas to add logo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 400;
      canvas.height = 400;
      
      img.onload = () => {
        if (ctx) {
          // Draw QR code
          ctx.drawImage(img, 0, 0, 400, 400);
          
          // Draw white circle in center (larger for better visibility)
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(200, 200, 50, 0, 2 * Math.PI);
          ctx.fill();
          
          if (eventImageUrl) {
            // Load and draw event image
            const eventImg = new Image();
            eventImg.crossOrigin = 'anonymous';
            eventImg.onload = () => {
              if (ctx) {
                // Draw event image in center with proper scaling
                ctx.save();
                ctx.beginPath();
                ctx.arc(200, 200, 45, 0, 2 * Math.PI);
                ctx.clip();
                
                // Calculate image dimensions to fit perfectly in circle
                const circleRadius = 45;
                const imageSize = circleRadius * 2; // 90px
                const centerX = 200;
                const centerY = 200;
                
                // Calculate position to center the image perfectly
                const x = centerX - imageSize/2; // 155
                const y = centerY - imageSize/2; // 155
                
                // Set image smoothing for better quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Draw image centered in the circle
                ctx.drawImage(eventImg, x, y, imageSize, imageSize);
                ctx.restore();
                
                // Convert to data URL
                const finalDataUrl = canvas.toDataURL('image/png');
                setQrCodeUrl(finalDataUrl);
              }
            };
            eventImg.onerror = () => {
              // Fallback to text if image fails to load
              if (ctx) {
                ctx.fillStyle = '#1976d2';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('EVENT', 200, 195);
                ctx.fillText('LOGO', 200, 215);
                
                const finalDataUrl = canvas.toDataURL('image/png');
                setQrCodeUrl(finalDataUrl);
              }
            };
            eventImg.src = eventImageUrl;
          } else {
            // Draw event name as text
            ctx.fillStyle = '#1976d2';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            const words = eventName.split(' ');
            const firstWord = words[0] || 'EVENT';
            const secondWord = words[1] || 'LOGO';
            ctx.fillText(firstWord, 200, 195);
            ctx.fillText(secondWord, 200, 215);
            
            // Convert to data URL
            const finalDataUrl = canvas.toDataURL('image/png');
            setQrCodeUrl(finalDataUrl);
          }
        }
      };
      
      img.src = qrCodeDataUrl;
      
    } catch (err: any) {
      setError(err?.message || "Không thể tạo mã QR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      generateQR();
    } else {
      setQrCodeUrl("");
      setError(null);
      setShortCode("");
    }
  }, [open, registrationId]);


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Vé điện tử - {eventName}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} alignItems="center">
          {loading && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Đang tạo mã QR...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          {qrCodeUrl && !loading && (
            <>
              <Box
                sx={{
                  p: 3,
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 3,
                  backgroundColor: "background.paper",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code with Event Logo" 
                  style={{ 
                    display: "block", 
                    maxWidth: "100%", 
                    maxHeight: "400px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
              </Box>
              
              <Stack spacing={2} alignItems="center" sx={{ width: "100%" }}>
                <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Mã QR ngắn gọn cho sự kiện
                  </Typography>
                  <Box
                    sx={{
                      p: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      backgroundColor: "background.paper",
                      width: "100%",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      fontFamily="monospace" 
                      textAlign="center"
                      sx={{ wordBreak: "break-all" }}
                    >
                      {shortCode}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    Mã này có thể được sử dụng để check-in thủ công
                  </Typography>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
        <Button onClick={generateQR} variant="contained" disabled={loading}>
          Tạo mã QR mới
        </Button>
      </DialogActions>
    </Dialog>
  );
}
