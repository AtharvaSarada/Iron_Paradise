import { lazy, useEffect, useState } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';

// Lazy load pages
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'));
const AdminMembers = lazy(() => import('@/pages/Admin/MembersSimple'));
const MemberDashboard = lazy(() => import('@/pages/Member/Dashboard'));
const MemberBills = lazy(() => import('@/pages/Member/Bills'));
const PublicPackages = lazy(() => import('@/pages/Public/Packages'));
const AuthPage = lazy(() => import('@/pages/Auth'));

// Protected route component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(profile);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this area.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your role: <span className="font-medium">{user.role}</span>
          </p>
          <button
            onClick={() => {
              // Redirect based on user role
              switch (user.role) {
                case 'admin':
                  window.location.href = '/admin';
                  break;
                case 'member':
                  window.location.href = '/member';
                  break;
                default:
                  window.location.href = '/packages';
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Public route component (redirects authenticated users)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(profile);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (user) {
    // Redirect based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'member':
        return <Navigate to="/member" replace />;
      case 'user':
      default:
        return <Navigate to="/user" replace />;
    }
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />,
  },
  {
    path: '/packages',
    element: <PublicRoute><PublicPackages /></PublicRoute>,
  },
  {
    path: '/auth',
    element: <PublicRoute><AuthPage /></PublicRoute>,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/members',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminMembers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/member',
    element: (
      <ProtectedRoute allowedRoles={['member']}>
        <MemberDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/member/bills',
    element: (
      <ProtectedRoute allowedRoles={['member']}>
        <MemberBills />
      </ProtectedRoute>
    ),
  },
]);
