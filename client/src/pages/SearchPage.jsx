import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane } from 'lucide-react';
import SearchForm from '../components/SearchForm';

const SearchPage = () => {
  const navigate = useNavigate();

  const handleSearch = (searchData) => {
    navigate('/results', { state: searchData });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Static Background - removed animation for performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#0f2847] to-[#0a192f] dark:from-[#020817] dark:via-[#0a0f1c] dark:to-[#020817]" />

      {/* Blurred Orbs - Optimized animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-emerald/20 rounded-full filter blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-sky/20 rounded-full filter blur-[120px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.3, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate('/')}
          className="group flex items-center space-x-2 text-white/80 hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald to-emerald-dark rounded-full mb-3 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
          >
            <Plane className="w-7 h-7 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-1">
            Find Your{' '}
            <motion.span
              className="text-gradient"
              animate={{
                textShadow: [
                  '0 0 20px rgba(16,185,129,0.5)',
                  '0 0 40px rgba(16,185,129,0.8)',
                  '0 0 20px rgba(16,185,129,0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Perfect Flight
            </motion.span>
          </h1>

          <p className="text-base text-gray-300 font-light">
            Compare prices, duration, and environmental impact
          </p>
        </motion.div>

        {/* Search Form with Enhanced Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald/30 to-sky/30 rounded-[2rem] blur-3xl" />
          
          {/* Form container */}
          <div className="relative">
            <SearchForm onSearch={handleSearch} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchPage;
