import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { fetchNotifications, fetchNotificationStats, markNotificationAsRead, markAllNotificationsAsRead, AdminNotificationResponse, NotificationStatsResponse } from '../../features/admin/adminNotificationsApi';

interface NotificationBellProps {
  onNotificationClick?: (notification: AdminNotificationResponse) => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<AdminNotificationResponse[]>([]);
  const [stats, setStats] = useState<NotificationStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const open = Boolean(anchorEl);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        fetchNotifications(false),
        fetchNotificationStats()
      ]);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      enqueueSnackbar('Không thể tải thông báo', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: AdminNotificationResponse) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
        );
        if (stats) {
          setStats(prev => prev ? { ...prev, totalUnread: prev.totalUnread - 1 } : null);
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setStats(prev => prev ? { ...prev, totalUnread: 0 } : null);
      enqueueSnackbar('Đã đánh dấu tất cả thông báo là đã đọc', { variant: 'success' });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      enqueueSnackbar('Không thể đánh dấu tất cả thông báo', { variant: 'error' });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT_EDIT_REQUEST':
        return <EditIcon color="primary" />;
      case 'EVENT_APPROVAL_REQUEST':
        return <CheckCircleIcon color="success" />;
      case 'USER_REGISTRATION':
        return <PersonAddIcon color="info" />;
      case 'SYSTEM_ALERT':
        return <WarningIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'EVENT_EDIT_REQUEST':
        return 'primary';
      case 'EVENT_APPROVAL_REQUEST':
        return 'success';
      case 'USER_REGISTRATION':
        return 'info';
      case 'SYSTEM_ALERT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const unreadCount = stats?.totalUnread || 0;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 600 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Thông báo</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Đánh dấu tất cả
              </Button>
            )}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Không có thông báo nào
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Chip size="small" label="Mới" color="error" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}

