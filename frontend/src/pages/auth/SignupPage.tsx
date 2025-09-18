import { useState } from "react";
import { useAuth } from "../../features/auth/useAuth";

export default function SignupPage() {
  const { signup, status, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup(email, password, fullName);
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Họ tên"
          style={{ display: "block", margin: "8px 0", width: "100%" }}
        />
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
          {status === "loading" ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
