import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const TOKEN_KEY = "access_token";

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem(TOKEN_KEY);
      setToken(stored);
      setLoading(false);
    };

    load();
  }, []);

  const login = async (newToken) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};