import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-cream">
      <span className="badge mb-4">404 ERROR</span>
      <h1 className="text-display-md text-navy font-bold mb-3">Page Not Found</h1>
      <p className="text-muted text-sm max-w-md mx-auto mb-8 leading-relaxed">
        The workshop or page you were looking for doesn't exist, has moved, or is temporarily unavailable.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/" className="btn-primary text-xs py-2 px-5">
          <Home className="w-4 h-4 mr-1.5" /> Return to Hub
        </Link>
        <Link to="/workshops" className="btn-secondary text-xs py-2 px-5">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Browse Workshops
        </Link>
      </div>
    </div>
  );
}
