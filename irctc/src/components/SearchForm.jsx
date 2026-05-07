import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowRightLeft, User, ChevronDown } from 'lucide-react';

const SearchForm = () => {
  const navigate = useNavigate();
  
  // 1. State to hold the search parameters
  const [searchParams, setSearchParams] = useState({
    from: 'MAS',
    to: 'CBE',
    date: '2026-05-03',
    ticketClass: 'All Classes',
    quota: 'GENERAL'
  });

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSwap = () => {
    setSearchParams({
      ...searchParams,
      from: searchParams.to,
      to: searchParams.from
    });
  };

  // 2. Handle the search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Construct the query string and navigate
    const queryString = new URLSearchParams(searchParams).toString();
    navigate(`/trains?${queryString}`);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-6">
      {/* From / To Row */}
      <div className="flex items-center gap-4 relative">
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            name="from"
            value={searchParams.from}
            onChange={handleChange}
            placeholder="From" 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
            required
          />
        </div>
        
        <button type="button" onClick={handleSwap} className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 z-10">
          <ArrowRightLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            name="to"
            value={searchParams.to}
            onChange={handleChange}
            placeholder="To" 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
            required
          />
        </div>
      </div>

      {/* Date / Class Row */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <label className="absolute left-12 top-2 text-[10px] text-gray-400 font-medium">Date of Journey</label>
          <input 
            type="date" 
            name="date"
            value={searchParams.date}
            onChange={handleChange}
            className="w-full pl-12 pr-4 pt-6 pb-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-sm" 
            required
          />
        </div>
        <div className="flex-1 relative cursor-pointer">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <label className="absolute left-12 top-2 text-[10px] text-gray-400 font-medium">Class</label>
          <select 
            name="ticketClass"
            value={searchParams.ticketClass}
            onChange={handleChange}
            className="w-full pl-12 pr-8 pt-6 pb-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold appearance-none cursor-pointer"
          >
            <option value="All Classes">All Classes</option>
            <option value="SL">Sleeper (SL)</option>
            <option value="3A">AC 3 Tier (3A)</option>
            <option value="2A">AC 2 Tier (2A)</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <button type="submit" className="w-full py-4 bg-[#0b1b36] text-white rounded-xl font-bold text-lg hover:bg-blue-900 transition mt-4 shadow-lg shadow-blue-900/20">
        Search Trains
      </button>
    </form>
  );
};

export default SearchForm;