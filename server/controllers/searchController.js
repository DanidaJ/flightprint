import Search from '../models/Search.js';

/**
 * Get all searches with pagination
 */
export const getAllSearches = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const searches = await Search.find()
      .sort({ searchedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Search.countDocuments();

    res.status(200).json({
      status: 'success',
      results: searches.length,
      data: {
        searches,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get popular routes (most searched)
 */
export const getPopularRoutes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const popularRoutes = await Search.aggregate([
      {
        $group: {
          _id: {
            origin: '$origin',
            destination: '$destination'
          },
          count: { $sum: 1 },
          lastSearched: { $max: '$searchedAt' },
          avgAdults: { $avg: '$adults' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          origin: '$_id.origin',
          destination: '$_id.destination',
          searchCount: '$count',
          lastSearched: 1,
          avgAdults: { $round: ['$avgAdults', 1] }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      results: popularRoutes.length,
      data: { popularRoutes }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get search statistics
 */
export const getSearchStats = async (req, res, next) => {
  try {
    const stats = await Search.aggregate([
      {
        $facet: {
          totalSearches: [
            { $count: 'count' }
          ],
          tripTypeDistribution: [
            {
              $group: {
                _id: '$tripType',
                count: { $sum: 1 }
              }
            }
          ],
          classDistribution: [
            {
              $group: {
                _id: '$travelClass',
                count: { $sum: 1 }
              }
            }
          ],
          avgAdults: [
            {
              $group: {
                _id: null,
                avg: { $avg: '$adults' }
              }
            }
          ],
          recentSearches: [
            { $sort: { searchedAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                origin: 1,
                destination: 1,
                departureDate: 1,
                tripType: 1,
                searchedAt: 1
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalSearches: stats[0].totalSearches[0]?.count || 0,
        tripTypeDistribution: stats[0].tripTypeDistribution,
        classDistribution: stats[0].classDistribution,
        avgAdults: stats[0].avgAdults[0]?.avg || 0,
        recentSearches: stats[0].recentSearches
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete old searches (cleanup)
 */
export const cleanupOldSearches = async (req, res, next) => {
  try {
    const daysOld = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Search.deleteMany({
      searchedAt: { $lt: cutoffDate }
    });

    res.status(200).json({
      status: 'success',
      message: `Deleted ${result.deletedCount} old searches`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    next(error);
  }
};
