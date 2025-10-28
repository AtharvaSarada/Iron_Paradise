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
    return <div>Access denied</div>;
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
      default:
        return <Navigate to="/packages" replace />;
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
