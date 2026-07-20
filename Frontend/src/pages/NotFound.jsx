import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../common/Button.jsx";

const NotFound = () => (
  <div className="container-app flex min-h-[70vh] flex-col items-center justify-center text-center">
    <Compass className="h-14 w-14 text-primary" />
    <h1 className="mt-4 font-heading text-3xl font-bold text-text">Page Not Found</h1>
    <p className="mt-2 text-text-muted">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="mt-6">
      <Button>Back to Home</Button>
    </Link>
  </div>
);

export default NotFound;
