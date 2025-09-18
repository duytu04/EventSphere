import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2 style={{ color: "red" }}>403 — Forbidden</h2>
      <p>Bạn không có quyền truy cập trang này.</p>
      <Link to="/">Quay lại Trang chủ</Link>
    </div>
  );
}
