// // src/features/admin/adminApi.ts
// // Gom toàn bộ API quản trị (Users/Organizers; có thể mở rộng Events sau)

// export type Role = "ADMIN" | "ORGANIZER" | "USER";

// export interface UserResponse {
//   id: number;
//   email: string;
//   fullName: string;
//   enabled: boolean;
//   roles: Role[];
// }

// export interface Paged<T> {
//   content: T[];
//   totalElements: number;
//   totalPages: number;
//   size: number;
//   number: number;
// }

// const BASE = "/api/admin";

// // ----- HTTP helper -----
// async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
//   const res = await fetch(input, {
//     ...init,
//     headers: {
//       "Content-Type": "application/json",
//       ...(init?.headers || {}),
//     },
//     credentials: "include", // nếu backend dùng cookie/session
//   });
//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(text || `${res.status} ${res.statusText}`);
//   }
//   // Một số endpoint 204/empty body:
//   if (res.status === 204) return {} as T;
//   return res.json().catch(() => ({} as T));
// }

// // ===== USERS & ORGANIZERS =====

// // Liệt kê users (filter role/q, phân trang)
// export async function listUsers(params: { q?: string; role?: Role; page?: number; size?: number }) {
//   const q = params.q ? `&q=${encodeURIComponent(params.q)}` : "";
//   const role = params.role ? `&role=${params.role}` : "";
//   const page = params.page ?? 0;
//   const size = params.size ?? 10;
//   return http<Paged<UserResponse>>(`${BASE}/users?page=${page}&size=${size}${q}${role}`);
// }

// // Tạo user (roles mặc định = ["USER"])
// export async function createUser(body: {
//   email: string;
//   fullName: string;
//   password: string;
//   enabled?: boolean;
//   roles?: Role[];
// }) {
//   return http<UserResponse>(`${BASE}/users`, {
//     method: "POST",
//     body: JSON.stringify({
//       ...body,
//       enabled: body.enabled ?? true,
//       roles: body.roles ?? ["USER"],
//     }),
//   });
// }

// // Tạo organizer (user có role ORGANIZER)
// export async function createOrganizer(body: { email: string; fullName: string; password: string; enabled?: boolean }) {
//   return createUser({ ...body, roles: ["ORGANIZER"] });
// }

// // Cập nhật user (tên + enabled)
// export async function updateUser(id: number, body: { fullName: string; enabled?: boolean }) {
//   return http<UserResponse>(`${BASE}/users/${id}`, {
//     method: "PUT",
//     body: JSON.stringify(body),
//   });
// }

// // Xoá user
// export async function deleteUser(id: number) {
//   await http<void>(`${BASE}/users/${id}`, { method: "DELETE" });
// }

// // Bật/tắt user
// export async function enableUser(id: number, enabled: boolean) {
//   return http<UserResponse>(`${BASE}/users/${id}/enable?enabled=${enabled}`, { method: "POST" });
// }

// // Set roles cho user
// export async function setRoles(id: number, roles: Role[]) {
//   return http<UserResponse>(`${BASE}/users/${id}/roles`, {
//     method: "POST",
//     body: JSON.stringify({ userId: id, roles }),
//   });
// }



// src/features/admin/adminApi.ts
// Gom toàn bộ API quản trị (Users/Organizers; có thể mở rộng Events sau)

export type Role = "ADMIN" | "ORGANIZER" | "USER";

/* ========== DTOs chung ========== */

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  enabled: boolean;
  roles: Role[];
}

export interface Paged<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/** Event item tối giản cho trang quản trị */
export interface AdminEventItem {
  id: number;
  name?: string;      // tùy backend map
  title?: string;     // fallback hiển thị
  startTime?: string;
  endTime?: string;
  status?: string;
}

export type PagedEvents = Paged<AdminEventItem>;

const BASE = "/api/admin";

/* ========== HTTP helper ========== */
async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include", // nếu backend dùng cookie/session
  });

  if (!res.ok) {
    // cố gắng đọc text lỗi (để show alert meaningful hơn)
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }

  // No content
  if (res.status === 204) return {} as T;

  // Một số API có thể trả về empty body dù 200
  const txt = await res.text().catch(() => "");
  if (!txt) return {} as T;

  try {
    return JSON.parse(txt) as T;
  } catch {
    // phòng trường hợp server trả text/plain
    return {} as T;
  }
}

/* ========== USERS & ORGANIZERS ========== */

/** Liệt kê users (filter role/q, phân trang) */
export async function listUsers(params: { q?: string; role?: Role; page?: number; size?: number }) {
  const q = params.q ? `&q=${encodeURIComponent(params.q)}` : "";
  const role = params.role ? `&role=${params.role}` : "";
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  return http<Paged<UserResponse>>(`${BASE}/users?page=${page}&size=${size}${q}${role}`);
}

/** Tạo user (roles mặc định = ["USER"]) */
export async function createUser(body: {
  email: string;
  fullName: string;
  password: string;
  enabled?: boolean;
  roles?: Role[];
}) {
  return http<UserResponse>(`${BASE}/users`, {
    method: "POST",
    body: JSON.stringify({
      ...body,
      enabled: body.enabled ?? true,
      roles: body.roles ?? ["USER"],
    }),
  });
}

/** Tạo organizer (user có role ORGANIZER) */
export async function createOrganizer(body: { email: string; fullName: string; password: string; enabled?: boolean }) {
  return createUser({ ...body, roles: ["ORGANIZER"] });
}

/** Cập nhật user (tên + enabled) */
export async function updateUser(id: number, body: { fullName: string; enabled?: boolean }) {
  return http<UserResponse>(`${BASE}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** Xoá user */
export async function deleteUser(id: number) {
  await http<void>(`${BASE}/users/${id}`, { method: "DELETE" });
}

/** Bật/tắt user */
export async function enableUser(id: number, enabled: boolean) {
  return http<UserResponse>(`${BASE}/users/${id}/enable?enabled=${enabled}`, { method: "POST" });
}

/** Set roles cho user */
export async function setRoles(id: number, roles: Role[]) {
  return http<UserResponse>(`${BASE}/users/${id}/roles`, {
    method: "POST",
    body: JSON.stringify({ userId: id, roles }),
  });
}

/** Tìm user theo email (cố gắng khớp chính xác, case-insensitive) */
export async function findUserByEmailExact(email: string) {
  const page = await listUsers({ q: email, page: 0, size: 10 });
  const hit = page.content.find(u => u.email.toLowerCase() === email.toLowerCase());
  return hit ?? null;
}

/* ========== ADMIN EVENTS (cho Organizer) ========== */

/**
 * Liệt kê events theo organizerId
 * YÊU CẦU BE: hỗ trợ query param organizerId tại /api/admin/events
 * Ví dụ BE: GET /api/admin/events?organizerId=123&page=0&size=10
 */
export async function listAdminEvents(params: { organizerId: number; page?: number; size?: number }) {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  return http<PagedEvents>(`${BASE}/events?organizerId=${params.organizerId}&page=${page}&size=${size}`);
}
