import axiosClient from '../../api/axiosClient';

export interface AdminMetricsResponse {
  kpis: {
    usersTotal: number;
    usersByRole: Record<string, number>;
    eventsTotal: number;
    eventsByStatus: Record<string, number>;
    registrationsTotal: number;
    attendanceTotal: number;
    capacityUtilizationPct: number;
  };
  pendingEvents: Array<{
    id: number;
    name: string;
    organizerName: string;
    startTime: string;
    capacity: number;
  }>;
  recentRegistrations: Array<{
    id: number;
    eventId: number;
    eventName: string;
    studentEmail: string;
    registeredOn: string;
  }>;
  capacityHotspots: Array<{
    eventId: number;
    eventName: string;
    capacity: number;
    seatsAvailable: number;
  }>;
  notificationStats: {
    totalUnread: number;
    editRequestUnread: number;
    approvalRequestUnread: number;
    userRegistrationUnread: number;
    systemAlertUnread: number;
  };
  lastUpdated: string;
}

export async function fetchAdminMetrics(): Promise<AdminMetricsResponse> {
  const response = await axiosClient.get('/api/admin/metrics');
  return response.data;
}

export async function approveEvent(eventId: number): Promise<void> {
  await axiosClient.post(`/api/admin/events/${eventId}/approve`);
}

export async function rejectEvent(eventId: number): Promise<void> {
  await axiosClient.post(`/api/admin/events/${eventId}/reject`);
}
