import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { alpha } from "@mui/material/styles";
import EventCard, { type EventCardData } from "../../components/events/EventCard";
import EventFilters, { type EventView } from "../../components/events/EventFilters";
import {
  fetchPublicEvents,
  type EventResponse as ApiEventResponse,
} from "../../features/events/eventsApi";

const SKELETON_COUNT = 8;

type EventItem = ApiEventResponse & EventCardData;

export default function EventsListPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState<string>("");
  const [debouncedQ, setDebouncedQ] = useState<string>("");
  const [view, setView] = useState<EventView>("upcoming");
  const [category, setCategory] = useState<string>("ALL");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPublicEvents({ q: debouncedQ, page: 0, size: 24 });
        if (!active) return;
        setItems(res.content ?? []);
      } catch (err: any) {
        if (!active) return;
        const message = (err?.response?.data?.message) ?? (err?.message) ?? "Không thể tải danh sách sự kiện.";
        setError(message);
        setItems([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [debouncedQ]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((event) => {
      if (event.category) {
        set.add(event.category);
      }
    });
    return ["ALL", ...Array.from(set).slice(0, 8)];
  }, [items]);

  useEffect(() => {
    if (category !== "ALL" && !categories.includes(category)) {
      setCategory("ALL");
    }
  }, [categories, category]);

  const filteredItems = useMemo(() => {
    let list = items.slice();

    if (debouncedQ) {
      const keyword = debouncedQ.toLowerCase();
      list = list.filter((event) => {
        const haystack = `${event.name ?? ""} ${event.location ?? ""} ${event.category ?? ""}`.toLowerCase();
        return haystack.includes(keyword);
      });
    }

    if (view === "upcoming") {
      const now = Date.now();
      const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
      list = list.filter((event) => {
        if (!event.startTime) return true;
        const eventTime = new Date(event.startTime).getTime();
        // Show events that are upcoming OR ended within the last 3 days
        return eventTime >= threeDaysAgo;
      });
    }

    if (category !== "ALL") {
      list = list.filter((event) => event.category === category);
    }

    return list;
  }, [items, view, category, debouncedQ]);

  const summary = useMemo(() => {
    const total = items.length;
    const now = Date.now();
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    const upcoming = items.filter((event) => {
      if (!event.startTime) return true;
      const eventTime = new Date(event.startTime).getTime();
      return eventTime >= threeDaysAgo;
    }).length;
    const capacityAvailable = items.reduce((acc, event) => {
      const seats = event.seatsAvailable ?? 0;
      return acc + (seats > 0 ? seats : 0);
    }, 0);
    return { total, upcoming, capacityAvailable };
  }, [items]);

  const backdrop =
    "radial-gradient(circle at 10% 20%, " +
    alpha(theme.palette.primary.main, 0.15) +
    ", transparent 55%)," +
    "radial-gradient(circle at 85% 15%, " +
    alpha(theme.palette.secondary.main, 0.18) +
    ", transparent 45%)," +
    "radial-gradient(circle at 15% 80%, " +
    alpha(theme.palette.primary.light, 0.14) +
    ", transparent 55%)," +
    "radial-gradient(circle at 80% 78%, " +
    alpha(theme.palette.secondary.light, 0.16) +
    ", transparent 50%)";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: backdrop,
        pb: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 10 } }}>
        <Stack spacing={6}>
          <EventFilters
            search={q}
            onSearchChange={(value) => setQ(value)}
            view={view}
            onViewChange={(nextView) => setView(nextView)}
            categories={categories}
            selectedCategory={category}
            onCategoryChange={(nextCategory) => setCategory(nextCategory)}
            summary={summary}
            disabled={loading}
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              mb={3}
              spacing={{ xs: 1.5, md: 0 }}
            >
              <Typography variant="h5" fontWeight={700}>
                {loading
                  ? "Đang tải sự kiện..."
                  : filteredItems.length > 0
                  ? `Có ${filteredItems.length} sự kiện dành cho bạn`
                  : "Không tìm thấy sự kiện phù hợp"}
              </Typography>
              {!loading && filteredItems.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Tổng số chỗ còn trống: {summary.capacityAvailable.toLocaleString("vi-VN")}
                </Typography>
              )}
            </Stack>

            <Grid container spacing={3}>
              {loading &&
                Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`sk-${index}`}>
                    <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
                      <Skeleton variant="rectangular" height={180} animation="wave" />
                      <CardContent>
                        <Skeleton width="80%" height={30} sx={{ mb: 1 }} />
                        <Skeleton width="60%" height={20} />
                        <Skeleton width="40%" height={20} sx={{ mt: 2 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

              {!loading &&
                filteredItems.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
                  </Grid>
                ))}

              {!loading && filteredItems.length === 0 && (
                <Grid item xs={12}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      textAlign: "center",
                      py: 6,
                      px: 4,
                      background: alpha(theme.palette.background.paper, 0.95),
                      boxShadow: theme.shadows[4],
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <AutoAwesomeRoundedIcon color="primary" sx={{ fontSize: 48 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {error ? "Không thể tải sự kiện" : "Chúng tôi chưa tìm thấy sự kiện phù hợp"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" maxWidth={480}>
                        {error
                          ? "Vui lòng thử lại sau ít phút hoặc kiểm tra kết nối mạng của bạn."
                          : "Thử thay đổi từ khóa tìm kiếm hoặc kiểm tra lại các bộ lọc. Bạn cũng có thể khám phá những sự kiện nổi bật trên trang chủ."}
                      </Typography>
                      <Button variant="contained" onClick={() => setCategory("ALL")}>
                        Quay về tất cả sự kiện
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}


