import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldOff className="size-16 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-3xl font-semibold tracking-tight">404</h2>
      <p className="max-w-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
