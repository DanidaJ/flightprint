import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: [true, 'Origin is required'],
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 3
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 3
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required']
  },
  returnDate: {
    type: Date,
    default: null
  },
  tripType: {
    type: String,
    enum: ['oneway', 'return'],
    default: 'oneway'
  },
  adults: {
    type: Number,
    default: 1,
    min: 1,
    max: 9
  },
  travelClass: {
    type: String,
    enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
    default: 'ECONOMY'
  },
  searchedAt: {
    type: Date,
    default: Date.now
  },
  resultCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
searchSchema.index({ origin: 1, destination: 1, departureDate: 1 });
searchSchema.index({ searchedAt: -1 });

// Method to check if search is valid (departure date is in the future)
searchSchema.methods.isValidSearch = function() {
  return this.departureDate > new Date();
};

const Search = mongoose.model('Search', searchSchema);

export default Search;
