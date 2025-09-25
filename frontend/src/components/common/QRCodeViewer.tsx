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
  Chip,
} from "@mui/material";
import QRCode from "qrcode";
import { generateQRCode } from "../../features/registrations/registrationsApi";

interface QRCodeViewerProps {
  open: boolean;
  onClose: () => void;
  registrationId: number;
  eventName: string;
}

export default function QRCodeViewer({ open, onClose, registrationId, eventName }: QRCodeViewerProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>("");

  const generateQR = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateQRCode(registrationId);
      const qrCodeDataUrl = await QRCode.toDataURL(result.qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrCodeDataUrl);
      setExpiresAt(result.expiresAt);
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
      setExpiresAt("");
    }
  }, [open, registrationId]);

  const formatExpiryTime = (expiry: string) => {
    try {
      const date = new Date(expiry);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return expiry;
    }
  };

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
                  p: 2,
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                }}
              >
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ display: "block", maxWidth: "100%" }}
                />
              </Box>
              
              <Stack spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Mã QR này chỉ có hiệu lực một lần và sẽ hết hạn sau khi đóng cửa sổ này
                </Typography>
                {expiresAt && (
                  <Chip
                    label={`Hết hạn: ${formatExpiryTime(expiresAt)}`}
                    color="warning"
                    size="small"
                  />
                )}
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
