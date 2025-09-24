


// // src/pages/home/HomePage.tsx
// import { useEffect, useMemo, useState, useContext, useRef } from "react";
// import { Link as RouterLink } from "react-router-dom";
// import { fetchPublicEvents, EventResponse } from "../../features/events/eventsApi";
// import {
//   Box,
//   Container,
//   Typography,
//   Stack,
//   Button,
//   Chip,
//   Grid,
//   Card,
//   CardContent,
//   CardMedia,
//   Avatar,
//   LinearProgress,
//   Skeleton,
//   IconButton,
//   useMediaQuery,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import ExploreIcon from "@mui/icons-material/TravelExplore";
// import EventIcon from "@mui/icons-material/Event";
// import StarIcon from "@mui/icons-material/Star";
// import FavoriteIcon from "@mui/icons-material/Favorite";
// import LoginIcon from "@mui/icons-material/Login";
// import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
// import PlaceIcon from "@mui/icons-material/Place";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
// import Sparkles from "@mui/icons-material/AutoAwesome";
// import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
// import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
// import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
// import { motion } from "framer-motion";
// import { ColorModeCtx } from "../../theme/theme";

// /* ================= Motion presets ================= */
// const fadeUp = {
//   hidden: { opacity: 0, y: 18 },
//   show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: d, ease: [0.22, 1, 0.36, 1] } }),
// };
// const fadeIn = {
//   hidden: { opacity: 0 },
//   show: (d = 0) => ({ opacity: 1, transition: { duration: 0.5, delay: d } }),
// };

// /* ================= Countdown hook & UI ================= */
// function useCountdown(targetISO?: string) {
//   const [now, setNow] = useState(() => Date.now());
//   const timer = useRef<number | null>(null);

//   useEffect(() => {
//     if (!targetISO) return;
//     timer.current = window.setInterval(() => setNow(Date.now()), 1000);
//     return () => {
//       if (timer.current) window.clearInterval(timer.current);
//     };
//   }, [targetISO]);

//   const target = targetISO ? new Date(targetISO).getTime() : undefined;
//   const msLeft = target ? Math.max(0, target - now) : 0;

//   const totalSeconds = Math.floor(msLeft / 1000);
//   const days = Math.floor(totalSeconds / 86400);
//   const hours = Math.floor((totalSeconds % 86400) / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;

//   return { days, hours, minutes, seconds, msLeft, isOver: msLeft <= 0 };
// }

// function CountdownPill({ value, label }: { value: number; label: string }) {
//   return (
//     <Stack
//       alignItems="center"
//       sx={{
//         minWidth: 66,
//         px: 1.5,
//         py: 1,
//         borderRadius: 2,
//         bgcolor: "background.paper",
//         border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
//         boxShadow: (t) => t.shadows[1],
//       }}
//     >
//       <Typography variant="h5" fontWeight={900}>
//         {String(value).padStart(2, "0")}
//       </Typography>
//       <Typography variant="caption" color="text.secondary">
//         {label}
//       </Typography>
//     </Stack>
//   );
// }

// function CountdownTicker({ targetISO, compact }: { targetISO?: string; compact?: boolean }) {
//   const { days, hours, minutes, seconds, isOver } = useCountdown(targetISO);
//   if (!targetISO) return null;
//   if (isOver) {
//     return (
//       <Chip
//         icon={<ScheduleRoundedIcon />}
//         label="Đang diễn ra"
//         color="success"
//         variant="filled"
//         sx={{ fontWeight: 700 }}
//       />
//     );
//   }
//   if (compact) {
//     return (
//       <Chip
//         icon={<HourglassBottomRoundedIcon />}
//         label={`${days}d ${hours}h ${minutes}m ${seconds}s`}
//         variant="outlined"
//       />
//     );
//   }
//   return (
//     <Stack direction="row" gap={1.25} alignItems="center" flexWrap="wrap">
//       <CountdownPill value={days} label="Ngày" />
//       <CountdownPill value={hours} label="Giờ" />
//       <CountdownPill value={minutes} label="Phút" />
//       <CountdownPill value={seconds} label="Giây" />
//     </Stack>
//   );
// }

// /* ================= Page ================= */
// export default function HomePage() {
//   const theme = useTheme();
//   const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
//   const { toggle, mode } = useContext(ColorModeCtx);

