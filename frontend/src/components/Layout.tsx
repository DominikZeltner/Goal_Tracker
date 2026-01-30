import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Goal Tracker</h1>
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4" role="navigation" aria-label="Hauptnavigation">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Timeline
                </Link>
                <Link
                  to="/tree"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/tree'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Zielbaum
                </Link>
              </nav>
              {/* Neues Ziel Button */}
              <Link
                to="/ziel/neu"
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                aria-label="Neues Ziel erstellen"
              >
                <span className="text-lg">+</span>
                Neues Ziel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        <Outlet />
      </main>
    </div>
  );
}
