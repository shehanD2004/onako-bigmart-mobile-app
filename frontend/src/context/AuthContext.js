import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  const handleLogin = async (data) => {
    const res = await login(data);
    setToken(res.data.token);
    await AsyncStorage.setItem("token", res.data.token);
  };

  return (
    <AuthContext.Provider value={{ token, handleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};