//   const [loading, setLoading] = useState(true);
//   const [events, setEvents] = useState<EventResponse[]>([]);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await fetchPublicEvents({ status: "APPROVED", page: 0, size: 16 });
//         if (!mounted) return;
//         setEvents(res.content || []);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // Heuristic:
//   // - upcoming: startTime >= now
//   // - hotBanner: sự kiện sắp diễn ra nhất (gần nhất trong tương lai), fallback là event đầu tiên
//   const now = Date.now();
//   const upcoming = useMemo(
//     () =>
//       (events || [])
//         .filter((e) => e.startTime && new Date(e.startTime).getTime() >= now)
//         .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime()),
//     [events, now]
//   );
//   const hotBanner = upcoming[0] || events[0];

//   const quickFilters = useMemo(
//     () => [
//       { label: "Công nghệ", q: "tech" },
//       { label: "Workshop", q: "workshop" },
//       { label: "Kỹ năng", q: "skill" },
//       { label: "Nghệ thuật", q: "art" },
//       { label: "Khởi nghiệp", q: "startup" },
//       { label: "Giao lưu", q: "networking" },
//     ],
//     []
//   );

//   const bgMesh = `
//     radial-gradient(800px 500px at 20% 5%, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 60%),
//     radial-gradient(700px 420px at 85% 0%, ${alpha(theme.palette.secondary.main, 0.25)} 0%, transparent 60%),
//     radial-gradient(700px 520px at 10% 90%, ${alpha(theme.palette.success.main, 0.18)} 0%, transparent 60%)
//   `;

//   return (
//     <Box sx={{ position: "relative", overflow: "hidden", minHeight: "100vh", background: bgMesh }}>
//       {/* Subtle grid overlay */}
//       <Box
//         sx={{
//           position: "absolute",
//           inset: 0,
//           pointerEvents: "none",
//           backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
//           backgroundSize: "36px 36px",
//           opacity: mode === "light" ? 1 : 0.35,
//         }}
//       />

//       <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
//         {/* Topbar tiny actions */}
//         <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//           <Chip
//             icon={<Sparkles />}
//             label="Public beta"
//             sx={{
//               bgcolor: alpha(theme.palette.primary.main, 0.1),
//               borderColor: alpha(theme.palette.primary.main, 0.25),
//               border: "1px solid",
//               fontWeight: 700,
//               letterSpacing: 0.3,
//             }}
//           />
//           <IconButton
//             onClick={toggle}
//             size="small"
//             sx={{
//               border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
//               borderRadius: 2,
//               backdropFilter: "blur(8px)",
//             }}
//             aria-label="toggle color mode"
//             title={`Chuyển sang chế độ ${mode === "light" ? "tối" : "sáng"}`}
//           >
//             {mode === "light" ? "🌙" : "☀️"}
//           </IconButton>
//         </Stack>

//         {/* ======== HOT BANNER with countdown ======== */}
//         <Grid container spacing={4} alignItems="stretch" sx={{ mb: 4 }}>
//           <Grid item xs={12}>
//             <motion.div variants={fadeIn} initial="hidden" animate="show">
//               <Card
//                 sx={{
//                   position: "relative",
//                   borderRadius: 4,
//                   overflow: "hidden",
//                   minHeight: { xs: 280, md: 360 },
//                   boxShadow: `0 24px 80px ${alpha(theme.palette.primary.main, 0.25)}`,
//                   border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
//                 }}
//               >
//                 {/* Background image */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     backgroundImage: `url("${
//                       hotBanner?.mainImageUrl ||
//                       "https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1600&auto=format&fit=crop"
//                     }")`,
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                     filter: "brightness(0.75)",
//                   }}
//                 />
//                 {/* Overlay gradient */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     background: `linear-gradient(90deg, ${alpha(theme.palette.background.default, 0.85)} 0%, transparent 45%)`,
//                   }}
//                 />
//                 <Grid container sx={{ position: "relative", zIndex: 1, height: "100%" }}>
//                   <Grid item xs={12} md={7}>
//                     <Stack spacing={2.25} sx={{ p: { xs: 3, md: 5 } }}>
//                       <Chip
//                         icon={<LocalFireDepartmentRoundedIcon />}
//                         color="error"
//                         label="Sự kiện HOT"
//                         sx={{ alignSelf: "flex-start", fontWeight: 800 }}
//                       />
//                       <Typography variant={isMdDown ? "h4" : "h3"} fontWeight={900} lineHeight={1.05} noWrap>
//                         {hotBanner?.name || "Khám phá sự kiện nổi bật tuần này"}
//                       </Typography>
//                       <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
//                         <PlaceIcon fontSize="small" />
//                         <Typography fontWeight={600}>{hotBanner?.location || "—"}</Typography>
//                         <AccessTimeIcon fontSize="small" sx={{ ml: 2 }} />
//                         <Typography color="text.secondary">
//                           {hotBanner?.startTime ? new Date(hotBanner.startTime).toLocaleString() : "—"}
//                         </Typography>
//                       </Stack>

