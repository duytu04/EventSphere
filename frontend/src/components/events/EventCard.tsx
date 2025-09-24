import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SeatsChip from "./SeatsChip";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1600&auto=format&fit=crop";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export interface EventCardData {
  id: number;
  name: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  mainImageUrl?: string;
  category?: string;
  seatsAvailable?: number | null;
  capacity?: number | null;
}

interface EventCardProps {
  event: EventCardData;
  onClick?: () => void;
  actionLabel?: string;
}

function formatDateRange(start?: string, end?: string) {
  if (!start) return "Thời gian sẽ được cập nhật";
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return "Thời gian sẽ được cập nhật";

  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  };
  const startLabel = startDate.toLocaleString("vi-VN", opts);

  if (!end) {
    return startLabel;
  }

  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) {
    return startLabel;
  }

  const sameDay = startDate.toDateString() === endDate.toDateString();
  const endLabel = endDate.toLocaleString(
    "vi-VN",
    sameDay
      ? { hour: "2-digit", minute: "2-digit" }
      : opts
  );

  return startLabel + " - " + endLabel;
}

function resolveImageUrl(raw?: string | null): string {
  if (!raw || !raw.trim()) {
    return FALLBACK_IMAGE;
  }
  const url = raw.trim();
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const base = API_BASE.replace(/\/$/, "");
  if (!base) {
    return url.startsWith("/") ? url : "/" + url;
  }
  if (url.startsWith("/")) {
    return base + url;
  }
  return base + "/" + url;
}

export default function EventCard({ event, onClick, actionLabel }: EventCardProps) {
  const theme = useTheme();
  const dateText = formatDateRange(event.startTime, event.endTime);
  const imageUrl = resolveImageUrl(event.mainImageUrl);

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: theme.shadows[6],
        backgroundColor: alpha(theme.palette.background.paper, 0.94),
      }}
    >
      <CardActionArea
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
        onClick={onClick}
      >
        <Box sx={{ position: "relative", width: "100%", bgcolor: theme.palette.background.default }}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt={event.name}
            sx={{
              height: 240,
              width: "100%",
              objectFit: "contain",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)",
            }}
          />
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              position: "absolute",
              left: 16,
              bottom: 16,
              zIndex: 1,
              backgroundColor: alpha(theme.palette.common.black, 0.45),
              backdropFilter: "blur(10px)",
              borderRadius: 999,
              px: 2,
              py: 0.5,
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: theme.palette.common.white }} />
            <Typography variant="caption" color="common.white" fontWeight={600}>
              {dateText}
            </Typography>
          </Stack>
        </Box>

        <CardContent sx={{ flexGrow: 1, width: "100%" }}>
          <Stack spacing={1.75}>
            <Typography variant="h6" fontWeight={700}>
              {event.name}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
              <LocationOnRoundedIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                {event.location || "Địa điểm đang cập nhật"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {event.category && (
                <Chip label={event.category} color="primary" size="small" sx={{ borderRadius: 2 }} />
              )}
              <SeatsChip seatsAvailable={event.seatsAvailable} capacity={event.capacity} />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5} color="primary.main">
              <Typography variant="body2" fontWeight={600}>
                {actionLabel || "Xem chi tiết"}
              </Typography>
              <ChevronRightRoundedIcon fontSize="small" />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
