# FlightPrint Backend API

Backend server for FlightPrint - An eco-friendly flight comparison application.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Amadeus API** - Flight data and carbon emissions
- **Redis-ready** - Caching infrastructure prepared (not implemented yet)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Amadeus API credentials ([Get them here](https://developers.amadeus.com/))

## 🔧 Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
CLIENT_URL=http://localhost:5173
```

## 🏃‍♂️ Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📡 API Endpoints

### Flights

#### Search Flights
```
GET /api/flights/search
```

**Query Parameters:**
- `origin` (required) - Origin airport IATA code (e.g., JFK)
- `destination` (required) - Destination airport IATA code (e.g., LAX)
- `departureDate` (required) - Departure date (YYYY-MM-DD)
- `returnDate` (optional) - Return date for round trips (YYYY-MM-DD)
- `adults` (optional) - Number of adults (default: 1)
- `travelClass` (optional) - ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST

**Example:**
```
GET /api/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20&adults=1&travelClass=ECONOMY
```

#### Get Flight by ID
```
GET /api/flights/:id
```

#### Get Recent Searches
```
GET /api/flights/recent?limit=10
```

### Search Analytics

#### Get All Searches
```
GET /api/search?page=1&limit=20
```

#### Get Popular Routes
```
GET /api/search/popular?limit=10
```

#### Get Search Statistics
```
GET /api/search/stats
```

#### Cleanup Old Searches
```
DELETE /api/search/cleanup?days=30
```

### Health Check
```
GET /health
```

## 📊 Data Models

### Flight Model
- Flight offer details
- Itineraries and segments
- Pricing information
- Carbon emissions
- Eco insights (trees, car km, home energy)

### Search Model
- Search parameters
- Trip type (oneway/return)
- Travel class
- Timestamps

## 🌍 Amadeus API Integration

The backend integrates with Amadeus API for:
- Real-time flight search
- Pricing data
- Carbon emission calculations
- Airport information

### Getting Amadeus API Credentials

1. Visit [Amadeus for Developers](https://developers.amadeus.com/)
2. Create an account
3. Create a new app
4. Get your API Key (Client ID) and API Secret (Client Secret)
5. Use **Test environment** for development

## 🔒 Security Features

- Helmet.js for HTTP headers security
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Strict rate limiting for flight searches (30 per 15 minutes)
- Input validation
- Error handling middleware

## 🗄️ Database Schema

### Flights Collection
- Stores flight offers with carbon footprint
- TTL index: Expires after 24 hours
- Indexes on: origin, destination, departureDate, price, emissions

### Searches Collection
- Tracks all user searches
- Indexes on: route, date, timestamp

## 🚦 Rate Limiting

- General API: 100 requests per 15 minutes
- Flight Search: 30 requests per 15 minutes (to protect Amadeus API quota)

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| NODE_ENV | Environment (development/production) | No |
| MONGO_URI | MongoDB connection string | Yes |
| AMADEUS_CLIENT_ID | Amadeus API Client ID | Yes |
| AMADEUS_CLIENT_SECRET | Amadeus API Client Secret | Yes |
| AMADEUS_API_BASE_URL | Amadeus API base URL | No (default: test API) |
| CLIENT_URL | Frontend URL for CORS | No (default: localhost:5173) |

## 🔮 Future Enhancements

- [ ] Redis caching for flight searches
- [ ] User authentication and saved searches
- [ ] Price alerts
- [ ] Flight booking integration
- [ ] Advanced carbon offset calculations
- [ ] Multi-city flight support
- [ ] Flight price prediction

## 🐛 Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // For validation errors
}
```

## 📄 License

ISC

## 👨‍💻 Author

FlightPrint Team

---

**Note:** This is a development server. For production deployment, ensure proper environment configuration, security measures, and monitoring.
