import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD LANGUAGE ----------------
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem("language");

        if (saved === "en" || saved === "fr") {
          setLanguage(saved);
        }
      } catch (e) {
        console.log("load error", e);
      } finally {
        setLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // ---------------- TOGGLE LANGUAGE ----------------
  const toggleLanguage = async () => {
    const newLang = language === "en" ? "fr" : "en";
    setLanguage(newLang);

    try {
      await AsyncStorage.setItem("language", newLang);
    } catch (e) {
      console.log("save error", e);
    }
  };

  // ---------------- MEMO CONTEXT VALUE ----------------
  const value = useMemo(() => ({
    language,
    toggleLanguage,
    loading,
  }), [language, loading]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);