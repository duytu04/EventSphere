// src/features/admin/adminApi.ts
// Gom toàn bộ API quản trị (Users/Organizers; có thể mở rộng Events sau)

import axiosClient from "../../api/axiosClient";

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

/* ========== USERS & ORGANIZERS ========== */

/** Liệt kê users (filter role/q, phân trang) */
export async function listUsers(params: { q?: string; role?: Role; page?: number; size?: number }) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.append('q', params.q);
  if (params.role) searchParams.append('role', params.role);
  searchParams.append('page', String(params.page ?? 0));
  searchParams.append('size', String(params.size ?? 10));
  
  const response = await axiosClient.get(`/api/admin/users?${searchParams.toString()}`);
  return response.data;
}

/** Tạo user (roles mặc định = ["USER"]) */
export async function createUser(body: {
  email: string;
  fullName: string;
  password: string;
  enabled?: boolean;
  roles?: Role[];
}) {
  const response = await axiosClient.post('/api/admin/users', {
    ...body,
    enabled: body.enabled ?? true,
    roles: body.roles ?? ["USER"],
  });
  return response.data;
}

/** Tạo organizer (user có role ORGANIZER) */
export async function createOrganizer(body: { email: string; fullName: string; password: string; enabled?: boolean }) {
  return createUser({ ...body, roles: ["ORGANIZER"] });
}

/** Cập nhật user (tên + enabled) */
export async function updateUser(id: number, body: { fullName: string; enabled?: boolean }) {
  const response = await axiosClient.put(`/api/admin/users/${id}`, body);
  return response.data;
}

/** Xoá user */
export async function deleteUser(id: number) {
  await axiosClient.delete(`/api/admin/users/${id}`);
}

/** Bật/tắt user */
export async function enableUser(id: number, enabled: boolean) {
  const response = await axiosClient.post(`/api/admin/users/${id}/enable?enabled=${enabled}`);
  return response.data;
}

/** Set roles cho user */
export async function setRoles(id: number, roles: Role[]) {
  const response = await axiosClient.post(`/api/admin/users/${id}/roles`, roles);
  return response.data;
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
  const searchParams = new URLSearchParams();
  searchParams.append('organizerId', String(params.organizerId));
  searchParams.append('page', String(params.page ?? 0));
  searchParams.append('size', String(params.size ?? 10));
  
  const response = await axiosClient.get(`/api/admin/events?${searchParams.toString()}`);
  return response.data;
}
