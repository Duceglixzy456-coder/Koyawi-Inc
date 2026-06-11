import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.195:8000";

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem("refresh_token");

  if (!refreshToken) return null;

  const res = await fetch(BASE_URL + "/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) return null;

  const data = await res.json();

  if (data.access_token) {
    await AsyncStorage.setItem("access_token", data.access_token);
    return data.access_token;
  }

  return null;
};

export const apiFetch = async (url, options = {}) => {
  let token = await AsyncStorage.getItem("access_token");

  const makeRequest = (accessToken) =>
    fetch(BASE_URL + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    });

  let res = await makeRequest(token);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      return res;
    }

    res = await makeRequest(newToken);
  }

  return res;
};