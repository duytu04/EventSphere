import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Rating, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { fetchRecentReviews, type RecentReviewItem } from "../../features/events/eventsApi";
import { Link as RouterLink } from "react-router-dom";

export default function RecentFeedback({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<RecentReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchRecentReviews(limit);
        if (active) setItems(list);
      } catch (e: any) {
        if (active) setError(e?.message ?? "Không tải được đánh giá mới nhất");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [limit]);

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800}>Cảm nhận gần đây</Typography>
            <Chip size="small" label={`${items.length} đánh giá`} />
          </Stack>

          {loading && (
            <Stack spacing={1.5}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                  <Skeleton variant="circular" width={36} height={36} />
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="35%" />
                    <Skeleton variant="text" width="80%" />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}

          {!loading && error && (
            <Typography variant="body2" color="text.secondary">{error}</Typography>
          )}

          {!loading && !error && (
            <Stack spacing={1.5}>
              {items.slice(0, limit).map((r) => (
                <Stack key={r.id + ":" + r.eventId} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    U
                  </Box>
                  <Stack spacing={0.25} sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle2" fontWeight={700}>User {r.userId}</Typography>
                      <Rating value={r.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        cho sự kiện <Typography component={RouterLink} to={`/events/${r.eventId}`} color="primary" sx={{ textDecoration: "none" }}>{r.eventName || `#${r.eventId}`}</Typography>
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.comment}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ở đây hiển thị các bình luận, đánh giá gần đây nhất , hiển thị theo dạng trượt ngang từ bên phải qua bên trái 
// hãy thêm vào trang home src/pages/home.tsx 