//                       {/* Countdown big */}
//                       <CountdownTicker targetISO={hotBanner?.startTime} />

//                       <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={1}>
//                         <Button
//                           component={RouterLink}
//                           to={hotBanner ? `/events/${hotBanner.id}` : "/events"}
//                           size="large"
//                           variant="contained"
//                           startIcon={<ExploreIcon />}
//                           sx={{
//                             px: 4,
//                             py: 1.5,
//                             borderRadius: 3,
//                             fontWeight: 800,
//                             boxShadow: `0 18px 48px ${alpha(theme.palette.primary.main, 0.35)}`,
//                           }}
//                         >
//                           Xem chi tiết
//                         </Button>
//                         <Button
//                           component={RouterLink}
//                           to="/events"
//                           size="large"
//                           variant="outlined"
//                           startIcon={<EventIcon />}
//                           sx={{ px: 3.5, py: 1.5, borderRadius: 3, fontWeight: 800 }}
//                         >
//                           Tất cả sự kiện
//                         </Button>
//                       </Stack>
//                     </Stack>
//                   </Grid>
//                 </Grid>
//               </Card>
//             </motion.div>
//           </Grid>
//         </Grid>

//         {/* QUICK FILTERS */}
//         <Stack
//           direction="row"
//           gap={1}
//           flexWrap="nowrap"
//           sx={{
//             mt: 1,
//             overflowX: "auto",
//             pb: 1,
//             "&::-webkit-scrollbar": { height: 6 },
//             "&::-webkit-scrollbar-thumb": { bgcolor: alpha(theme.palette.text.primary, 0.2), borderRadius: 99 },
//           }}
//         >
//           {quickFilters.map((f, i) => (
//             <motion.div key={f.q} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.05}>
//               <Chip
//                 clickable
//                 component={RouterLink as any}
//                 to={`/events?q=${encodeURIComponent(f.q)}`}
//                 label={f.label}
//                 variant="outlined"
//                 sx={{
//                   bgcolor: alpha(theme.palette.background.paper, 0.6),
//                   backdropFilter: "blur(6px)",
//                   borderRadius: 2,
//                 }}
//               />
//             </motion.div>
//           ))}
//         </Stack>
//       </Container>

//       {/* ======== UPCOMING with countdown ======== */}
//       <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
//           <Stack direction="row" gap={1} alignItems="center">
//             <ScheduleRoundedIcon />
//             <Typography variant="h5" fontWeight={900}>Sắp diễn ra</Typography>
//           </Stack>
//           <Button component={RouterLink} to="/events" endIcon={<KeyboardArrowRightIcon />}>Xem tất cả</Button>
//         </Stack>

//         <Grid container spacing={2}>
//           {loading
//             ? Array.from({ length: 6 }).map((_, i) => (
//                 <Grid item xs={12} sm={6} md={4} key={i}>
//                   <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
//                     <Skeleton variant="rectangular" height={164} />
//                     <CardContent>
//                       <Skeleton width="70%" height={24} />
//                       <Skeleton width="50%" height={18} />
//                       <Skeleton width="60%" height={18} />
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               ))
//             : (upcoming.length ? upcoming : events).slice(0, 6).map((ev, idx) => (
//                 <Grid key={ev.id} item xs={12} sm={6} md={4}>
//                   <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0.03 * idx}>
//                     <UpcomingCard ev={ev} />
//                   </motion.div>
//                 </Grid>
//               ))}
//         </Grid>
//       </Container>

