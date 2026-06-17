import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem("language");
        if (saved) setLanguage(saved);
      } catch (e) {
        console.log("load error", e);
      }
    };

    loadLanguage();
  }, []);

  const toggleLanguage = async () => {
    const newLang = language === "en" ? "fr" : "en";
    setLanguage(newLang);

    try {
      await AsyncStorage.setItem("language", newLang);
    } catch (e) {
      console.log("save error", e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);