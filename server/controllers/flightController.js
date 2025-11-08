import amadeusService from '../services/amadeusService.js';
import Flight from '../models/Flight.js';
import Search from '../models/Search.js';

/**
 * Search for flights
 */
export const searchFlights = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      travelClass = 'ECONOMY'
    } = req.query;

    // Validation
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Origin, destination, and departure date are required'
      });
    }

    // Validate IATA codes (3 letters)
    if (origin.length !== 3 || destination.length !== 3) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid airport codes. Please use 3-letter IATA codes (e.g., JFK, LAX)'
      });
    }

    // Validate date format
    const depDate = new Date(departureDate);
    if (isNaN(depDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid departure date format. Use YYYY-MM-DD'
      });
    }

    // Check if departure date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (depDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Departure date cannot be in the past'
      });
    }

    // Save search to database
    // TODO: Re-enable when user authentication is implemented
    // const tripType = returnDate ? 'return' : 'oneway';
    // const searchRecord = new Search({
    //   origin: origin.toUpperCase(),
    //   destination: destination.toUpperCase(),
    //   departureDate: depDate,
    //   returnDate: returnDate ? new Date(returnDate) : null,
    //   tripType,
    //   adults: parseInt(adults),
    //   travelClass
    // });

    // Search flights using Amadeus API
    const searchParams = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate,
      adults: parseInt(adults),
      travelClass,
      max: 250  // Request more flights to ensure we get popular airlines
    };

    const amadeusResponse = await amadeusService.searchFlights(searchParams);

    // Process and enrich flight data
    const flights = await processFlightOffers(
      amadeusResponse.data || [],
      origin.toUpperCase(),
      destination.toUpperCase(),
      depDate
    );

    // Sort and prioritize flights
    const prioritizedFlights = prioritizeFlights(flights);

    // Return top 20 results
    const topFlights = prioritizedFlights.slice(0, 20);

    // Update search record with result count
    // TODO: Re-enable when user authentication is implemented
    // searchRecord.resultCount = flights.length;
    // await searchRecord.save();

    res.status(200).json({
      status: 'success',
      results: topFlights.length,
      totalFound: flights.length,
      data: {
        // searchId: searchRecord._id, // TODO: Re-enable when user authentication is implemented
        flights: topFlights
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get flight by ID
 */
export const getFlightById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const flight = await Flight.findById(id);

    if (!flight) {
      return res.status(404).json({
        status: 'error',
        message: 'Flight not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { flight }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get recent searches
 */
export const getRecentSearches = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const searches = await Search.find()
      .sort({ searchedAt: -1 })
      .limit(limit)
      .select('-__v');

    res.status(200).json({
      status: 'success',
      results: searches.length,
      data: { searches }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Process and enrich flight offers from Amadeus
 */
async function processFlightOffers(offers, origin, destination, departureDate) {
  const processedFlights = [];

  for (const offer of offers) {
    try {
      // Extract basic flight info
      const itineraries = offer.itineraries || [];
      const price = offer.price || {};
      const travelerPricings = offer.travelerPricings || [];

      // Count total stops correctly
      // Each segment is a flight leg
      // Stops = (number of segments - 1) for each itinerary
      let totalStops = 0;
      itineraries.forEach(itinerary => {
        const segments = itinerary.segments || [];
        // Each segment can also have internal stops (technical stops)
        const segmentStops = segments.reduce((sum, segment) => {
          return sum + (segment.numberOfStops || 0);
        }, 0);
        // Add segment-based stops (segments - 1) + technical stops
        totalStops += Math.max(0, segments.length - 1) + segmentStops;
      });

      // Get airlines
      const airlineCodes = new Set();
      const airlines = [];
      
      itineraries.forEach(itinerary => {
        itinerary.segments?.forEach(segment => {
          if (segment.carrierCode && !airlineCodes.has(segment.carrierCode)) {
            airlineCodes.add(segment.carrierCode);
            airlines.push({
              code: segment.carrierCode,
              name: getAirlineName(segment.carrierCode)
            });
          }
        });
      });

      // Extract carbon emissions if available
      let carbonEmissions = {
        weight: 0,
        weightUnit: 'KG',
        cabin: travelerPricings[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY'
      };

      // Try to get emissions from Amadeus data
      if (travelerPricings[0]?.fareDetailsBySegment) {
        const segments = travelerPricings[0].fareDetailsBySegment;
        let totalEmissions = 0;
        
        segments.forEach(segment => {
          if (segment.co2Emissions) {
            totalEmissions += segment.co2Emissions[0]?.weight || 0;
          }
        });

        if (totalEmissions > 0) {
          carbonEmissions.weight = totalEmissions;
          // Removed console.log to prevent memory leaks in production
        }
      }

      // If no emissions data, estimate based on distance
      if (carbonEmissions.weight === 0) {
        // Rough estimate: short-haul ~90kg, medium ~200kg, long-haul ~400kg per passenger
        // Calculate emissions for each itinerary separately
        const estimatedDistance = estimateFlightDistance(origin, destination);
        const singleTripEmissions = amadeusService.estimateEmissions(
          estimatedDistance,
          carbonEmissions.cabin,
          totalStops
        );
        
        // Multiply by number of itineraries (1 for one-way, 2 for round-trip)
        carbonEmissions.weight = singleTripEmissions * itineraries.length;
        // Removed console.log to prevent memory leaks in production
      }

      // Create flight document
      const flightData = {
        flightOfferId: offer.id,
        origin,
        destination,
        departureDate,
        itineraries: itineraries.map(itinerary => ({
          duration: itinerary.duration,
          segments: itinerary.segments?.map(segment => ({
            departure: {
              iataCode: segment.departure?.iataCode,
              terminal: segment.departure?.terminal,
              at: new Date(segment.departure?.at)
            },
            arrival: {
              iataCode: segment.arrival?.iataCode,
              terminal: segment.arrival?.terminal,
              at: new Date(segment.arrival?.at)
            },
            carrierCode: segment.carrierCode,
            carrierName: getAirlineName(segment.carrierCode),
            flightNumber: segment.number,
            aircraft: segment.aircraft?.code,
            duration: segment.duration,
            numberOfStops: segment.numberOfStops || 0
          }))
        })),
        price: {
          currency: price.currency || 'USD',
          total: parseFloat(price.total) || 0,
          base: parseFloat(price.base) || 0,
          grandTotal: parseFloat(price.grandTotal) || parseFloat(price.total) || 0
        },
        travelClass: travelerPricings[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
        stops: totalStops,
        airlines,
        carbonEmissions,
        validatingAirlineCodes: offer.validatingAirlineCodes || [],
        numberOfBookableSeats: offer.numberOfBookableSeats || 0
      };

      // Save to database (with upsert to handle duplicates)
      // TODO: Re-enable when user authentication is implemented
      // This will allow tracking user's flight searches and bookings
      // try {
      //   const flight = await Flight.findOneAndUpdate(
      //     { flightOfferId: flightData.flightOfferId },
      //     flightData,
      //     { upsert: true, new: true, setDefaultsOnInsert: true }
      //   );
      //   processedFlights.push(flight);
      // } catch (dbError) {
      //   // If DB save fails, still return the data without saving
      //   console.warn('DB save failed, returning flight data anyway:', dbError.message);
      //   processedFlights.push(flightData);
      // }
      
      // For now, just return the flight data without saving
      processedFlights.push(flightData);

    } catch (error) {
      console.error('Error processing flight offer:', error.message);
      // Continue with next offer
    }
  }

  return processedFlights;
}

/**
 * Get airline name from code (expanded list)
 */
function getAirlineName(code) {
  const airlines = {
    // Major International Airlines
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'DL': 'Delta Air Lines',
    'BA': 'British Airways',
    'AF': 'Air France',
    'LH': 'Lufthansa',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'SQ': 'Singapore Airlines',
    'EY': 'Etihad Airways',
    'TK': 'Turkish Airlines',
    'KL': 'KLM',
    'AC': 'Air Canada',
    'NH': 'ANA',
    'JL': 'Japan Airlines',
    'CX': 'Cathay Pacific',
    'QF': 'Qantas',
    'VS': 'Virgin Atlantic',
    'AZ': 'ITA Airways',
    'IB': 'Iberia',
    'LX': 'Swiss International Air Lines',
    'OS': 'Austrian Airlines',
    'SN': 'Brussels Airlines',
    'SK': 'SAS Scandinavian Airlines',
    'AY': 'Finnair',
    'TP': 'TAP Air Portugal',
    
    // Asian Airlines
    'UL': 'SriLankan Airlines',
    'AI': 'Air India',
    'SV': 'Saudia',
    'MS': 'EgyptAir',
    'TG': 'Thai Airways',
    'MH': 'Malaysia Airlines',
    'GA': 'Garuda Indonesia',
    'KE': 'Korean Air',
    'OZ': 'Asiana Airlines',
    'BR': 'EVA Air',
    'CI': 'China Airlines',
    'CA': 'Air China',
    'MU': 'China Eastern',
    'CZ': 'China Southern',
    'HU': 'Hainan Airlines',
    
    // Middle Eastern
    'GF': 'Gulf Air',
    'RJ': 'Royal Jordanian',
    'ME': 'Middle East Airlines',
    'WY': 'Oman Air',
    'KU': 'Kuwait Airways',
    
    // Low-cost Carriers
    'WN': 'Southwest Airlines',
    'B6': 'JetBlue Airways',
    'NK': 'Spirit Airlines',
    'F9': 'Frontier Airlines',
    'G4': 'Allegiant Air',
    'FR': 'Ryanair',
    'U2': 'easyJet',
    'VY': 'Vueling',
    'W6': 'Wizz Air',
    'FZ': 'flydubai',
    'WK': 'Edelweiss Air',
    '6E': 'IndiGo',
    'SG': 'SpiceJet',
    
    // Others
    'AS': 'Alaska Airlines',
    'WS': 'WestJet',
    'LA': 'LATAM Airlines',
    'AM': 'Aeroméxico',
    'CM': 'Copa Airlines',
    'ET': 'Ethiopian Airlines',
    'KQ': 'Kenya Airways',
    'SA': 'South African Airways'
  };

  return airlines[code] || code;
}

/**
 * Prioritize flights based on popular airlines and other factors
 */
function prioritizeFlights(flights) {
  // Define popular/premium airlines (priority carriers)
  const premiumAirlines = new Set([
    'EK', // Emirates
    'QR', // Qatar Airways
    'SQ', // Singapore Airlines
    'EY', // Etihad Airways
    'BA', // British Airways
    'AF', // Air France
    'LH', // Lufthansa
    'AA', // American Airlines
    'UA', // United Airlines
    'DL', // Delta Air Lines
    'CX', // Cathay Pacific
    'QF', // Qantas
    'NH', // ANA
    'JL', // Japan Airlines
    'TK', // Turkish Airlines
    'KL', // KLM
    'VS', // Virgin Atlantic
    'AC', // Air Canada
    'UL', // SriLankan Airlines
    'AI', // Air India
    'TG', // Thai Airways
    'MH', // Malaysia Airlines
    'KE', // Korean Air
    'LX', // Swiss
    'OS', // Austrian
    'IB', // Iberia
    'AZ', // ITA Airways
  ]);

  return flights.sort((a, b) => {
    // Calculate priority scores
    let scoreA = 0;
    let scoreB = 0;

    // 1. Prioritize direct flights (highest priority)
    if (a.stops === 0) scoreA += 1000;
    if (b.stops === 0) scoreB += 1000;

    // 2. Prioritize premium airlines
    const hasAPremiumAirline = a.airlines.some(airline => premiumAirlines.has(airline.code));
    const hasBPremiumAirline = b.airlines.some(airline => premiumAirlines.has(airline.code));
    
    if (hasAPremiumAirline) scoreA += 500;
    if (hasBPremiumAirline) scoreB += 500;

    // 3. Penalize flights with more stops
    scoreA -= (a.stops * 200);
    scoreB -= (b.stops * 200);

    // 4. Consider price (lower is better, but weight it less than airline quality)
    // Normalize by dividing by 10 so price doesn't dominate
    scoreA -= (a.price.grandTotal / 10);
    scoreB -= (b.price.grandTotal / 10);

    // 5. Prefer flights with more available seats
    scoreA += (a.numberOfBookableSeats * 2);
    scoreB += (b.numberOfBookableSeats * 2);

    // 6. Consider flight duration (shorter is better for same route)
    // Extract duration from first itinerary
    const getDurationMinutes = (flight) => {
      if (!flight.itineraries?.[0]?.duration) return 9999;
      const duration = flight.itineraries[0].duration;
      // Parse ISO 8601 duration (PT2H30M -> 150 minutes)
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (!match) return 9999;
      const hours = parseInt(match[1] || 0);
      const minutes = parseInt(match[2] || 0);
      return hours * 60 + minutes;
    };

    const durationA = getDurationMinutes(a);
    const durationB = getDurationMinutes(b);
    scoreA -= (durationA * 0.5);
    scoreB -= (durationB * 0.5);

    // Sort by score (highest first)
    return scoreB - scoreA;
  });
}

/**
 * Estimate flight distance (simplified)
 */
function estimateFlightDistance(origin, destination) {
  // This is a very rough estimation based on common routes
  // In a real application, you'd use actual airport coordinates
  const distances = {
    'JFKLAX': 3983,
    'JFKLHR': 5541,
    'LAXSFO': 543,
    'LASDFW': 1789,
    'ORDLAX': 2799
  };

  const key = origin + destination;
  const reverseKey = destination + origin;

  return distances[key] || distances[reverseKey] || 1500; // Default 1500km
}