//       {/* ======== FEATURED (fallback) ======== */}
//       <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
//           <Stack direction="row" gap={1} alignItems="center">
//             <StarIcon />
//             <Typography variant="h5" fontWeight={900}>Sự kiện nổi bật</Typography>
//           </Stack>
//           <Button component={RouterLink} to="/events" endIcon={<KeyboardArrowRightIcon />}>Xem tất cả</Button>
//         </Stack>

//         <Grid container spacing={2}>
//           {(events || []).slice(0, 6).map((ev, idx) => (
//             <Grid key={ev.id} item xs={12} sm={6} md={4}>
//               <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0.03 * idx}>
//                 <EventTeaserPublic ev={ev} />
//               </motion.div>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       {/* CTA BOTTOM */}
//       <Container maxWidth="lg" sx={{ pb: { xs: 12, md: 14 } }}>
//         <Card
//           sx={{
//             p: { xs: 3, md: 5 },
//             borderRadius: 4,
//             background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
//               theme.palette.secondary.main, 0.1
//             )} 50%)`,
//             border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
//             boxShadow: theme.shadows[6],
//           }}
//         >
//           <Grid container spacing={3} alignItems="center">
//             <Grid item xs={12} md={8}>
//               <Typography variant={isMdDown ? "h4" : "h3"} fontWeight={900} gutterBottom>
//                 Biến mỗi sự kiện thành một trải nghiệm đáng nhớ
//               </Typography>
//               <Typography variant="h6" color="text.secondary">
//                 Khám phá – Kết nối – Học hỏi. Bắt đầu ngay hôm nay.
//               </Typography>
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
//                 <Button component={RouterLink} to="/events" size="large" variant="contained" sx={{ py: 1.5, fontWeight: 800, borderRadius: 3 }}>
//                   Xem sự kiện
//                 </Button>
//                 <Button component={RouterLink} to="/signup" size="large" variant="outlined" sx={{ py: 1.5, fontWeight: 800, borderRadius: 3 }}>
//                   Bắt đầu miễn phí
//                 </Button>
//               </Stack>
//             </Grid>
//           </Grid>
//         </Card>
//       </Container>

//       {/* Sticky CTA for mobile */}
//       <Box
//         sx={{
//           position: "fixed",
//           left: 0,
//           right: 0,
//           bottom: 12,
//           display: { xs: "flex", md: "none" },
//           justifyContent: "center",
//           zIndex: 10,
//           px: 2,
//         }}
//       >
//         <Card
//           elevation={6}
//           sx={{
//             width: "100%",
//             maxWidth: 560,
//             borderRadius: 999,
//             px: 2,
//             py: 1,
//             backdropFilter: "blur(10px)",
//             border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
//             background: alpha(theme.palette.background.paper, 0.9),
//           }}
//         >
//           <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
//             <Typography fontWeight={800}>Khám phá ngay</Typography>
//             <Stack direction="row" spacing={1}>
//               <Button component={RouterLink} to="/events" size="small" variant="contained">
//                 Sự kiện
//               </Button>
//               <Button component={RouterLink} to="/signup" size="small" variant="outlined">
//                 Đăng ký
//               </Button>
//             </Stack>
//           </Stack>
//         </Card>
//       </Box>
//     </Box>
//   );
// }

// /* ================= Cards ================= */
// function UpcomingCard({ ev }: { ev: EventResponse }) {
//   const theme = useTheme();
//   const seatsUsed =
//     typeof ev.capacity === "number" && typeof ev.seatsAvailable === "number"
//       ? Math.max(0, ev.capacity - ev.seatsAvailable)
//       : undefined;
//   const progress =
//     seatsUsed !== undefined && ev.capacity ? Math.min(100, Math.round((seatsUsed / ev.capacity) * 100)) : 0;

