import express from 'express';
import {
  searchFlights,
  getFlightById,
  getRecentSearches
} from '../controllers/flightController.js';
import { strictRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   GET /api/flights/search
 * @desc    Search for flights
 * @query   origin, destination, departureDate, returnDate (optional), adults, travelClass
 * @access  Public
 */
router.get('/search', strictRateLimiter, searchFlights);

/**
 * @route   GET /api/flights/recent
 * @desc    Get recent flight searches
 * @query   limit (optional)
 * @access  Public
 */
router.get('/recent', getRecentSearches);

/**
 * @route   GET /api/flights/:id
 * @desc    Get flight by ID
 * @access  Public
 */
router.get('/:id', getFlightById);

export default router;
