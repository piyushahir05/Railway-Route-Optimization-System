import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import RouteFinder from './pages/RouteFinder';
import AlternativeRoutes from './pages/AlternativeRoutes';
import Simulate from './pages/Simulate';
import Visualization from './pages/Visualization';
import Admin from './pages/Admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <main className="p-4">
            <Routes>
              <Route path="/" element={<RouteFinder />} />
              <Route path="/alternatives" element={<AlternativeRoutes />} />
              <Route path="/simulate" element={<Simulate />} />
              <Route path="/visualization" element={<Visualization />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
