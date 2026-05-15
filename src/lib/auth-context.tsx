import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User } from "./simpeg-data";

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
