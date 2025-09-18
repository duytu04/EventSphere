import axios from "axios";
import { API_BASE } from "./endpoints";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default client;
