import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Welcome, {user?.fullName}
        </h1>
        <p className="text-gray-600 mb-1">{user?.email}</p>
        <p className="text-sm text-gray-500 mb-6">
          Roles: {user?.roles?.join(', ')}
        </p>

        <Link
          to="/browse"
          className="block w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 mb-3"
        >
          Browse Providers
        </Link>

        <Link
          to="/my-bookings"
          className="block w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 mb-3"
        >
          My Bookings
        </Link>

        <Link
          to="/provider-profile"
          className="block w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 mb-3"
        >
          Manage Provider Profile
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="block w-full bg-orange-600 text-white py-2 rounded font-semibold hover:bg-orange-700 mb-3"
          >
            Admin Dashboard
          </Link>
        )}

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;