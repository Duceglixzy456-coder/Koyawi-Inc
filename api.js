import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.195:8000";

/**
 * Get token safely from storage (NO hooks here)
 */
const getStoredToken = async () => {
  return await AsyncStorage.getItem("access_token");
};

/**
 * Refresh token using refresh_token
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    if (!refreshToken) return null;

    const res = await fetch(`${BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (data?.access_token) {
      await AsyncStorage.setItem("access_token", data.access_token);
      return data.access_token;
    }

    return null;
  } catch (err) {
    console.log("REFRESH ERROR:", err);
    return null;
  }
};

/**
 * SAFE API FETCH WITH AUTO REFRESH
 */
export const apiFetch = async (url, options = {}) => {
  let token = await getStoredToken();

  const makeRequest = (accessToken) =>
    fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    });

  let res = await makeRequest(token);

  // TOKEN EXPIRED → REFRESH FLOW
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
      ]);
      return res;
    }

    res = await makeRequest(newToken);
  }

  return res;
};