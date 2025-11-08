import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
  departure: {
    iataCode: String,
    terminal: String,
    at: Date
  },
  arrival: {
    iataCode: String,
    terminal: String,
    at: Date
  },
  carrierCode: String,
  carrierName: String,
  flightNumber: String,
  aircraft: String,
  duration: String,
  numberOfStops: {
    type: Number,
    default: 0
  }
});

const itinerarySchema = new mongoose.Schema({
  duration: String,
  segments: [segmentSchema]
});

const flightSchema = new mongoose.Schema({
  // Flight identification
  flightOfferId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Search criteria
  origin: {
    type: String,
    required: true,
    uppercase: true
  },
  destination: {
    type: String,
    required: true,
    uppercase: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  
  // Flight details
  itineraries: [itinerarySchema],
  
  // Pricing
  price: {
    currency: {
      type: String,
      default: 'USD'
    },
    total: {
      type: Number,
      required: true
    },
    base: Number,
    fees: Number,
    grandTotal: Number
  },
  
  // Travel class
  travelClass: {
    type: String,
    enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
    default: 'ECONOMY'
  },
  
  // Number of stops
  stops: {
    type: Number,
    default: 0
  },
  
  // Airlines involved
  airlines: [{
    code: String,
    name: String
  }],
  
  // Carbon emissions
  carbonEmissions: {
    weight: {
      type: Number,
      required: true
    },
    weightUnit: {
      type: String,
      default: 'KG'
    },
    cabin: String
  },
  
  // Eco insights
  ecoInsights: {
    treesNeeded: Number,
    carKmEquivalent: Number,
    homeEnergyDays: Number
  },
  
  // Metadata
  validatingAirlineCodes: [String],
  numberOfBookableSeats: Number,
  
  // Timestamps
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24*60*60*1000) // 24 hours from now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
flightSchema.index({ origin: 1, destination: 1, departureDate: 1 });
flightSchema.index({ 'price.total': 1 });
flightSchema.index({ 'carbonEmissions.weight': 1 });
flightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Calculate eco insights before saving
flightSchema.pre('save', function(next) {
  if (this.carbonEmissions && this.carbonEmissions.weight) {
    const co2Kg = this.carbonEmissions.weight;
    
    // Average tree absorbs ~21 kg CO2 per year
    this.ecoInsights = {
      treesNeeded: Math.ceil(co2Kg / 21),
      // Average car emits ~0.12 kg CO2 per km
      carKmEquivalent: Math.round(co2Kg / 0.12),
      // Average home uses ~30 kg CO2 per day
      homeEnergyDays: Math.round((co2Kg / 30) * 10) / 10
    };
  }
  next();
});

const Flight = mongoose.model('Flight', flightSchema);

export default Flight;
