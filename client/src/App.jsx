import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const FlightResults = lazy(() => import('./pages/FlightResults'));
const FlightDetails = lazy(() => import('./pages/FlightDetails'));
const ImpactDashboard = lazy(() => import('./pages/ImpactDashboard'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a192f] to-[#0f2847] dark:from-[#020817] dark:to-[#0a192f]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white/60 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors duration-300 flex flex-col">
          <Toaster />
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/results" element={<FlightResults />} />
                <Route path="/flight-details" element={<FlightDetails />} />
                <Route path="/impact" element={<ImpactDashboard />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
