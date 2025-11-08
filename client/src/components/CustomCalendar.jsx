import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CustomCalendar = ({ 
  value, 
  onChange, 
  minDate, 
  label, 
  icon: Icon = CalendarIcon,
  accentColor = 'emerald',
  placeholder = 'Select date'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  const accentColors = {
    emerald: {
      text: 'text-emerald',
      bg: 'bg-emerald',
      hover: 'hover:bg-emerald/10',
      border: 'border-emerald',
      ring: 'ring-emerald',
      shadow: 'shadow-emerald/50',
      focus: 'focus:ring-emerald focus:border-emerald'
    },
    sky: {
      text: 'text-sky',
      bg: 'bg-sky',
      hover: 'hover:bg-sky/10',
      border: 'border-sky',
      ring: 'ring-sky',
      shadow: 'shadow-sky/50',
      focus: 'focus:ring-sky focus:border-sky'
    }
  };

  const colors = accentColors[accentColor] || accentColors.emerald;

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize current month based on value or minDate
  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value));
    } else if (minDate) {
      setCurrentMonth(new Date(minDate));
    }
  }, [value, minDate]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateDisabled = (date) => {
    if (!minDate) return false;
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < min;
  };

  const isDateSelected = (date) => {
    if (!value) return false;
    const selected = new Date(value);
    selected.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return selected.getTime() === checkDate.getTime();
  };

  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return today.getTime() === checkDate.getTime();
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(selectedDate)) {
      onChange(formatDateForInput(selectedDate));
      setIsOpen(false);
    }
  };

  const changeMonth = (increment) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div ref={calendarRef} className="relative group">
      <label className="block text-xs font-semibold text-white mb-1.5 flex items-center space-x-2">
        <span>{label}</span>
        <span className={`${colors.text} text-xs`}>📅</span>
      </label>
      
      <div className="relative">
        <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${colors.text}/70 group-focus-within:${colors.text} transition-colors z-10`} />
        <input
          type="text"
          value={formatDate(value)}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder={placeholder}
          className={`w-full pl-10 pr-3 py-2.5 bg-white/90 backdrop-blur-xl border-2 border-white/30 rounded-xl focus:ring-2 ${colors.focus} focus:bg-white transition-all outline-none text-navy font-medium placeholder:text-gray-400 text-sm cursor-pointer`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 bottom-full mb-2 bg-gradient-to-br from-[#0a192f] via-[#0f2847] to-[#0a192f] backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 overflow-hidden w-60"
          >
            {/* Header */}
            <div className={`${colors.bg} px-2 py-1 flex items-center justify-between`}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => changeMonth(-1)}
                className="p-0.5 hover:bg-white/20 rounded transition-colors"
              >
                <ChevronLeft className="w-3 h-3 text-white" />
              </motion.button>
              
              <div className="text-white font-bold text-[11px]">
                {monthNames[month]} {year}
              </div>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => changeMonth(1)}
                className="p-0.5 hover:bg-white/20 rounded transition-colors"
              >
                <ChevronRight className="w-3 h-3 text-white" />
              </motion.button>
            </div>

            {/* Calendar Grid */}
            <div className="p-1.5">
              {/* Day names */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[9px] font-semibold text-white/60">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const date = new Date(year, month, day);
                  const disabled = isDateDisabled(date);
                  const selected = isDateSelected(date);
                  const today = isToday(date);

                  return (
                    <motion.button
                      key={day}
                      type="button"
                      whileHover={!disabled ? { scale: 1.05 } : {}}
                      whileTap={!disabled ? { scale: 0.95 } : {}}
                      onClick={() => handleDateClick(day)}
                      disabled={disabled}
                      className={`
                        aspect-square rounded text-[10px] font-medium transition-all
                        ${disabled 
                          ? 'text-white/20 cursor-not-allowed' 
                          : selected 
                            ? `${colors.bg} text-white shadow-sm ${accentColor === 'emerald' ? 'shadow-emerald/30' : 'shadow-sky/30'}`
                            : today
                              ? `${colors.border} border text-white ${colors.hover}`
                              : `text-white ${colors.hover}`
                        }
                      `}
                    >
                      {day}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-1.5 pt-1.5 border-t border-white/10 flex justify-between items-center">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const today = new Date();
                    if (!isDateDisabled(today)) {
                      onChange(formatDateForInput(today));
                      setIsOpen(false);
                    }
                  }}
                  className={`text-[9px] ${colors.text} ${colors.hover} px-2 py-0.5 rounded transition-colors font-semibold`}
                >
                  Today
                </motion.button>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="text-[9px] text-white/70 hover:text-white px-2 py-0.5 rounded transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomCalendar;
