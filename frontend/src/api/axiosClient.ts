

// src/api/axiosClient.ts
import axios from "axios";
import { API_BASE } from "./endpoints";

// Đọc token từ localStorage (tuỳ bạn lưu ở đâu)
const getToken = () => localStorage.getItem("access_token") ?? "";

const instance = axios.create({
  baseURL: API_BASE,
  // bạn có thể set timeout, headers mặc định ở đây
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    // Tuỳ chọn: xử lý 401, refresh token...
    return Promise.reject(err);
  }
);

export default instance;
