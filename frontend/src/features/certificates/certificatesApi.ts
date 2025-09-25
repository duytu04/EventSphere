import api from "../../api/axiosClient";
import { ENDPOINTS } from "../../api/endpoints";

// Types
export type CertificateStatus = "VALID" | "EXPIRED" | "IN_PROGRESS";

export type Certificate = {
  id: number;
  eventId: number;
  eventName: string;
  title: string;
  issueDate: string;
  expirationDate?: string;
  credentialId: string;
  status: CertificateStatus;
  skills: string[];
  description?: string;
};

// API Functions
export async function fetchMyCertificates(): Promise<Certificate[]> {
  const { data } = await api.get(ENDPOINTS.certificates.myCertificates);
  return data.map((cert: any) => ({
    id: cert.id,
    eventId: cert.eventId,
    eventName: cert.eventName || "Sự kiện",
    title: cert.title || cert.name || "Chứng nhận tham dự",
    issueDate: cert.issueDate || cert.createdAt,
    expirationDate: cert.expirationDate,
    credentialId: cert.credentialId || cert.id.toString(),
    status: cert.status || "VALID",
    skills: cert.skills || [],
    description: cert.description,
  }));
}

export async function getCertificateById(certificateId: number): Promise<Certificate> {
  const { data } = await api.get(`${ENDPOINTS.certificates.certificate}/${certificateId}`);
  return {
    id: data.id,
    eventId: data.eventId,
    eventName: data.eventName || "Sự kiện",
    title: data.title || data.name || "Chứng nhận tham dự",
    issueDate: data.issueDate || data.createdAt,
    expirationDate: data.expirationDate,
    credentialId: data.credentialId || data.id.toString(),
    status: data.status || "VALID",
    skills: data.skills || [],
    description: data.description,
  };
}
