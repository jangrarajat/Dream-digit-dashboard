// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

// Env se credentials lo
const FIXED_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ;
const FIXED_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ;

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }

    if (email === FIXED_EMAIL && password === FIXED_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("isAuthenticated", "true");
      return true;
    } else {
      setError("Invalid email or password");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        error,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}