import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

export type EventView = "upcoming" | "all";

interface SummaryData {
  total: number;
  upcoming: number;
  capacityAvailable: number;
}

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: EventView;
  onViewChange: (value: EventView) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  summary?: SummaryData;
  sx?: SxProps<Theme>;
  showFilterButton?: boolean;
  disabled?: boolean;
}

function renderSummary(summary?: SummaryData) {
  if (!summary) return "Các sự kiện đang được cập nhật";

  const totalText = summary.total.toLocaleString("vi-VN");
  const upcomingText = summary.upcoming.toLocaleString("vi-VN");
  return totalText + " sự kiện, " + upcomingText + " sắp diễn ra";
}

export default function EventFilters({
  search,
  onSearchChange,
  view,
  onViewChange,
  categories,
  selectedCategory,
  onCategoryChange,
  summary,
  sx,
  showFilterButton = true,
  disabled,
}: EventFiltersProps) {
  const theme = useTheme();
  const summaryText = renderSummary(summary);
  const background = "linear-gradient(135deg, "
    + alpha(theme.palette.primary.main, 0.18)
    + " 0%, "
    + alpha(theme.palette.secondary.main, 0.2)
    + " 45%, "
    + alpha(theme.palette.primary.dark, 0.22)
    + " 100%)";

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4,
        overflow: "hidden",
        background: background,
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 6 },
        boxShadow: theme.shadows[12],
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "-30%",
            background: "radial-gradient(circle, "
              + alpha(theme.palette.common.white, 0.18)
              + " 0%, transparent 65%)",
            filter: "blur(40px)",
          },
        }}
      />

      <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
          <Chip
            icon={<EventAvailableRoundedIcon />}
            label="Khám phá sự kiện"
            color="secondary"
            sx={{ fontWeight: 600, borderRadius: 3 }}
          />
          <Typography variant="caption" color="text.primary" sx={{ opacity: 0.7 }}>
            {summaryText}
          </Typography>
        </Stack>

        <Typography variant="h3" fontWeight={700} lineHeight={1.1} maxWidth={680} color="common.white">
          Tìm kiếm sự kiện phù hợp với bạn và đăng ký chỉ trong vài giây
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            fullWidth
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên, địa điểm, chủ đề..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.common.white, 0.92),
                '& input': { fontWeight: 500 },
              },
            }}
            disabled={disabled}
          />

          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, value) => value && onViewChange(value)}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.common.white, 0.14),
              borderRadius: 3,
              '& .MuiToggleButton-root': {
                border: "none",
                color: theme.palette.common.white,
                textTransform: "none",
                px: 2.4,
                py: 1,
              },
            }}
            disabled={disabled}
          >
            <ToggleButton value="upcoming">Sắp diễn ra</ToggleButton>
            <ToggleButton value="all">Tất cả sự kiện</ToggleButton>
          </ToggleButtonGroup>

          {showFilterButton && (
            <Tooltip title="Tuỳ chọn lọc nâng cao (sắp ra mắt)">
              <span>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<FilterAltRoundedIcon />}
                  disabled
                  sx={{
                    borderRadius: 3,
                    color: theme.palette.common.white,
                    borderColor: alpha(theme.palette.common.white, 0.5),
                    '&:hover': {
                      borderColor: theme.palette.common.white,
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  Bộ lọc
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
          {categories.map((category) => {
            const isActive = category === selectedCategory;
            const label = category === "ALL" ? "Tất cả" : category;
            return (
              <Chip
                key={category}
                label={label}
                color={isActive ? "primary" : "default"}
                onClick={() => onCategoryChange(category)}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 500,
                  backgroundColor: isActive
                    ? alpha(theme.palette.common.white, 0.2)
                    : alpha(theme.palette.common.white, 0.1),
                  color: theme.palette.common.white,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.25),
                  },
                }}
              />
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}
