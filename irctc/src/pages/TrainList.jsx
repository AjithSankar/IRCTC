import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Train, ArrowRight, Clock, Home, CalendarDays, Users, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosSetup'; // Use your configured Axios instance
import axios from 'axios';

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#0b1b36] flex items-center gap-3">
              {fromStation} <ArrowRight className="w-6 h-6 text-orange-500" /> {toStation}
            </h1>
            <p className="text-gray-500 font-medium mt-1">Showing available trains and seat status</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition bg-blue-50 px-4 py-2 rounded-lg"
          >
            Modify Search
          </button>
        </div>

        {/* 🔹 THE NEW 6-DAY HORIZONTAL SLIDER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {sliderDates.map((dateObj, index) => {
              const dateString = formatLocalDate(dateObj);
              const isSelected = dateString === journeyDate;

              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(dateObj)}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl flex flex-col items-center justify-center transition border-2 ${isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                      : 'bg-white border-transparent hover:border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                    {dayName}
                  </span>
                  <span className={`text-lg font-black ${isSelected ? 'text-[#0b1b36]' : 'text-gray-800'}`}>
                    {monthDay}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Train List Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0b1b36]"></div>
            <p className="mt-4 text-gray-500 font-bold animate-pulse">Fetching live seat availability...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl font-bold text-center">
            {error}
          </div>
        ) : trains.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 rounded-2xl text-center shadow-sm">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Trains Found</h3>
            <p className="text-gray-500">There are no direct trains running between these stations on {journeyDate}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {trains.map((train, index) => (
              <div key={`train-${train.trainNo}-${index}`} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">

                {/* Train Header */}
                <div className="flex flex-wrap justify-between items-start border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0b1b36] flex items-center gap-2">
                      <Train className="w-6 h-6 text-orange-500" /> {train.trainName}
                      <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{train.trainNo}</span>
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-600">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {train.departureTime}</span>
                      <span className="text-gray-300">|</span>
                      <span>Runs On: <span className="text-green-600">{train.runsOn || 'DAILY'}</span></span>
                    </div>
                  </div>
                </div>

                {/* Class Availability Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {train.classes.map((cls, index) => {

                    const statusText = cls.availability;
                    const isAvailable = statusText.startsWith('AVAILABLE');
                    const isWL = statusText.startsWith('WL');
                    const classType = cls.className || cls.classType || cls.type || 'SL';

                    return (
                      <div
                        key={`class-${train.trainNo}-${index}`}
                        className={`border-2 rounded-xl p-4 transition flex flex-col justify-between ${isAvailable ? 'border-green-100 bg-green-50/30' :
                            isWL ? 'border-orange-100 bg-orange-50/30' :
                              statusText === '' ? 'border-gray-200 bg-gray-50' :
                                'border-red-100 bg-red-50/30'
                          }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-black text-gray-800">{classType}</span>
                            <span className="font-bold text-gray-500 text-sm">₹{cls.price}</span>
                          </div>
                          <div className={`font-black text-lg mb-4 ${isAvailable ? 'text-green-600' : isWL ? 'text-orange-500' : 'text-red-500'}`}>
                            {statusText || 'N/A'}
                          </div>
                        </div>

                        {/* 🔹 RESTORED: Explicit Book Now Button with your exact routing */}
                        <button
                          onClick={() => navigate(`/book?trainId=${train.id || train.trainNo}&class=${classType}&date=${journeyDate}`)}
                          disabled={!isAvailable && !isWL} // Disable if it's completely full/unavailable
                          className={`w-full py-2 rounded-lg font-bold text-sm text-white transition shadow-sm ${isAvailable ? 'bg-green-600 hover:bg-green-700' :
                              isWL ? 'bg-orange-500 hover:bg-orange-600' :
                                'bg-gray-400 cursor-not-allowed opacity-50'
                            }`}
                        >
                          {isWL ? 'Book Waitlist' : 'Book Now'}
                        </button>
                      </div>
                    )
                  })}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainList;