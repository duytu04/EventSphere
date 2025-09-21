


// // src/features/events/eventsApi.ts
// import api from "../../api/axiosClient";
// import { ENDPOINTS } from "../../api/endpoints";

// /* ================== Types ================== */
// export type EventResponse = {
//   id: number;               // map từ eventId
//   name: string;             // map từ title
//   description?: string;
//   category?: string;
//   location?: string;        // map từ venue
//   startTime: string;        // ISO string
//   endTime: string;
//   seatsAvailable?: number;
//   capacity?: number;        // map từ totalSeats
//   status?: string;          // APPROVED | PENDING_APPROVAL | REJECTED | ...
//   version?: number;
// };

// export type PagedResponse<T> = {
//   content: T[];
//   page: number;
//   size: number;
//   totalElements: number;
//   totalPages: number;
// };

// export type EventCreatePayload = {
//   name: string;
//   description?: string;
//   category?: string;
//   location?: string;
//   startTime: string; // "YYYY-MM-DDTHH:mm" hoặc ISO
//   endTime: string;
//   capacity?: number;
// };

// export type EventUpdatePayload = Partial<EventCreatePayload> & {
//   id?: number;
//   version?: number;
// };

// /* ================== Helpers ================== */
// const mapDto = (e: any): EventResponse => ({
//   id: e?.id ?? e?.eventId,
//   name: e?.name ?? e?.title,
//   description: e?.description,
//   category: e?.category,
//   location: e?.location ?? e?.venue,
//   startTime: e?.startTime,
//   endTime: e?.endTime,
//   seatsAvailable: e?.seatsAvailable ?? e?.seatsAvail,
//   capacity: e?.capacity ?? e?.totalSeats,
//   status: e?.status ?? e?.approvalStatus, // phòng trường hợp BE trả approvalStatus
//   version: e?.version,
// });

// const normalizePage = (data: any): PagedResponse<EventResponse> => {
//   const contentRaw = data?.content ?? [];
//   const content = Array.isArray(contentRaw) ? contentRaw.map(mapDto) : [];
//   return {
//     content,
//     page: data?.page ?? 0,
//     size: data?.size ?? content.length,
//     totalElements: data?.totalElements ?? content.length,
//     totalPages: data?.totalPages ?? 1,
//   };
// };

// // URL tiện ích (fallback nếu ENDPOINTS chưa có builder .event)
// const adminEventUrl = (id: number | string) =>
//   (ENDPOINTS.admin as any)?.event ? (ENDPOINTS.admin as any).event(id) : `${ENDPOINTS.admin.events}/${id}`;

// const organizerEventUrl = (id: number | string) =>
//   (ENDPOINTS.organizer as any)?.event ? (ENDPOINTS.organizer as any).event(id) : `${ENDPOINTS.organizer.events}/${id}`;

// /* ================== PUBLIC ================== */
// export async function fetchPublicEvents(params?: { q?: string; page?: number; size?: number }) {
//   const { q = "", page = 0, size = 10 } = params ?? {};
//   const { data } = await api.get(ENDPOINTS.public.events, { params: { q, page, size } });
//   return normalizePage(data);
// }

// export async function fetchPublicEventById(id: number) {
//   // scaffold đã định nghĩa ENDPOINTS.public.event(id)
//   const { data } = await api.get(ENDPOINTS.public.event(id));
//   return mapDto(data);
// }

// /* ================== ADMIN ================== */
// export async function fetchAdminEvents(params?: { q?: string; status?: string; page?: number; size?: number }) {
//   const { q, status, page = 0, size = 10 } = params ?? {};
//   const { data } = await api.get(ENDPOINTS.admin.events, { params: { q, status, page, size } });
//   return normalizePage(data);
// }

