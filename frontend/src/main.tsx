import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import { router } from './config/router';
import { queryClient } from './config/react-query';
import { useAuthStore } from './stores/authStore';

// Initialize auth on app start
const { initialize } = useAuthStore.getState();
initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-xl text-gray-600">Loading Iron Paradise...</div>
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
