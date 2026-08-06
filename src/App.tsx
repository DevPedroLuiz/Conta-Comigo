import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AppProvider } from './core/providers/AppProvider';
import { Toaster } from './core/ui/components/toast';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AppProvider>
  );
}
