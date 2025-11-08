// API service for FlightPrint backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Search for flights
 */
export const searchFlights = async (searchParams) => {
  try {
    const { origin, destination, departureDate, returnDate, adults = 1, travelClass = 'ECONOMY' } = searchParams;

    // Build query string
    const params = new URLSearchParams({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      adults,
      travelClass
    });

    // Add return date if provided
    if (returnDate) {
      params.append('returnDate', returnDate);
    }

    const response = await fetch(`${API_BASE_URL}/flights/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search flights');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Only log in development to prevent memory leaks
    if (import.meta.env.DEV) {
      console.error('Flight search error:', error);
    }
    throw error;
  }
};

/**
 * Get flight by ID
 */
export const getFlightById = async (flightId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch flight details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Get flight error:', error);
    }
    throw error;
  }
};

/**
 * Get recent searches
 */
export const getRecentSearches = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent searches');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Get recent searches error:', error);
    }
    throw error;
  }
};

/**
 * Get popular routes
 */
export const getPopularRoutes = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/popular?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch popular routes');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get popular routes error:', error);
    throw error;
  }
};

/**
 * Get search statistics
 */
export const getSearchStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search statistics');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get search stats error:', error);
    throw error;
  }
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await fetch(`http://localhost:5000/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('API is not healthy');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Search airports by query (name or code)
 */
export const searchAirports = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const params = new URLSearchParams({ query });
    const response = await fetch(`${API_BASE_URL}/airports/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search airports');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Airport search error:', error);
    return []; // Return empty array on error
  }
};

/**
 * Get airport details by code
 */
export const getAirportByCode = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Airport not found');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get airport error:', error);
    throw error;
  }
};

/**
 * Get popular airports
 */
export const getPopularAirports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/popular`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch popular airports');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Get popular airports error:', error);
    return [];
  }
};
