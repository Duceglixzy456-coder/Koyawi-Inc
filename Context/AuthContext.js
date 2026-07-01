import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = "access_token";

const decodeUser = (token) => {
  try {
    const decoded = jwtDecode(token);

    return {
      id: decoded?.sub ?? null,
      raw: decoded,
    };
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);

        if (!stored || stored === "null") {
          setToken(null);
          setUser(null);
        } else {
          setToken(stored);
          setUser(decodeUser(stored));
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (newToken) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(decodeUser(newToken));
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
  value={{
    token,
    user,
    userId: user?.id,   // 🔥 ADD THIS
    login,
    logout,
    loading,
  }}
>
      {children}
    </AuthContext.Provider>
  );
};