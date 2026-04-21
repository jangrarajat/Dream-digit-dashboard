import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login or dashboard based on auth state
    const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
    navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
  }, [navigate]);

  return null;
}