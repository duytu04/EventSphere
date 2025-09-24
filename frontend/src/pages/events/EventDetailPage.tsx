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
} from "@mui/material";
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
import { alpha } from "@mui/material/styles";
import SeatsChip from "../../components/events/SeatsChip";
import { useAuth } from "../../features/auth/useAuth";
import {
  fetchAdminEventById,
  fetchPublicEventById,
  type EventResponse as ApiEventResponse,
} from "../../features/events/eventsApi";

type EventResponse = ApiEventResponse;

type QuickFact = {
  icon: ElementType;
  label: string;
  value: ReactNode;
  helper?: string;
};

const PREPARATION_TIPS = [
  "Dang ky som de giu cho.",
  "Kiem tra email xac nhan va mang ma QR toi diem check-in.",
  "Theo doi fanpage de cap nhat thong tin moi nhat.",
] as const;

const STATUS_LABEL: Record<string, { label: string; color: "default" | "success" | "warning" | "error" | "info" }> = {
  APPROVED: { label: "Da duoc duyet", color: "success" },
  PENDING_APPROVAL: { label: "Dang xet duyet", color: "warning" },
  REJECTED: { label: "Bi tu choi", color: "error" },
  DRAFT: { label: "Ban nhap", color: "default" },
};

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
  if (!start) return "Thoi gian se duoc cap nhat";
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return "Thoi gian se duoc cap nhat";

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

  return startLabel + " - " + endLabel;
}

function formatCountdown(diffMs: number) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(days + " ngày");
  if (hours > 0) parts.push(hours + " giờ");
  if (minutes > 0 && parts.length < 2) parts.push(minutes + " phút");
  if (parts.length < 2 && seconds > 0 && days === 0) parts.push(seconds + " giây");

  if (parts.length === 0) {
    parts.push(seconds + " giây");
  }

  return "Bắt đầu sau " + parts.join(" ");
}

function buildHeroFallback(theme: ReturnType<typeof useTheme>) {
  const start = alpha(theme.palette.primary.main, 0.35);
  const end = alpha(theme.palette.secondary.main, 0.32);
  return "linear-gradient(135deg, " + start + " 0%, " + end + " 100%)";
}

