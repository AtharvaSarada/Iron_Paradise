import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Iron Paradise - Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user?.full_name || user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
          <p className="text-gray-600">
            Welcome to Iron Paradise Gym Management System!
          </p>
          <p className="text-gray-600 mt-2">
            Role: <span className="font-semibold">{user?.role}</span>
          </p>
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/members')}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Members
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
