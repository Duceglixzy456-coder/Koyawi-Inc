import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.194:8000";

export async function apiFetch(endpoint, options = {}) {
  let token = await AsyncStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(BASE_URL + endpoint, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    const refreshRes = await fetch(BASE_URL + "/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await refreshRes.json();

    await AsyncStorage.setItem("access_token", data.access_token);

    return fetch(BASE_URL + endpoint, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${data.access_token}`,
      },
    });
  }

  return res;
}