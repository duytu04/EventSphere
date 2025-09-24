import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

type MediaType = "video" | "photo" | "document";
type MediaItem = {
  id: string;
  title: string;
  type: MediaType;
  eventName: string;
  uploadedAt: string;
  sizeLabel: string;
  thumbnail: string;
  description?: string;
  duration?: string;
};

const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "MEDIA-401",
    title: "Highlight Tech Innovators 2025",
    type: "video",
    eventName: "Tech Innovators Summit 2025",
    uploadedAt: "2025-10-15T09:00:00",
    sizeLabel: "420 MB",
    duration: "03:24",
    thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1000&auto=format&fit=crop",
    description: "Video recap ngắn giới thiệu các khoảnh khắc nổi bật và trích dẫn từ diễn giả.",
  },
  {
    id: "MEDIA-388",
    title: "Ảnh hậu trường workshop UX",
    type: "photo",
    eventName: "Workshop: Thiết kế trải nghiệm người dùng",
    uploadedAt: "2025-11-03T18:20:00",
    sizeLabel: "18 ảnh • 95 MB",
    thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1000&auto=format&fit=crop",
    description: "Album ảnh hậu trường buổi workshop với mentor và học viên.",
  },
  {
    id: "MEDIA-372",
    title: "Slide keynote Music & Art Night",
    type: "document",
    eventName: "Music & Art Night",
    uploadedAt: "2024-08-18T10:15:00",
    sizeLabel: "12 trang • 4.2 MB",
    thumbnail: "https://images.unsplash.com/photo-1455894127589-22f75500213a?w=1000&auto=format&fit=crop",
    description: "Slide thuyết trình chia sẻ kinh nghiệm xây dựng cộng đồng sáng tạo.",
  },
];

const TYPE_META: Record<MediaType, { label: string; icon: React.ReactNode; color: string }> = {
  video: {
    label: "Video",
    icon: <PlayCircleFilledRoundedIcon fontSize="small" />,
    color: "#4F46E5",
  },
  photo: {
    label: "Album ảnh",
    icon: <ImageRoundedIcon fontSize="small" />,
    color: "#059669",
  },
  document: {
    label: "Tài liệu",
    icon: <DescriptionRoundedIcon fontSize="small" />,
    color: "#F97316",
  },
};

function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function MyMedia() {
  const theme = useTheme();

  const summary = {
    total: MEDIA_ITEMS.length,
    video: MEDIA_ITEMS.filter((m) => m.type === "video").length,
    photo: MEDIA_ITEMS.filter((m) => m.type === "photo").length,
    document: MEDIA_ITEMS.filter((m) => m.type === "document").length,
  };

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              Thư viện media
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý video, ảnh và tài liệu bạn nhận được từ các sự kiện đã tham gia.
            </Typography>
          </Stack>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Tổng cộng {summary.total} media
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${summary.video} video`} size="small" />
                  <Chip label={`${summary.photo} album ảnh`} size="small" />
                  <Chip label={`${summary.document} tài liệu`} size="small" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {MEDIA_ITEMS.map((item) => {
              const meta = TYPE_META[item.type];
              return (
                <Grid key={item.id} item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                    <Box
                      component="div"
                      sx={{
                        position: "relative",
                        pt: "56.25%",
                        backgroundImage: `linear-gradient(180deg, ${alpha(meta.color, 0.12)}, ${alpha(meta.color, 0.06)}), url(${item.thumbnail})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderTopLeftRadius: (theme) => theme.shape.borderRadius * 3,
                        borderTopRightRadius: (theme) => theme.shape.borderRadius * 3,
                      }}
                    />

                    <CardHeader
                      title={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            icon={meta.icon}
                            label={meta.label}
                            size="small"
                            sx={{
                              backgroundColor: alpha(meta.color, 0.12),
                              color: meta.color,
                            }}
                          />
                          {item.duration ? (
                            <Chip label={item.duration} size="small" variant="outlined" />
                          ) : null}
                        </Stack>
                      }
                      subheader={<Typography variant="subtitle1" fontWeight={700}>{item.title}</Typography>}
                    />

                    <Divider />

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={1.5}>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Stack direction="row" spacing={1} color="text.secondary">
                          <Typography variant="body2">{item.eventName}</Typography>
                          <Typography variant="body2">•</Typography>
                          <Typography variant="body2">Tải lên {formatDateTime(item.uploadedAt)}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Kích thước: {item.sizeLabel}
                        </Typography>
                      </Stack>
                    </CardContent>

                    <Divider />

                    <CardContent>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button variant="contained" startIcon={<VisibilityRoundedIcon />} sx={{ borderRadius: 2 }}>
                          Xem trực tuyến
                        </Button>
                        <Button variant="outlined" startIcon={<DownloadRoundedIcon />} sx={{ borderRadius: 2 }}>
                          Tải về
                        </Button>
                        <Button variant="text" startIcon={<LinkRoundedIcon />} sx={{ borderRadius: 2 }}>
                          Sao chép liên kết
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
