import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProviderProfile from './pages/ProviderProfile';
import Browse from './pages/Browse';
import ProviderDetail from './pages/ProviderDetail';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import BookingChat from './pages/BookingChat';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading NeighborLink...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/browse"
        element={
          <Layout>
            <Browse />
          </Layout>
        }
      />
      <Route
        path="/providers/:id"
        element={
          <Layout>
            <ProviderDetail />
          </Layout>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider-profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProviderProfile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <Layout>
              <MyBookings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:bookingId/chat"
        element={
          <ProtectedRoute>
            <Layout hideFooter={true}>
              <BookingChat />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;