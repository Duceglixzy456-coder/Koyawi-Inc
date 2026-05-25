import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * SAVE TOKEN after login
 */
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (err) {
    console.log("SAVE TOKEN ERROR:", err);
  }
};

/**
 * GET token anytime from any screen
 */
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (err) {
    console.log("GET TOKEN ERROR:", err);
    return null;
  }
};

/**
 * LOGOUT (optional later)
 */
export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (err) {
    console.log("CLEAR TOKEN ERROR:", err);
  }
};