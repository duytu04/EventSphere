

// src/api/endpoints.ts
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:6868";

export const ENDPOINTS = {
  // healthcheck
  ping: `${API_BASE}/api/ping`,

  // auth
  auth: {
    signup: `${API_BASE}/api/auth/signup`,
    login:  `${API_BASE}/api/auth/login`,
    me:     `${API_BASE}/api/auth/me`,
  },

  // 🔶 LEGACY (tương thích ngược với code cũ, có thể bỏ dần)
  events: {
    list:   `${API_BASE}/api/events`,
    create: `${API_BASE}/api/events`,
  },

  // 🔷 PUBLIC (list/detail sự kiện công khai)
  public: {
    events: `${API_BASE}/api/events`,
    event:  (id: number | string) => `${API_BASE}/api/events/${id}`,
    reviews: (id: number | string) => `${API_BASE}/api/events/${id}/reviews`,
    recentReviews: (limit: number = 10) => `${API_BASE}/api/feedback/recent?limit=${limit}`,
  },

  // 🔵 FEEDBACK (đánh giá và bình luận)
  feedback: {
    create: `${API_BASE}/api/feedback`,
    avg: (id: number | string) => `${API_BASE}/api/public/feedback/avg?eventId=${id}`,
  },

  // 🎫 REGISTRATIONS (đăng ký sự kiện)
  registrations: {
    myRegistrations: `${API_BASE}/api/me/registrations`,
    generateQR: (id: number | string) => `${API_BASE}/api/me/registrations/${id}/qr`,
    markAttendance: (id: number | string) => `${API_BASE}/api/me/registrations/${id}/attendance`,
  },

  // 🏆 CERTIFICATES (chứng nhận)
  certificates: {
    myCertificates: `${API_BASE}/api/me/certificates`,
    certificate: (id: number | string) => `${API_BASE}/api/me/certificates/${id}`,
  },

  // 🟣 ORGANIZER (quản lý sự kiện của organizer)
  organizer: {
    events: `${API_BASE}/api/organizer/events`,
    event:  (id: number | string) => `${API_BASE}/api/organizer/events/${id}`,
    attendanceMark: `${API_BASE}/api/organizer/attendance/mark`,
    certificatesIssue: `${API_BASE}/api/organizer/certificates/issue`,
    attendanceLogs: (eventId: number | string, page: number = 0, size: number = 20) =>
      `${API_BASE}/api/organizer/attendance/logs?eventId=${eventId}&page=${page}&size=${size}`,
  },

  // 🟥 ADMIN (duyệt sự kiện, quản trị user, analytics)
  admin: {
    sample:  `${API_BASE}/api/admin/sample`,
    events:  `${API_BASE}/api/admin/events`,                        // list/create
    event:   (id: number | string) => `${API_BASE}/api/admin/events/${id}`, // detail/update/delete
    // Nếu backend dùng PUT (chuẩn REST) cho approve/reject, bật 2 dòng dưới:
    eventsApprove: (id: number | string) => `${API_BASE}/api/admin/events/${id}/approve`,
    eventsReject:  (id: number | string) => `${API_BASE}/api/admin/events/${id}/reject`,
    users:   `${API_BASE}/api/admin/users`,
    role:    (id: number | string) => `${API_BASE}/api/admin/users/${id}/role`,
    analytics: `${API_BASE}/api/admin/analytics/overview`,
  },

  // 🔌 WebSocket / STOMP (nếu dùng seats realtime)
  ws: {
    seats: `${API_BASE}/ws`, // ví dụ: subscribe /topic/seats.{eventId}
  },
};