// export async function fetchAdminEventById(id: number) {
//   // Nếu BE có GET /api/admin/events/{id} → dùng adminEventUrl
//   // Nếu chưa có, bạn có thể tạm dùng public detail
//   try {
//     const { data } = await api.get(adminEventUrl(id));
//     return mapDto(data);
//   } catch {
//     const { data } = await api.get(ENDPOINTS.public.event(id));
//     return mapDto(data);
//   }
// }

// export async function createAdminEvent(payload: EventCreatePayload) {
//   const { data } = await api.post(ENDPOINTS.admin.events, payload);
//   return mapDto(data);
// }

// export async function updateAdminEvent(id: number, payload: EventUpdatePayload) {
//   const { data } = await api.put(adminEventUrl(id), payload);
//   return mapDto(data);
// }

// export async function deleteAdminEvent(id: number) {
//   await api.delete(adminEventUrl(id));
// }

// export async function approveEvent(id: number) {
//   // Phương án REST “đẹp”:
//   // return api.put(ENDPOINTS.admin.eventsApprove(id));
//   // Fallback (BE hiện tại đang dùng POST /events/{id}/approve):
//   return api.post(`${ENDPOINTS.admin.events}/${id}/approve`);
// }

// export async function rejectEvent(id: number) {
//   // Phương án REST “đẹp”:
//   // return api.put(ENDPOINTS.admin.eventsReject(id));
//   // Fallback:
//   return api.post(`${ENDPOINTS.admin.events}/${id}/reject`);
// }

// /* ================== ORGANIZER ================== */
// export async function fetchOrganizerEvents(params?: { q?: string; status?: string; page?: number; size?: number }) {
//   const { q, status, page = 0, size = 10 } = params ?? {};
//   const { data } = await api.get(ENDPOINTS.organizer.events, { params: { q, status, page, size } });
//   return normalizePage(data);
// }

// export async function fetchOrganizerEventById(id: number) {
//   const { data } = await api.get(organizerEventUrl(id));
//   return mapDto(data);
// }

// export async function createOrganizerEvent(payload: EventCreatePayload) {
//   const { data } = await api.post(ENDPOINTS.organizer.events, payload);
//   return mapDto(data);
// }

// export async function updateOrganizerEvent(id: number, payload: EventUpdatePayload) {
//   const { data } = await api.put(organizerEventUrl(id), payload);
//   return mapDto(data);
// }

// export async function deleteOrganizerEvent(id: number) {
//   await api.delete(organizerEventUrl(id));
// }



// src/features/events/eventsApi.ts
import api from "../../api/axiosClient";
import { ENDPOINTS } from "../../api/endpoints";

/* ================== Types ================== */
export type EventResponse = {
  id: number;               // map từ eventId
  name: string;             // map từ title
  description?: string;
  mainImageUrl?: string;    // NEW
  category?: string;
  location?: string;        // map từ venue
  startTime: string;        // ISO string
  endTime: string;
  seatsAvailable?: number;
  capacity?: number;        // map từ totalSeats
  status?: string;          // APPROVED | PENDING_APPROVAL | REJECTED | ...
  version?: number;
};

export type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type EventCreatePayload = {
  name: string;
  description?: string;
  category?: string;
  location?: string;
  startTime: string; // "YYYY-MM-DDTHH:mm" hoặc ISO
  endTime: string;
  capacity?: number;
  mainImageUrl?: string; // NEW
};

export type EventUpdatePayload = Partial<EventCreatePayload> & {
  id?: number;
  version?: number;
};

/* ================== URL helpers (có fallback) ================== */
const publicListUrl =
  (ENDPOINTS.public as any)?.events ?? "/api/events";
const publicDetailUrl = (id: number | string) =>
  (ENDPOINTS.public as any)?.event
    ? (ENDPOINTS.public as any).event(id)
    : `/api/events/${id}`;

const adminListUrl =
  (ENDPOINTS.admin as any)?.events ?? "/api/admin/events";
const adminEventUrl = (id: number | string) =>
  (ENDPOINTS.admin as any)?.event
    ? (ENDPOINTS.admin as any).event(id)
    : `${adminListUrl}/${id}`;

const organizerListUrl =
  (ENDPOINTS.organizer as any)?.events ?? "/api/organizer/events";
const organizerEventUrl = (id: number | string) =>
  (ENDPOINTS.organizer as any)?.event
    ? (ENDPOINTS.organizer as any).event(id)
    : `${organizerListUrl}/${id}`;

/* ================== Helpers ================== */
const mapDto = (e: any): EventResponse => ({
  id: e?.id ?? e?.eventId,
  name: e?.name ?? e?.title,
  description: e?.description,
  mainImageUrl: e?.mainImageUrl ?? e?.imageUrl, // NEW (fallback imageUrl cũ)
  category: e?.category,
  location: e?.location ?? e?.venue,
  startTime: e?.startTime,
  endTime: e?.endTime,
  seatsAvailable: e?.seatsAvailable ?? e?.seatsAvail,
  capacity: e?.capacity ?? e?.totalSeats,
  status: e?.status ?? e?.approvalStatus,
  version: e?.version,
});

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

/* ================== PUBLIC ================== */
export async function fetchPublicEvents(params?: {
  q?: string;
  status?: string; // BE hiện tại hỗ trợ lọc status ở /api/events
  page?: number;
  size?: number;
}) {
  const { q = "", status, page = 0, size = 10 } = params ?? {};
  const { data } = await api.get(publicListUrl, { params: { q, status, page, size } });
  return normalizePage(data);
}

export async function fetchPublicEventById(id: number) {
  const { data } = await api.get(publicDetailUrl(id));
  return mapDto(data);
}

/* ================== ADMIN ================== */
export async function fetchAdminEvents(params?: {
  q?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  const { q, status, page = 0, size = 10 } = params ?? {};
  const { data } = await api.get(adminListUrl, { params: { q, status, page, size } });
  return normalizePage(data);
}

export async function fetchAdminEventById(id: number) {
  // Nếu chưa có GET /api/admin/events/{id}, fallback sang public detail
  try {
    const { data } = await api.get(adminEventUrl(id));
    return mapDto(data);
  } catch {
    const { data } = await api.get(publicDetailUrl(id));
    return mapDto(data);
  }
}

export async function createAdminEvent(payload: EventCreatePayload, organizerId?: number) {
  // ADMIN tạo thay organizer: thêm query param organizerId nếu có
  const config = organizerId ? { params: { organizerId } } : undefined;
  const { data } = await api.post(adminListUrl, payload, config);
  return mapDto(data);
}

export async function updateAdminEvent(id: number, payload: EventUpdatePayload) {
  const { data } = await api.put(adminEventUrl(id), payload);
  return mapDto(data);
}

export async function deleteAdminEvent(id: number) {
  await api.delete(adminEventUrl(id));
}

export async function approveEvent(id: number) {
  // Fallback cho BE hiện tại: POST /api/admin/events/{id}/approve
  return api.post(`${adminListUrl}/${id}/approve`);
}

export async function rejectEvent(id: number) {
  return api.post(`${adminListUrl}/${id}/reject`);
}

/* ================== ORGANIZER ================== */
export async function fetchOrganizerEvents(params?: {
  q?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  const { q, status, page = 0, size = 10 } = params ?? {};
  const { data } = await api.get(organizerListUrl, { params: { q, status, page, size } });
  return normalizePage(data);
}

export async function fetchOrganizerEventById(id: number) {
  const { data } = await api.get(organizerEventUrl(id));
  return mapDto(data);
}

export async function createOrganizerEvent(payload: EventCreatePayload) {
  const { data } = await api.post(organizerListUrl, payload);
  return mapDto(data);
}

export async function updateOrganizerEvent(id: number, payload: EventUpdatePayload) {
  const { data } = await api.put(organizerEventUrl(id), payload);
  return mapDto(data);
}

export async function deleteOrganizerEvent(id: number) {
  await api.delete(organizerEventUrl(id));
}
