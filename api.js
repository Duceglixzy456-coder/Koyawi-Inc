const BASE_URL = "http://192.168.1.194:8000";

export const api = async (
  endpoint,
  token,
  options = {},
  navigation
) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });

    // Unauthorized
    if (res.status === 401) {
      console.log("TOKEN EXPIRED OR INVALID");

      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }

      return null;
    }

    // Handle empty responses
    if (res.status === 204) {
      return null;
    }

    // Return JSON if available
    const contentType = res.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return await res.json();
    }

    // Otherwise return plain text
    return await res.text();
  } catch (err) {
    console.log("API ERROR:", err);
    throw err;
  }
};