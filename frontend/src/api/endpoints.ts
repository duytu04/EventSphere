// export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:6868";

// export const ENDPOINTS = {
//   ping: `${API_BASE}/api/ping`,
//   auth: {
//     signup: `${API_BASE}/api/auth/signup`,
//     login:  `${API_BASE}/api/auth/login`,
//     me:     `${API_BASE}/api/auth/me`,
//   },
//   admin: {
//     sample: `${API_BASE}/api/admin/sample`,
//   },
// };

 export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:6868";

export const ENDPOINTS = {
  ping: `${API_BASE}/api/ping`,
  auth: {
    signup: `${API_BASE}/api/auth/signup`,
    login:  `${API_BASE}/api/auth/login`,
    me:     `${API_BASE}/api/auth/me`,
  },
  events: {
    list:   `${API_BASE}/api/events`,
    create: `${API_BASE}/api/events`,
  },
  admin: {
    sample: `${API_BASE}/api/admin/sample`,
    events: `${API_BASE}/api/admin/events`,
  },
};
