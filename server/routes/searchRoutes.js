import express from 'express';
import {
  getAllSearches,
  getPopularRoutes,
  getSearchStats,
  cleanupOldSearches
} from '../controllers/searchController.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Get all searches with pagination
 * @query   page, limit
 * @access  Public
 */
router.get('/', getAllSearches);

/**
 * @route   GET /api/search/popular
 * @desc    Get popular routes
 * @query   limit (optional)
 * @access  Public
 */
router.get('/popular', getPopularRoutes);

/**
 * @route   GET /api/search/stats
 * @desc    Get search statistics
 * @access  Public
 */
router.get('/stats', getSearchStats);

/**
 * @route   DELETE /api/search/cleanup
 * @desc    Delete old searches
 * @query   days (optional, default 30)
 * @access  Public (should be protected in production)
 */
router.delete('/cleanup', cleanupOldSearches);

export default router;
