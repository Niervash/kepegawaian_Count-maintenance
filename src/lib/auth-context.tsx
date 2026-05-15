import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User } from "./simpeg-data";
import api from "@/services/api";

interface AuthCtx {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("sikapas_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem("sikapas_user");
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("sikapas_token");
      if (token) {
        try {
          const response = await api.get("/auth/me");
          if (response.data.success) {
            const userData = response.data.data;
            // The /auth/me might return nested pegawai data, 
            // but for context we want the user object with flattened jabatan/nip if possible
            // or just the user object. 
            // Based on backend getMe, it returns user with included pegawai.
            
            const flattenedUser = {
              ...userData,
              jabatan: userData.jabatan || userData.pegawai?.jabatan?.nama || userData.pegawai?.jabatan || "",
              nip: userData.nip || userData.pegawai?.nip || "",
            };
            
            localStorage.setItem("sikapas_user", JSON.stringify(flattenedUser));
            setUser(flattenedUser);
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
          // If 401, maybe logout? 
          // logout(); 
        }
      }
    };

    fetchMe();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("sikapas_token", token);
    localStorage.setItem("sikapas_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("sikapas_token");
    localStorage.removeItem("sikapas_user");
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("sikapas_user", JSON.stringify(userData));
    setUser(userData);
  };

  return <Ctx.Provider value={{ user, login, logout, updateUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
