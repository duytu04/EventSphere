import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import client from "../../api/axiosClient";
import { ENDPOINTS } from "../../api/endpoints";
import { jwtDecode } from "jwt-decode";

type Jwt = { roles?: string[] };
type Profile = { userId:number; email:string; fullName:string; roles:string[] } | null;
type State = { token:string|null; roles:string[]; profile:Profile; status:string; error?:string };
const t0 = localStorage.getItem("access_token");
const roles0 = t0 ? ((jwtDecode<Jwt>(t0).roles ?? []) as string[]) : [];
const initial: State = { token:t0, roles:roles0, profile:null, status:"idle" };

export const loginThunk = createAsyncThunk("auth/login", async (p:{email:string;password:string}) => {
  const r = await client.post(ENDPOINTS.auth.login, p); return r.data.accessToken as string;
});
export const fetchMeThunk = createAsyncThunk("auth/me", async () => {
  const r = await client.get(ENDPOINTS.auth.me); return r.data as Profile;
});
export const signupThunk = createAsyncThunk("auth/signup", async (p:{email:string;password:string;fullName:string}) => {
  const r = await client.post(ENDPOINTS.auth.signup, p); return r.data as Profile;
});

const slice = createSlice({
  name:"auth", initialState:initial,
  reducers:{
    logout(s){ s.token=null; s.profile=null; s.roles=[]; localStorage.removeItem("access_token"); }
  },
  extraReducers(b){
    b.addCase(loginThunk.fulfilled,(s,a)=>{ s.token=a.payload; localStorage.setItem("access_token",a.payload);
      try{ s.roles=(jwtDecode<Jwt>(a.payload).roles??[]) as string[]; }catch{ s.roles=[]; } })
     .addCase(fetchMeThunk.fulfilled,(s,a)=>{ s.profile=a.payload; });
  }
});
export const { logout } = slice.actions;
export default slice.reducer;
