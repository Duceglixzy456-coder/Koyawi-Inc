import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const decodeUser = (token) => {
  try {
    const decoded = jwtDecode(token);

    return {
      id: decoded?.sub || decoded?.user_id || null,
      email: decoded?.email || null,
      raw: decoded,
    };
  } catch (err) {
    console.log("JWT DECODE ERROR:", err);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- INIT ----------------
  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(ACCESS_KEY);
        const storedRefresh = await AsyncStorage.getItem(REFRESH_KEY);

        if (storedToken) {
          setAccessToken(storedToken);
          setUser(decodeUser(storedToken));
        }

        if (storedRefresh) {
          setRefreshToken(storedRefresh);
        }
      } catch (err) {
        console.log("AUTH INIT ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (accessTokenValue, refreshTokenValue = null) => {
    try {
      await AsyncStorage.setItem(ACCESS_KEY, accessTokenValue);

      if (refreshTokenValue) {
        await AsyncStorage.setItem(REFRESH_KEY, refreshTokenValue);
        setRefreshToken(refreshTokenValue);
      }

      setAccessToken(accessTokenValue);
      setUser(decodeUser(accessTokenValue));
    } catch (err) {
      console.log("LOGIN STORAGE ERROR:", err);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    await AsyncStorage.removeItem(ACCESS_KEY);
    await AsyncStorage.removeItem(REFRESH_KEY);

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token: accessToken,   // 🔥 IMPORTANT: keep compatibility
        accessToken,
        refreshToken,
        user,
        userId: user?.id,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};