//   return (
//     <Card
//       elevation={0}
//       sx={{
//         borderRadius: 3,
//         overflow: "hidden",
//         border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
//         transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
//         "&:hover": {
//           transform: "translateY(-6px)",
//           borderColor: alpha(theme.palette.primary.main, 0.4),
//           boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.18)}`,
//         },
//       }}
//     >
//       <RouterLink to={`/events/${ev.id}`} style={{ textDecoration: "none", color: "inherit" }}>
//         <CardMedia
//           component="img"
//           height="164"
//           src={ev.mainImageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop"}
//           alt={ev.name}
//           loading="lazy"
//           sizes="(max-width: 600px) 100vw, 33vw"
//         />
//         <CardContent>
//           <Stack direction="row" gap={1} alignItems="center" justifyContent="space-between">
//             <Typography variant="subtitle1" fontWeight={900} noWrap>
//               {ev.name || "(Không tên)"}
//             </Typography>
//             {ev.status && <Chip size="small" label={ev.status} color={ev.status === "APPROVED" ? "success" : "default"} />}
//           </Stack>

//           <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
//             <PlaceIcon fontSize="small" color="disabled" />
//             <Typography variant="body2" color="text.secondary" noWrap>
//               {ev.location || "—"}
//             </Typography>
//           </Stack>
//           <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
//             <AccessTimeIcon fontSize="small" color="disabled" />
//             <Typography variant="body2" color="text.secondary" noWrap>
//               {formatDateRange(ev.startTime, ev.endTime)}
//             </Typography>
//           </Stack>

//           {/* Compact countdown under card title */}
//           <Box sx={{ mt: 1 }}>
//             <CountdownTicker targetISO={ev.startTime} compact />
//           </Box>

//           {seatsUsed !== undefined && ev.capacity ? (
//             <Box sx={{ mt: 1.25 }}>
//               <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 99 }} />
//               <Stack direction="row" justifyContent="space-between" mt={0.5}>
//                 <Typography variant="caption" color="text.secondary">
//                   Đã đăng ký: {seatsUsed}/{ev.capacity}
//                 </Typography>
//               </Stack>
//             </Box>
//           ) : null}
//         </CardContent>
//       </RouterLink>
//     </Card>
//   );
// }

// function EventTeaserPublic({ ev }: { ev: EventResponse }) {
//   const theme = useTheme();
//   const seatsUsed =
//     typeof ev.capacity === "number" && typeof ev.seatsAvailable === "number"
//       ? Math.max(0, ev.capacity - ev.seatsAvailable)
//       : undefined;
//   const progress =
//     seatsUsed !== undefined && ev.capacity ? Math.min(100, Math.round((seatsUsed / ev.capacity) * 100)) : 0;

//   return (
//     <Card
//       elevation={0}
//       sx={{
//         borderRadius: 3,
//         overflow: "hidden",
//         border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
//         position: "relative",
//         transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
//         "&:hover": {
//           transform: "translateY(-6px)",
//           borderColor: alpha(theme.palette.primary.main, 0.4),
//           boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.18)}`,
//         },
//       }}
//     >
//       <RouterLink to={`/events/${ev.id}`} style={{ textDecoration: "none", color: "inherit" }}>
//         <CardMedia
//           component="img"
//           height="164"
//           src={
//             ev.mainImageUrl ||
//             "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop"
//           }
//           alt={ev.name}
//           loading="lazy"
//           sizes="(max-width: 600px) 100vw, 33vw"
//         />
//         <CardContent>
//           <Typography variant="subtitle1" fontWeight={800} noWrap>
//             {ev.name || "(Không tên)"}
//           </Typography>
//           <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
//             <PlaceIcon fontSize="small" color="disabled" />
//             <Typography variant="body2" color="text.secondary" noWrap>
//               {ev.location || "—"}
//             </Typography>
//           </Stack>
//           <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
//             <AccessTimeIcon fontSize="small" color="disabled" />
//             <Typography variant="body2" color="text.secondary" noWrap>
//               {formatDateRange(ev.startTime, ev.endTime)}
//             </Typography>
//           </Stack>

//           {seatsUsed !== undefined && ev.capacity ? (
//             <Box sx={{ mt: 1.25 }}>
//               <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 99 }} />
//               <Stack direction="row" justifyContent="space-between" mt={0.5}>
//                 <Typography variant="caption" color="text.secondary">
//                   Đã đăng ký: {seatsUsed}/{ev.capacity}
//                 </Typography>
//                 {ev.status && (
//                   <Chip
//                     size="small"
//                     label={ev.status}
//                     color={ev.status === "APPROVED" ? "success" : "default"}
//                     variant="outlined"
//                   />
//                 )}
//               </Stack>
//             </Box>
//           ) : (
//             ev.status && <Chip sx={{ mt: 1 }} size="small" label={ev.status} />
//           )}
//         </CardContent>
//       </RouterLink>
//     </Card>
//   );
// }

