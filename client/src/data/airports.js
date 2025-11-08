// Major airports database with IATA codes
export const airports = [
  // North America
  { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy International' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', name: 'Los Angeles International' },
  { code: 'ORD', city: 'Chicago', country: 'USA', name: "O'Hare International" },
  { code: 'DFW', city: 'Dallas', country: 'USA', name: 'Dallas/Fort Worth International' },
  { code: 'ATL', city: 'Atlanta', country: 'USA', name: 'Hartsfield-Jackson Atlanta International' },
  { code: 'MIA', city: 'Miami', country: 'USA', name: 'Miami International' },
  { code: 'SFO', city: 'San Francisco', country: 'USA', name: 'San Francisco International' },
  { code: 'BOS', city: 'Boston', country: 'USA', name: 'Logan International' },
  { code: 'SEA', city: 'Seattle', country: 'USA', name: 'Seattle-Tacoma International' },
  { code: 'IAD', city: 'Washington', country: 'USA', name: 'Dulles International' },
  { code: 'DCA', city: 'Washington', country: 'USA', name: 'Reagan National' },
  { code: 'LAS', city: 'Las Vegas', country: 'USA', name: 'Harry Reid International' },
  { code: 'MCO', city: 'Orlando', country: 'USA', name: 'Orlando International' },
  { code: 'DEN', city: 'Denver', country: 'USA', name: 'Denver International' },
  { code: 'PHX', city: 'Phoenix', country: 'USA', name: 'Phoenix Sky Harbor International' },
  { code: 'IAH', city: 'Houston', country: 'USA', name: 'George Bush Intercontinental' },
  { code: 'EWR', city: 'Newark', country: 'USA', name: 'Newark Liberty International' },
  { code: 'LGA', city: 'New York', country: 'USA', name: 'LaGuardia' },
  { code: 'CLT', city: 'Charlotte', country: 'USA', name: 'Charlotte Douglas International' },
  { code: 'MSP', city: 'Minneapolis', country: 'USA', name: 'Minneapolis-St Paul International' },
  { code: 'DTW', city: 'Detroit', country: 'USA', name: 'Detroit Metropolitan Wayne County' },
  { code: 'PDX', city: 'Portland', country: 'USA', name: 'Portland International' },
  { code: 'SAN', city: 'San Diego', country: 'USA', name: 'San Diego International' },
  { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson International' },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', name: 'Vancouver International' },
  { code: 'YUL', city: 'Montreal', country: 'Canada', name: 'Montreal-Pierre Elliott Trudeau International' },
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', name: 'Mexico City International' },

  // Europe
  { code: 'LHR', city: 'London', country: 'UK', name: 'Heathrow' },
  { code: 'LGW', city: 'London', country: 'UK', name: 'Gatwick' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle' },
  { code: 'ORY', city: 'Paris', country: 'France', name: 'Orly' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Schiphol' },
  { code: 'MAD', city: 'Madrid', country: 'Spain', name: 'Adolfo Suárez Madrid-Barajas' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Barcelona-El Prat' },
  { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci-Fiumicino' },
  { code: 'MXP', city: 'Milan', country: 'Italy', name: 'Malpensa' },
  { code: 'MUC', city: 'Munich', country: 'Germany', name: 'Franz Josef Strauss' },
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
  { code: 'VIE', city: 'Vienna', country: 'Austria', name: 'Vienna International' },
  { code: 'BRU', city: 'Brussels', country: 'Belgium', name: 'Brussels Airport' },
  { code: 'CPH', city: 'Copenhagen', country: 'Denmark', name: 'Copenhagen Airport' },
  { code: 'ARN', city: 'Stockholm', country: 'Sweden', name: 'Stockholm Arlanda' },
  { code: 'OSL', city: 'Oslo', country: 'Norway', name: 'Oslo Airport' },
  { code: 'HEL', city: 'Helsinki', country: 'Finland', name: 'Helsinki-Vantaa' },
  { code: 'DUB', city: 'Dublin', country: 'Ireland', name: 'Dublin Airport' },
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', name: 'Lisbon Portela' },
  { code: 'ATH', city: 'Athens', country: 'Greece', name: 'Athens International' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
  { code: 'SVO', city: 'Moscow', country: 'Russia', name: 'Sheremetyevo International' },
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', name: 'Václav Havel Airport Prague' },
  { code: 'WAW', city: 'Warsaw', country: 'Poland', name: 'Warsaw Chopin Airport' },

  // Asia
  { code: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Narita International' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Haneda Airport' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Incheon International' },
  { code: 'PVG', city: 'Shanghai', country: 'China', name: 'Pudong International' },
  { code: 'PEK', city: 'Beijing', country: 'China', name: 'Beijing Capital International' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International' },
  { code: 'MNL', city: 'Manila', country: 'Philippines', name: 'Ninoy Aquino International' },
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', name: 'Soekarno-Hatta International' },
  { code: 'DEL', city: 'Delhi', country: 'India', name: 'Indira Gandhi International' },
  { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj International' },
  { code: 'BLR', city: 'Bangalore', country: 'India', name: 'Kempegowda International' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE', name: 'Abu Dhabi International' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International' },
  { code: 'KWI', city: 'Kuwait City', country: 'Kuwait', name: 'Kuwait International' },
  { code: 'BAH', city: 'Manama', country: 'Bahrain', name: 'Bahrain International' },
  { code: 'TLV', city: 'Tel Aviv', country: 'Israel', name: 'Ben Gurion Airport' },

  // Oceania
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', name: 'Melbourne Airport' },
  { code: 'BNE', city: 'Brisbane', country: 'Australia', name: 'Brisbane Airport' },
  { code: 'PER', city: 'Perth', country: 'Australia', name: 'Perth Airport' },
  { code: 'AKL', city: 'Auckland', country: 'New Zealand', name: 'Auckland Airport' },
  { code: 'CHC', city: 'Christchurch', country: 'New Zealand', name: 'Christchurch International' },

  // South America
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', name: 'São Paulo/Guarulhos International' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', name: 'Rio de Janeiro/Galeão International' },
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', name: 'Ministro Pistarini International' },
  { code: 'SCL', city: 'Santiago', country: 'Chile', name: 'Arturo Merino Benítez International' },
  { code: 'BOG', city: 'Bogotá', country: 'Colombia', name: 'El Dorado International' },
  { code: 'LIM', city: 'Lima', country: 'Peru', name: 'Jorge Chávez International' },

  // Africa
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', name: 'OR Tambo International' },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', name: 'Cape Town International' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt', name: 'Cairo International' },
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', name: 'Addis Ababa Bole International' },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', name: 'Jomo Kenyatta International' },
  { code: 'LOS', city: 'Lagos', country: 'Nigeria', name: 'Murtala Muhammed International' },
  { code: 'CMN', city: 'Casablanca', country: 'Morocco', name: 'Mohammed V International' },
];

/**
 * Search airports by query string
 * @param {string} query - Search query (city name, airport code, or country)
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} Array of matching airports
 */
export const searchAirports = (query, limit = 10) => {
  if (!query || query.length < 1) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  const results = airports.filter(airport => {
    return (
      airport.code.toLowerCase().includes(searchTerm) ||
      airport.city.toLowerCase().includes(searchTerm) ||
      airport.country.toLowerCase().includes(searchTerm) ||
      airport.name.toLowerCase().includes(searchTerm)
    );
  });

  // Sort results: exact code matches first, then city matches, then others
  results.sort((a, b) => {
    const aCode = a.code.toLowerCase();
    const bCode = b.code.toLowerCase();
    const aCity = a.city.toLowerCase();
    const bCity = b.city.toLowerCase();
    
    if (aCode === searchTerm) return -1;
    if (bCode === searchTerm) return 1;
    if (aCode.startsWith(searchTerm) && !bCode.startsWith(searchTerm)) return -1;
    if (bCode.startsWith(searchTerm) && !aCode.startsWith(searchTerm)) return 1;
    if (aCity.startsWith(searchTerm) && !bCity.startsWith(searchTerm)) return -1;
    if (bCity.startsWith(searchTerm) && !aCity.startsWith(searchTerm)) return 1;
    
    return 0;
  });

  return results.slice(0, limit);
};

/**
 * Get airport by IATA code
 * @param {string} code - IATA airport code
 * @returns {Object|null} Airport object or null if not found
 */
export const getAirportByCode = (code) => {
  if (!code) return null;
  return airports.find(airport => airport.code.toLowerCase() === code.toLowerCase()) || null;
};
