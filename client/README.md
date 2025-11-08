# FlightPrint Frontend

**Tagline:** Fly Smart. Leave Less.

A sleek, eco-futuristic web app that helps users compare flight tickets based on price, duration, and **real carbon footprint data** from Amadeus API.

## 🚀 Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router v6
- **API Integration:** Amadeus Flight & Emissions API

## 🎨 Design Features

- **Eco Futurism Theme** - Blend of nature and technology
- **Color Palette:**
  - Deep Navy `#0B1B3F` (trust, sky)
  - Emerald Green `#00C896` (eco-energy)
  - Sky Blue Gradient `#1CA9F4 → #68E1FD`
  - Soft White `#F4F7F8` background

## 📦 Installation

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Create .env file (already created)
# VITE_API_URL=http://localhost:5000/api

# Run development server
npm run dev

# Build for production
npm run build
```

## ⚙️ Environment Variables

Create a `.env` file in the client folder:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🔌 API Integration

The frontend now connects to the **real Amadeus API** through the backend:

- **Real flight data** (prices, durations, airlines)
- **Real CO₂ emissions** per flight
- **Eco insights** (trees needed, car km equivalent, home energy)

### API Service (`src/services/api.js`)
- `searchFlights()` - Search for flights with real data
- `getFlightById()` - Get detailed flight information
- `getRecentSearches()` - View search history
- `getPopularRoutes()` - Popular flight routes
- `getSearchStats()` - Search analytics

## 🧩 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── SearchForm.jsx         # Updated to extract IATA codes
│   │   └── FlightCard.jsx         # Updated with eco insights
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── FlightResults.jsx      # 🆕 Now uses real API data
│   │   └── ImpactDashboard.jsx
│   ├── services/
│   │   └── api.js                 # 🆕 API service layer
│   ├── data/
│   │   └── mockData.js            # No longer used (kept for reference)
````
│   │   ├── LandingPage.jsx
│   │   ├── FlightResults.jsx
│   │   └── ImpactDashboard.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## ✨ Key Features

### 1. Landing Page
- Hero section with eco-friendly messaging
- Flight search form (From, To, Dates, Passengers)
- Impact statistics display
- Feature highlights

### 2. Flight Results
- Flight comparison cards with:
  - Price, duration, and airline info
  - CO₂ emissions with color-coded badges
  - Impact insights (trees, car km equivalents)
- Sort by price, duration, or emissions
- Smooth animations and hover effects

### 3. Impact Dashboard
- Total CO₂ emissions visualization
- Bar and pie charts for route analysis
- Equivalent metrics (trees, car km, home energy)
- Eco badges gamification
- Environmental tips

## 🎯 Next Steps (Backend Integration)

When ready to integrate with real data:

1. Replace `mockData.js` with API calls
2. Integrate Amadeus API for flight data
3. Add user authentication
4. Implement flight booking functionality
5. Add carbon offset payment integration

## 🌿 Environmental Impact

FlightPrint encourages eco-friendly travel by:
- Visualizing carbon footprints in relatable terms
- Highlighting low-emission flight options
- Educating users about environmental impact
- Gamifying sustainable choices

## 📱 Responsive Design

Fully responsive for:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🎨 UI/UX Principles

- **Minimalistic** - Clean lines, large air spacing
- **Floating Cards** - Elevated design elements
- **Smooth Transitions** - Framer Motion animations
- **Accessible** - High contrast, clear typography
- **Aspirational** - Tesla-like innovation meets Ecosia's eco-tone

---

Built with 💚 for sustainable travelers
