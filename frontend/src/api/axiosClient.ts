import axios from "axios";
import { ENDPOINTS } from "./endpoints";
export async function ping(){
  const res = await axios.get(ENDPOINTS.ping);
  return res.data;
}
