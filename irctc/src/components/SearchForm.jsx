import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowRightLeft, User, ChevronDown, Search } from 'lucide-react';

const STATIONS = [
  { code: 'MAS', name: 'Chennai Central' },
  { code: 'CBE', name: 'Coimbatore Jn' },
  { code: 'MTP', name: 'Mettupalayam' },
  { code: 'AJJ', name: 'Arakkonam' },
  { code: 'MDU', name: 'Madurai Jn' },
  { code: 'TPJ', name: 'Tiruchirappalli' },
  { code: 'SBC', name: 'KSR Bengaluru' }
];

const SearchForm = () => {
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  // Controlled Form State
  const [fromStation, setFromStation] = useState('MAS');
  const [toStation, setToStation] = useState('CBE');
  const [journeyDate, setJourneyDate] = useState(defaultDate);

  const handleSwap = () => {
    setFromStation(toStation);
    setToStation(fromStation);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (fromStation === toStation) {
      alert("Source and Destination cannot be the same!");
      return;
    }

    // 🔹 The Magic: Push the state to the URL query parameters
    navigate(`/trains?from=${fromStation}&to=${toStation}&date=${journeyDate}`);
  };

  return (
    <div className="mt-6 w-full max-w-7xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">

        {/* Row 1: From & To (Side by Side) */}
        <div className="flex flex-col md:flex-row gap-3 relative">

          {/* From Station */}
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {/* Removed appearance-none so the dropdown arrow shows */}
              <select
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#0b1b36] cursor-pointer"
              >
                {STATIONS.map(st => <option key={`from-${st.code}`} value={st.code}>{st.name} ({st.code})</option>)}
              </select>
            </div>
          </div>

          {/* Floating Swap Button (Centered between inputs on desktop) */}
          <button
            type="button"
            onClick={handleSwap}
            className="hidden md:flex absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 z-10 p-2 bg-blue-50 border-4 border-white text-blue-600 rounded-full hover:bg-blue-100 transition shadow-sm items-center justify-center"
            title="Swap Stations"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          {/* Mobile Swap Button (Only shows on small screens) */}
          <div className="md:hidden flex justify-center -my-2 z-10">
            <button type="button" onClick={handleSwap} className="p-2 bg-blue-50 text-blue-600 rounded-full border-2 border-white shadow-sm">
              <ArrowRightLeft className="w-4 h-4 rotate-90" />
            </button>
          </div>

          {/* To Station */}
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#0b1b36] cursor-pointer"
              >
                {STATIONS.map(st => <option key={`to-${st.code}`} value={st.code}>{st.name} ({st.code})</option>)}
              </select>
            </div>
          </div>

        </div>

        {/* Row 2: Journey Date */}
        <div className="w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Journey Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={journeyDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#0b1b36] cursor-pointer"
            />
          </div>
        </div>

        {/* Row 3: Submit Button */}
        <div className="w-full mt-2">
          <button
            type="submit"
            className="w-full py-4 bg-[#0b1b36] text-white font-bold text-lg rounded-xl hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-md"
          >
            <Search className="w-5 h-5" /> Search
          </button>
        </div>

      </form>
    </div>
  );
};

export default SearchForm;