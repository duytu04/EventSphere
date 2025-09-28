import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { loginThunk, signupThunk, fetchMeThunk, logout } from "./authSlice";
import { jwtDecode } from "jwt-decode";

import { useEffect } from "react";
export function useAuth(){
  const d = useDispatch<AppDispatch>();
  const s = useSelector((st:RootState)=>st.auth);
  useEffect(()=>{ if(s.token && !s.profile) d(fetchMeThunk()); },[s.token]);
  return {
    token: s.token, profile: s.profile, roles: s.roles,
    status: s.status, error: s.error,
    login: (email:string,password:string)=>d(loginThunk({email,password})),
    signup: (email:string,password:string,fullName:string)=>d(signupThunk({email,password,fullName})),
    signout: ()=>d(logout()),
    hasRole: (r:string)=>s.roles.includes(r) || s.roles.includes(`ROLE_${r}`),
  };
}



