import aerodataboxService from '../services/aerodataboxService.js';

/**
 * Search for airports based on query
 */
export const searchAirports = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const airports = await aerodataboxService.searchAirports(query);

    res.status(200).json({
      success: true,
      data: airports,
      cached: airports.length > 0 // Indicate if results might be cached/local
    });
  } catch (error) {
    console.error('Error in searchAirports controller:', error);
    
    // Even on error, try to return local results
    try {
      const localResults = aerodataboxService.searchLocalAirports(req.query.query || '');
      if (localResults.length > 0) {
        return res.status(200).json({
          success: true,
          data: localResults,
          cached: true,
          warning: 'Using local airport database due to API limitations'
        });
      }
    } catch (fallbackError) {
      // Ignore fallback errors
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search airports',
      data: []
    });
  }
};

/**
 * Get airport details by code
 */
export const getAirportByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Airport code is required'
      });
    }

    const airport = await aerodataboxService.getAirportByCode(code);

    res.status(200).json({
      success: true,
      data: airport
    });
  } catch (error) {
    console.error('Error in getAirportByCode controller:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Airport not found'
    });
  }
};

/**
 * Get popular airports
 */
export const getPopularAirports = async (req, res) => {
  try {
    const airports = aerodataboxService.getPopularAirports();

    res.status(200).json({
      success: true,
      data: airports
    });
  } catch (error) {
    console.error('Error in getPopularAirports controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular airports'
    });
  }
};
