import { Link, useLocation } from 'react-router-dom';
import { Train } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80">
            <Train size={28} />
            <span>Railway Route Optimization</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              to="/"
              className={`transition-opacity ${
                isActive('/') ? 'opacity-100 border-b-2 pb-4' : 'opacity-75 hover:opacity-100'
              }`}
            >
              Route Finder
            </Link>
            <Link
              to="/alternatives"
              className={`transition-opacity ${
                isActive('/alternatives') ? 'opacity-100 border-b-2 pb-4' : 'opacity-75 hover:opacity-100'
              }`}
            >
              Alternatives
            </Link>
            <Link
              to="/simulate"
              className={`transition-opacity ${
                isActive('/simulate') ? 'opacity-100 border-b-2 pb-4' : 'opacity-75 hover:opacity-100'
              }`}
            >
              Simulate
            </Link>
            <Link
              to="/visualization"
              className={`transition-opacity ${
                isActive('/visualization') ? 'opacity-100 border-b-2 pb-4' : 'opacity-75 hover:opacity-100'
              }`}
            >
              Visualization
            </Link>
            <Link
              to="/admin"
              className={`transition-opacity ${
                isActive('/admin') ? 'opacity-100 border-b-2 pb-4' : 'opacity-75 hover:opacity-100'
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
