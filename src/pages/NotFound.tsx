import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Shield } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background cyber-grid">
      <div className="text-center">
        <Shield className="h-16 w-16 text-primary mx-auto mb-4" style={{ filter: "drop-shadow(0 0 20px hsl(185 100% 50% / 0.4))" }} />
        <h1 className="mb-4 text-6xl font-display font-bold text-gradient">404</h1>
        <p className="mb-6 text-xl text-muted-foreground font-medium">Access Denied — Route Not Found</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] transition-all">
          Return to Base
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
