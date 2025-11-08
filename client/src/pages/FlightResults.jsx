import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, TrendingDown, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import FlightCard from '../components/FlightCard';
import { searchFlights } from '../services/api';

const FlightResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state;
  const hasShownToast = useRef(false);

  const [flights, setFlights] = useState([]);
  const [sortBy, setSortBy] = useState('price');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if there's no search data and redirect (only once)
    if (!searchData && !hasShownToast.current) {
      hasShownToast.current = true;
      toast('Please search for flights first to view results', {
        duration: 4000,
        position: 'top-center',
        icon: '✈️',
        style: {
          background: '#D1FAE5',
          color: '#065F46',
          border: '2px solid #34D399',
          padding: '16px',
          fontWeight: '500',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      });
      navigate('/search', { replace: true });
      return;
    }
  }, [searchData, navigate]);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!searchData) return;

      try {
        setLoading(true);
        setError(null);

        // Call real API
        const response = await searchFlights({
          origin: searchData.from,
          destination: searchData.to,
          departureDate: searchData.departDate,
          returnDate: searchData.returnDate || null,
          adults: searchData.passengers,
          travelClass: 'ECONOMY'
        });

        // Transform API response to match our component structure
        const transformedFlights = response.data.flights.map((flight) => {
          // Helper function to calculate layover duration
          const calculateLayover = (segment1, segment2) => {
            const arrival = new Date(segment1.arrival.at);
            const departure = new Date(segment2.departure.at);
            const diffMs = departure - arrival;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return { hours, minutes, airport: segment1.arrival.iataCode };
          };

          // Process outbound itinerary segments
          const outbound = flight.itineraries[0];
          const outboundFirstSegment = outbound.segments[0];
          const outboundLastSegment = outbound.segments[outbound.segments.length - 1];

          // Create segments array with layover information
          const outboundSegments = outbound.segments.map((segment, index) => {
            const nextSegment = outbound.segments[index + 1];
            const layover = nextSegment ? calculateLayover(segment, nextSegment) : null;

            return {
              segmentNumber: index + 1,
              totalSegments: outbound.segments.length,
              airline: segment.carrierName,
              carrierCode: segment.carrierCode,
              flightNumber: `${segment.carrierCode} ${segment.flightNumber}`,
              from: segment.departure.iataCode,
              to: segment.arrival.iataCode,
              departure: new Date(segment.departure.at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }),
              arrival: new Date(segment.arrival.at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }),
              departureDateTime: new Date(segment.departure.at),
              arrivalDateTime: new Date(segment.arrival.at),
              duration: segment.duration,
              aircraft: segment.aircraft,
              terminal: {
                departure: segment.departure.terminal,
                arrival: segment.arrival.terminal
              },
              layover: layover
            };
          });

          // Check if there's a return flight (second itinerary)
          const hasReturn = flight.itineraries.length > 1;
          let returnFlight = null;

          if (hasReturn) {
            const inbound = flight.itineraries[1];
            const inboundFirstSegment = inbound.segments[0];
            const inboundLastSegment = inbound.segments[inbound.segments.length - 1];

            // Create segments array for return flight
            const inboundSegments = inbound.segments.map((segment, index) => {
              const nextSegment = inbound.segments[index + 1];
              const layover = nextSegment ? calculateLayover(segment, nextSegment) : null;

              return {
                segmentNumber: index + 1,
                totalSegments: inbound.segments.length,
                airline: segment.carrierName,
                carrierCode: segment.carrierCode,
                flightNumber: `${segment.carrierCode} ${segment.flightNumber}`,
                from: segment.departure.iataCode,
                to: segment.arrival.iataCode,
                departure: new Date(segment.departure.at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }),
                arrival: new Date(segment.arrival.at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }),
                departureDateTime: new Date(segment.departure.at),
                arrivalDateTime: new Date(segment.arrival.at),
                duration: segment.duration,
                aircraft: segment.aircraft,
                terminal: {
                  departure: segment.departure.terminal,
                  arrival: segment.arrival.terminal
                },
                layover: layover
              };
            });

            returnFlight = {
              airline: inboundFirstSegment.carrierName || 'Unknown',
              flightNumber: `${inboundFirstSegment.carrierCode} ${inboundFirstSegment.flightNumber}`,
              from: flight.destination,
              to: flight.origin,
              departure: new Date(inboundFirstSegment.departure.at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }),
              arrival: new Date(inboundLastSegment.arrival.at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }),
              departureDate: new Date(inboundFirstSegment.departure.at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              }),
              stops: inbound.segments.length - 1,
              segments: inboundSegments
            };
          }

          return {
            id: flight._id || flight.flightOfferId,
            airline: outboundFirstSegment.carrierName || 'Unknown',
            flightNumber: `${outboundFirstSegment.carrierCode} ${outboundFirstSegment.flightNumber}`,
            from: flight.origin,
            to: flight.destination,
            departure: new Date(outboundFirstSegment.departure.at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            arrival: new Date(outboundLastSegment.arrival.at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            departureDate: new Date(outboundFirstSegment.departure.at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
            duration: parseInt(outbound.duration.replace('PT', '').replace('H', '')) * 60 + 
                     parseInt(outbound.duration.split('M')[0].split('H')[1] || 0),
            stops: flight.stops,
            segments: outboundSegments, // Add detailed segments info
            price: Math.round(flight.price.total),
            co2: Math.round(flight.carbonEmissions.weight),
            ecoInsights: flight.ecoInsights,
            returnFlight: returnFlight, // Add return flight data
            hasReturn: hasReturn,
            rawData: flight // Keep original data for details
          };
        });

        setFlights(transformedFlights);
      } catch (err) {
        // Only log in development to prevent memory leaks
        if (import.meta.env.DEV) {
          console.error('Flight search error:', err);
        }
        setError(err.message || 'Failed to fetch flights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchData]);

  const sortedFlights = [...flights].sort((a, b) => {
    // First, always sort by number of stops (direct flights first)
    const stopsDiff = a.stops - b.stops;
    if (stopsDiff !== 0) return stopsDiff;
    
    // Then sort by the selected criteria within the same stop count
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration - b.duration;
    if (sortBy === 'emissions') return a.co2 - b.co2;
    return 0;
  });

  if (!searchData) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-emerald transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-poppins font-semibold text-navy dark:text-white mb-2 transition-colors duration-300">
                {searchData.from} {searchData.returnDate ? '⇄' : '→'} {searchData.to}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                {searchData.departDate}
                {searchData.returnDate && ` - ${searchData.returnDate}`}
                {' • '}
                {searchData.passengers}{' '}
                {searchData.passengers === 1 ? 'passenger' : 'passengers'}
                {searchData.returnDate && ' • Round trip'}
              </p>
            </div>

            {/* Sort Options */}
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent outline-none cursor-pointer transition-colors duration-300"
              >
                <option value="price">Lowest Price</option>
                <option value="duration">Shortest Duration</option>
                <option value="emissions">Lowest Emissions</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Finding the best flights...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">Fetching real-time data from Amadeus API</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6 transition-colors duration-300"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1 transition-colors duration-300">Error Loading Flights</h3>
                <p className="text-red-600 dark:text-red-400 text-sm transition-colors duration-300">{error}</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-3 text-sm text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 underline transition-colors duration-300"
                >
                  Try a new search
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {!loading && !error && flights.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-emerald/10 dark:bg-emerald/20 border border-emerald/30 dark:border-emerald/40 rounded-xl p-4 mb-6 flex items-start space-x-3 transition-colors duration-300"
            >
              <TrendingDown className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-navy dark:text-gray-100 font-medium">
                  Found {flights.length} flights • Direct flights first, then sorted by{' '}
                  {sortBy === 'emissions' ? 'lowest emissions' : sortBy}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  💚 Green badges indicate eco-friendly options
                </p>
              </div>
            </motion.div>

            <div className="space-y-4">
              {sortedFlights.map((flight, index) => (
                <FlightCard 
                  key={flight.id} 
                  flight={flight} 
                  index={index} 
                  passengers={searchData?.passengers || 1}
                />
              ))}
            </div>
          </>
        )}

        {/* No Results */}
        {!loading && !error && flights.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-navy mb-2">No Flights Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any flights for this route. Try adjusting your search.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-emerald text-white rounded-lg hover:bg-emerald-dark transition-colors"
            >
              New Search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlightResults;
