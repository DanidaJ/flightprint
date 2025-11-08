import express from 'express';
import { searchAirports, getAirportByCode, getPopularAirports } from '../controllers/airportController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to airport routes
router.use(rateLimiter);

// Search airports by query (name or code)
router.get('/search', searchAirports);

// Get popular airports
router.get('/popular', getPopularAirports);

// Get airport details by code
router.get('/:code', getAirportByCode);

export default router;
