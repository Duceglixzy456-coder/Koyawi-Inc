import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "../navigation/NavigationRef";

export const forceLogout = async () => {
  try {
    await AsyncStorage.removeItem("token");

    navigationRef.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (e) {
    console.log("Logout error:", e);
  }
};