// /* ================= Utils ================= */
// function formatDateRange(start?: string, end?: string) {
//   if (!start) return "—";
//   try {
//     const s = new Date(start);
//     const e = end ? new Date(end) : undefined;
//     const sameDay = e && s.toDateString() === e.toDateString();
//     const fmt = (d: Date) => d.toLocaleString();
//     if (!e) return fmt(s);
//     return sameDay ? `${fmt(s)} – ${e.toLocaleTimeString()}` : `${fmt(s)} → ${fmt(e)}`;
//   } catch {
//     return start;
//   }
// }



// src/pages/home/HomePage.tsx
import { useMemo, useState, useContext, useRef, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  LinearProgress,
  Skeleton,
  IconButton,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ExploreIcon from "@mui/icons-material/TravelExplore";
import EventIcon from "@mui/icons-material/Event";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Sparkles from "@mui/icons-material/AutoAwesome";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import { motion } from "framer-motion";
import { ColorModeCtx } from "../../theme/theme";
import { fetchPublicEvents, EventResponse } from "../../features/events/eventsApi";
import EventCard from "../../components/events/EventCard";

/* ================= Motion presets ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: d, ease: [0.22, 1, 0.36, 1] } }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: (d = 0) => ({ opacity: 1, transition: { duration: 0.5, delay: d } }),
};


/* ================= Countdown hook & UI ================= */
function useCountdown(targetISO?: string) {
  const [now, setNow] = useState(() => Date.now());
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!targetISO) return;
    timer.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [targetISO]);

  const target = targetISO ? new Date(targetISO).getTime() : undefined;
  const msLeft = target ? Math.max(0, target - now) : 0;

  const totalSeconds = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, msLeft, isOver: msLeft <= 0 };
}

