import api from "../../api/axiosClient";
import { ENDPOINTS } from "../../api/endpoints";

// Types
export type RegistrationStatus = "CONFIRMED" | "WAITLISTED" | "CANCELLED" | "ATTENDED";

export type Registration = {
  id: number;
  eventId: number;
  eventName: string;
  eventLocation: string;
  eventStartTime: string;
  eventEndTime?: string;
  status: RegistrationStatus;
  registeredAt: string;
  qrCode?: string;
  isScanned?: boolean;
};

export type RegistrationSummary = {
  total: number;
  confirmed: number;
  attended: number;
  cancelled: number;
  waitlisted: number;
};

// API Functions
export async function fetchMyRegistrations(): Promise<Registration[]> {
  const { data } = await api.get(ENDPOINTS.registrations.myRegistrations);
  return data.map((reg: any) => ({
    id: reg.id,
    eventId: reg.eventId,
    eventName: reg.eventName || "Sự kiện",
    eventLocation: reg.eventLocation || "Địa điểm",
    eventStartTime: reg.eventStartTime || reg.startTime,
    eventEndTime: reg.eventEndTime || reg.endTime,
    status: reg.status || "CONFIRMED",
    registeredAt: reg.registeredAt || reg.createdAt,
    qrCode: reg.qrCode,
    isScanned: reg.isScanned || false,
  }));
}

export async function generateQRCode(registrationId: number): Promise<{ qrCode: string; expiresAt: string }> {
  const { data } = await api.post(ENDPOINTS.registrations.generateQR(registrationId));
  return {
    qrCode: data.qrCode,
    expiresAt: data.expiresAt,
  };
}

export async function markAttendance(registrationId: number): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(ENDPOINTS.registrations.markAttendance(registrationId));
  return data;
}

export async function getRegistrationSummary(): Promise<RegistrationSummary> {
  const registrations = await fetchMyRegistrations();
  return {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === "CONFIRMED").length,
    attended: registrations.filter(r => r.status === "ATTENDED").length,
    cancelled: registrations.filter(r => r.status === "CANCELLED").length,
    waitlisted: registrations.filter(r => r.status === "WAITLISTED").length,
  };
}
