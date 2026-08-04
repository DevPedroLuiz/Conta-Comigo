import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AppProvider } from './core/providers/AppProvider';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
