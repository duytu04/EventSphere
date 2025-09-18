import axios from "axios";
import { API_BASE } from "./endpoints";

export type Event = {
  id?: number;
  name: string;
  description?: string;
  location?: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  capacity?: number;
  createdAt?: string;
};

const api = axios.create({ baseURL: API_BASE });

export async function fetchEvents(): Promise<Event[]> {
  const { data } = await api.get("/api/events");
  return data;
}

export async function createEvent(e: Event): Promise<Event> {
  const { data } = await api.post("/api/events", e);
  return data;
}
