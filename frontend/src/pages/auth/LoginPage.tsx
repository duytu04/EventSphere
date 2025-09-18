import { useState } from "react";
import { useAuth } from "../../features/auth/useAuth";

export default function LoginPage() {
  const { login, status, error } = useAuth();
  const [email, setEmail] = useState("admin@eventsphere.local");
  const [password, setPassword] = useState("Admin@123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ display: "block", margin: "8px 0", width: "100%" }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          style={{ display: "block", margin: "8px 0", width: "100%" }}
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
