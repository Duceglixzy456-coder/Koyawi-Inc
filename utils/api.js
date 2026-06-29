// utils/api.js
import { getTokenOrLogout } from "./auth";

const BASE_URL = "http://192.168.1.194:8000";

export const api = async (endpoint, options = {}, navigation) => {
  const token = await getTokenOrLogout(navigation);

  if (!token) return null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    navigation?.replace("SessionExpired");
    return null;
  }

  return res;
};