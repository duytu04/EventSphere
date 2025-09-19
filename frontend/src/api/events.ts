// src/api/events.ts
import api from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export type EventResponse = {
  id: number;               // map từ eventId
  name: string;             // map từ title
  description?: string;
  category?: string;
  location?: string;        // map từ venue
  startTime: string;        // LocalDateTime (server) -> FE string
  endTime: string;
  seatsAvailable?: number;
  capacity?: number;
  status?: string;
  version?: number;
};

type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const mapDto = (e: any): EventResponse => ({
  id: e.id ?? e.eventId,           // BE dùng eventId
  name: e.name ?? e.title,
  description: e.description,
  category: e.category,
  location: e.location ?? e.venue,
  startTime: e.startTime,
  endTime: e.endTime,
  seatsAvailable: e.seatsAvailable ?? e.seatsAvail,
  capacity: e.capacity ?? e.totalSeats,
  status: e.status,
  version: e.version,
});

// Chuẩn hoá PagedResponse từ BE (Public & Admin đều trả dạng này)
const normalizePage = (data: any): PagedResponse<EventResponse> => {
  const contentRaw = data?.content ?? [];
  const content = Array.isArray(contentRaw) ? contentRaw.map(mapDto) : [];
  return {
    content,
    page: data?.page ?? 0,
    size: data?.size ?? content.length,
    totalElements: data?.totalElements ?? content.length,
    totalPages: data?.totalPages ?? 1,
  };
};

// PUBLIC
export async function fetchPublicEvents(params?: { q?: string; page?: number; size?: number }) {
  const { q = "", page = 0, size = 10 } = params ?? {};
  const { data } = await api.get(ENDPOINTS.events.list, { params: { q, page, size } });
  return normalizePage(data);
}

// ADMIN
export async function fetchAdminEvents(params?: { q?: string; status?: string; page?: number; size?: number }) {
  const { q, status, page = 0, size = 10 } = params ?? {};
  const { data } = await api.get(ENDPOINTS.admin.events, { params: { q, status, page, size } });
  return normalizePage(data);
}

export async function createAdminEvent(payload: {
  name: string;
  description?: string;
  category?: string;
  location?: string;
  startTime: string; // ISO hoặc "YYYY-MM-DDTHH:mm"
  endTime: string;
  capacity?: number;
}) {
  const { data } = await api.post(ENDPOINTS.admin.events, payload);
  return mapDto(data);
}

export async function approveEvent(id: number) {
  await api.post(`${ENDPOINTS.admin.events}/${id}/approve`);
}

export async function rejectEvent(id: number) {
  await api.post(`${ENDPOINTS.admin.events}/${id}/reject`);
}
