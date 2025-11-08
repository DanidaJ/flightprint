import axios from 'axios';

class AeroDataBoxService {
  constructor() {
    // Credentials will be loaded lazily from environment
    this.cache = new Map(); // In-memory cache
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
    this.rateLimitResetTime = null;
    this.requestsThisMinute = 0;
    this.maxRequestsPerMinute = 10; // Conservative limit
  }

  getCredentials() {
    return {
      apiKey: process.env.AERODATABOX_API_KEY,
      apiHost: process.env.AERODATABOX_API_HOST
    };
  }

  getBaseURL() {
    const { apiHost } = this.getCredentials();
    return `https://${apiHost}`;
  }

  /**
   * Check if we can make a request (rate limiting)
   */
  async checkRateLimit() {
    const now = Date.now();
    
    // If we've been rate limited, wait until reset time
    if (this.rateLimitResetTime && now < this.rateLimitResetTime) {
      const waitTime = this.rateLimitResetTime - now;
      console.log(`⏳ Rate limit active. Waiting ${Math.ceil(waitTime / 1000)}s before next request...`);
      return false;
    }

    // Reset counter every minute
    if (!this.lastMinuteStart || now - this.lastMinuteStart > 60000) {
      this.requestsThisMinute = 0;
      this.lastMinuteStart = now;
    }

    // Check if we've exceeded requests per minute
    if (this.requestsThisMinute >= this.maxRequestsPerMinute) {
      console.log(`⏳ Rate limit: ${this.requestsThisMinute} requests this minute. Using cached/fallback data.`);
      return false;
    }

    // Enforce minimum interval between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
    this.requestsThisMinute++;
    return true;
  }

  /**
   * Handle rate limit response
   */
  handleRateLimit(error) {
    if (error.response?.status === 429) {
      // Set rate limit reset time (wait 1 minute)
      this.rateLimitResetTime = Date.now() + 60000;
      console.warn('⚠️ Rate limited by AeroDataBox API. Using fallback data for 1 minute.');
      return true;
    }
    return false;
  }

