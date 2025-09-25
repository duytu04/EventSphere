import api from "../../api/axiosClient";
import { ENDPOINTS } from "../../api/endpoints";

export type AttendanceMarkRequest = {
  eventId: number;
  userId?: number; // cho manual
  qrToken?: string; // token giải từ QR
};

export type AttendanceMarkResponse = {
  id: number;
  userId: number;
  eventId: number;
  method: "QR" | "MANUAL";
  markedAt: string; // ISO
};

export async function markAttendance(req: AttendanceMarkRequest) {
  const { data } = await api.post(ENDPOINTS.organizer.attendanceMark, req);
  return data as AttendanceMarkResponse;
}

export async function fetchAttendanceLogs(eventId: number, page: number = 0, size: number = 20) {
  const { data } = await api.get(ENDPOINTS.organizer.attendanceLogs(eventId, page, size));
  return data;
}

export type OrganizerEvent = {
  id: number;
  title: string;
  startTime: string;
  endTime?: string;
  status: string;
};

export async function fetchOrganizerEvents(): Promise<OrganizerEvent[]> {
  const { data } = await api.get(ENDPOINTS.organizer.events);
  return data.content?.map((event: any) => ({
    id: event.id,
    title: event.name || event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status,
  })) || [];
}

export type AttendanceLog = {
  id: number;
  userId: number;
  eventId: number;
  method: "QR" | "MANUAL";
  markedAt: string;
  attendeeName?: string;
  attendeeEmail?: string;
};

export type AttendanceStats = {
  totalCheckedIn: number;
  totalRegistered: number;
  totalErrors: number;
};


