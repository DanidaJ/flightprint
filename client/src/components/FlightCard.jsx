import { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plane, Leaf, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FlightCard = memo(({ flight, index, passengers = 1 }) => {
  const navigate = useNavigate();
  const getEmissionLevel = (co2) => {
    if (co2 < 200) return { color: 'emerald', label: 'Low', badge: 'Eco Choice 🌿' };
    if (co2 < 300) return { color: 'yellow-500', label: 'Medium', badge: '' };
    return { color: 'orange-500', label: 'High', badge: '' };
  };

  // Calculate outbound and return CO2 separately
  const outboundCO2 = flight.hasReturn ? Math.round(flight.co2 / 2) : flight.co2;
  const returnCO2 = flight.hasReturn ? Math.round(flight.co2 / 2) : 0;
  const totalCO2 = flight.co2;
  
  const outboundLevel = getEmissionLevel(outboundCO2);
  const returnLevel = getEmissionLevel(returnCO2);
  const totalLevel = getEmissionLevel(totalCO2);

  const handleCardClick = () => {
    navigate('/flight-details', { state: { flight, passengers } });
  };

  const FlightSegment = ({ flightData, label, stops, co2, emissionLevel, isReturn = false, segments }) => (
    <div className={isReturn ? 'mt-3 pt-3 border-t border-gray-100 dark:border-gray-700' : ''}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-emerald bg-emerald/10 dark:bg-emerald/20 px-2 py-1 rounded">
            {label}
          </span>
          {flightData.departureDate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{flightData.departureDate}</span>
          )}
        </div>
        {/* CO2 Badge for this segment */}
        <div className={`flex items-center space-x-1 bg-${emissionLevel.color}/10 px-2 py-1 rounded-lg`}>
          <Leaf className={`w-3 h-3 text-${emissionLevel.color}`} />
          <span className={`text-xs font-bold text-${emissionLevel.color}`}>{co2} kg</span>
        </div>
      </div>

      {/* Show all segments if flight has stops */}
      {segments && segments.length > 1 ? (
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index}>
              {/* Flight Segment */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-300">
                  <Plane className="w-4 h-4 text-navy dark:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-navy dark:text-white text-xs transition-colors duration-300">
                    {segment.airline}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {segment.flightNumber}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="text-right">
                    <p className="font-bold text-navy dark:text-white">{segment.from}</p>
                    <p className="text-gray-500 dark:text-gray-400">{segment.departure}</p>
                  </div>
                  <div className="flex items-center px-2">
                    <div className="w-12 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy dark:text-white">{segment.to}</p>
                    <p className="text-gray-500 dark:text-gray-400">{segment.arrival}</p>
                  </div>
                </div>
              </div>

              {/* Layover Info */}
              {segment.layover && (
                <div className="flex items-center justify-center py-1 mb-1">
                  <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                      {segment.layover.hours}h {segment.layover.minutes}m layover in {segment.layover.airport}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Single segment - Direct flight */
        <>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-300">
              <Plane className="w-5 h-5 text-navy dark:text-white transition-colors duration-300" />
            </div>
            <div>
              <p className="font-semibold text-navy dark:text-white text-sm transition-colors duration-300">{flightData.airline}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{flightData.flightNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-center">
              <p className="text-xl font-bold text-navy dark:text-white transition-colors duration-300">{flightData.departure}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{flightData.from}</p>
            </div>

            <div className="flex-1 relative flex flex-col items-center">
              <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 relative w-full transition-colors duration-300">
                <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 rotate-90 transition-colors duration-300" />
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold text-navy dark:text-white transition-colors duration-300">{flightData.arrival}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{flightData.to}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-glow transition-all overflow-hidden cursor-pointer group"
    >
      <div className="p-5">
        <div className="grid md:grid-cols-12 gap-4 items-center">
          {/* Airline & Times */}
          <div className="md:col-span-7">
            <FlightSegment 
              flightData={{
                airline: flight.airline,
                flightNumber: flight.flightNumber,
                departure: flight.departure,
                arrival: flight.arrival,
                from: flight.from,
                to: flight.to,
                departureDate: flight.departureDate
              }}
              stops={flight.stops}
              segments={flight.segments}
              label="Outbound"
              co2={outboundCO2}
              emissionLevel={outboundLevel}
            />
            
            {/* Return Flight */}
            {flight.hasReturn && flight.returnFlight && (
              <FlightSegment 
                flightData={flight.returnFlight}
                stops={flight.returnFlight.stops}
                segments={flight.returnFlight.segments}
                label="Return"
                co2={returnCO2}
                emissionLevel={returnLevel}
                isReturn={true}
              />
            )}
          </div>

          {/* Total CO2 & Price */}
          <div className="md:col-span-5 flex items-center justify-between">
            {/* Total CO2 */}
            <div className={`bg-${totalLevel.color}/10 border border-${totalLevel.color}/30 rounded-xl p-4 flex-1`}>
              <div className="flex items-center space-x-2 mb-1">
                <Leaf className={`w-5 h-5 text-${totalLevel.color}`} />
                <span className={`text-2xl font-bold text-${totalLevel.color}`}>
                  {totalCO2} kg
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                Total CO₂/person
              </p>
              {totalLevel.badge && (
                <span className="text-xs bg-emerald text-white px-2 py-0.5 rounded-full">
                  {totalLevel.badge}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-center ml-4">
              <p className="text-3xl font-bold text-navy dark:text-white transition-colors duration-300">${flight.price}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
                {flight.hasReturn ? 'total' : 'per person'}
              </p>
            </div>
          </div>
        </div>

        {/* Click to View Insights */}
        <motion.div
          className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center space-x-2 text-emerald group-hover:text-emerald-dark transition-colors duration-300"
        >
          <span className="text-sm font-medium">Click to view detailed insights</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.div>
      </div>
    </motion.div>
  );
});

FlightCard.displayName = 'FlightCard';

export default FlightCard;