function CountdownPill({ value, label }: { value: number; label: string }) {
  return (
    <Stack
      alignItems="center"
      sx={{
        minWidth: 66,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
        boxShadow: (t) => t.shadows[1],
      }}
    >
      <Typography variant="h5" fontWeight={900}>
        {String(value).padStart(2, "0")}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function CountdownTicker({ targetISO, compact }: { targetISO?: string; compact?: boolean }) {
  const { days, hours, minutes, seconds, isOver } = useCountdown(targetISO);
  if (!targetISO) return null;
  if (isOver) {
    return (
      <Chip
        icon={<ScheduleRoundedIcon />}
        label="Đang diễn ra"
        color="success"
        variant="filled"
        sx={{ fontWeight: 700 }}
      />
    );
  }
  if (compact) {
    return (
      <Chip
        icon={<HourglassBottomRoundedIcon />}
        label={`${days}d ${hours}h ${minutes}m ${seconds}s`}
        variant="outlined"
      />
    );
  }
  return (
    <Stack direction="row" gap={1.25} alignItems="center" flexWrap="wrap">
      <CountdownPill value={days} label="Ngày" />
      <CountdownPill value={hours} label="Giờ" />
      <CountdownPill value={minutes} label="Phút" />
      <CountdownPill value={seconds} label="Giây" />
    </Stack>
  );
}

/* ================= Page ================= */
export default function HomePage() {
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
  const { toggle, mode } = useContext(ColorModeCtx);

  // 👉 Kết nối API thay vì dữ liệu tĩnh
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchPublicEvents({ status: "APPROVED", page: 0, size: 16 });
        if (!mounted) return;
        setEvents(res.content || []);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to fetch events:", err);
        setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // upcoming & hot banner
  const now = Date.now();
  const upcoming = useMemo(
    () =>
      (events || [])
        .filter((e) => e.startTime && new Date(e.startTime).getTime() >= now)
        .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime()),
    [events, now]
  );
  const hotBanner = upcoming[0] || events[0];

  const quickFilters = useMemo(
    () => [
      { label: "Công nghệ", q: "tech" },
      { label: "Workshop", q: "workshop" },
      { label: "Kỹ năng", q: "skill" },
      { label: "Nghệ thuật", q: "art" },
      { label: "Khởi nghiệp", q: "startup" },
      { label: "Giao lưu", q: "networking" },
    ],
    []
  );

  const bgMesh = `
    radial-gradient(800px 500px at 20% 5%, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 60%),
    radial-gradient(700px 420px at 85% 0%, ${alpha(theme.palette.secondary.main, 0.25)} 0%, transparent 60%),
    radial-gradient(700px 520px at 10% 90%, ${alpha(theme.palette.success.main, 0.18)} 0%, transparent 60%)
  `;

  // Hiển thị error nếu có
  if (error) {
    return (
      <Box sx={{ position: "relative", overflow: "hidden", minHeight: "100vh", background: bgMesh }}>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Thử lại
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", overflow: "hidden", minHeight: "100vh", background: bgMesh }}>
      {/* Subtle grid overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          opacity: mode === "light" ? 1 : 0.35,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        {/* Topbar tiny actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip
            icon={<Sparkles />}
            label="Public beta"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderColor: alpha(theme.palette.primary.main, 0.25),
              border: "1px solid",
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          />
          <IconButton
            onClick={toggle}
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              borderRadius: 2,
              backdropFilter: "blur(8px)",
            }}
            aria-label="toggle color mode"
            title={`Chuyển sang chế độ ${mode === "light" ? "tối" : "sáng"}`}
          >
            {mode === "light" ? "🌙" : "☀️"}
          </IconButton>
        </Stack>

        {/* ======== HOT BANNER with countdown ======== */}
        <Grid container spacing={4} alignItems="stretch" sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <motion.div variants={fadeIn} initial="hidden" animate="show">
              <Card
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  minHeight: { xs: 280, md: 360 },
                  boxShadow: `0 24px 80px ${alpha(theme.palette.primary.main, 0.25)}`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                }}
              >
                {/* Background image */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("${
                      hotBanner?.mainImageUrl ||
                      "https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1600&auto=format&fit=crop"
                    }")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    filter: "brightness(0.75)",
                  }}
                />
                {/* Overlay gradient */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(90deg, ${alpha(theme.palette.background.default, 0.85)} 0%, transparent 45%)`,
                  }}
                />
                <Grid container sx={{ position: "relative", zIndex: 1, height: "100%" }}>
                  <Grid item xs={12} md={7}>
                    <Stack spacing={2.25} sx={{ p: { xs: 3, md: 5 } }}>
                      <Chip
                        icon={<LocalFireDepartmentRoundedIcon />}
                        color="error"
                        label="Sự kiện HOT"
                        sx={{ alignSelf: "flex-start", fontWeight: 800 }}
                      />
                      <Typography variant={isMdDown ? "h4" : "h3"} fontWeight={900} lineHeight={1.05} noWrap>
                        {hotBanner?.name || "Khám phá sự kiện nổi bật tuần này"}
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        <PlaceIcon fontSize="small" />
                        <Typography fontWeight={600}>{hotBanner?.location || "—"}</Typography>
                        <AccessTimeIcon fontSize="small" sx={{ ml: 2 }} />
                        <Typography color="text.secondary">
                          {hotBanner?.startTime ? new Date(hotBanner.startTime).toLocaleString() : "—"}
                        </Typography>
                      </Stack>

                      {/* Countdown big */}
                      <CountdownTicker targetISO={hotBanner?.startTime} />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={1}>
                        <Button
                          component={RouterLink}
                          to={hotBanner ? `/events/${hotBanner.id}` : "/events"}
                          size="large"
                          variant="contained"
                          startIcon={<ExploreIcon />}
                          sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 800,
                            boxShadow: `0 18px 48px ${alpha(theme.palette.primary.main, 0.35)}`,
                          }}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          component={RouterLink}
                          to="/events"
                          size="large"
                          variant="outlined"
                          startIcon={<EventIcon />}
                          sx={{ px: 3.5, py: 1.5, borderRadius: 3, fontWeight: 800 }}
                        >
                          Tất cả sự kiện
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* QUICK FILTERS */}
        <Stack
          direction="row"
          gap={1}
          flexWrap="nowrap"
          sx={{
            mt: 1,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: alpha(theme.palette.text.primary, 0.2), borderRadius: 99 },
          }}
        >
          {quickFilters.map((f, i) => (
            <motion.div key={f.q} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.05}>
              <Chip
                clickable
                component={RouterLink as any}
                to={`/events?q=${encodeURIComponent(f.q)}`}
                label={f.label}
                variant="outlined"
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: "blur(6px)",
                  borderRadius: 2,
                }}
              />
            </motion.div>
          ))}
        </Stack>
      </Container>

      {/* ======== UPCOMING with countdown ======== */}
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" gap={1} alignItems="center">
            <ScheduleRoundedIcon />
            <Typography variant="h5" fontWeight={900}>Sắp diễn ra</Typography>
          </Stack>
          <Button component={RouterLink} to="/events" endIcon={<KeyboardArrowRightIcon />}>Xem tất cả</Button>
        </Stack>

        <Grid container spacing={2}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
                    <Skeleton variant="rectangular" height={164} />
                    <CardContent>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="50%" height={18} />
                      <Skeleton width="60%" height={18} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : (upcoming.length ? upcoming : events).slice(0, 6).map((ev, idx) => (
                <Grid key={ev.id} item xs={12} sm={6} md={4}>
                  <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0.03 * idx}>
                    <EventCard 
                      event={ev} 
                      actionLabel="Xem chi tiết"
                      onClick={() => window.location.href = `/events/${ev.id}`}
                    />
                  </motion.div>
                </Grid>
              ))}
        </Grid>
      </Container>

      {/* ======== FEATURED (fallback) ======== */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" gap={1} alignItems="center">
            <StarIcon />
            <Typography variant="h5" fontWeight={900}>Sự kiện nổi bật</Typography>
          </Stack>
          <Button component={RouterLink} to="/events" endIcon={<KeyboardArrowRightIcon />}>Xem tất cả</Button>
        </Stack>

        <Grid container spacing={2}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
                    <Skeleton variant="rectangular" height={164} />
                    <CardContent>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="50%" height={18} />
                      <Skeleton width="60%" height={18} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : (events || []).slice(0, 6).map((ev, idx) => (
                <Grid key={ev.id} item xs={12} sm={6} md={4}>
                  <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0.03 * idx}>
                    <EventCard 
                      event={ev} 
                      actionLabel="Xem chi tiết"
                      onClick={() => window.location.href = `/events/${ev.id}`}
                    />
                  </motion.div>
                </Grid>
              ))}
        </Grid>
      </Container>

      {/* CTA BOTTOM */}
      <Container maxWidth="lg" sx={{ pb: { xs: 12, md: 14 } }}>
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
              theme.palette.secondary.main, 0.1
            )} 50%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            boxShadow: theme.shadows[6],
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant={isMdDown ? "h4" : "h3"} fontWeight={900} gutterBottom>
                Biến mỗi sự kiện thành một trải nghiệm đáng nhớ
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Khám phá – Kết nối – Học hỏi. Bắt đầu ngay hôm nay.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button component={RouterLink} to="/events" size="large" variant="contained" sx={{ py: 1.5, fontWeight: 800, borderRadius: 3 }}>
                  Xem sự kiện
                </Button>
                <Button component={RouterLink} to="/signup" size="large" variant="outlined" sx={{ py: 1.5, fontWeight: 800, borderRadius: 3 }}>
                  Bắt đầu miễn phí
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* Sticky CTA for mobile */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 12,
          display: { xs: "flex", md: "none" },
          justifyContent: "center",
          zIndex: 10,
          px: 2,
        }}
      >
        <Card
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 560,
            borderRadius: 999,
            px: 2,
            py: 1,
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            background: alpha(theme.palette.background.paper, 0.9),
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography fontWeight={800}>Khám phá ngay</Typography>
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/events" size="small" variant="contained">
                Sự kiện
              </Button>
              <Button component={RouterLink} to="/signup" size="small" variant="outlined">
                Đăng ký
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}


/* ================= Utils ================= */
function formatDateRange(start?: string, end?: string) {
  if (!start) return "—";
  try {
    const s = new Date(start);
    const e = end ? new Date(end) : undefined;
    const sameDay = e && s.toDateString() === e.toDateString();
    const fmt = (d: Date) => d.toLocaleString();
    if (!e) return fmt(s);
    return sameDay ? `${fmt(s)} – ${e.toLocaleTimeString()}` : `${fmt(s)} → ${fmt(e)}`;
  } catch {
    return start;
  }
}
