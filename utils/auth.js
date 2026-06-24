import AsyncStorage from "@react-native-async-storage/async-storage";

export const getTokenOrLogout = async (navigation) => {
  const token = await AsyncStorage.getItem("access_token");

  if (!token) {
    return null;
  }

  return token;
};

export const logout = async (navigation) => {
  await AsyncStorage.removeItem("access_token");
  navigation?.replace("Login");
};