import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Search, Plane, Plus, Minus } from 'lucide-react';
import { searchAirports, getPopularAirports } from '../services/api';
import CustomCalendar from './CustomCalendar';

const SearchForm = memo(({ onSearch }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
  });

  // Autocomplete states
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [selectedFromIndex, setSelectedFromIndex] = useState(-1);
  const [selectedToIndex, setSelectedToIndex] = useState(-1);
  const [isLoadingFrom, setIsLoadingFrom] = useState(false);
  const [isLoadingTo, setIsLoadingTo] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  const fromDebounceTimer = useRef(null);
  const toDebounceTimer = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target) && 
          !fromInputRef.current.contains(event.target)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target) && 
          !toInputRef.current.contains(event.target)) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Cleanup debounce timers
      if (fromDebounceTimer.current) clearTimeout(fromDebounceTimer.current);
      if (toDebounceTimer.current) clearTimeout(toDebounceTimer.current);
    };
  }, []);

  // Extract IATA code from input (e.g., "New York (JFK)" -> "JFK")
  const extractIATACode = (input) => {
    if (!input) return '';
    
    // Remove extra spaces
    input = input.trim();
    
    // Check if there's a code in parentheses
    const match = input.match(/\(([A-Z]{3})\)/);
    if (match) return match[1];
    
    // If input is already 3 letters, return uppercase
    if (input.length === 3 && /^[A-Za-z]+$/.test(input)) {
      return input.toUpperCase();
    }
    
    // Common city to IATA code mappings
    const cityToIATA = {
      'new york': 'JFK',
      'nyc': 'JFK',
      'london': 'LHR',
      'paris': 'CDG',
      'tokyo': 'NRT',
      'los angeles': 'LAX',
      'la': 'LAX',
      'chicago': 'ORD',
      'dubai': 'DXB',
      'singapore': 'SIN',
      'sydney': 'SYD',
      'toronto': 'YYZ',
      'san francisco': 'SFO',
      'miami': 'MIA',
      'boston': 'BOS',
      'seattle': 'SEA',
      'atlanta': 'ATL',
      'dallas': 'DFW',
      'houston': 'IAH',
      'washington': 'IAD',
      'dc': 'IAD',
      'las vegas': 'LAS',
      'vegas': 'LAS',
      'orlando': 'MCO',
      'denver': 'DEN',
      'phoenix': 'PHX',
      'bangkok': 'BKK',
      'hong kong': 'HKG',
      'mumbai': 'BOM',
      'delhi': 'DEL',
      'istanbul': 'IST',
      'rome': 'FCO',
      'barcelona': 'BCN',
      'madrid': 'MAD',
      'amsterdam': 'AMS',
      'frankfurt': 'FRA',
      'zurich': 'ZRH',
      'vienna': 'VIE',
      'moscow': 'SVO',
      'beijing': 'PEK',
      'shanghai': 'PVG',
      'seoul': 'ICN',
      'manila': 'MNL',
      'jakarta': 'CGK',
      'kuala lumpur': 'KUL',
      'mexico city': 'MEX',
      'sao paulo': 'GRU',
      'rio': 'GIG',
      'buenos aires': 'EZE',
      'johannesburg': 'JNB',
      'cairo': 'CAI',
      'doha': 'DOH',
      'abu dhabi': 'AUH',
      'melbourne': 'MEL',
      'auckland': 'AKL'
    };
    
    const lowerInput = input.toLowerCase();
    return cityToIATA[lowerInput] || input.toUpperCase().substring(0, 3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.from && formData.to && formData.departDate) {
      const searchData = {
        ...formData,
        from: extractIATACode(formData.from),
        to: extractIATACode(formData.to)
      };
      onSearch(searchData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle date changes with validation
    if (name === 'departDate') {
      const newFormData = {
        ...formData,
        [name]: value,
      };
      
      // If return date exists and is before the new depart date, clear it
      if (formData.returnDate && value && new Date(formData.returnDate) <= new Date(value)) {
        newFormData.returnDate = '';
      }
      
      setFormData(newFormData);
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Handle autocomplete for airport fields with debouncing
    if (name === 'from') {
      // Clear previous timer
      if (fromDebounceTimer.current) {
        clearTimeout(fromDebounceTimer.current);
      }

      if (value.length >= 2) {
        setIsLoadingFrom(true);
        // Debounce API call by 300ms
        fromDebounceTimer.current = setTimeout(async () => {
          try {
            const suggestions = await searchAirports(value);
            setFromSuggestions(suggestions);
            setShowFromDropdown(suggestions.length > 0);
          } catch (error) {
            // Only log in development to prevent memory leaks
            if (import.meta.env.DEV) {
              console.error('Error fetching airport suggestions:', error);
            }
            setFromSuggestions([]);
          } finally {
            setIsLoadingFrom(false);
          }
        }, 300);
      } else {
        setFromSuggestions([]);
        setShowFromDropdown(false);
        setIsLoadingFrom(false);
      }
      setSelectedFromIndex(-1);
    } else if (name === 'to') {
      // Clear previous timer
      if (toDebounceTimer.current) {
        clearTimeout(toDebounceTimer.current);
      }

      if (value.length >= 2) {
        setIsLoadingTo(true);
        // Debounce API call by 300ms
        toDebounceTimer.current = setTimeout(async () => {
          try {
            const suggestions = await searchAirports(value);
            setToSuggestions(suggestions);
            setShowToDropdown(suggestions.length > 0);
          } catch (error) {
            // Only log in development to prevent memory leaks
            if (import.meta.env.DEV) {
              console.error('Error fetching airport suggestions:', error);
            }
            setToSuggestions([]);
          } finally {
            setIsLoadingTo(false);
          }
        }, 300);
      } else {
        setToSuggestions([]);
        setShowToDropdown(false);
        setIsLoadingTo(false);
      }
      setSelectedToIndex(-1);
    }
  };

  const handleAirportSelect = (airport, field) => {
    const displayValue = `${airport.city} (${airport.code})`;
    setFormData({
      ...formData,
      [field]: displayValue,
    });

    if (field === 'from') {
      setShowFromDropdown(false);
      setFromSuggestions([]);
    } else {
      setShowToDropdown(false);
      setToSuggestions([]);
    }
  };

  const handleDateChange = (field, value) => {
    if (field === 'departDate') {
      const newFormData = {
        ...formData,
        departDate: value,
      };
      
      // If return date exists and is before or equal to the new depart date, clear it
      if (formData.returnDate && value && new Date(formData.returnDate) <= new Date(value)) {
        newFormData.returnDate = '';
      }
      
      setFormData(newFormData);
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleKeyDown = (e, field) => {
    const suggestions = field === 'from' ? fromSuggestions : toSuggestions;
    const selectedIndex = field === 'from' ? selectedFromIndex : selectedToIndex;
    const setSelectedIndex = field === 'from' ? setSelectedFromIndex : setSelectedToIndex;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleAirportSelect(suggestions[selectedIndex], field);
    } else if (e.key === 'Escape') {
      if (field === 'from') {
        setShowFromDropdown(false);
      } else {
        setShowToDropdown(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-5 md:p-6 max-w-5xl mx-auto border border-white/20"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          {/* From */}
          <motion.div 
            className="relative group"
            whileFocus={{ scale: 1.02 }}
          >
            <label className="block text-xs font-semibold text-white mb-1.5 flex items-center space-x-2">
              <span>From</span>
              <span className="text-emerald text-xs">✈</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald/70 group-focus-within:text-emerald transition-colors z-10" />
              <input
                ref={fromInputRef}
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'from')}
                onFocus={() => {
                  if (formData.from.length > 0 && fromSuggestions.length > 0) {
                    setShowFromDropdown(true);
                  }
                }}
                placeholder="New York, JFK, or NYC"
                className="w-full pl-10 pr-3 py-2.5 bg-white/90 backdrop-blur-xl border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-emerald focus:border-emerald focus:bg-white transition-all outline-none text-navy font-medium placeholder:text-gray-400 text-sm"
                required
                autoComplete="off"
              />
              
              {/* Dropdown */}
              <AnimatePresence>
                {(showFromDropdown || isLoadingFrom) && (
                  <motion.div
                    ref={fromDropdownRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto"
                  >
                    {isLoadingFrom ? (
                      <div className="px-4 py-3 text-center text-gray-500 text-sm">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-emerald"></div>
                        <span className="ml-2">Searching airports...</span>
                      </div>
                    ) : fromSuggestions.length > 0 ? (
                      fromSuggestions.map((airport, index) => (
                        <motion.div
                          key={`${airport.code}-${index}`}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            index === selectedFromIndex
                              ? 'bg-emerald/10 border-l-4 border-emerald'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleAirportSelect(airport, 'from')}
                          onMouseEnter={() => setSelectedFromIndex(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-navy text-sm">
                                {airport.city || airport.countryName}, {airport.country}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {airport.name}
                              </div>
                            </div>
                            <div className="text-emerald font-bold text-sm ml-2">
                              {airport.code || airport.iata}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500 text-sm">
                        No airports found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* To */}
          <motion.div 
            className="relative group"
            whileFocus={{ scale: 1.02 }}
          >
            <label className="block text-xs font-semibold text-white mb-1.5 flex items-center space-x-2">
              <span>To</span>
              <span className="text-sky text-xs">🌍</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sky/70 group-focus-within:text-sky transition-colors z-10" />
              <input
                ref={toInputRef}
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'to')}
                onFocus={() => {
                  if (formData.to.length > 0 && toSuggestions.length > 0) {
                    setShowToDropdown(true);
                  }
                }}
                placeholder="London, LHR, or Paris"
                className="w-full pl-10 pr-3 py-2.5 bg-white/90 backdrop-blur-xl border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-sky focus:border-sky focus:bg-white transition-all outline-none text-navy font-medium placeholder:text-gray-400 text-sm"
                required
                autoComplete="off"
              />
              
              {/* Dropdown */}
              <AnimatePresence>
                {(showToDropdown || isLoadingTo) && (
                  <motion.div
                    ref={toDropdownRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto"
                  >
                    {isLoadingTo ? (
                      <div className="px-4 py-3 text-center text-gray-500 text-sm">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-sky"></div>
                        <span className="ml-2">Searching airports...</span>
                      </div>
                    ) : toSuggestions.length > 0 ? (
                      toSuggestions.map((airport, index) => (
                        <motion.div
                          key={`${airport.code}-${index}`}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            index === selectedToIndex
                              ? 'bg-sky/10 border-l-4 border-sky'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleAirportSelect(airport, 'to')}
                          onMouseEnter={() => setSelectedToIndex(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-navy text-sm">
                                {airport.city || airport.countryName}, {airport.country}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {airport.name}
                              </div>
                            </div>
                            <div className="text-sky font-bold text-sm ml-2">
                              {airport.code || airport.iata}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500 text-sm">
                        No airports found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Depart Date */}
          <CustomCalendar
            value={formData.departDate}
            onChange={(value) => handleDateChange('departDate', value)}
            minDate={new Date().toISOString().split('T')[0]}
            label="Departure"
            icon={Calendar}
            accentColor="emerald"
            placeholder="Select departure date"
          />

          {/* Return Date */}
          <CustomCalendar
            value={formData.returnDate}
            onChange={(value) => handleDateChange('returnDate', value)}
            minDate={
              formData.departDate 
                ? new Date(new Date(formData.departDate).getTime() + 86400000).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
            }
            label="Return (Optional)"
            icon={Calendar}
            accentColor="sky"
            placeholder="Select return date"
          />
        </div>

        {/* Passengers */}
        <motion.div 
          className="relative max-w-xs group"
        >
          <label className="block text-xs font-semibold text-white mb-1.5 flex items-center space-x-2">
            <span>Passengers</span>
            <span className="text-emerald text-xs">👥</span>
          </label>
          <div className="flex items-center bg-white/90 backdrop-blur-xl border-2 border-white/30 rounded-xl overflow-hidden">
            <Users className="ml-3 w-4 h-4 text-emerald/70 transition-colors" />
            
            {/* Decrement Button */}
            <motion.button
              type="button"
              onClick={() => {
                if (formData.passengers > 1) {
                  setFormData({ ...formData, passengers: formData.passengers - 1 });
                }
              }}
              disabled={formData.passengers <= 1}
              whileHover={{ scale: formData.passengers > 1 ? 1.1 : 1 }}
              whileTap={{ scale: formData.passengers > 1 ? 0.95 : 1 }}
              className={`ml-auto p-2 transition-all ${
                formData.passengers > 1
                  ? 'text-emerald hover:bg-emerald/10 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <Minus className="w-4 h-4" />
            </motion.button>

            {/* Passenger Count Display */}
            <div className="px-4 py-2.5 min-w-[120px] text-center">
              <span className="text-navy font-bold text-sm">
                {formData.passengers} {formData.passengers === 1 ? 'Passenger' : 'Passengers'}
              </span>
            </div>

            {/* Increment Button */}
            <motion.button
              type="button"
              onClick={() => {
                if (formData.passengers < 9) {
                  setFormData({ ...formData, passengers: formData.passengers + 1 });
                }
              }}
              disabled={formData.passengers >= 9}
              whileHover={{ scale: formData.passengers < 9 ? 1.1 : 1 }}
              whileTap={{ scale: formData.passengers < 9 ? 0.95 : 1 }}
              className={`mr-auto p-2 transition-all ${
                formData.passengers < 9
                  ? 'text-emerald hover:bg-emerald/10 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ 
            scale: 1.03,
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)',
          }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="relative w-full bg-gradient-to-r from-emerald via-emerald-dark to-emerald text-white py-3 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] transition-all overflow-hidden group"
        >
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          
          <Search className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Discover Your Flight's Footprint</span>
          <Plane className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </form>

      <motion.p 
        className="text-center text-[10px] text-white/70 mt-3 font-light"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ✨ Compare flights and see their real environmental impact
      </motion.p>
    </motion.div>
  );
});

SearchForm.displayName = 'SearchForm';

export default SearchForm;