  /**
   * Get cached data
   */
  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`✅ Cache hit for: ${key}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached data
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Search airports by name or code
   * @param {string} query - Search query (airport name or code)
   * @returns {Promise<Array>} - List of matching airports
   */
  async searchAirports(query) {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const cacheKey = `search:${query.toLowerCase()}`;
      
      // Check cache first
      const cachedResult = this.getCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Try local search first (faster and no API limits)
      const localResults = this.searchLocalAirports(query);
      
      // If we have good local results (3 or more), use them
      if (localResults.length >= 3) {
        console.log(`✅ Using local airport data for query: ${query}`);
        this.setCache(cacheKey, localResults);
        return localResults;
      }

      const { apiKey, apiHost } = this.getCredentials();

      // Check if API credentials are configured
      if (!apiKey || !apiHost) {
        console.warn('⚠️ AeroDataBox API credentials not configured. Using local data only.');
        return localResults; // Return whatever local results we have
      }

      // Check rate limit before making request
      const canMakeRequest = await this.checkRateLimit();
      if (!canMakeRequest) {
        console.log('⚠️ Rate limit reached. Using local airport data.');
        return localResults; // Return local results as fallback
      }

      const response = await axios.get(`${this.getBaseURL()}/airports/search/term`, {
        params: {
          q: query,
          limit: 50
        },
        headers: {
          'x-rapidapi-host': apiHost,
          'x-rapidapi-key': apiKey
        },
        timeout: 5000 // 5 second timeout
      });

      // Format the response to match our frontend structure
      const airports = response.data.items || [];
      const formattedResults = airports.map(airport => ({
        code: airport.iata || airport.icao,
        iata: airport.iata,
        icao: airport.icao,
        name: airport.name,
        city: airport.municipalityName || airport.location?.city,
        country: airport.countryCode,
        countryName: airport.countryName
      }));

      // Cache the results
      this.setCache(cacheKey, formattedResults);
      
      console.log(`✅ Found ${formattedResults.length} airports from API for query: ${query}`);
      return formattedResults;

    } catch (error) {
      // Handle rate limiting
      if (this.handleRateLimit(error)) {
        console.log('⚠️ Using local airport search as fallback');
        return this.searchLocalAirports(query);
      }

      console.error('Error searching airports:', error.message);
      
      // Always return local results as fallback
      const localResults = this.searchLocalAirports(query);
      console.log(`⚠️ API error. Returning ${localResults.length} local results for: ${query}`);
      return localResults;
    }
  }

  /**
   * Search local airport database (no API needed)
   */
  searchLocalAirports(query) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const airports = this.getAllAirports();

    return airports.filter(airport => {
      const code = (airport.code || '').toLowerCase();
      const iata = (airport.iata || '').toLowerCase();
      const icao = (airport.icao || '').toLowerCase();
      const name = (airport.name || '').toLowerCase();
      const city = (airport.city || '').toLowerCase();
      const country = (airport.country || '').toLowerCase();

      return code.includes(searchTerm) ||
             iata.includes(searchTerm) ||
             icao.includes(searchTerm) ||
             name.includes(searchTerm) ||
             city.includes(searchTerm) ||
             country.includes(searchTerm);
    }).slice(0, 50); // Limit to 50 results
  }

  /**
   * Get airport details by code (IATA or ICAO)
   * @param {string} code - Airport code (IATA or ICAO)
   * @returns {Promise<Object>} - Airport details
   */
  async getAirportByCode(code) {
    try {
      const cacheKey = `airport:${code.toUpperCase()}`;
      
      // Check cache first
      const cachedResult = this.getCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Try local data first
      const localAirport = this.getLocalAirportByCode(code);
      if (localAirport) {
        console.log(`✅ Using local data for airport: ${code}`);
        this.setCache(cacheKey, localAirport);
        return localAirport;
      }

      const { apiKey, apiHost } = this.getCredentials();

      // Check if API credentials are configured
      if (!apiKey || !apiHost) {
        console.warn('⚠️ AeroDataBox API credentials not configured');
        throw new Error('Airport not found in local database and API not configured');
      }

      // Check rate limit
      const canMakeRequest = await this.checkRateLimit();
      if (!canMakeRequest) {
        throw new Error('Rate limit reached and airport not found in local database');
      }

      // Try IATA first, then ICAO
      const codeType = code.length === 3 ? 'iata' : 'icao';
      
      const response = await axios.get(`${this.getBaseURL()}/airports/${codeType}/${code}`, {
        headers: {
          'x-rapidapi-host': apiHost,
          'x-rapidapi-key': apiKey
        },
        timeout: 5000
      });

      const airport = response.data;
      const formattedAirport = {
        code: airport.iata || airport.icao,
        iata: airport.iata,
        icao: airport.icao,
        name: airport.name,
        city: airport.municipalityName || airport.location?.city,
        country: airport.countryCode,
        countryName: airport.countryName,
        location: airport.location
      };

      // Cache the result
      this.setCache(cacheKey, formattedAirport);
      
      return formattedAirport;
    } catch (error) {
      if (this.handleRateLimit(error)) {
        // Try local data again
        const localAirport = this.getLocalAirportByCode(code);
        if (localAirport) {
          return localAirport;
        }
      }

      console.error(`Error fetching airport ${code}:`, error.message);
      throw new Error('Airport not found');
    }
  }

  /**
   * Get airport from local database by code
   */
  getLocalAirportByCode(code) {
    const airports = this.getAllAirports();
    const upperCode = code.toUpperCase();
    
    return airports.find(airport => 
      airport.code === upperCode || 
      airport.iata === upperCode || 
      airport.icao === upperCode
    );
  }

  /**
   * Get all airports from local database
   */
  getAllAirports() {
    return [
      // North America
      { code: 'JFK', iata: 'JFK', icao: 'KJFK', city: 'New York', country: 'US', countryName: 'United States', name: 'John F. Kennedy International Airport' },
      { code: 'LAX', iata: 'LAX', icao: 'KLAX', city: 'Los Angeles', country: 'US', countryName: 'United States', name: 'Los Angeles International Airport' },
      { code: 'ORD', iata: 'ORD', icao: 'KORD', city: 'Chicago', country: 'US', countryName: 'United States', name: "O'Hare International Airport" },
      { code: 'DFW', iata: 'DFW', icao: 'KDFW', city: 'Dallas', country: 'US', countryName: 'United States', name: 'Dallas/Fort Worth International Airport' },
      { code: 'ATL', iata: 'ATL', icao: 'KATL', city: 'Atlanta', country: 'US', countryName: 'United States', name: 'Hartsfield-Jackson Atlanta International Airport' },
      { code: 'MIA', iata: 'MIA', icao: 'KMIA', city: 'Miami', country: 'US', countryName: 'United States', name: 'Miami International Airport' },
      { code: 'SFO', iata: 'SFO', icao: 'KSFO', city: 'San Francisco', country: 'US', countryName: 'United States', name: 'San Francisco International Airport' },
      { code: 'BOS', iata: 'BOS', icao: 'KBOS', city: 'Boston', country: 'US', countryName: 'United States', name: 'Logan International Airport' },
      { code: 'SEA', iata: 'SEA', icao: 'KSEA', city: 'Seattle', country: 'US', countryName: 'United States', name: 'Seattle-Tacoma International Airport' },
      { code: 'IAD', iata: 'IAD', icao: 'KIAD', city: 'Washington', country: 'US', countryName: 'United States', name: 'Washington Dulles International Airport' },
      { code: 'DCA', iata: 'DCA', icao: 'KDCA', city: 'Washington', country: 'US', countryName: 'United States', name: 'Ronald Reagan Washington National Airport' },
      { code: 'LAS', iata: 'LAS', icao: 'KLAS', city: 'Las Vegas', country: 'US', countryName: 'United States', name: 'Harry Reid International Airport' },
      { code: 'MCO', iata: 'MCO', icao: 'KMCO', city: 'Orlando', country: 'US', countryName: 'United States', name: 'Orlando International Airport' },
      { code: 'DEN', iata: 'DEN', icao: 'KDEN', city: 'Denver', country: 'US', countryName: 'United States', name: 'Denver International Airport' },
      { code: 'PHX', iata: 'PHX', icao: 'KPHX', city: 'Phoenix', country: 'US', countryName: 'United States', name: 'Phoenix Sky Harbor International Airport' },
      { code: 'IAH', iata: 'IAH', icao: 'KIAH', city: 'Houston', country: 'US', countryName: 'United States', name: 'George Bush Intercontinental Airport' },
      { code: 'EWR', iata: 'EWR', icao: 'KEWR', city: 'Newark', country: 'US', countryName: 'United States', name: 'Newark Liberty International Airport' },
      { code: 'LGA', iata: 'LGA', icao: 'KLGA', city: 'New York', country: 'US', countryName: 'United States', name: 'LaGuardia Airport' },
      { code: 'CLT', iata: 'CLT', icao: 'KCLT', city: 'Charlotte', country: 'US', countryName: 'United States', name: 'Charlotte Douglas International Airport' },
      { code: 'MSP', iata: 'MSP', icao: 'KMSP', city: 'Minneapolis', country: 'US', countryName: 'United States', name: 'Minneapolis-St Paul International Airport' },
      { code: 'DTW', iata: 'DTW', icao: 'KDTW', city: 'Detroit', country: 'US', countryName: 'United States', name: 'Detroit Metropolitan Wayne County Airport' },
      { code: 'PDX', iata: 'PDX', icao: 'KPDX', city: 'Portland', country: 'US', countryName: 'United States', name: 'Portland International Airport' },
      { code: 'SAN', iata: 'SAN', icao: 'KSAN', city: 'San Diego', country: 'US', countryName: 'United States', name: 'San Diego International Airport' },
      { code: 'YYZ', iata: 'YYZ', icao: 'CYYZ', city: 'Toronto', country: 'CA', countryName: 'Canada', name: 'Toronto Pearson International Airport' },
      { code: 'YVR', iata: 'YVR', icao: 'CYVR', city: 'Vancouver', country: 'CA', countryName: 'Canada', name: 'Vancouver International Airport' },
      { code: 'YUL', iata: 'YUL', icao: 'CYUL', city: 'Montreal', country: 'CA', countryName: 'Canada', name: 'Montreal-Pierre Elliott Trudeau International Airport' },
      { code: 'MEX', iata: 'MEX', icao: 'MMMX', city: 'Mexico City', country: 'MX', countryName: 'Mexico', name: 'Mexico City International Airport' },

      // Europe
      { code: 'LHR', iata: 'LHR', icao: 'EGLL', city: 'London', country: 'GB', countryName: 'United Kingdom', name: 'London Heathrow Airport' },
      { code: 'LGW', iata: 'LGW', icao: 'EGKK', city: 'London', country: 'GB', countryName: 'United Kingdom', name: 'London Gatwick Airport' },
      { code: 'CDG', iata: 'CDG', icao: 'LFPG', city: 'Paris', country: 'FR', countryName: 'France', name: 'Charles de Gaulle Airport' },
      { code: 'ORY', iata: 'ORY', icao: 'LFPO', city: 'Paris', country: 'FR', countryName: 'France', name: 'Paris Orly Airport' },
      { code: 'FRA', iata: 'FRA', icao: 'EDDF', city: 'Frankfurt', country: 'DE', countryName: 'Germany', name: 'Frankfurt Airport' },
      { code: 'AMS', iata: 'AMS', icao: 'EHAM', city: 'Amsterdam', country: 'NL', countryName: 'Netherlands', name: 'Amsterdam Airport Schiphol' },
      { code: 'MAD', iata: 'MAD', icao: 'LEMD', city: 'Madrid', country: 'ES', countryName: 'Spain', name: 'Adolfo Suárez Madrid-Barajas Airport' },
      { code: 'BCN', iata: 'BCN', icao: 'LEBL', city: 'Barcelona', country: 'ES', countryName: 'Spain', name: 'Barcelona-El Prat Airport' },
      { code: 'FCO', iata: 'FCO', icao: 'LIRF', city: 'Rome', country: 'IT', countryName: 'Italy', name: 'Leonardo da Vinci-Fiumicino Airport' },
      { code: 'MXP', iata: 'MXP', icao: 'LIMC', city: 'Milan', country: 'IT', countryName: 'Italy', name: 'Milan Malpensa Airport' },
      { code: 'MUC', iata: 'MUC', icao: 'EDDM', city: 'Munich', country: 'DE', countryName: 'Germany', name: 'Munich Airport' },
      { code: 'ZRH', iata: 'ZRH', icao: 'LSZH', city: 'Zurich', country: 'CH', countryName: 'Switzerland', name: 'Zurich Airport' },
      { code: 'VIE', iata: 'VIE', icao: 'LOWW', city: 'Vienna', country: 'AT', countryName: 'Austria', name: 'Vienna International Airport' },
      { code: 'BRU', iata: 'BRU', icao: 'EBBR', city: 'Brussels', country: 'BE', countryName: 'Belgium', name: 'Brussels Airport' },
      { code: 'CPH', iata: 'CPH', icao: 'EKCH', city: 'Copenhagen', country: 'DK', countryName: 'Denmark', name: 'Copenhagen Airport' },
      { code: 'ARN', iata: 'ARN', icao: 'ESSA', city: 'Stockholm', country: 'SE', countryName: 'Sweden', name: 'Stockholm Arlanda Airport' },
      { code: 'OSL', iata: 'OSL', icao: 'ENGM', city: 'Oslo', country: 'NO', countryName: 'Norway', name: 'Oslo Airport' },
      { code: 'HEL', iata: 'HEL', icao: 'EFHK', city: 'Helsinki', country: 'FI', countryName: 'Finland', name: 'Helsinki-Vantaa Airport' },
      { code: 'DUB', iata: 'DUB', icao: 'EIDW', city: 'Dublin', country: 'IE', countryName: 'Ireland', name: 'Dublin Airport' },
      { code: 'LIS', iata: 'LIS', icao: 'LPPT', city: 'Lisbon', country: 'PT', countryName: 'Portugal', name: 'Lisbon Portela Airport' },
      { code: 'ATH', iata: 'ATH', icao: 'LGAV', city: 'Athens', country: 'GR', countryName: 'Greece', name: 'Athens International Airport' },
      { code: 'IST', iata: 'IST', icao: 'LTFM', city: 'Istanbul', country: 'TR', countryName: 'Turkey', name: 'Istanbul Airport' },
      { code: 'PRG', iata: 'PRG', icao: 'LKPR', city: 'Prague', country: 'CZ', countryName: 'Czech Republic', name: 'Václav Havel Airport Prague' },
      { code: 'WAW', iata: 'WAW', icao: 'EPWA', city: 'Warsaw', country: 'PL', countryName: 'Poland', name: 'Warsaw Chopin Airport' },

      // Asia
      { code: 'NRT', iata: 'NRT', icao: 'RJAA', city: 'Tokyo', country: 'JP', countryName: 'Japan', name: 'Narita International Airport' },
      { code: 'HND', iata: 'HND', icao: 'RJTT', city: 'Tokyo', country: 'JP', countryName: 'Japan', name: 'Tokyo Haneda Airport' },
      { code: 'ICN', iata: 'ICN', icao: 'RKSI', city: 'Seoul', country: 'KR', countryName: 'South Korea', name: 'Incheon International Airport' },
      { code: 'PVG', iata: 'PVG', icao: 'ZSPD', city: 'Shanghai', country: 'CN', countryName: 'China', name: 'Shanghai Pudong International Airport' },
      { code: 'PEK', iata: 'PEK', icao: 'ZBAA', city: 'Beijing', country: 'CN', countryName: 'China', name: 'Beijing Capital International Airport' },
      { code: 'HKG', iata: 'HKG', icao: 'VHHH', city: 'Hong Kong', country: 'HK', countryName: 'Hong Kong', name: 'Hong Kong International Airport' },
      { code: 'SIN', iata: 'SIN', icao: 'WSSS', city: 'Singapore', country: 'SG', countryName: 'Singapore', name: 'Singapore Changi Airport' },
      { code: 'BKK', iata: 'BKK', icao: 'VTBS', city: 'Bangkok', country: 'TH', countryName: 'Thailand', name: 'Suvarnabhumi Airport' },
      { code: 'KUL', iata: 'KUL', icao: 'WMKK', city: 'Kuala Lumpur', country: 'MY', countryName: 'Malaysia', name: 'Kuala Lumpur International Airport' },
      { code: 'MNL', iata: 'MNL', icao: 'RPLL', city: 'Manila', country: 'PH', countryName: 'Philippines', name: 'Ninoy Aquino International Airport' },
      { code: 'CGK', iata: 'CGK', icao: 'WIII', city: 'Jakarta', country: 'ID', countryName: 'Indonesia', name: 'Soekarno-Hatta International Airport' },
      { code: 'DEL', iata: 'DEL', icao: 'VIDP', city: 'Delhi', country: 'IN', countryName: 'India', name: 'Indira Gandhi International Airport' },
      { code: 'BOM', iata: 'BOM', icao: 'VABB', city: 'Mumbai', country: 'IN', countryName: 'India', name: 'Chhatrapati Shivaji Maharaj International Airport' },
      { code: 'BLR', iata: 'BLR', icao: 'VOBL', city: 'Bangalore', country: 'IN', countryName: 'India', name: 'Kempegowda International Airport' },
      { code: 'DXB', iata: 'DXB', icao: 'OMDB', city: 'Dubai', country: 'AE', countryName: 'United Arab Emirates', name: 'Dubai International Airport' },
      { code: 'AUH', iata: 'AUH', icao: 'OMAA', city: 'Abu Dhabi', country: 'AE', countryName: 'United Arab Emirates', name: 'Abu Dhabi International Airport' },
      { code: 'DOH', iata: 'DOH', icao: 'OTHH', city: 'Doha', country: 'QA', countryName: 'Qatar', name: 'Hamad International Airport' },
      { code: 'KWI', iata: 'KWI', icao: 'OKBK', city: 'Kuwait City', country: 'KW', countryName: 'Kuwait', name: 'Kuwait International Airport' },
      { code: 'BAH', iata: 'BAH', icao: 'OBBI', city: 'Manama', country: 'BH', countryName: 'Bahrain', name: 'Bahrain International Airport' },
      { code: 'TLV', iata: 'TLV', icao: 'LLBG', city: 'Tel Aviv', country: 'IL', countryName: 'Israel', name: 'Ben Gurion Airport' },
      { code: 'CMB', iata: 'CMB', icao: 'VCBI', city: 'Colombo', country: 'LK', countryName: 'Sri Lanka', name: 'Bandaranaike International Airport' },

      // Oceania
      { code: 'SYD', iata: 'SYD', icao: 'YSSY', city: 'Sydney', country: 'AU', countryName: 'Australia', name: 'Sydney Kingsford Smith Airport' },
      { code: 'MEL', iata: 'MEL', icao: 'YMML', city: 'Melbourne', country: 'AU', countryName: 'Australia', name: 'Melbourne Airport' },
      { code: 'BNE', iata: 'BNE', icao: 'YBBN', city: 'Brisbane', country: 'AU', countryName: 'Australia', name: 'Brisbane Airport' },
      { code: 'PER', iata: 'PER', icao: 'YPPH', city: 'Perth', country: 'AU', countryName: 'Australia', name: 'Perth Airport' },
      { code: 'AKL', iata: 'AKL', icao: 'NZAA', city: 'Auckland', country: 'NZ', countryName: 'New Zealand', name: 'Auckland Airport' },
      { code: 'CHC', iata: 'CHC', icao: 'NZCH', city: 'Christchurch', country: 'NZ', countryName: 'New Zealand', name: 'Christchurch International Airport' },

      // South America
      { code: 'GRU', iata: 'GRU', icao: 'SBGR', city: 'São Paulo', country: 'BR', countryName: 'Brazil', name: 'São Paulo/Guarulhos International Airport' },
      { code: 'GIG', iata: 'GIG', icao: 'SBGL', city: 'Rio de Janeiro', country: 'BR', countryName: 'Brazil', name: 'Rio de Janeiro/Galeão International Airport' },
      { code: 'EZE', iata: 'EZE', icao: 'SAEZ', city: 'Buenos Aires', country: 'AR', countryName: 'Argentina', name: 'Ministro Pistarini International Airport' },
      { code: 'SCL', iata: 'SCL', icao: 'SCEL', city: 'Santiago', country: 'CL', countryName: 'Chile', name: 'Arturo Merino Benítez International Airport' },
      { code: 'BOG', iata: 'BOG', icao: 'SKBO', city: 'Bogotá', country: 'CO', countryName: 'Colombia', name: 'El Dorado International Airport' },
      { code: 'LIM', iata: 'LIM', icao: 'SPJC', city: 'Lima', country: 'PE', countryName: 'Peru', name: 'Jorge Chávez International Airport' },

      // Africa
      { code: 'JNB', iata: 'JNB', icao: 'FAJS', city: 'Johannesburg', country: 'ZA', countryName: 'South Africa', name: 'OR Tambo International Airport' },
      { code: 'CPT', iata: 'CPT', icao: 'FACT', city: 'Cape Town', country: 'ZA', countryName: 'South Africa', name: 'Cape Town International Airport' },
      { code: 'CAI', iata: 'CAI', icao: 'HECA', city: 'Cairo', country: 'EG', countryName: 'Egypt', name: 'Cairo International Airport' },
      { code: 'NBO', iata: 'NBO', icao: 'HKJK', city: 'Nairobi', country: 'KE', countryName: 'Kenya', name: 'Jomo Kenyatta International Airport' },
      { code: 'ADD', iata: 'ADD', icao: 'HAAB', city: 'Addis Ababa', country: 'ET', countryName: 'Ethiopia', name: 'Addis Ababa Bole International Airport' }
    ];
  }

  /**
   * Get popular airports (cached list)
   * This is a fallback for offline mode or initial load
   */
  getPopularAirports() {
    return [
      { code: 'JFK', iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'US', countryName: 'United States' },
      { code: 'LAX', iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'US', countryName: 'United States' },
      { code: 'LHR', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'GB', countryName: 'United Kingdom' },
      { code: 'DXB', iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'AE', countryName: 'United Arab Emirates' },
      { code: 'HND', iata: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'JP', countryName: 'Japan' },
      { code: 'CDG', iata: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'FR', countryName: 'France' },
      { code: 'FRA', iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'DE', countryName: 'Germany' },
      { code: 'SIN', iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'SG', countryName: 'Singapore' },
      { code: 'AMS', iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'NL', countryName: 'Netherlands' },
      { code: 'ICN', iata: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'KR', countryName: 'South Korea' },
      { code: 'CMB', iata: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'LK', countryName: 'Sri Lanka' },
      { code: 'BOM', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'IN', countryName: 'India' },
      { code: 'DEL', iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'IN', countryName: 'India' },
      { code: 'SYD', iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'AU', countryName: 'Australia' },
      { code: 'MEL', iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'AU', countryName: 'Australia' }
    ];
  }
}

export default new AeroDataBoxService();
