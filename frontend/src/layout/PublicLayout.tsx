import { Outlet, Link } from "react-router-dom";
export default function PublicLayout(){
  return (
    <div>
      <div style={{padding:"10px 14px", borderBottom:"1px solid #eee"}}>
        <b>EventSphere</b> · <Link to="/">Home</Link> · <Link to="/admin">Admin</Link> · <Link to="/login">Login</Link> · <Link to="/signup">Signup</Link>
      </div>
      <div style={{minHeight:"70vh"}}><Outlet/></div>
      <div style={{padding:"10px 14px", borderTop:"1px solid #eee", color:"#666"}}>© {new Date().getFullYear()}</div>
    </div>
  );
}
