import { ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";

export type OrganizerEventPreview = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  status: string;
  ticketsSold: number;
  capacity: number;
  category?: string;
  image?: string;
  description?: string;
};

type Props = {
  open: boolean;
  event: OrganizerEventPreview | null;
  onClose: () => void;
};

function formatRange(start?: string, end?: string) {
  if (!start) return "—";
  try {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : undefined;
    const sameDay = endDate && startDate.toDateString() === endDate.toDateString();
    const fmtDate = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    if (!endDate) return fmtDate.format(startDate);
    if (sameDay) {
      const fmtTime = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${fmtDate.format(startDate)} – ${fmtTime.format(endDate)}`;
    }
    return `${fmtDate.format(startDate)} → ${fmtDate.format(endDate)}`;
  } catch {
    return start;
  }
}

export default function OrganizerEventDetailDrawer({ open, event, onClose }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();

  const progress = useMemo(() => {
    if (!event || !event.capacity) return 0;
    return Math.min(100, Math.round((event.ticketsSold / event.capacity) * 100));
  }, [event]);

  const handleEdit = () => {
    if (!event) return;
    navigate(`/organizer/events/${event.id}/edit`);
  };

  const handleAttendance = () => {
    if (!event) return;
    navigate(`/organizer/attendance?event=${encodeURIComponent(event.id)}`);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: "100vw", sm: 480, md: 560 },
          p: 3,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="overline" sx={{ opacity: 0.7 }}>
              Chi tiết sự kiện
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {event?.name ?? "—"}
            </Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        {event ? (
          <Stack spacing={3}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: (t) => `1px solid ${alpha(t.palette.divider, 0.2)}`,
              }}
            >
              {event.image ? (
                <Box
                  component="img"
                  src={event.image}
                  alt={event.name}
                  sx={{ width: "100%", height: 220, objectFit: "cover" }}
                />
              ) : (
                <Box
                  sx={{
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: alpha(theme.palette.primary.main, 0.08),
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    Chưa có ảnh sự kiện
                  </Typography>
                </Box>
              )}

              <Stack spacing={2} sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label={event.status} color={progress >= 80 ? "success" : progress >= 50 ? "primary" : "default"} />
                  {event.category ? <Chip label={event.category} variant="outlined" /> : null}
                </Stack>

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="body2">{formatRange(event.startDate, event.endDate)}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PlaceRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="body2">{event.location}</Typography>
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  <LinearProgress value={progress} variant="determinate" sx={{ height: 8, borderRadius: 999 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {event.ticketsSold}/{event.capacity} khách đã check-in / đăng ký
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {progress}%
                    </Typography>
                  </Stack>
                </Stack>

                {event.description ? (
                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                ) : null}
              </Stack>
            </Box>

            <CardActionsRow onEdit={handleEdit} onAttendance={handleAttendance} />

            <Divider />

            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Số liệu nhanh
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <InfoChip icon={<GroupRoundedIcon fontSize="small" />} label="Sức chứa" value={`${event.capacity} khách`} />
                <InfoChip icon={<GroupRoundedIcon fontSize="small" />} label="Đã đăng ký" value={`${event.ticketsSold} khách`} />
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Chọn một sự kiện để xem chi tiết.
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}

type InfoChipProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function InfoChip({ icon, label, value }: InfoChipProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
      }}
    >
      {icon}
      <Stack spacing={0.25}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
}

type CardActionsRowProps = {
  onEdit: () => void;
  onAttendance: () => void;
};

function CardActionsRow({ onEdit, onAttendance }: CardActionsRowProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <Button variant="contained" startIcon={<EditCalendarRoundedIcon />} onClick={onEdit} sx={{ borderRadius: 2 }}>
        Chỉnh sửa sự kiện
      </Button>
      <Button variant="outlined" startIcon={<QrCodeScannerRoundedIcon />} onClick={onAttendance} sx={{ borderRadius: 2 }}>
        Mở điểm danh
      </Button>
    </Stack>
  );
}
