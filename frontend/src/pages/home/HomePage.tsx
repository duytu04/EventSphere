

import { useAuth } from "../../features/auth/useAuth";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { profile, token, signout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Trang chủ EventSphere</h1>
      {!token ? (
        <p>
          Bạn chưa đăng nhập. <Link to="/login">Đăng nhập</Link> hoặc{" "}
          <Link to="/signup">Đăng ký</Link>.
        </p>
      ) : (
        <div>
          <p>
            Xin chào, <b>{profile?.fullName ?? profile?.email}</b>
          </p>
          <p>Vai trò: {profile?.roles.join(", ")}</p>
          <button onClick={() => signout()}>Đăng xuất</button>
          <p>
            <Link to="/admin">Vào trang Admin</Link>
          </p>
        </div>
      )}
    </div>
  );
}
