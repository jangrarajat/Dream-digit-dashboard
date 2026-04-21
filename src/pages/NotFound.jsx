import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-slide-in">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Page Not Found</h2>

        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist. This route may have been moved or deleted.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="admin-button justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Go to Dashboard
          </Link>

          <Link
            to="/login"
            className="admin-button-secondary justify-center"
          >
            Back to Login
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          Error Code: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;