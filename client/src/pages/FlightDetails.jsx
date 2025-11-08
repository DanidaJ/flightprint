import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plane, Clock, Leaf, Car, TreePine, TrendingUp, Users, MapPin, Calendar, Info } from 'lucide-react';

const FlightDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, passengers = 1 } = location.state || {};

  if (!flight) {
    navigate('/results');
    return null;
  }

  const getEmissionLevel = (co2) => {
    if (co2 < 200) return { color: 'emerald', label: 'Low', badge: 'Eco-Friendly Choice 🌿' };
    if (co2 < 300) return { color: 'yellow-500', label: 'Medium', badge: 'Moderate Impact 🟡' };
    return { color: 'orange-500', label: 'High', badge: 'Higher Impact 🟠' };
  };

  // Calculate outbound CO2 (half if round trip)
  const outboundCO2 = flight.hasReturn ? Math.round(flight.co2 / 2) : flight.co2;
  const returnCO2 = flight.hasReturn ? Math.round(flight.co2 / 2) : 0;
  const totalPerPerson = flight.co2;
  const totalAllPassengers = flight.co2 * passengers;

  const outboundLevel = getEmissionLevel(outboundCO2);
  const returnLevel = getEmissionLevel(returnCO2);
  const totalLevel = getEmissionLevel(totalPerPerson);

  // Enhanced eco insights
  const treesNeeded = Math.round(totalAllPassengers / 21);
  const carKm = Math.round(totalAllPassengers / 0.12);
  const homeEnergyDays = Math.round((totalAllPassengers / 30) * 10) / 10;
  const plasticBottles = Math.round(totalAllPassengers * 11); // ~11 plastic bottles per kg CO2

  const FlightSegmentDetail = ({ flightData, label, co2, emissionLevel, stops, segments }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald to-sky rounded-xl flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-navy dark:text-white transition-colors duration-300">{label} Flight</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              {stops === 0 ? 'Direct Flight' : `${stops} stop${stops > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className={`bg-${emissionLevel.color}/10 border border-${emissionLevel.color}/30 rounded-lg px-4 py-2`}>
          <div className="flex items-center space-x-2">
            <Leaf className={`w-5 h-5 text-${emissionLevel.color}`} />
            <span className={`text-lg font-bold text-${emissionLevel.color}`}>{co2} kg</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center transition-colors duration-300">CO₂/person</p>
        </div>
      </div>

      {/* Journey Timeline - Detailed Segments */}
      {segments && segments.length > 0 ? (
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div key={index}>
              {/* Segment Card */}
              <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                {/* Segment Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-emerald/10 text-emerald px-2 py-1 rounded-md text-xs font-semibold">
                      Leg {segment.segmentNumber} of {segment.totalSegments}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {segment.airline}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-navy dark:text-white">
                    {segment.flightNumber}
                  </div>
                </div>

                {/* Route and Times */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-navy dark:text-white mb-1">{segment.departure}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{segment.from}</p>
                    {segment.terminal.departure && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Terminal {segment.terminal.departure}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-full mb-1">
                      <div className="border-t-2 border-dashed border-emerald relative">
                        <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-emerald rotate-90 bg-white dark:bg-gray-700 px-1" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {segment.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-navy dark:text-white mb-1">{segment.arrival}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{segment.to}</p>
                    {segment.terminal.arrival && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Terminal {segment.terminal.arrival}
                      </p>
                    )}
                  </div>
                </div>

                {/* Aircraft Type */}
                {segment.aircraft && (
                  <div className="flex items-center justify-center space-x-2 bg-sky/5 dark:bg-sky/10 rounded-lg py-2">
                    <Plane className="w-4 h-4 text-sky" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Aircraft: <span className="font-semibold">{segment.aircraft}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Layover Card */}
              {segment.layover && (
                <div className="flex items-center justify-center py-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-2 flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        {segment.layover.hours}h {segment.layover.minutes}m Layover
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        {segment.layover.airport} Airport
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Fallback for simple display */
        <div>
          {/* Flight Details */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-navy dark:text-white mb-1 transition-colors duration-300">{flightData.departure}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">{flightData.from}</p>
              {flightData.departureDate && (
                <div className="flex items-center justify-center space-x-1 text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">
                  <Calendar className="w-3 h-3" />
                  <span>{flightData.departureDate}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="relative w-full">
                <div className="border-t-2 border-dashed border-emerald relative">
                  <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-emerald rotate-90 bg-white dark:bg-gray-800 transition-colors duration-300" />
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">
                  {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-navy dark:text-white mb-1 transition-colors duration-300">{flightData.arrival}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{flightData.to}</p>
            </div>
          </div>

          {/* Flight Number */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center transition-colors duration-300">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">Flight Number</p>
            <p className="text-sm font-semibold text-navy dark:text-white transition-colors duration-300">{flightData.flightNumber}</p>
          </div>
        </div>
      )}
```
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2847] to-[#0a192f] dark:from-[#020817] dark:via-[#0a0f1c] dark:to-[#020817] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Results</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-transparent dark:border-gray-700 transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-navy dark:text-white mb-2 transition-colors duration-300">Flight Details</h1>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Complete breakdown of your flight and its environmental impact</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-emerald">${flight.price}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Total Price</p>
            </div>
          </div>

          {/* Passenger Count */}
          <div className="flex items-center space-x-2 bg-emerald/10 dark:bg-emerald/20 border border-emerald/30 dark:border-emerald/40 rounded-lg px-4 py-3 inline-flex transition-colors duration-300">
            <Users className="w-5 h-5 text-emerald" />
            <span className="font-semibold text-navy dark:text-white transition-colors duration-300">{passengers} Passenger{passengers > 1 ? 's' : ''}</span>
          </div>
        </motion.div>

        {/* Flight Segments */}
        <div className="space-y-6 mb-6">
          {/* Outbound Flight */}
          <FlightSegmentDetail
            label="Outbound"
            flightData={{
              airline: flight.airline,
              flightNumber: flight.flightNumber,
              departure: flight.departure,
              arrival: flight.arrival,
              from: flight.from,
              to: flight.to,
              departureDate: flight.departureDate
            }}
            co2={outboundCO2}
            emissionLevel={outboundLevel}
            stops={flight.stops}
            segments={flight.segments}
          />

          {/* Return Flight */}
          {flight.hasReturn && flight.returnFlight && (
            <FlightSegmentDetail
              label="Return"
              flightData={flight.returnFlight}
              co2={returnCO2}
              emissionLevel={returnLevel}
              stops={flight.returnFlight.stops}
              segments={flight.returnFlight.segments}
            />
          )}
        </div>

        {/* CO2 Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 transition-colors duration-300"
        >
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-6 flex items-center space-x-2 transition-colors duration-300">
            <Leaf className="w-7 h-7 text-emerald" />
            <span>Carbon Emissions Summary</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Per Person */}
            <div className={`bg-${totalLevel.color}/10 dark:bg-${totalLevel.color}/20 border-2 border-${totalLevel.color}/30 dark:border-${totalLevel.color}/40 rounded-xl p-6 transition-colors duration-300`}>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">CO₂ Emissions Per Person</p>
              <p className={`text-5xl font-bold text-${totalLevel.color} mb-2`}>{totalPerPerson} kg</p>
              <div className={`inline-flex items-center space-x-2 bg-${totalLevel.color}/20 dark:bg-${totalLevel.color}/30 px-3 py-1 rounded-full transition-colors duration-300`}>
                <span className={`text-xs font-semibold text-${totalLevel.color}`}>{totalLevel.badge}</span>
              </div>
            </div>

            {/* All Passengers */}
            <div className="bg-gradient-to-br from-orange-50 dark:from-orange-900/20 to-red-50 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-6 transition-colors duration-300">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">Total CO₂ for All Passengers</p>
              <p className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2 transition-colors duration-300">{totalAllPassengers} kg</p>
              <div className="inline-flex items-center space-x-2 bg-orange-200 dark:bg-orange-800 px-3 py-1 rounded-full transition-colors duration-300">
                <Users className="w-4 h-4 text-orange-700 dark:text-orange-300 transition-colors duration-300" />
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 transition-colors duration-300">{passengers} × {totalPerPerson} kg</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Environmental Impact Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300"
        >
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-2 transition-colors duration-300">Environmental Impact Insights</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">Understanding the environmental footprint of your journey</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Car Equivalent */}
            <div className="bg-gradient-to-br from-sky-50 dark:from-sky-900/20 to-blue-50 dark:to-blue-900/20 rounded-xl p-6 border border-sky-200 dark:border-sky-800 transition-colors duration-300">
              <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-sky-700 dark:text-sky-400 mb-2 transition-colors duration-300">{carKm.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">Kilometers by car</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">Equivalent CO₂ emissions</p>
            </div>

            {/* Trees Needed */}
            <div className="bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-green-50 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 transition-colors duration-300">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2 transition-colors duration-300">{treesNeeded}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">Trees needed</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">To offset this journey</p>
            </div>

            {/* Home Energy */}
            <div className="bg-gradient-to-br from-orange-50 dark:from-orange-900/20 to-amber-50 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 transition-colors duration-300">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-400 mb-2 transition-colors duration-300">{homeEnergyDays}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">Days of energy</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">Average home usage</p>
            </div>

            {/* Plastic Bottles */}
            <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-pink-50 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 transition-colors duration-300">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">♻️</span>
              </div>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2 transition-colors duration-300">{plasticBottles}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">Plastic bottles</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">Manufacturing equivalent</p>
            </div>
          </div>

          {/* Offset Tip */}
          <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 transition-colors duration-300">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2 transition-colors duration-300">💚 Consider Carbon Offsetting</h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed transition-colors duration-300">
                  You can offset the <span className="font-bold">{totalAllPassengers} kg</span> of CO₂ from this trip by 
                  supporting reforestation projects, renewable energy initiatives, or carbon capture programs. 
                  Many airlines offer offset programs at checkout, or you can use services like Gold Standard or Verra.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FlightDetails;