function buildBackground(theme: ReturnType<typeof useTheme>) {
  return (
    "radial-gradient(circle at 10% 20%, " +
    alpha(theme.palette.primary.main, 0.12) +
    ", transparent 55%),\n          radial-gradient(circle at 85% 15%, " +
    alpha(theme.palette.secondary.main, 0.16) +
    ", transparent 45%),\n          radial-gradient(circle at 15% 80%, " +
    alpha(theme.palette.primary.light, 0.12) +
    ", transparent 55%),\n          radial-gradient(circle at 80% 78%, " +
    alpha(theme.palette.secondary.light, 0.18) +
    ", transparent 60%)"
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
export default function EventDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const eventId = useMemo(() => Number(id), [id]);
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || Number.isNaN(eventId)) {
      setError("ID su kien khong hop le.");
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
      } catch (err) {
        if (!active) return;
        try {
          const fallback = await fetchAdminEventById(eventId);
          if (active) setEvent(fallback);
        } catch (fallbackError: any) {
          if (!active) return;
          const message =
            fallbackError?.response?.data?.message ??
            fallbackError?.message ??
            "Khong tai duoc thong tin su kien.";
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

  useEffect(() => {
    if (!shareMessage) return;
    const timer = window.setTimeout(() => setShareMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [shareMessage]);

  const statusChip = event?.status ? STATUS_LABEL[event.status] ?? { label: event.status, color: "default" } : null;
  const isOnlineEvent = event?.location?.toLowerCase().includes("online");
  const formattedStart = formatDate(event?.startTime);
  const formattedEnd = formatDate(event?.endTime);
  const dateRange = formatDateRange(event?.startTime, event?.endTime);

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
    if (shouldStop) {
      return;
    }

    const timer = window.setInterval(() => {
      if (tick()) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [event?.startTime, event?.endTime]);

  const eventEnd = event?.endTime ? new Date(event.endTime) : null;
  const eventEnded = eventEnd ? eventEnd.getTime() < Date.now() : false;
  const heroTicketLabel = countdown ?? dateRange;
  const registrationCtaLabel = eventEnded
    ? "Su kien da ket thuc"
    : token
    ? "Nhan ve dien tu"
    : "Dang nhap de dang ky";

  const heroHasImage = Boolean(event?.mainImageUrl);
  const headerOffset = {
    xs: `calc(${theme.spacing(9)} + env(safe-area-inset-top))`,
    md: `calc(${theme.spacing(11)} + env(safe-area-inset-top))`,
  };
  const heroTextColor = heroHasImage ? "common.white" : "text.primary";
  const heroIconBorder = heroHasImage ? alpha(theme.palette.common.white, 0.5) : alpha(theme.palette.text.primary, 0.2);
  const heroIconBackground = heroHasImage ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.text.primary, 0.08);
  const heroSkeletonColor = heroHasImage ? alpha(theme.palette.common.white, 0.28) : alpha(theme.palette.text.primary, 0.18);

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
            ? "Trang thai"
            : "Thoi gian",
        value: timeValue,
      },
      {
        icon: isOnlineEvent ? LanguageRoundedIcon : LocationOnRoundedIcon,
        label: isOnlineEvent ? "Hinh thuc" : "Dia diem",
        value: event.location ?? "Dia diem dang cap nhat",
      },
      event.capacity || event.seatsAvailable
        ? {
            icon: PeopleAltRoundedIcon,
            label: "Cho trong",
            value: <SeatsChip seatsAvailable={event.seatsAvailable} capacity={event.capacity} size="small" dense />,
          }
        : null,
      event.category
        ? {
            icon: CategoryRoundedIcon,
            label: "Danh muc",
            value: event.category,
          }
        : null,
    ];
    return facts.filter(Boolean) as QuickFact[];
  }, [event, dateRange, isOnlineEvent, countdown]);

  const timelineItems = useMemo(
    () => [
      { icon: CalendarMonthRoundedIcon, title: "Bat dau", value: formattedStart },
      { icon: ScheduleRoundedIcon, title: "Ket thuc", value: formattedEnd },
    ],
    [formattedStart, formattedEnd]
  );

  const locationUrl = useMemo(() => {
    if (!event?.location) return null;
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(event.location);
  }, [event?.location]);

  const handleNativeShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.name ?? "Su kien",
          text: event?.description ?? "Cung tham gia su kien nay tren EventSphere.",
          url,
        });
        return;
      }
    } catch (err) {
      setShareMessage("Khong the chia se tu dong. Hay thu sao chep lien ket.");
      return;
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareMessage("Lien ket da duoc sao chep.");
      } else {
        setShareMessage("Hay sao chep lien ket: " + url);
      }
    } catch {
      setShareMessage("Hay sao chep lien ket: " + url);
    }
  };

  const handleCopyShareLink = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareMessage("Lien ket da duoc sao chep.");
      } else {
        setShareMessage("Hay sao chep lien ket: " + url);
      }
    } catch {
      setShareMessage("Khong sao chep duoc lien ket. Hay thu lai.");
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: buildBackground(theme),
        pb: { xs: 10, md: 14 },
      }}
    >
      <Box
        component="section"
        sx={{
          position: "relative",
          pt: headerOffset,
          pb: { xs: 6, md: 8 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            borderRadius: { xs: 0, md: 5 },
            overflow: "hidden",
            minHeight: { xs: 360, md: 480 },
            maxWidth: { xs: "100%", md: "80%" },
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: heroHasImage ? "0 30px 80px rgba(15,23,42,0.35)" : theme.shadows[10],
            background: buildHeroFallback(theme),
          }}
        >
          {heroHasImage && (
            <Box
              component="img"
              src={event!.mainImageUrl}
              alt={event?.name ?? "Event banner"}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          )}

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: heroHasImage
                ? `linear-gradient(180deg, ${alpha(theme.palette.common.black, 0.2)} 0%, ${alpha(theme.palette.common.black, 0.8)} 88%)`
                : `linear-gradient(180deg, ${alpha(theme.palette.common.black, 0.12)} 0%, ${alpha(theme.palette.common.black, 0.25)} 85%)`,
            }}
          />

          <Container
            maxWidth="lg"
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              py: { xs: 5, md: 7 },
            }}
          >
            <Stack height="100%" justifyContent="center" spacing={4} color={heroTextColor} sx={{ width: "100%" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconButton
                  onClick={() => navigate(-1)}
                  sx={{
                    color: "inherit",
                    border: "1px solid " + heroIconBorder,
                    borderRadius: 2,
                    backdropFilter: "blur(6px)",
                    backgroundColor: heroIconBackground,
                  }}
                >
                  <ArrowBackRoundedIcon />
                </IconButton>
                <Breadcrumbs sx={{ color: "inherit", fontWeight: 500 }}>
                  <MuiLink underline="hover" color="inherit" component={RouterLink} to="/">
                    Trang chu
                  </MuiLink>
                  <MuiLink underline="hover" color="inherit" component={RouterLink} to="/events">
                    Su kien
                  </MuiLink>
                  <Typography color="inherit">Chi tiet</Typography>
                </Breadcrumbs>
              </Stack>

              <Stack spacing={2.5} maxWidth={720}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {statusChip && <Chip label={statusChip.label} color={statusChip.color} sx={{ borderRadius: 2, fontWeight: 600 }} />}
                  <TicketChip label={heroTicketLabel} />
                </Stack>
                {loading ? (
                  <Skeleton variant="text" width={480} height={74} sx={{ bgcolor: heroSkeletonColor }} />
                ) : (
                  <Typography variant="h3" fontWeight={800} lineHeight={1.05}>
                    {event?.name ?? "Su kien"}
                  </Typography>
                )}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }}>
                  {event?.category && <Chip label={event.category} color="secondary" sx={{ borderRadius: 3, fontWeight: 600 }} />}
                  <SeatsChip seatsAvailable={event?.seatsAvailable} capacity={event?.capacity} />
                </Stack>
                {event?.description && (
                  <Typography variant="body1" sx={{ maxWidth: 720, opacity: 0.85, display: { xs: "none", md: "block" } }}>
                    {event.description}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>

      {(loading || event) && (
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            mt: { xs: -8, md: -14 },
            mb: { xs: 6, md: 8 },
          }}
        >
          <Card
            sx={{
              borderRadius: 4,
              p: { xs: 2.5, md: 3 },
              boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
              background: alpha(theme.palette.background.paper, 0.96),
              backdropFilter: "blur(12px)",
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
                  const Icon = fact.icon;
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
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: theme.shadows[12],
                  background: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: "blur(16px)",
                }}
              >
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
                      <Button variant="contained" onClick={() => window.location.reload()}>
                        Thu lai
                      </Button>
                    </Stack>
                  ) : event ? (
                    <Stack spacing={3}>
                      <Stack spacing={2}>
                        <Typography variant="h5" fontWeight={700}>
                          Tong quan su kien
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                          {event.description?.trim() || "Thong tin chi tiet se duoc cap nhat som."}
                        </Typography>
                      </Stack>
                    </Stack>
                  ) : null}
                </CardContent>
              </Card>

              {!loading && !error && event && (
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: theme.shadows[8],
                    background: alpha(theme.palette.background.paper, 0.94),
                  }}
                >
                  <CardContent>
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="h5" fontWeight={700}>
                          Chi tiet su kien
                        </Typography>
                        {statusChip && (
                          <Chip
                            label={statusChip.label}
                            color={statusChip.color}
                            size="small"
                            sx={{ borderRadius: 2, fontWeight: 600 }}
                          />
                        )}
                      </Stack>

                      <Stack spacing={3}>
                        <Stack spacing={2}>
                          <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
                            Thoi gian
                          </Typography>
                          <Stack spacing={2}>
                            {timelineItems.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Stack direction="row" spacing={1.75} alignItems="flex-start" key={item.title}>
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 2,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      color: theme.palette.primary.main,
                                    }}
                                  >
                                    <ItemIcon fontSize="small" />
                                  </Box>
                                  <Box>
                                    <Typography fontWeight={600}>{item.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {item.value}
                                    </Typography>
                                  </Box>
                                </Stack>
                              );
                            })}
                          </Stack>
                        </Stack>

                        <Divider light />

                        <Stack spacing={2}>
                          <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
                            Dia diem & tham gia
                          </Typography>
                          <Stack direction="row" spacing={1.75} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                              }}
                            >
                              {isOnlineEvent ? <LanguageRoundedIcon fontSize="small" /> : <LocationOnRoundedIcon fontSize="small" />}
                            </Box>
                            <Box>
                              <Typography fontWeight={600}>{isOnlineEvent ? "Su kien truc tuyen" : "Dia diem to chuc"}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {event.location ?? "Dia diem dang cap nhat"}
                              </Typography>
                              <Button
                                size="small"
                                variant="text"
                                startIcon={
                                  isOnlineEvent ? <LanguageRoundedIcon fontSize="small" /> : <LocationOnRoundedIcon fontSize="small" />
                                }
                                href={locationUrl ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                disabled={!locationUrl}
                                sx={{ alignSelf: "flex-start", mt: 1, px: 0 }}
                              >
                                Mo trong ban do
                              </Button>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1.75} alignItems="center">
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                              }}
                            >
                              <PeopleAltRoundedIcon fontSize="small" />
                            </Box>
                            <SeatsChip seatsAvailable={event.seatsAvailable} capacity={event.capacity} size="medium" />
                          </Stack>

                          {event.category && (
                            <Chip
                              label={event.category}
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: 3, fontWeight: 600, alignSelf: "flex-start" }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 6,
                  overflow: "hidden",
                  boxShadow: "0 30px 60px rgba(39,58,137,0.25)",
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: "1px solid " + alpha(theme.palette.primary.main, 0.12),
                }}
              >
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
                          <Typography variant="h6" fontWeight={700}>
                            Ve tham du
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Giu cho ngay de khong bo lo trai nghiem.
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <CategoryRoundedIcon color="primary" />
                          <Box>
                            <Typography fontWeight={600}>Danh muc</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.category ?? "Dang cap nhat"}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <PeopleAltRoundedIcon color="primary" />
                          <SeatsChip seatsAvailable={event.seatsAvailable} capacity={event.capacity} />
                        </Stack>
                      </Stack>

                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={eventEnded}
                        onClick={() => {
                          if (!event || eventEnded) return;
                          if (!token) {
                            navigate("/login", { state: { redirectTo: "/events/" + event.id } });
                            return;
                          }
                          navigate("/events/" + event.id + "?intent=register");
                        }}
                        sx={{
                          borderRadius: 3,
                          fontWeight: 600,
                          py: 1.4,
                          boxShadow: "0 18px 38px rgba(91,124,250,0.35)",
                          opacity: eventEnded ? 0.7 : 1,
                        }}
                      >
                        {registrationCtaLabel}
                      </Button>
                    </Stack>
                  ) : null}
                </CardContent>
              </Card>

              {!loading && !error && (
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: theme.shadows[6],
                    background: alpha(theme.palette.background.paper, 0.92),
                  }}
                >
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Chia se & luu su kien
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chia se su kien voi ban be hoac luu lai lien ket de dang truy cap trong lan toi.
                      </Typography>
                      <Stack spacing={1.25}>
                        <Button variant="contained" startIcon={<IosShareRoundedIcon />} onClick={handleNativeShare}>
                          Chia se ngay
                        </Button>
                        <Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={handleCopyShareLink}>
                          Sao chep lien ket
                        </Button>
                      </Stack>
                      {shareMessage && (
                        <Typography variant="caption" color="text.secondary">
                          {shareMessage}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: theme.shadows[6],
                  background: alpha(theme.palette.background.paper, 0.92),
                }}
              >
                <CardContent>
                  <Stack spacing={2.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Ho tro & lien he
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Neu can ho tro, vui long lien he ban to chuc qua email hoac hotline duoc cung cap tren ve dien tu cua ban.
                    </Typography>
                    <Button variant="outlined" size="small" disabled>
                      Thong tin lien he dang cap nhat
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: theme.shadows[6],
                  background: alpha(theme.palette.background.paper, 0.92),
                }}
              >
                <CardContent>
                  <Stack spacing={2.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Goi y chuan bi
                    </Typography>
                    <Stack component="ul" spacing={1.25} sx={{ m: 0, pl: 2, color: "text.secondary" }}>
                      {PREPARATION_TIPS.map((tip, index) => (
                        <Typography component="li" variant="body2" key={index}>
                          {tip}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: theme.shadows[6],
                  background: alpha(theme.palette.background.paper, 0.92),
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Luu y quan trong
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vui long co mat truoc gio bat dau 15 phut de hoan tat check-in. Ban to chuc co the thay doi chuong trinh neu can thiet.
                    </Typography>
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
