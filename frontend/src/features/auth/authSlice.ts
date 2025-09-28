import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import client from "../../api/axiosClient";
import { ENDPOINTS } from "../../api/endpoints";
import { jwtDecode } from "jwt-decode";

type Jwt = { authorities?: string[] };
type Profile = { userId:number; email:string; fullName:string; roles:string[] } | null;
type State = { token:string|null; roles:string[]; profile:Profile; status:string; error?:string };
const t0 = localStorage.getItem("access_token");
const roles0 = t0 ? ((jwtDecode<Jwt>(t0).authorities ?? []) as string[]) : [];
const initial: State = { token:t0, roles:roles0, profile:null, status:"idle" };

export const loginThunk = createAsyncThunk("auth/login", async (p:{email:string;password:string}) => {
  const r = await client.post(ENDPOINTS.auth.login, p); 
  const data = r.data;
  // Store token and return profile data
  localStorage.setItem("access_token", data.accessToken);
  return {
    token: data.accessToken,
    profile: {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      roles: data.roles
    }
  };
});
export const fetchMeThunk = createAsyncThunk("auth/me", async () => {
  const r = await client.get(ENDPOINTS.auth.me); return r.data as Profile;
});
export const signupThunk = createAsyncThunk("auth/signup", async (p:{email:string;password:string;fullName:string}) => {
  const r = await client.post(ENDPOINTS.auth.signup, p); 
  const data = r.data;
  // Store token and return profile data
  localStorage.setItem("access_token", data.accessToken);
  return {
    userId: data.userId,
    email: data.email,
    fullName: data.fullName,
    roles: data.roles
  } as Profile;
});

const slice = createSlice({
  name:"auth", initialState:initial,
  reducers:{
    logout(s){ s.token=null; s.profile=null; s.roles=[]; localStorage.removeItem("access_token"); }
  },
  extraReducers(b){
    b.addCase(loginThunk.fulfilled,(s,a)=>{ 
      s.token=a.payload.token; 
      s.profile=a.payload.profile;
      s.roles=a.payload.profile.roles;
      // Also update roles from JWT token
      try{ s.roles=(jwtDecode<Jwt>(a.payload.token).authorities??[]) as string[]; }catch{ s.roles=[]; }
    })
     .addCase(fetchMeThunk.fulfilled,(s,a)=>{ s.profile=a.payload; })
     .addCase(signupThunk.fulfilled,(s,a)=>{ s.profile=a.payload; s.token=localStorage.getItem("access_token");
      try{ s.roles=(jwtDecode<Jwt>(s.token!).authorities??[]) as string[]; }catch{ s.roles=[]; } });
  }
});
export const { logout } = slice.actions;
export default slice.reducer;
