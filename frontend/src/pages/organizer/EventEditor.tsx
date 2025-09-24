import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";

const CATEGORY_SUGGESTIONS = ["Công nghệ", "Kinh doanh", "Nghệ thuật", "Giáo dục", "Thể thao"];

export default function EventEditor() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isEditing = Boolean(params.id && params.id !== "new");

  const [form, setForm] = useState({
    name: isEditing ? "Tech Innovators Summit" : "",
    description: isEditing
      ? "Sự kiện quy tụ cộng đồng đổi mới sáng tạo với các phiên thảo luận, workshop và khu trải nghiệm."
      : "",
    mainImageUrl: isEditing
      ? "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop"
      : "",
    category: CATEGORY_SUGGESTIONS[0],
    location: "Trung tâm Hội nghị GEM",
    startTime: "2025-10-01T08:00",
    endTime: "2025-10-01T17:30",
    capacity: 500,
  });

  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const pageTitle = useMemo(
    () => (isEditing ? `Chỉnh sửa sự kiện ${params.id}` : "Tạo sự kiện mới"),
    [isEditing, params.id]
  );

  const scheduleLabel = useMemo(() => {
    if (!form.startTime) return "—";
    try {
      const start = new Date(form.startTime);
      const end = form.endTime ? new Date(form.endTime) : undefined;
      const fmtDate = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      if (!end) return fmtDate.format(start);
      const sameDay = start.toDateString() === end.toDateString();
      if (sameDay) {
        const fmtTime = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });
        return `${fmtDate.format(start)} – ${fmtTime.format(end)}`;
      }
      return `${fmtDate.format(start)} → ${fmtDate.format(end)}`;
    } catch {
      return "—";
    }
  }, [form.startTime, form.endTime]);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      navigate("/organizer/events", { replace: true });
    }, 1200);
  };

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Stack spacing={3}>
      <Button onClick={() => navigate(-1)} startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>
        Quay lại
      </Button>

      <Card sx={{ borderRadius: 3 }}>
        <CardHeader
          title={pageTitle}
          subheader="Điền thông tin chi tiết để sự kiện của bạn sẵn sàng ra mắt"
          action={
            <Chip
              color={isEditing ? "primary" : "default"}
              label={isEditing ? "Đang chỉnh sửa" : "Bản nháp"}
              variant={isEditing ? "filled" : "outlined"}
            />
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <TextField
                  label="Tên sự kiện"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ví dụ: Tech Innovators Summit"
                  required
                  fullWidth
                />

                <TextField
                  label="Mô tả"
                  multiline
                  minRows={5}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Chia sẻ điểm nổi bật, agenda và thông tin khách mời"
                />

                <Stack spacing={1.5}>
                  <TextField
                    label="Ảnh đại diện (URL)"
                    placeholder="https://..."
                    value={form.mainImageUrl}
                    onChange={(e) => handleChange("mainImageUrl", e.target.value)}
                    fullWidth
                  />
                  {form.mainImageUrl?.trim() ? (
                    <Box
                      component="img"
                      src={form.mainImageUrl}
                      alt="preview"
                      sx={{
                        width: "100%",
                        borderRadius: 2,
                        maxHeight: 220,
                        objectFit: "cover",
                        border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
                      }}
                      onError={(ev) => ((ev.currentTarget.style.display = "none"))}
                    />
                  ) : null}
                </Stack>

                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Lịch trình
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="Bắt đầu"
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => handleChange("startTime", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Kết thúc"
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                </Stack>

                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Vé & giới hạn
                  </Typography>
                  <TextField
                    label="Sức chứa"
                    type="number"
                    value={form.capacity}
                    onChange={(e) => handleChange("capacity", Number(e.target.value))}
                    inputProps={{ min: 0 }}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <TextField
                  label="Danh mục"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  helperText={`Gợi ý: ${CATEGORY_SUGGESTIONS.join(", ")}`}
                  fullWidth
                />

                <TextField
                  label="Địa điểm"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Nhập địa điểm tổ chức"
                  fullWidth
                />

                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    size="large"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {saving ? "Đang lưu..." : "Lưu sự kiện"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewRoundedIcon />}
                    size="large"
                    sx={{ borderRadius: 2 }}
                    onClick={scrollToPreview}
                  >
                    Xem trước sự kiện
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<AutoAwesomeRoundedIcon />}
                    size="large"
                    sx={{ borderRadius: 2 }}
                  >
                    Gợi ý chương trình
                  </Button>
                </Stack>

                <Card
                  ref={previewRef}
                  id="event-preview"
                  sx={{ borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}
                >
                  {form.mainImageUrl ? (
                    <Box
                      component="img"
                      src={form.mainImageUrl}
                      alt={form.name || "event preview"}
                      sx={{ width: "100%", height: 180, objectFit: "cover" }}
                      onError={(ev) => ((ev.currentTarget.style.display = "none"))}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
                          theme.palette.primary.light,
                          0.2
                        )})`,
                      }}
                    >
                      <Typography variant="subtitle1" color="text.secondary">
                        Thêm ảnh để nổi bật sự kiện
                      </Typography>
                    </Box>
                  )}
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {form.category ? <Chip label={form.category} size="small" /> : null}
                        <Chip label={`${form.capacity} khách`} size="small" variant="outlined" />
                      </Stack>
                      <Stack spacing={0.75}>
                        <Typography variant="h6" fontWeight={700}>
                          {form.name || "Tên sự kiện của bạn"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {form.location || "Địa điểm sẽ hiển thị tại đây"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {scheduleLabel}
                        </Typography>
                      </Stack>
                      {form.description ? (
                        <Typography variant="body2" color="text.secondary">
                          {form.description}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Thêm mô tả để người tham dự hiểu rõ nội dung sự kiện.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
