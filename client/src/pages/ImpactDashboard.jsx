import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { 
  TrendingDown, 
  TreePine, 
  Car, 
  Home, 
  Award, 
  Plane, 
  Globe, 
  AlertTriangle,
  Users,
  Fuel,
  Cloud,
  BarChart3,
  Zap
} from 'lucide-react';

const ImpactDashboard = () => {
  // Global Aviation Statistics (2024)
  const globalStats = {
    dailyFlights: 102465,
    annualPassengers: 4.5, // billion
    annualCO2: 915, // million tonnes
    aviationCO2Share: 2.5, // percentage of global CO2
    fuelConsumption: 360, // billion liters annually
  };

  // Common route emissions (kg CO2 per passenger)
  const popularRoutes = [
    { route: 'NYC → LON', distance: 5585, co2: 550, duration: 7.5, passengers: 85000 },
    { route: 'LAX → TYO', distance: 8815, co2: 830, duration: 11.5, passengers: 65000 },
    { route: 'LHR → DXB', distance: 5476, co2: 540, duration: 7, passengers: 95000 },
    { route: 'SYD → LAX', distance: 12051, co2: 1180, duration: 13, passengers: 45000 },
    { route: 'PAR → NYC', distance: 5837, co2: 570, duration: 8, passengers: 78000 },
    { route: 'SIN → SFO', distance: 13593, co2: 1320, duration: 14.5, passengers: 38000 },
  ];

  // Aircraft type comparison
  const aircraftEfficiency = [
    { type: 'A320neo', seats: 180, co2PerKm: 68, efficiency: 'Excellent' },
    { type: 'B737 MAX', seats: 178, co2PerKm: 70, efficiency: 'Excellent' },
    { type: 'B787', seats: 242, co2PerKm: 85, efficiency: 'Very Good' },
    { type: 'A350', seats: 315, co2PerKm: 95, efficiency: 'Very Good' },
    { type: 'B777', seats: 350, co2PerKm: 110, efficiency: 'Good' },
    { type: 'A380', seats: 525, co2PerKm: 145, efficiency: 'Moderate' },
  ];

  // Monthly flight emissions trend
  const monthlyTrend = [
    { month: 'Jan', flights: 95000, co2: 73 },
    { month: 'Feb', flights: 92000, co2: 71 },
    { month: 'Mar', flights: 102000, co2: 79 },
    { month: 'Apr', flights: 104000, co2: 81 },
    { month: 'May', flights: 108000, co2: 84 },
    { month: 'Jun', flights: 115000, co2: 89 },
    { month: 'Jul', flights: 125000, co2: 97 },
    { month: 'Aug', flights: 123000, co2: 96 },
    { month: 'Sep', flights: 110000, co2: 85 },
    { month: 'Oct', flights: 107000, co2: 83 },
    { month: 'Nov', flights: 98000, co2: 76 },
    { month: 'Dec', flights: 105000, co2: 82 },
  ];

  // Emissions by flight distance category
  const distanceCategories = [
    { category: 'Short (<1500km)', share: 45, avgCO2: 130, examples: 'Domestic flights' },
    { category: 'Medium (1500-4000km)', share: 30, avgCO2: 380, examples: 'Regional international' },
    { category: 'Long (>4000km)', share: 25, avgCO2: 820, examples: 'Intercontinental' },
  ];

  // Calculate some interesting statistics
  const avgEmissionsPerFlight = (globalStats.annualCO2 * 1000000) / (globalStats.dailyFlights * 365);
  const avgEmissionsPerPassenger = (globalStats.annualCO2 * 1000) / globalStats.annualPassengers;
  const totalCO2 = popularRoutes.reduce((sum, item) => sum + item.co2, 0) / popularRoutes.length;
  const totalTrees = Math.round(totalCO2 / 20);
  const carKm = Math.round(totalCO2 * 4.5);
  const homeEnergy = Math.round(totalCO2 / 6);

  const pieData = distanceCategories.map((item) => ({
    name: item.category,
    value: item.share,
  }));

  const COLORS = ['#00C896', '#1CA9F4', '#68E1FD', '#FF6B6B', '#4ECDC4', '#FFD93D'];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-poppins font-semibold text-navy dark:text-white mb-2 transition-colors duration-300">
            ✈️ Global Aviation Impact Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Understanding the environmental footprint of commercial aviation with real-time statistics
          </p>
        </motion.div>

        {/* Global Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-navy to-sky p-8 rounded-2xl shadow-glow mb-8 text-white"
        >
          <div className="flex items-center mb-4">
            <Globe className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-poppins font-semibold">Global Aviation Statistics 2024</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-3xl font-bold">{globalStats.dailyFlights.toLocaleString()}</p>
              <p className="text-sm opacity-90">Daily Flights</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{globalStats.annualPassengers}B</p>
              <p className="text-sm opacity-90">Annual Passengers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{globalStats.annualCO2}M</p>
              <p className="text-sm opacity-90">Tonnes CO₂/Year</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{globalStats.aviationCO2Share}%</p>
              <p className="text-sm opacity-90">Global CO₂ Share</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{globalStats.fuelConsumption}B</p>
              <p className="text-sm opacity-90">Liters Fuel/Year</p>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald to-emerald-light text-white rounded-2xl p-6 shadow-glow"
          >
            <Cloud className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{Math.round(avgEmissionsPerFlight).toLocaleString()}</p>
            <p className="text-sm opacity-90">kg CO₂ per Flight (avg)</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border-2 border-emerald/20 dark:border-emerald/30 transition-colors duration-300"
          >
            <Users className="w-8 h-8 mb-3 text-emerald" />
            <p className="text-3xl font-bold text-navy dark:text-white mb-1 transition-colors duration-300">{Math.round(avgEmissionsPerPassenger).toLocaleString()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">kg CO₂ per Passenger (avg)</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border-2 border-sky/20 dark:border-sky/30 transition-colors duration-300"
          >
            <Fuel className="w-8 h-8 mb-3 text-sky" />
            <p className="text-3xl font-bold text-navy dark:text-white mb-1 transition-colors duration-300">3-4L</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Fuel per 100 passenger-km</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border-2 border-orange-500/20 dark:border-orange-500/30 transition-colors duration-300"
          >
            <AlertTriangle className="w-8 h-8 mb-3 text-orange-500" />
            <p className="text-3xl font-bold text-navy dark:text-white mb-1 transition-colors duration-300">2.5%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">of Global Emissions</p>
          </motion.div>
        </div>

        {/* Popular Routes Emissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card mb-8 transition-colors duration-300"
        >
          <div className="flex items-center mb-6">
            <Plane className="w-6 h-6 mr-3 text-navy dark:text-white transition-colors duration-300" />
            <h3 className="text-xl font-poppins font-semibold text-navy dark:text-white transition-colors duration-300">
              Popular International Routes - CO₂ Emissions
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={popularRoutes} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="route" stroke="#666" />
              <YAxis stroke="#666" label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => {
                  if (name === 'co2') return [value + ' kg', 'CO₂ Emissions'];
                  if (name === 'distance') return [value + ' km', 'Distance'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="co2" fill="#00C896" radius={[8, 8, 0, 0]} name="CO₂ (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card transition-colors duration-300"
          >
            <h3 className="text-xl font-poppins font-semibold text-navy dark:text-white mb-6 transition-colors duration-300">
              Monthly Flight Emissions Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C896" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00C896" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" label={{ value: 'Million Tonnes CO₂', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="co2" 
                  stroke="#00C896" 
                  fillOpacity={1} 
                  fill="url(#colorCO2)" 
                  name="CO₂ (Million Tonnes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart - Flight Distance Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card transition-colors duration-300"
          >
            <h3 className="text-xl font-poppins font-semibold text-navy dark:text-white mb-6 transition-colors duration-300">
              Emissions by Flight Distance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name.split(' ')[0]} ${value}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {distanceCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[idx] }}
                    />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{cat.category}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">{cat.avgCO2} kg CO₂ avg</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Aircraft Efficiency Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card mb-8 transition-colors duration-300"
        >
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 mr-3 text-navy dark:text-white transition-colors duration-300" />
            <h3 className="text-xl font-poppins font-semibold text-navy dark:text-white transition-colors duration-300">
              Aircraft Fuel Efficiency Comparison
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {aircraftEfficiency.map((aircraft, idx) => (
              <div 
                key={idx}
                className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-emerald/30 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-navy dark:text-white transition-colors duration-300">{aircraft.type}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    aircraft.efficiency === 'Excellent' ? 'bg-emerald/20 text-emerald' :
                    aircraft.efficiency === 'Very Good' ? 'bg-sky/20 text-sky' :
                    aircraft.efficiency === 'Good' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {aircraft.efficiency}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  <p className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium text-navy dark:text-white transition-colors duration-300">{aircraft.seats} seats</span>
                  </p>
                  <p className="flex justify-between">
                    <span>CO₂/km:</span>
                    <span className="font-medium text-navy dark:text-white transition-colors duration-300">{aircraft.co2PerKm} kg</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Per Passenger:</span>
                    <span className="font-medium text-navy dark:text-white transition-colors duration-300">{(aircraft.co2PerKm / aircraft.seats * 1000).toFixed(1)} g/km</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Environmental Impact Equivalents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card mb-8 transition-colors duration-300"
        >
          <h3 className="text-2xl font-poppins font-semibold text-navy dark:text-white mb-6 transition-colors duration-300">
            🌍 Understanding the Impact: Average Long-Haul Flight
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
            A typical long-haul flight (e.g., London to New York) produces approximately <span className="font-semibold text-navy dark:text-white transition-colors duration-300">{Math.round(totalCO2)} kg CO₂</span> per passenger. That's equivalent to:
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-emerald/10 dark:bg-emerald/20 rounded-xl p-5 text-center transition-colors duration-300">
              <TreePine className="w-10 h-10 mx-auto mb-3 text-emerald" />
              <p className="text-3xl font-bold text-navy dark:text-white mb-2 transition-colors duration-300">{totalTrees}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Trees needed to absorb this CO₂ in a year</p>
            </div>
            <div className="bg-sky/10 dark:bg-sky/20 rounded-xl p-5 text-center transition-colors duration-300">
              <Car className="w-10 h-10 mx-auto mb-3 text-sky" />
              <p className="text-3xl font-bold text-navy dark:text-white mb-2 transition-colors duration-300">{carKm.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Kilometers driven in average car</p>
            </div>
            <div className="bg-orange-500/10 dark:bg-orange-500/20 rounded-xl p-5 text-center transition-colors duration-300">
              <Home className="w-10 h-10 mx-auto mb-3 text-orange-500" />
              <p className="text-3xl font-bold text-navy dark:text-white mb-2 transition-colors duration-300">{homeEnergy}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Days of average home energy use</p>
            </div>
            <div className="bg-purple-500/10 dark:bg-purple-500/20 rounded-xl p-5 text-center transition-colors duration-300">
              <Zap className="w-10 h-10 mx-auto mb-3 text-purple-500" />
              <p className="text-3xl font-bold text-navy dark:text-white mb-2 transition-colors duration-300">{Math.round(totalCO2 * 122)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">kWh of electricity consumed</p>
            </div>
          </div>
        </motion.div>

        {/* Key Insights and Facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gradient-to-r from-navy/5 dark:from-navy/20 to-sky/5 dark:to-sky/20 border-2 border-navy/10 dark:border-navy/30 rounded-2xl p-8 mb-8 transition-colors duration-300"
        >
          <h3 className="text-2xl font-poppins font-semibold text-navy dark:text-white mb-6 transition-colors duration-300">
            📊 Key Aviation Facts & Statistics
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald/20 dark:bg-emerald/30 flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                  <span className="text-emerald font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy dark:text-white mb-1 transition-colors duration-300">Fastest Growing Source</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Aviation is one of the fastest-growing sources of greenhouse gas emissions globally, with passenger numbers expected to double by 2037.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald/20 dark:bg-emerald/30 flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                  <span className="text-emerald font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy dark:text-white mb-1 transition-colors duration-300">Altitude Impact</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Emissions at high altitude have 2-4x the climate impact of ground-level emissions due to additional effects like contrail formation.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald/20 dark:bg-emerald/30 flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                  <span className="text-emerald font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy dark:text-white mb-1 transition-colors duration-300">Efficiency Improvements</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Modern aircraft are 80% more fuel-efficient than jets from the 1960s, but increased travel demand has offset these gains.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-sky/20 dark:bg-sky/30 flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                  <span className="text-sky font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy dark:text-white mb-1 transition-colors duration-300">Business Class Impact</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Business class passengers have a carbon footprint up to 3x higher than economy due to more space per passenger.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-sky/20 dark:bg-sky/30 flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                  <span className="text-sky font-bold">5</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy dark:text-white mb-1 transition-colors duration-300">Short-Haul Impact</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Takeoff and landing consume 25% of fuel, making short flights less efficient per kilometer than long-haul flights.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-sky/20 dark:bg-sky/30 flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                  <span className="text-sky font-bold">6</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy dark:text-white mb-1 transition-colors duration-300">Sustainable Aviation Fuel</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">SAF can reduce lifecycle emissions by up to 80%, but currently accounts for less than 0.1% of global jet fuel use.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Impact Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-emerald/10 dark:from-emerald/20 to-sky/10 dark:to-sky/20 border border-emerald/30 dark:border-emerald/40 rounded-2xl p-8 transition-colors duration-300"
        >
          <h3 className="text-xl font-poppins font-semibold text-navy dark:text-white mb-4 transition-colors duration-300">
            💡 How to Reduce Your Aviation Carbon Footprint
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="flex items-start space-x-3">
                <span className="text-emerald text-xl font-bold">✓</span>
                <span><strong className="text-gray-900 dark:text-white">Choose direct flights</strong> — they emit 20-30% less CO₂ than flights with layovers</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald text-xl font-bold">✓</span>
                <span><strong className="text-gray-900 dark:text-white">Fly economy class</strong> — business class has 3x the carbon footprint per passenger</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald text-xl font-bold">✓</span>
                <span><strong className="text-gray-900 dark:text-white">Pack light</strong> — every 10 kg saved reduces emissions by approximately 2-3%</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald text-xl font-bold">✓</span>
                <span><strong className="text-gray-900 dark:text-white">Choose newer aircraft</strong> — they can be up to 25% more fuel-efficient</span>
              </li>
            </ul>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="flex items-start space-x-3">
                <span className="text-emerald text-xl font-bold">✓</span>
                <span><strong className="text-gray-900 dark:text-white">Consider alternatives</strong> — for distances under 500km, trains emit 90% less CO₂</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald text-xl font-bold">✓</span>
                <span><strong className="text-gray-900 dark:text-white">Offset your carbon</strong> — invest in verified carbon offset programs</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald text-xl font-bold">✓</span>
                <span><strong className="text-gray-900 dark:text-white">Travel less frequently</strong> — consolidate trips and stay longer when possible</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald text-xl font-bold">✓</span>
                <span><strong className="text-gray-900 dark:text-white">Support sustainable aviation</strong> — choose airlines investing in SAF and carbon reduction</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImpactDashboard;
