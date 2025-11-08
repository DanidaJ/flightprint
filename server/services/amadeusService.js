import axios from 'axios';

class AmadeusService {
  constructor() {
    this.clientId = null;
    this.clientSecret = null;
    this.baseURL = null;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.initialized = false;
  }

  /**
   * Initialize the service with environment variables
   */
  initialize() {
    if (this.initialized) return;
    
    this.clientId = process.env.AMADEUS_CLIENT_ID;
    this.clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    this.baseURL = process.env.AMADEUS_API_BASE_URL || 'https://test.api.amadeus.com';
    this.initialized = true;
    
    // Debug: Check if credentials are loaded
    if (!this.clientId || !this.clientSecret) {
      console.error('❌ Amadeus credentials not found in environment variables');
      console.error('CLIENT_ID:', this.clientId ? 'Set' : 'Missing');
      console.error('CLIENT_SECRET:', this.clientSecret ? 'Set' : 'Missing');
    } else {
      console.log('✅ Amadeus credentials loaded successfully');
    }
  }

  /**
   * Get access token from Amadeus API
   */
  async getAccessToken() {
    // Initialize if not already done
    if (!this.initialized) {
      this.initialize();
    }

    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);
      
      console.log('✅ Amadeus access token obtained');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Amadeus access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  /**
   * Search for flight offers
   */
  async searchFlights(searchParams) {
    try {
      const token = await this.getAccessToken();

      const params = {
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.adults || 1,
        travelClass: searchParams.travelClass || 'ECONOMY',
        currencyCode: 'USD',
        max: searchParams.max || 250,  // Increased from 50 to 250 to get more options
        nonStop: false,  // Explicitly allow connections
        maxPrice: searchParams.maxPrice || undefined
      };

      // Add return date if it's a return trip
      if (searchParams.returnDate) {
        params.returnDate = searchParams.returnDate;
      }

      const response = await axios.get(
        `${this.baseURL}/v2/shopping/flight-offers`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params
        }
      );

      console.log(`✅ Found ${response.data.data?.length || 0} flight offers from Amadeus API`);
      return response.data;
    } catch (error) {
      console.error('❌ Amadeus flight search error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get flight CO2 emissions
   */
  async getFlightEmissions(flightOffer) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseURL}/v1/travel/predictions/flight-emissions`,
        [flightOffer],
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Amadeus emissions API error:', error.response?.data || error.message);
      // Return null if emissions API fails - we'll calculate manually
      return null;
    }
  }

  /**
   * Estimate CO2 emissions manually based on distance and class
   */
  estimateEmissions(distance, travelClass, stops) {
    // Average emissions in kg CO2 per passenger per km
    const emissionFactors = {
      'ECONOMY': 0.09,
      'PREMIUM_ECONOMY': 0.13,
      'BUSINESS': 0.20,
      'FIRST': 0.27
    };

    const factor = emissionFactors[travelClass] || emissionFactors['ECONOMY'];
    
    // Add 20% for each stop (takeoff and landing are most fuel-intensive)
    const stopMultiplier = 1 + (stops * 0.20);
    
    return Math.round(distance * factor * stopMultiplier);
  }

  /**
   * Calculate distance between two airports (rough estimate using haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get airport information
   */
  async getAirportInfo(iataCode) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/v1/reference-data/locations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            keyword: iataCode,
            subType: 'AIRPORT'
          }
        }
      );

      return response.data.data?.[0] || null;
    } catch (error) {
      console.error('❌ Airport info error:', error.response?.data || error.message);
      return null;
    }
  }
}

export default new AmadeusService();
