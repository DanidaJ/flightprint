import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Plane, Sparkles, ArrowRight, Leaf, Globe as GlobeIcon } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';

// Lazy load heavy components
const Globe3D = lazy(() => import('../components/Globe3D'));
const ParticleBackground = lazy(() => import('../components/ParticleBackground'));

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Parallax transforms
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const featuresY = useTransform(smoothProgress, [0.2, 0.5], [100, 0]);
  const ctaScale = useTransform(smoothProgress, [0.7, 1], [0.8, 1]);

  // Counting animations
  const co2Saved = useCountUp(82000, 2500);
  const tripsCount = useCountUp(15420, 2500);
  const treesCount = useCountUp(4100, 2500);

  useEffect(() => {
    // Throttle mouse move for better performance
    let ticking = false;
    const handleMouseMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMousePosition({
            x: (e.clientX / window.innerWidth - 0.5) * 2,
            y: (e.clientY / window.innerHeight - 0.5) * 2,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden py-6 sm:py-8 md:py-12 lg:py-16"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Static Gradient Background - removed animation for performance */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#0f2847] to-[#0a192f] dark:from-[#020817] dark:via-[#0a0f1c] dark:to-[#020817]" />

        {/* Particle Background - lazy loaded */}
        <Suspense fallback={null}>
          <ParticleBackground />
        </Suspense>

        {/* Blurred Orbs - Optimized with reduced animation complexity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-96 sm:h-96 bg-emerald/20 rounded-full filter blur-[80px] sm:blur-[120px]"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-20 sm:top-40 right-5 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-sky/20 rounded-full filter blur-[80px] sm:blur-[120px]"
            animate={{
              scale: [1.15, 1, 1.15],
              opacity: [0.4, 0.3, 0.4],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          <motion.div
            className="absolute bottom-10 sm:bottom-20 left-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-emerald/15 rounded-full filter blur-[60px] sm:blur-[100px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 md:pt-12 pb-6 sm:pb-8 md:pb-12">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            
            {/* Right: 3D Globe - Shown first on mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[500px] w-full lg:order-last"
              style={{
                transform: typeof window !== 'undefined' && window.innerWidth > 768 ? `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)` : 'none',
              }}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin"></div>
                </div>
              }>
                <Globe3D />
              </Suspense>
              
              {/* Floating plane */}
              <motion.div
                className="absolute -top-5 -right-5 sm:-top-10 sm:-right-10 w-12 h-12 sm:w-20 sm:h-20 lg:w-32 lg:h-32 pointer-events-none z-10"
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  transform: typeof window !== 'undefined' && window.innerWidth > 768 ? `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)` : 'none',
                }}
              >
                <Plane className="w-full h-full text-emerald drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
              </motion.div>
            </motion.div>

            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="z-10 text-center lg:text-left w-full lg:order-first"
              style={{
                transform: typeof window !== 'undefined' && window.innerWidth > 768 ? `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)` : 'none',
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center space-x-2 bg-emerald/10 backdrop-blur-xl border border-emerald/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald animate-pulse" />
                <span className="text-emerald text-[10px] sm:text-xs font-medium tracking-wide">
                  Sustainable Travel Intelligence
                </span>
              </motion.div>

              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-poppins font-bold text-white mb-3 sm:mb-4 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }}
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Fly Smart.{' '}
                </motion.span>
                <motion.span
                  className="text-gradient relative inline-block"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 0.5, duration: 0.6 }
                  }}
                >
                  <motion.span
                    animate={{
                      textShadow: [
                        '0 0 20px rgba(16,185,129,0.5)',
                        '0 0 40px rgba(16,185,129,0.8)',
                        '0 0 20px rgba(16,185,129,0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Leave Less.
                  </motion.span>
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-sm sm:text-base text-gray-300 max-w-xl mb-4 sm:mb-6 font-light leading-relaxed mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                Compare flights by price, duration, and carbon footprint.
                Make travel choices that feel lighter on the planet.
              </motion.p>

              {/* Stats with glassmorphism - Compact */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.5,
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 px-2 sm:px-0"
              >
                {[
                  { value: co2Saved.toLocaleString(), label: 'CO₂ Saved', unit: 'kg', icon: Leaf },
                  { value: tripsCount.toLocaleString(), label: 'Eco Trips', unit: '', icon: Plane },
                  { value: treesCount.toLocaleString(), label: 'Trees Saved', unit: '', icon: GlobeIcon },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.5 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.7 + index * 0.1
                      }
                    }}
                    whileHover={{ 
                      scale: 1.08, 
                      y: -8,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 10
                      }
                    }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald/20 to-sky/20 rounded-lg sm:rounded-xl blur-lg sm:blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center hover:border-emerald/50 transition-all">
                      <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald mx-auto mb-1" />
                      <motion.p
                        className="text-sm sm:text-lg md:text-xl font-bold text-white mb-0.5"
                        animate={{
                          textShadow: [
                            '0 0 10px rgba(16,185,129,0.3)',
                            '0 0 20px rgba(16,185,129,0.6)',
                            '0 0 10px rgba(16,185,129,0.3)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stat.value}
                        {stat.unit && <span className="text-[10px] sm:text-xs md:text-sm text-emerald ml-0.5">{stat.unit}</span>}
                      </motion.p>
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-400 font-medium whitespace-nowrap">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button - Enhanced with Strong Glow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="relative inline-block w-full sm:w-auto px-4 sm:px-0"
              >
                {/* Animated pulsing glow ring */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald via-emerald-light to-emerald rounded-full blur-xl sm:blur-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 0 60px rgba(16,185,129,1), 0 0 100px rgba(16,185,129,0.6)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/search')}
                  className="relative group w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-emerald via-emerald-light to-emerald text-white rounded-full font-bold text-sm sm:text-base md:text-lg shadow-[0_0_40px_rgba(16,185,129,0.8),0_0_80px_rgba(16,185,129,0.4)] hover:shadow-[0_0_80px_rgba(16,185,129,1),0_0_120px_rgba(16,185,129,0.6)] transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 border-2 border-emerald-light/50"
                >
                  {/* Inner glow overlay */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  
                  <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Search Flights</span>
                  <ArrowRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>

      </motion.section>

      {/* Features Section with Parallax */}
      <motion.section 
        className="py-24 bg-background dark:bg-gray-900 relative overflow-hidden transition-colors duration-300"
        style={{ y: featuresY }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ 
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-5xl font-poppins font-bold text-navy dark:text-white mb-6 transition-colors duration-300"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.1
                }
              }}
              viewport={{ once: true, margin: '-50px' }}
            >
              Why FlightPrint?
            </motion.h2>
            <motion.p 
              className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Empowering you to make informed, sustainable travel decisions
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: GlobeIcon,
                title: 'Real-Time Data',
                description:
                  'Access live flight prices, durations, and routes from major airlines worldwide.',
                color: 'emerald',
                gradient: 'from-emerald/20 to-emerald/5',
              },
              {
                icon: Leaf,
                title: 'Carbon Insights',
                description:
                  'See the exact CO₂ emissions of every flight, translated into relatable terms.',
                color: 'emerald',
                gradient: 'from-emerald/20 to-emerald/5',
              },
              {
                icon: Sparkles,
                title: 'Smart Recommendations',
                description:
                  'Get personalized suggestions for the most eco-friendly travel options.',
                color: 'emerald',
                gradient: 'from-emerald/20 to-emerald/5',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: index * 0.15
                  }
                }}
                viewport={{ once: true, margin: '-80px' }}
                whileHover={{ 
                  y: -20, 
                  scale: 1.05,
                  boxShadow: '0 25px 70px rgba(16, 185, 129, 0.4)',
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 10
                  } 
                }}
                className="group relative"
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                
                {/* Card */}
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                  {/* Icon container with animation */}
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color} to-${feature.color}-dark flex items-center justify-center mb-6 shadow-lg`}
                    initial={{ rotate: -180, scale: 0 }}
                    whileInView={{ 
                      rotate: 0, 
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2 + index * 0.1
                      }
                    }}
                    whileHover={{ 
                      rotate: 360, 
                      scale: 1.15,
                      transition: { 
                        type: "spring",
                        stiffness: 300,
                        damping: 15
                      }
                    }}
                    viewport={{ once: true }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-poppins font-bold text-navy dark:text-white mb-4 group-hover:text-emerald transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.3 + index * 0.1 }
                    }}
                    viewport={{ once: true }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg transition-colors duration-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ 
                      opacity: 1,
                      transition: { delay: 0.4 + index * 0.1 }
                    }}
                    viewport={{ once: true }}
                  >
                    {feature.description}
                  </motion.p>
                  
                  {/* Decorative corner element */}
                  <motion.div 
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald/10 to-transparent rounded-bl-3xl"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 0, scale: 1 }}
                    whileHover={{ opacity: 1, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section with Glassmorphism */}
      <motion.section 
        className="relative py-32 overflow-hidden"
        style={{ scale: ctaScale }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald via-emerald-dark to-navy"
          animate={{
            background: [
              'linear-gradient(135deg, #10b981 0%, #059669 50%, #0a192f 100%)',
              'linear-gradient(135deg, #059669 0%, #10b981 50%, #0f2847 100%)',
              'linear-gradient(135deg, #10b981 0%, #059669 50%, #0a192f 100%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 left-20 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"
            animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 right-20 w-80 h-80 bg-sky/20 rounded-full filter blur-3xl"
            animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ 
              opacity: 1, 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 20
              }
            }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }
              }}
              viewport={{ once: true }}
              animate={{ rotate: [0, 360] }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' } }}
              className="inline-block mb-8"
            >
              <GlobeIcon className="w-20 h-20 text-white/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
            </motion.div>
            
            <motion.h2 
              className="text-5xl md:text-6xl font-poppins font-bold mb-8 text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.3,
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              viewport={{ once: true }}
            >
              Every Journey Leaves a Print
            </motion.h2>
            <motion.p 
              className="text-2xl mb-12 text-white/90 font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Let's make yours smaller, together.
            </motion.p>
            
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.7
                }
              }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.1, 
                boxShadow: '0 0 60px rgba(255,255,255,0.5)',
                transition: { 
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className="group relative bg-white text-emerald-dark px-12 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-[0_0_80px_rgba(255,255,255,0.8)] transition-all duration-300 inline-flex items-center space-x-3"
            >
              <span>Start Your Eco-Journey</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
