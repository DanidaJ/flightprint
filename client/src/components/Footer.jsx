import { motion } from 'framer-motion';
import { Heart, Github, Linkedin, Mail, Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-emerald to-emerald-dark rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                FlightPrint
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fly Smart. Leave Less.
              </p>
            </div>
          </motion.div>

          {/* Center: Copyright & Credits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              © 2025 Nerdtastic🧠™ by{' '}
              <span className="font-semibold text-emerald">Danida Jayakody</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              FlightPrint is a project by Nerdtastic🧠™ | All rights reserved.
            </p>
          </motion.div>

          {/* Right: Social Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/DanidaJ"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald/10 dark:hover:bg-emerald/20 flex items-center justify-center transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-emerald" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="https://linkedin.com/in/danida-jayakody"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald/10 dark:hover:bg-emerald/20 flex items-center justify-center transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-emerald" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="mailto:danida@nerdtastic.com"
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald/10 dark:hover:bg-emerald/20 flex items-center justify-center transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-emerald" />
            </motion.a>
          </motion.div>
        </div>

        {/* Made with Love */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" />
            <span>for a sustainable future</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
