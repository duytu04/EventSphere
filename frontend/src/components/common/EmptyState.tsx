import { Box, Typography, Button } from "@mui/material";

export default function EmptyState({ title="Không có dữ liệu", hint, actionLabel, onAction }:{
  title?: string; hint?: string; actionLabel?: string; onAction?: ()=>void;
}){
  return (
    <Box sx={{ textAlign:"center", py:6, opacity:0.8 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {hint && <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>{hint}</Typography>}
      {actionLabel && onAction && <Button variant="outlined" onClick={onAction}>{actionLabel}</Button>}
    </Box>
  );
}
