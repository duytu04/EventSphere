







import React, { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { alpha, lighten, darken } from "@mui/material/styles";
import DOMPurify from "dompurify";
import SeatsChip from "../../components/events/SeatsChip";
import { useAuth } from "../../features/auth/useAuth";
import {
  fetchAdminEventById,
  fetchPublicEventById,
  type EventResponse as ApiEventResponse,
  fetchEventReviews,
  createEventReview,
  type EventReview,
} from "../../features/events/eventsApi";
import api from "../../api/axiosClient";

// Types

type EventResponse = ApiEventResponse;

type QuickFact = {
  icon: ElementType;
  label: string;
  value: ReactNode;
  helper?: string;
};

// Constants

const PREPARATION_TIPS = [
  "Đăng ký sớm để giữ chỗ.",
  "Kiểm tra email xác nhận và mang mã QR tới điểm check-in.",
  "Theo dõi fanpage để cập nhật thông tin mới nhất.",
] as const;

const STATUS_LABEL: Record<string, { label: string; color: "default" | "success" | "warning" | "error" | "info" }> = {
  APPROVED: { label: "Đã được duyệt", color: "success" },
  PENDING_APPROVAL: { label: "Đang xét duyệt", color: "warning" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  DRAFT: { label: "Bản nháp", color: "default" },
};

// Utils

function formatDate(value?: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(
    "vi-VN",
    options ?? {
      weekday: "long",
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
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
  if (!end) return startLabel;

  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return startLabel;

  const sameDay = startDate.toDateString() === endDate.toDateString();
  const endLabel = endDate.toLocaleString(
    "vi-VN",
    sameDay ? { hour: "2-digit", minute: "2-digit" } : opts
  );

  return `${startLabel} - ${endLabel}`;
}

function formatCountdown(diffMs: number) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ngày`);
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0 && parts.length < 2) parts.push(`${minutes} phút`);
  if (parts.length < 2 && seconds > 0 && days === 0) parts.push(`${seconds} giây`);

  if (parts.length === 0) parts.push(`${seconds} giây`);
  return `Bắt đầu sau ${parts.join(" ")}`;
}

function buildBackground(theme: ReturnType<typeof useTheme>) {
  const base = theme.palette.mode === "dark" ? 0.2 : 0.12;
  return (
    `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, base)}, transparent 55%),` +
    `radial-gradient(circle at 85% 15%, ${alpha(theme.palette.secondary.main, base + 0.04)}, transparent 45%),` +
    `radial-gradient(circle at 15% 80%, ${alpha(theme.palette.primary.light, base)}, transparent 55%),` +
    `radial-gradient(circle at 80% 78%, ${alpha(theme.palette.secondary.light, base + 0.06)}, transparent 60%)`
  );
}

function TicketChip({ label }: { label: string }) {
  return (
    <Chip
      icon={<ConfirmationNumberRoundedIcon fontSize="small" />}
      label={label}
      color="secondary"
      sx={{ borderRadius: 3, px: 1.5, fontWeight: 600 }}
    />
  );
}

// Component

export default function EventDetailPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const eventId = useMemo(() => Number(id), [id]);
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [myComment, setMyComment] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [myRegistration, setMyRegistration] = useState<any>(null);
  const [registrationLoading, setRegistrationLoading] = useState<boolean>(false);

  // Registration functions
  const fetchMyRegistration = async () => {
    if (!token || !eventId) return;
    try {
      const { data } = await api.get(`/api/me/registrations`);
      const myReg = data.find((reg: any) => reg.eventId === eventId);
      setMyRegistration(myReg || null);
    } catch (error) {
      console.error("Failed to fetch registration:", error);
    }
  };

  const handleRegister = async () => {
    if (!event || !token) return;
    setRegistrationLoading(true);
    try {
      const { data } = await api.post(`/api/events/${event.id}/register`);
      setMyRegistration(data);
      // Show success message
      alert("Đăng ký thành công!");
    } catch (error: any) {
      console.error("Registration failed:", error);
      alert(error?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!myRegistration) return;
    const confirmed = window.confirm("Bạn có chắc muốn huỷ đăng ký?");
    if (!confirmed) return;
    
    setRegistrationLoading(true);
    try {
      await api.delete(`/api/me/registrations/${myRegistration.id}`);
      setMyRegistration(null);
      alert("Đã huỷ đăng ký thành công!");
    } catch (error: any) {
      console.error("Cancel registration failed:", error);
      alert(error?.response?.data?.message || "Huỷ đăng ký thất bại");
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Fetch event (public first, fallback admin)
  useEffect(() => {
    if (!eventId || Number.isNaN(eventId)) {
      setError("ID sự kiện không hợp lệ.");
      setEvent(null);
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicEventById(eventId);
        if (active) setEvent(data);
      } catch (_) {
        if (!active) return;
        try {
          const fallback = await fetchAdminEventById(eventId);
          if (active) setEvent(fallback);
        } catch (fallbackError: any) {
          if (!active) return;
          const message =
            fallbackError?.response?.data?.message ??
            fallbackError?.message ??
            "Không tải được thông tin sự kiện.";
          setError(message);
          setEvent(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [eventId]);

  // Share message auto-hide
  useEffect(() => {
    if (!shareMessage) return;
    const timer = window.setTimeout(() => setShareMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [shareMessage]);

  const statusChip = event?.status ? STATUS_LABEL[event.status] ?? { label: event.status, color: "default" } : null;
  const isOnlineEvent = (event?.location ?? "").toLowerCase().includes("online");
  const formattedStart = formatDate(event?.startTime);
  const formattedEnd = formatDate(event?.endTime);
  const dateRange = formatDateRange(event?.startTime, event?.endTime);

  // Countdown ticker
  useEffect(() => {
    const startTime = event?.startTime ? new Date(event.startTime) : null;
    if (!startTime || Number.isNaN(startTime.getTime())) {
      setCountdown(null);
      return;
    }

    const endTime = event?.endTime ? new Date(event.endTime) : null;

    const tick = () => {
      const now = Date.now();
      const diff = startTime.getTime() - now;

      if (diff <= 0) {
        if (endTime && endTime.getTime() < now) {
          setCountdown(null);
        } else {
          setCountdown("Đang diễn ra");
        }
        return true;
      }

      setCountdown(formatCountdown(diff));
      return false;
    };

    const shouldStop = tick();
    if (shouldStop) return;

    const timer = window.setInterval(() => {
      if (tick()) window.clearInterval(timer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [event?.startTime, event?.endTime]);

  // Load reviews after eventId present
  useEffect(() => {
    if (!eventId) return;
    let active = true;
    (async () => {
      setReviewsLoading(true);
      try {
        const list = await fetchEventReviews(eventId);
        if (active) setReviews(list);
      } catch {
        if (active) setReviews([]);
      } finally {
        if (active) setReviewsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [eventId]);

  // Fetch my registration when token is available
  useEffect(() => {
    if (token && eventId) {
      fetchMyRegistration();
    }
  }, [token, eventId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const handleSubmitReview = async () => {
    if (!token) {
      navigate("/login", { state: { redirectTo: "/events/" + eventId } });
      return;
    }
    if (!eventId || !myRating) return;
    const payload = { rating: myRating, comment: myComment.trim() };
    setSubmitLoading(true);
    try {
      const created = await createEventReview(eventId, payload);
      setReviews((prev) => [created, ...prev]);
      setMyRating(null);
      setMyComment("");
    } catch (_) {
      setShareMessage("Không gửi được đánh giá. Hãy thử lại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const eventEnd = event?.endTime ? new Date(event.endTime) : null;
  const eventEnded = eventEnd ? eventEnd.getTime() < Date.now() : false;
  const heroTicketLabel = countdown ?? dateRange;
  const registrationCtaLabel = eventEnded
    ? "Sự kiện đã kết thúc"
    : !token
    ? "Đăng nhập để đăng ký"
    : myRegistration
    ? "Đã đăng ký"
    : "Đăng ký tham gia";

  const heroHasImage = Boolean(event?.mainImageUrl);
  const headerOffset = {
    xs: `calc(${theme.spacing(9)} + env(safe-area-inset-top))`,
    md: `calc(${theme.spacing(11)} + env(safe-area-inset-top))`,
  } as const;

  const quickFacts = useMemo<QuickFact[]>(() => {
    if (!event) return [];

    const timeValue = countdown ? (
      <Stack spacing={0.25}>
        <Typography variant="body1" fontWeight={700}>
          {countdown}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dateRange}
        </Typography>
      </Stack>
    ) : (
      dateRange
    );

    const facts: (QuickFact | null)[] = [
      {
        icon: CalendarMonthRoundedIcon,
        label:
          countdown && countdown !== "Đang diễn ra"
            ? "Đếm ngược"
            : countdown === "Đang diễn ra"
            ? "Trạng thái"
            : "Thời gian",
        value: timeValue,
      },
      {
        icon: isOnlineEvent ? LanguageRoundedIcon : LocationOnRoundedIcon,
        label: isOnlineEvent ? "Hình thức" : "Địa điểm",
        value: event.location ?? "Địa điểm đang cập nhật",
      },
      event.capacity || event.seatsAvailable
        ? {
            icon: PeopleAltRoundedIcon,
            label: "Chỗ trống",
            value: <SeatsChip seatsAvailable={event.seatsAvailable} capacity={event.capacity} size="small" dense />,
          }
        : null,
      event.category
        ? {
            icon: CategoryRoundedIcon,
            label: "Danh mục",
            value: event.category,
          }
        : null,
    ];
    return facts.filter(Boolean) as QuickFact[];
  }, [event, dateRange, isOnlineEvent, countdown]);

  const timelineItems = useMemo(
    () => [
      { icon: CalendarMonthRoundedIcon, title: "Bắt đầu", value: formattedStart },
      { icon: ScheduleRoundedIcon, title: "Kết thúc", value: formattedEnd },
    ],
    [formattedStart, formattedEnd]
  );

  const handleNativeShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({
          title: event?.name ?? "Sự kiện",
          text: event?.description ?? "Cùng tham gia sự kiện này trên EventSphere.",
          url,
        });
        return;
      }
    } catch (err) {
      setShareMessage("Không thể chia sẻ tự động. Hãy thử sao chép liên kết.");
      return;
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareMessage("Liên kết đã được sao chép.");
      } else {
        setShareMessage("Hãy sao chép liên kết: " + url);
      }
    } catch {
      setShareMessage("Hãy sao chép liên kết: " + url);
    }
  };

  const handleCopyShareLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareMessage("Liên kết đã được sao chép.");
      } else {
        setShareMessage("Hãy sao chép liên kết: " + url);
      }
    } catch {
      setShareMessage("Không sao chép được liên kết. Hãy thử lại.");
    }
  };

  // Subtle motion helper
  const motion = (index: number) => ({
    opacity: loading ? 0 : 1,
    transform: loading ? "translateY(8px)" : "translateY(0)",
    transition: prefersReduced
      ? undefined
      : `opacity .5s ease ${index * 60}ms, transform .5s ease ${index * 60}ms`,
  } as const);

  return (
    <Box sx={{ minHeight: "100vh", background: buildBackground(theme), pb: { xs: 10, md: 14 } }}>
      {/* HERO */}
      <Box component="section" sx={{ position: "relative", pt: headerOffset, pb: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            borderRadius: { xs: 0, md: 5 },
            overflow: "visible",
            minHeight: { xs: 420, md: 560 },
            maxWidth: { xs: "100%", md: "76%" },
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Ticket wrapper (no border) */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: 6,
              p: 0,
              background: "none",
              boxShadow: theme.palette.mode === "dark" ? "0 40px 100px rgba(0,0,0,.45)" : "0 30px 80px rgba(15,23,42,.25)",
              ...motion(0),
            }}
          >
            {/* Ticket body */}
            <Box
              sx={{
                position: "relative",
                borderRadius: 5,
                overflow: "hidden",
                backdropFilter: "blur(10px)",
                background: (t) =>
                  `linear-gradient(180deg, ${alpha(t.palette.background.paper, 0.72)} 0%, ${alpha(
                    t.palette.background.paper,
                    0.95
                  )} 100%)`,
              }}
            >
              {/* notches */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: -22,
                  transform: "translateY(-50%)",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: (t) => t.palette.background.default,
                  boxShadow: (t) => `
                    inset 0 0 0 2px ${alpha(t.palette.divider, 0.9)},
                    0 4px 12px rgba(0,0,0,.15)
                  `,
                  display: { xs: "block", md: "block" },
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: -22,
                  transform: "translateY(-50%)",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: (t) => t.palette.background.default,
                  boxShadow: (t) => `
                    inset 0 0 0 2px ${alpha(t.palette.divider, 0.9)},
                    0 4px 12px rgba(0,0,0,.15)
                  `,
                  display: { xs: "block", md: "block" },
                }}
              />

              {/* perforation */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: { xs: "100%", md: "33.333%" },
                  width: 0,
                  borderLeft: "2px dashed",
                  borderColor: (t) => alpha(t.palette.text.primary, 0.28),
                  display: { xs: "block", md: "block" },
                }}
              />

              <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 3.5, md: 5 } }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
                    alignItems: "center",
                    gap: { xs: 2.5, md: 4 },
                  }}
                >
                  {/* LEFT */}
                  <Box sx={{ color: (t) => (heroHasImage ? t.palette.common.white : t.palette.text.primary) }}>
                    <Stack spacing={3} sx={{ pr: { md: 3 } }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <IconButton
                          onClick={() => navigate(-1)}
                          sx={{
                            color: "inherit",
                            border: (t) => `1px solid ${alpha(heroHasImage ? t.palette.common.white : t.palette.text.primary, 0.24)}`,
                            borderRadius: 2,
                            backdropFilter: "blur(6px)",
                            backgroundColor: (t) => alpha(heroHasImage ? t.palette.common.white : t.palette.text.primary, 0.06),
                            transition: prefersReduced ? undefined : "background-color .2s ease, border-color .2s ease, transform .15s ease",
                            "&:hover": {
                              transform: prefersReduced ? undefined : "translateY(-1px)",
                              borderColor: (t) => alpha(heroHasImage ? t.palette.common.white : t.palette.text.primary, 0.38),
                              backgroundColor: (t) => alpha(heroHasImage ? t.palette.common.white : t.palette.text.primary, 0.1),
                            },
                          }}
                          aria-label="Quay lại"
                        >
                          <ArrowBackRoundedIcon />
                        </IconButton>
                        <Breadcrumbs sx={{ color: "inherit", fontWeight: 500 }} aria-label="breadcrumb">
                          <MuiLink underline="hover" color="inherit" component={RouterLink} to="/">
                            Trang chủ
                          </MuiLink>
                          <MuiLink underline="hover" color="inherit" component={RouterLink} to="/events">
                            Sự kiện
                          </MuiLink>
                          <Typography color="inherit">Chi tiết</Typography>
                        </Breadcrumbs>
                      </Stack>

                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          {statusChip && (
                            <Chip label={statusChip.label} color={statusChip.color} sx={{ borderRadius: 2, fontWeight: 700 }} size="small" />
                          )}
                          <TicketChip label={heroTicketLabel} />
                        </Stack>

                        {loading ? (
                          <Skeleton variant="text" width={isMdUp ? 560 : 320} height={isMdUp ? 72 : 48} sx={{ bgcolor: alpha("#fff", 0.25) }} />
                        ) : (
  <Typography
  fontWeight={700}
  lineHeight={1.4}
  sx={{
    fontSize: { xs: "1.2rem", md: "1.5rem" }, // 👈 thu nhỏ hơn h4/h3
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordBreak: "break-word",
    letterSpacing: "-0.01em",
  }}
>
  {event?.name ?? "Sự kiện"}
</Typography>


                        )}

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems="center">
                          {event?.category && (
                            <Chip label={event.category} color="secondary" sx={{ borderRadius: 3, fontWeight: 600 }} />
                          )}
                          <SeatsChip seatsAvailable={event?.seatsAvailable} capacity={event?.capacity} />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* RIGHT image */}
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 4,
                      overflow: "hidden",
                      height: { xs: 260, md: 420 },
                      background: (t) => `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.12)}, ${alpha(t.palette.secondary.main, 0.12)})`,
                    }}
                  >
                    {heroHasImage ? (
                      <Box
                        component="img"
                        loading="lazy"
                        src={event!.mainImageUrl}
                        alt={event?.name ?? "Event banner"}
                        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "right center" }}
                      />
                    ) : (
                      <Stack alignItems="center" justifyContent="center" sx={{ position: "absolute", inset: 0 }}>
                        <ConfirmationNumberRoundedIcon sx={{ fontSize: 72, opacity: 0.3 }} />
                      </Stack>
                    )}

                    {/* shimmer overlay */}
                    <Box
                      aria-hidden
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(120deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.18) 40%, rgba(255,255,255,0) 60%)",
                        transform: "translateX(-50%)",
                        animation: prefersReduced ? undefined : "shine 4s infinite",
                        "@keyframes shine": {
                          "0%": { transform: "translateX(-60%)" },
                          "100%": { transform: "translateX(120%)" },
                        },
                        pointerEvents: "none",
                      }}
                    />
                  </Box>
                </Box>
              </Container>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* QUICK FACTS */}
      {(loading || event) && (
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, mt: { xs: -8, md: -14 }, mb: { xs: 6, md: 8 } }}>
          <Card
            sx={{
              borderRadius: 4,
              p: { xs: 2.5, md: 3 },
              boxShadow: theme.palette.mode === "dark" ? "0 24px 60px rgba(0,0,0,0.4)" : "0 24px 60px rgba(15,23,42,0.18)",
              background: alpha(theme.palette.background.paper, 0.96),
              backdropFilter: "blur(12px)",
              ...motion(1),
            }}
          >
            {loading ? (
              <Grid container spacing={2.5}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Stack spacing={0.5} sx={{ width: "100%" }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="80%" />
                      </Stack>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2.5}>
                {quickFacts.map((fact) => {
                  const Icon = fact.icon as React.ElementType;
                  const isStringValue = typeof fact.value === "string" || typeof fact.value === "number";
                  const columns = quickFacts.length === 1 ? 12 : quickFacts.length === 2 ? 6 : quickFacts.length === 3 ? 4 : 3;
                  return (
                    <Grid item xs={12} sm={6} md={columns} key={fact.label}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                            color: theme.palette.primary.main,
                          }}
                        >
                          <Icon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" sx={{ letterSpacing: 0.6 }}>
                            {fact.label}
                          </Typography>
                          {isStringValue ? (
                            <Typography variant="body1" fontWeight={700} sx={{ mt: 0.25 }}>
                              {fact.value as string | number}
                            </Typography>
                          ) : (
                            <Box sx={{ mt: 0.75 }}>{fact.value}</Box>
                          )}
                          {fact.helper && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
                              {fact.helper}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Card>
        </Container>
      )}

      {/* MAIN CONTENT */}
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="flex-start">
          {/* LEFT column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Overview */}
              <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[12], background: alpha(theme.palette.background.paper, 0.95), backdropFilter: "blur(16px)", ...motion(2) }}>
                <CardContent>
                  {loading ? (
                    <Stack spacing={3}>
                      <Skeleton variant="rectangular" height={220} />
                      <Skeleton variant="text" height={32} width="40%" />
                      <Skeleton variant="text" height={24} width="80%" />
                      <Skeleton variant="text" height={24} width="65%" />
                    </Stack>
                  ) : error ? (
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <InfoRoundedIcon color="warning" sx={{ fontSize: 56 }} />
                      <Typography variant="h6">{error}</Typography>
                      <Button variant="contained" onClick={() => (typeof window !== "undefined" ? window.location.reload() : undefined)}>
                        Thử lại
                      </Button>
                    </Stack>
                  ) : event ? (
                    <Stack spacing={3}>
                      <Stack spacing={2}>
                        <Typography variant="h5" fontWeight={700}>Tổng quan sự kiện</Typography>
                        {event.description ? (
                          <Box
                            sx={{
                              color: 'text.secondary',
                              lineHeight: 1.7,
                              '& img': { maxWidth: '100%', borderRadius: 1 },
                              '& ul, & ol': { pl: 3 },
                              '& blockquote': { pl: 2, borderLeft: (t) => `3px solid ${alpha(t.palette.text.primary, 0.2)}` },
                              '& h1, & h2, & h3': { mt: 1.25 },
                            }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
                          />
                        ) : (
                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            Thông tin chi tiết sẽ được cập nhật sớm.
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  ) : null}
                </CardContent>
              </Card>

              {/* Details */}
              {!loading && !error && event && (
                <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[8], background: alpha(theme.palette.background.paper, 0.94), ...motion(3) }}>
                  <CardContent>
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="h5" fontWeight={700}>Chi tiết sự kiện</Typography>
                        {statusChip && (
                          <Chip label={statusChip.label} color={statusChip.color} size="small" sx={{ borderRadius: 2, fontWeight: 600 }} />
                        )}
                      </Stack>

                      <Stack spacing={3}>
                        <Stack spacing={2}>
                          <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">Thời gian</Typography>
                          <Stack spacing={2}>
                            {timelineItems.map((item) => {
                              const ItemIcon = item.icon as React.ElementType;
                              return (
                                <Stack direction="row" spacing={1.75} alignItems="flex-start" key={item.title}>
                                  <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                    <ItemIcon fontSize="small" />
                                  </Box>
                                  <Box>
                                    <Typography fontWeight={600}>{item.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">{item.value}</Typography>
                                  </Box>
                                </Stack>
                              );
                            })}
                          </Stack>
                        </Stack>

                        <Divider light />

                        <Stack spacing={2}>
                          <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">Địa điểm & tham gia</Typography>
                          <Stack direction="row" spacing={1.75} alignItems="flex-start">
                            <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                              {isOnlineEvent ? <LanguageRoundedIcon fontSize="small" /> : <LocationOnRoundedIcon fontSize="small" />}
                            </Box>
                            <Box>
                              <Typography fontWeight={600}>{isOnlineEvent ? "Sự kiện trực tuyến" : "Địa điểm tổ chức"}</Typography>
                              <Typography variant="body2" color="text.secondary">{event.location ?? "Địa điểm đang cập nhật"}</Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1.75} alignItems="center">
                            <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                              <PeopleAltRoundedIcon fontSize="small" />
                            </Box>
                            <SeatsChip seatsAvailable={event.seatsAvailable} capacity={event.capacity} size="medium" />
                          </Stack>

                          {event.category && (
                            <Chip label={event.category} color="primary" variant="outlined" sx={{ borderRadius: 3, fontWeight: 600, alignSelf: "flex-start" }} />
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Reviews */}
              <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[8], background: alpha(theme.palette.background.paper, 0.95), ...motion(4) }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Typography variant="h5" fontWeight={800}>Đánh giá & Bình luận</Typography>
                        <Chip label={`${reviews.length} đánh giá`} size="small" />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={averageRating} precision={0.1} readOnly />
                        <Typography variant="body2" color="text.secondary">{averageRating || 0}/5</Typography>
                      </Stack>
                    </Stack>

                    {/* Write review */}
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack spacing={1.5}>
                          <Typography variant="subtitle1" fontWeight={700}>Để lại đánh giá của bạn</Typography>
                          <Rating value={myRating} onChange={(_, v) => setMyRating(v)} size="large" />
                          <TextField multiline minRows={3} placeholder="Chia sẻ cảm nhận của bạn về sự kiện..." value={myComment} onChange={(e) => setMyComment(e.target.value)} />
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button variant="contained" disabled={!myRating || submitLoading} onClick={handleSubmitReview}>Gửi đánh giá</Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* List reviews */}
                    <Stack spacing={2}>
                      {reviewsLoading && (
                        <Stack spacing={1.5}>
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                              <Skeleton variant="circular" width={40} height={40} />
                              <Stack spacing={0.75} sx={{ width: "100%" }}>
                                <Skeleton variant="text" width="35%" />
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="60%" />
                              </Stack>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                      {!reviewsLoading && reviews.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Chưa có đánh giá nào. Hãy là người đầu tiên!</Typography>
                      )}
                      {!reviewsLoading && reviews.map((r) => (
                        <Stack key={r.id} direction="row" spacing={1.5} alignItems="flex-start">
                          <Avatar src={r.userAvatarUrl ?? undefined}>{r.userName?.[0]?.toUpperCase()}</Avatar>
                          <Stack spacing={0.25} sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle2" fontWeight={700}>{r.userName}</Typography>
                              <Rating value={r.rating} size="small" readOnly />
                              <Typography variant="caption" color="text.secondary">{r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : ""}</Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{r.comment}</Typography>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* RIGHT column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3} sx={{ position: { md: "sticky" }, top: { md: theme.spacing(12) } }}>
              {/* Ticket CTA */}
              <Card sx={{ borderRadius: 6, overflow: "hidden", boxShadow: theme.palette.mode === "dark" ? "0 30px 60px rgba(0,0,0,0.5)" : "0 30px 60px rgba(39,58,137,0.25)", background: alpha(theme.palette.background.paper, 0.95), border: 'none', ...motion(2) }}>
                <CardContent sx={{ p: 3 }}>
                  {loading ? (
                    <Stack spacing={2}>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="rectangular" height={48} />
                    </Stack>
                  ) : event ? (
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <ConfirmationNumberRoundedIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>Vé tham dự</Typography>
                          <Typography variant="body2" color="text.secondary">Giữ chỗ ngay để không bỏ lỡ trải nghiệm.</Typography>
                        </Box>
                      </Stack>

                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <CategoryRoundedIcon color="primary" />
                          <Box>
                            <Typography fontWeight={600}>Danh mục</Typography>
                            <Typography variant="body2" color="text.secondary">{event.category ?? "Đang cập nhật"}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <PeopleAltRoundedIcon color="primary" />
                          <SeatsChip seatsAvailable={event.seatsAvailable} capacity={event.capacity} />
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={eventEnded || registrationLoading || myRegistration}
                          onClick={() => {
                            if (!event || eventEnded || myRegistration) return;
                            if (!token) {
                              navigate("/login", { state: { redirectTo: "/events/" + event.id } });
                              return;
                            }
                            handleRegister();
                          }}
                          sx={{ borderRadius: 3, fontWeight: 600, py: 1.4, boxShadow: "0 18px 38px rgba(91,124,250,0.35)", opacity: eventEnded || myRegistration ? 0.7 : 1 }}
                        >
                          {registrationLoading ? "Đang đăng ký..." : registrationCtaLabel}
                        </Button>
                        {myRegistration && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="large"
                            disabled={registrationLoading}
                            onClick={handleCancelRegistration}
                            sx={{ borderRadius: 3, fontWeight: 600, py: 1.4 }}
                          >
                            {registrationLoading ? "Đang huỷ..." : "Huỷ đăng ký"}
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  ) : null}
                </CardContent>
              </Card>

              {/* Share */}
              <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[6], background: alpha(theme.palette.background.paper, 0.92), ...motion(3) }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Typography variant="subtitle1" fontWeight={700}>Chia sẻ & lưu sự kiện</Typography>
                    <Typography variant="body2" color="text.secondary">Chia sẻ sự kiện với bạn bè hoặc lưu lại liên kết để truy cập lần tới.</Typography>
                    <Stack spacing={1.25} direction={{ xs: 'column', sm: 'row' }}>
                      <Button variant="contained" startIcon={<IosShareRoundedIcon />} onClick={handleNativeShare}>Chia sẻ ngay</Button>
                      <Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={handleCopyShareLink}>Sao chép liên kết</Button>
                    </Stack>
                    {shareMessage && (
                      <Typography variant="caption" color="text.secondary">{shareMessage}</Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Help */}
              <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[6], background: alpha(theme.palette.background.paper, 0.92), ...motion(4) }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Typography variant="subtitle1" fontWeight={700}>Hỗ trợ & liên hệ</Typography>
                    <Typography variant="body2" color="text.secondary">Nếu cần hỗ trợ, vui lòng liên hệ ban tổ chức qua email hoặc hotline được cung cấp trên vé điện tử của bạn.</Typography>
                    <Button variant="outlined" size="small" disabled>Thông tin liên hệ đang cập nhật</Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[6], background: alpha(theme.palette.background.paper, 0.92), ...motion(5) }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Typography variant="subtitle1" fontWeight={700}>Gợi ý chuẩn bị</Typography>
                    <Stack component="ul" spacing={1.25} sx={{ m: 0, pl: 2, color: "text.secondary" }}>
                      {PREPARATION_TIPS.map((tip, index) => (
                        <Typography component="li" variant="body2" key={index}>{tip}</Typography>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[6], background: alpha(theme.palette.background.paper, 0.92), ...motion(6) }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight={700}>Lưu ý quan trọng</Typography>
                    <Typography variant="body2" color="text.secondary">Vui lòng có mặt trước giờ bắt đầu 15 phút để hoàn tất check-in. Ban tổ chức có thể thay đổi chương trình nếu cần thiết.</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
