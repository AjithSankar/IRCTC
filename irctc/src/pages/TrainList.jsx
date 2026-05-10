import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Train, ArrowRight, Clock, Home, CalendarDays, Users, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosSetup'; // Use your configured Axios instance
import axios from 'axios';
import TrainCard from '../components/TrainCard';

const STATIONS = [
  { code: 'MAS', name: 'Chennai Central' },
  { code: 'CBE', name: 'Coimbatore Jn' },
  { code: 'MDU', name: 'Madurai Jn' },
  { code: 'TPJ', name: 'Tiruchirappalli' },
  { code: 'SBC', name: 'KSR Bengaluru' }
];

const TrainList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromStation = searchParams.get('from');
  const toStation = searchParams.get('to');
  const journeyDate = searchParams.get('date');

  // Real State Management
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔹 STATE FOR MODIFY SEARCH
  const [isModifying, setIsModifying] = useState(false);
  const [modFrom, setModFrom] = useState(fromStation || '');
  const [modTo, setModTo] = useState(toStation || '');
  const [modDate, setModDate] = useState(journeyDate || '');

  // Keep local state synced if URL changes
  useEffect(() => {
    setModFrom(fromStation || '');
    setModTo(toStation || '');
    setModDate(journeyDate || '');
  }, [fromStation, toStation, journeyDate]);

  // Fetch Data on Component Mount
  useEffect(() => {

    const controller = new AbortController(); // For cleanup in case of component unmount

    const fetchTrains = async () => {

      if (!fromStation || !toStation || !journeyDate) {
        setError("Invalid search parameters. Please return to home and search again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        // Calling your new Spring Boot endpoint
        const response = await api.get('/trains/search', {
          params: { from: fromStation, to: toStation, date: journeyDate },
          signal: controller.signal // Attach the signal axios request
        });
        setTrains(response.data);
      } catch (err) {

        if (err.name === 'CanceledError' || controller.signal.aborted) {
          console.log('Previous Search Request was cancelled');
          return;
        }

        console.error("Actual API Error:", err);
        setError('Failed to fetch train schedules. Please try again later.');

      } finally {
        // only turn off loading if it's not a cancelled request
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (fromStation && toStation && journeyDate) {
      fetchTrains();
    }

    // 4. The Cleanup Function!
    // This runs if the component unmounts OR if StrictMode forces a remount.
    // It instantly cancels the first API call before starting the second one.
    return () => {
      controller.abort();
    };

  }, [fromStation, toStation, journeyDate]); // Re-run if URL parameters change

  // 🔹 HELPER: Generate the next 6 days for the slider
  const getNextSixDays = (startDateStr) => {
    const dates = [];
    // Handle timezone parsing safely by appending time
    const start = new Date(`${startDateStr}T00:00:00`);

    for (let i = 0; i < 6; i++) {
      const nextDate = new Date(start);
      nextDate.setDate(start.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };

  const formatLocalDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 🔹 HANDLER: Update URL when a date tab is clicked
  const handleDateClick = (newDateObj) => {
    // Format back to YYYY-MM-DD
    const newDateString = formatLocalDate(newDateObj);

    // Update the URL parameters (which auto-triggers the useEffect!)
    setSearchParams({
      from: fromStation,
      to: toStation,
      date: newDateString
    });
  };

  const sliderDates = journeyDate ? getNextSixDays(journeyDate) : [];

  const handleBookNow = (trainId, classType) => {
    navigate(`/book?trainId=${trainId}&class=${classType}&date=${journeyDate}`);
  };

  // 🔹 HANDLER: Fire the new search
  const handleModifySearch = (e) => {
    e.preventDefault();
    if (modFrom === modTo) {
      alert("Source and Destination cannot be the same!");
      return;
    }
    // Update the URL! This automatically triggers the main useEffect above.
    setSearchParams({ from: modFrom, to: modTo, date: modDate });
    setIsModifying(false); // Close the inline form
  };

  // 1. Loading State UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-900 mb-4"></div>
        <p className="text-gray-600 font-medium tracking-wide">Searching for trains...</p>
      </div>
    );
  }

  // 2. Error State UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
          <p className="font-bold">{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 underline hover:text-red-800">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12">

      {/* 🔹 DYNAMIC HEADER BAR */}
      <div className="bg-[#0b1b36] text-white p-3 sticky top-0 z-20 shadow-md">
        <div className="w-full px-2 mx-auto flex items-center">

          {!isModifying ? (
            <div className="flex w-full justify-between items-center">
              <div className="font-bold text-xl flex items-center gap-3">
                {fromStation} <span className="text-gray-400 text-sm">➔</span> {toStation}
                <span className="text-gray-400 font-normal mx-2">|</span> {journeyDate}
              </div>
              <button
                onClick={() => setIsModifying(true)}
                className="bg-orange-500 px-6 py-2 rounded font-bold hover:bg-orange-600 transition shadow-sm text-sm"
              >
                Modify Search
              </button>
            </div>
          ) : (
            <form onSubmit={handleModifySearch} className="flex flex-wrap gap-2 w-full items-center text-sm">
              {/* ... existing form inputs, slightly reduced padding if desired ... */}
              <select value={modFrom} onChange={(e) => setModFrom(e.target.value)} className="px-3 py-1.5 rounded text-gray-800 font-bold">
                {STATIONS.map(st => <option key={`mod-from-${st.code}`} value={st.code}>{st.code} - {st.name}</option>)}
              </select>
              <span className="text-gray-400">➔</span>
              <select value={modTo} onChange={(e) => setModTo(e.target.value)} className="px-3 py-1.5 rounded text-gray-800 font-bold">
                {STATIONS.map(st => <option key={`mod-to-${st.code}`} value={st.code}>{st.code} - {st.name}</option>)}
              </select>
              <input type="date" value={modDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setModDate(e.target.value)} className="px-3 py-1.5 rounded text-gray-800 font-bold" />
              <button type="submit" className="bg-orange-500 px-6 py-1.5 rounded font-bold hover:bg-orange-600 transition ml-auto">Search</button>
              <button type="button" onClick={() => setIsModifying(false)} className="px-4 py-1.5 text-gray-300 hover:text-white font-bold transition">Cancel</button>
            </form>
          )}

        </div>
      </div>

      <div className="w-full px-2 mx-auto flex flex-col lg:flex-row gap-2 mt-4">

        {/* LEFT SIDEBAR: Hardcoded to 260px width, pushed to far left */}
        <div className="w-full lg:w-[260px] shrink-0">
          <div className="bg-white border border-gray-300 shadow-sm text-[13px]">
            <div className="text-[15px] font-bold text-gray-800 mb-3 bg-white p-3 border border-gray-300 flex justify-between items-center shadow-sm">Refine Results</div>

            <div className="p-4 border-b border-gray-200">
              <div className="font-bold text-[11px] text-gray-500 mb-2 uppercase tracking-wide">Journey Class</div>
              <div className="space-y-2 text-gray-700 font-medium">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" /> AC 3 Tier (3A)</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" /> AC 2 Tier (2A)</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" /> Sleeper (SL)</label>
              </div>
            </div>

            <div className="p-4">
              <div className="font-bold text-[11px] text-gray-500 mb-2 uppercase tracking-wide">Train Type</div>
              <div className="space-y-2 text-gray-700 font-medium">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" /> SPECIAL</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" /> OTHER</label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT: Takes up all remaining space */}
        <div className="flex-1 overflow-hidden">
          <div className="text-[15px] font-bold text-gray-800 mb-3 bg-white p-3 border border-gray-300 flex justify-between items-center shadow-sm">
            <span>{trains.length} Results for {fromStation} ➔ {toStation} | {journeyDate}</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 font-bold bg-white border border-gray-300 shadow-sm">Loading trains...</div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 font-bold border border-red-200">{error}</div>
          ) : trains.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-bold bg-white border border-gray-300 shadow-sm">No direct trains found for this date.</div>
          ) : (
            <div className="space-y-4">
              {trains.map((train, idx) => (
                <TrainCard key={idx} train={train} journeyDate={journeyDate} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TrainList;