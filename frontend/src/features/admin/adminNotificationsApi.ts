import axiosClient from '../../api/axiosClient';

export interface AdminNotificationResponse {
  id: number;
  type: 'EVENT_EDIT_REQUEST' | 'EVENT_APPROVAL_REQUEST' | 'USER_REGISTRATION' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationStatsResponse {
  totalUnread: number;
  editRequestUnread: number;
  approvalRequestUnread: number;
  userRegistrationUnread: number;
  systemAlertUnread: number;
}

export async function fetchNotifications(unreadOnly: boolean = false): Promise<AdminNotificationResponse[]> {
  const response = await axiosClient.get(`/api/admin/notifications?unreadOnly=${unreadOnly}`);
  return response.data;
}

export async function fetchNotificationStats(): Promise<NotificationStatsResponse> {
  const response = await axiosClient.get('/api/admin/notifications/stats');
  return response.data;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await axiosClient.post(`/api/admin/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await axiosClient.post('/api/admin/notifications/read-all');
}

