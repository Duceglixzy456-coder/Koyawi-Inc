import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.194:8000";

export async function apiFetch(endpoint, options = {}) {
  let token = await AsyncStorage.getItem("access_token");

  const makeHeaders = (t) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (t) headers.Authorization = `Bearer ${t}`;

    return headers;
  };

  let res = await fetch(BASE_URL + endpoint, {
    method: options.method || "GET",
    ...options,
    headers: makeHeaders(token),
  });

  // =========================
  // HANDLE 401 REFRESH
  // =========================
  if (res.status === 401) {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.log("No refresh token found");
      return res;
    }

    const refreshRes = await fetch(BASE_URL + "/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshRes.ok) {
      console.log("Refresh failed");
      return res;
    }

    const refreshData = await refreshRes.json();

   await AsyncStorage.setItem(ACCESS_KEY, refreshData.access_token);

    token = refreshData.access_token;

    res = await fetch(BASE_URL + endpoint, {
      method: options.method || "GET",
      ...options,
      headers: makeHeaders(token),
    });
  }

  return res;
}