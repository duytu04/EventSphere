import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import { Chip, type ChipProps } from "@mui/material";

interface SeatsChipProps {
  seatsAvailable?: number | null;
  capacity?: number | null;
  size?: ChipProps["size"];
  dense?: boolean;
}

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function buildLabel(seatsAvailable?: number | null, capacity?: number | null) {
  const remaining = seatsAvailable ?? (capacity ?? null);

  if (remaining == null) {
    return "Còn chỗ trống";
  }

  const safeRemaining = Math.max(0, remaining);
  const base = "Còn " + formatNumber(safeRemaining) + " chỗ trống";

  if (capacity != null && capacity > 0 && seatsAvailable != null) {
    return base + " / " + formatNumber(Math.max(0, capacity)) + " chỗ";
  }

  if (capacity != null && capacity > 0 && seatsAvailable == null) {
    return base + " (tạm tính)";
  }

  return base;
}

function resolveColor(seatsAvailable?: number | null, capacity?: number | null): ChipProps["color"] {
  const remainingRaw = seatsAvailable ?? (capacity ?? 0);
  const remaining = Math.max(0, remainingRaw);

  if (remaining <= 0) return "error";

  if (capacity != null && capacity > 0 && seatsAvailable != null) {
    const ratio = Math.max(0, seatsAvailable) / capacity;
    if (ratio <= 0.15) return "warning";
    if (ratio >= 0.6) return "success";
  }

  return "primary";
}

export default function SeatsChip({ seatsAvailable, capacity, size = "small", dense = false }: SeatsChipProps) {
  const label = buildLabel(seatsAvailable, capacity);
  const color = resolveColor(seatsAvailable, capacity);

  return (
    <Chip
      icon={!dense ? <EventSeatRoundedIcon fontSize="small" /> : undefined}
      label={label}
      color={color}
      variant={color === "default" ? "outlined" : "filled"}
      size={size}
      sx={{
        fontWeight: 600,
        borderRadius: 999,
        px: dense ? 0.5 : 1.25,
        py: dense ? 0 : 0.25,
        '& .MuiChip-icon': {
          ml: dense ? 0 : 0.5,
        },
      }}
    />
  );
}
