import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Calendar, Users, ChevronRight, AlertCircle, Clock, Home} from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import api from '../api/axiosSetup';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const response = await api.get(`/v1/bookings/user/${user.id}`);
        setBookings(response.data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Could not load your booking history.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchMyBookings();
    }
  }, [user]);

  // Helper to format status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700';
      case 'PARTIALLY_CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'FAILED': 
      case 'NOT_BOOKED': return 'bg-red-100 text-red-700';
      case 'PROCESSING': 
      case 'INITIATED': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        
        {/* 🔹 UPDATED: Flex container for Header and Home Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-[#0b1b36]">My Bookings</h1>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-300 text-gray-700 rounded-xl font-bold hover:bg-blue-100 transition shadow-sm"
          >
            <Home className="w-4 h-4" /> <ChevronRight className="w-4 h-4"/> Return to Home
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {bookings.length === 0 && !error ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
            <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Bookings Found</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't booked any train tickets yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#0b1b36] text-white rounded-xl font-bold hover:bg-blue-900 transition"
            >
              Search Trains
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div 
                key={booking.bookingId} 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer group"
                onClick={() => navigate(`/ticket/${booking.bookingId}?status=success`)}
              >
                {/* Card Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <span className="font-bold text-gray-800">ID: {booking.bookingId.split('-')[0].toUpperCase()}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* Left: Journey Details (You can pass trainNo and date in your DTO to make this dynamic!) */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#0b1b36] flex items-center gap-2 mb-2">
                      <Train className="w-5 h-5 text-orange-500" />
                      {booking.trainNumber}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600 text-sm font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {booking.journeyDate}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {booking.passengers?.length || 0} Passengers</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                    {booking.status === 'INITIATED' || booking.status === 'PROCESSING' ? (
                       <span className="text-orange-500 font-bold flex items-center gap-1 text-sm">
                         <Clock className="w-4 h-4 animate-spin" /> Processing
                       </span>
                    ) : (
                      <button className="flex-1 md:flex-none flex items-center justify-center gap-1 px-5 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                        View Ticket <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;