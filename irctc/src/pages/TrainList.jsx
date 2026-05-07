import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import api from '../api/axiosSetup'; // Use your configured Axios instance
import axios from 'axios';

const TrainList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  // Real State Management
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Data on Component Mount
  useEffect(() => {

    const controller = new AbortController(); // For cleanup in case of component unmount

    const fetchTrains = async () => {
      setLoading(true);
      setError('');
      try {
        // Calling your new Spring Boot endpoint
        const response = await api.get('/trains/search', {
          params: { from, to, date },
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

    if (from && to && date) {
      fetchTrains();
    }

    // 4. The Cleanup Function!
    // This runs if the component unmounts OR if StrictMode forces a remount.
    // It instantly cancels the first API call before starting the second one.
    return () => {
      controller.abort();
    };

  }, [from, to, date]); // Re-run if URL parameters change

  const handleBookNow = (trainId, classType) => {
    navigate(`/book?trainId=${trainId}&class=${classType}&date=${date}`);
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      {/* Header Summary */}
      <div className="max-w-5xl mx-auto bg-[#0b1b36] text-white p-6 rounded-2xl shadow-lg mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {from} <ArrowRight className="w-5 h-5 text-orange-500" /> {to}
          </h1>
          <p className="text-gray-300 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Date of Journey: {date}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 border border-white/30 rounded-lg hover:bg-white/10 transition"
        >
          Modify Search
        </button>
      </div>

      {/* Train List */}
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-gray-800">
          {trains.length} Trains Found
        </h2>

        {trains.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-200">
            <p className="text-gray-500 text-lg">No direct trains found between these stations on the selected date.</p>
          </div>
        ) : (
          trains.map((train) => (
            /* Keep the exact same Train Card UI mapping logic here! */
            /* <div key={train.id} ...> ... </div> */
            <div key={train.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* ... Train Header ... */}
              <div className="bg-gray-100/50 p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#0b1b36]">{train.name} ({train.id})</h3>
                </div>
              </div>

              {/* ... Train Timings ... */}
              <div className="p-6 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{train.departureTime}</p>
                  <p className="text-sm text-gray-500 font-medium">{from}</p>
                </div>

                <div className="flex-1 flex flex-col items-center px-8">
                  <p className="text-sm text-gray-500 font-medium mb-1">{train.duration}</p>
                  <div className="w-full flex items-center">
                    <div className="h-[2px] bg-gray-300 flex-1"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-500 mx-1"></div>
                    <div className="h-[2px] bg-gray-300 flex-1"></div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{train.arrivalTime}</p>
                  <p className="text-sm text-gray-500 font-medium">{to}</p>
                </div>
              </div>

              {/* ... Class Availability Boxes ... */}
              <div className="px-6 pb-6 flex gap-4 overflow-x-auto">
                {train.classes.map((cls, index) => (
                  <div key={index} className="min-w-[160px] border border-gray-200 rounded-xl p-3 hover:border-blue-500 transition cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">{cls.type}</span>
                      <span className="text-sm font-semibold text-gray-600">₹{cls.price}</span>
                    </div>
                    <div className={`text-sm font-bold mb-3 ${cls.availability.startsWith('WL') ? 'text-orange-500' : 'text-green-600'}`}>
                      {cls.availability}
                    </div>
                    <button
                      onClick={() => handleBookNow(train.id, cls.type)}
                      className="w-full py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainList;