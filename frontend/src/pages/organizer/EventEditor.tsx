import { useEffect, useMemo, useRef, useState } from "react";
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
  Alert,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import { useSnackbar } from "notistack";
import {
  createOrganizerEvent,
  fetchOrganizerEventById,
  updateOrganizerEvent,
  EventResponse,
} from "../../features/events/eventsApi";

const CATEGORY_SUGGESTIONS = ["Công nghệ", "Kinh doanh", "Nghệ thuật", "Giáo dục", "Thể thao"];

export default function EventEditor() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isEditing = Boolean(params.id && params.id !== "new");
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    name: "",
    description: "",
    mainImageUrl: "",
    category: CATEGORY_SUGGESTIONS[0] ?? "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: 0,
  });
  const [eventVersion, setEventVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const toInputValue = (value?: string) => {
    if (!value) return "";
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
        date.getMinutes()
      )}`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!isEditing || !params.id) return;
    const eventId = Number(params.id);
    if (Number.isNaN(eventId)) return;

    let active = true;
    setLoading(true);
    setErrorMessage(null);

    fetchOrganizerEventById(eventId)
      .then((data: EventResponse) => {
        if (!active) return;
        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          mainImageUrl: data.mainImageUrl ?? "",
          category: data.category ?? CATEGORY_SUGGESTIONS[0] ?? "",
          location: data.location ?? "",
          startTime: toInputValue(data.startTime),
          endTime: toInputValue(data.endTime),
          capacity: data.capacity ?? 0,
        });
        setEventVersion(data.version ?? null);
      })
      .catch((err: any) => {
        if (!active) return;
        console.error(err);
        setErrorMessage(err?.message ?? "Không thể tải thông tin sự kiện");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isEditing, params.id]);

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

  const isBusy = saving || loading;

  const handleChange = (key: keyof typeof form, value: any) => {
    setErrorMessage(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (saving || loading) return;

    if (!form.name.trim()) {
      setErrorMessage("Tên sự kiện không được bỏ trống");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setErrorMessage("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      category: form.category?.trim() || undefined,
      location: form.location?.trim() || undefined,
      startTime: form.startTime,
      endTime: form.endTime,
      capacity: Number.isNaN(form.capacity) ? 0 : Number(form.capacity),
      mainImageUrl: form.mainImageUrl?.trim() || undefined,
    };

    try {
      setErrorMessage(null);
      setSaving(true);

      if (isEditing && params.id) {
        const eventId = Number(params.id);
        if (Number.isNaN(eventId)) {
          throw new Error("ID sự kiện không hợp lệ");
        }
        await updateOrganizerEvent(eventId, {
          ...payload,
          version: eventVersion ?? undefined,
        });
        enqueueSnackbar("Cập nhật sự kiện thành công", { variant: "success" });
      } else {
        await createOrganizerEvent(payload);
        enqueueSnackbar("Tạo sự kiện thành công", { variant: "success" });
      }

      navigate("/organizer/events", { replace: true });
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.message ?? err?.message ?? "Không thể lưu sự kiện";
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Stack spacing={3}>
      <Button onClick={() => navigate(-1)} startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }}>
        Quay lại
      </Button>

      {loading ? <LinearProgress sx={{ borderRadius: 2 }} /> : null}
      {errorMessage ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}

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
                  disabled={isBusy}
                />

                <TextField
                  label="Mô tả"
                  multiline
                  minRows={5}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Chia sẻ điểm nổi bật, agenda và thông tin khách mời"
                  disabled={isBusy}
                />

                <Stack spacing={1.5}>
                  <TextField
                    label="Ảnh đại diện (URL)"
                    placeholder="https://..."
                  value={form.mainImageUrl}
                  onChange={(e) => handleChange("mainImageUrl", e.target.value)}
                  fullWidth
                  disabled={isBusy}
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
                      disabled={isBusy}
                    />
                    <TextField
                      label="Kết thúc"
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      disabled={isBusy}
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
                    disabled={isBusy}
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
                  disabled={isBusy}
                />

                <TextField
                  label="Địa điểm"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Nhập địa điểm tổ chức"
                  fullWidth
                  disabled={isBusy}
                />

                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    size="large"
                    onClick={handleSubmit}
                    disabled={isBusy}
                    sx={{ borderRadius: 2 }}
                  >
                    {saving ? "Đang lưu..." : loading ? "Đang tải..." : "Lưu sự kiện"}
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
