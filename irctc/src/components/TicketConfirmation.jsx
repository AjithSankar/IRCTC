import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Download, Home, AlertCircle } from 'lucide-react';
import api from '../api/axiosSetup';

const TicketConfirmation = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const statusParam = searchParams.get('status');
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    // Fetch the final booking details to display the ticket
    const fetchFinalDetails = async () => {
      try {
        const response = await api.get(`/v1/bookings/${bookingId}`);
        setBookingDetails(response.data);
      } catch (error) {
        console.error("Failed to load final ticket details", error);
      }
    };
    fetchFinalDetails();
  }, [bookingId]);

  if (!bookingDetails) return null; // Or a small loading spinner

  const isSuccess = statusParam === 'success';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Status Header */}
        <div className={`rounded-t-3xl p-8 text-center text-white ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex justify-center mb-4">
            {isSuccess ? <CheckCircle2 className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
          </div>
          <h1 className="text-3xl font-black mb-2">
            {isSuccess ? 'Booking Confirmed!' : 'Booking Failed'}
          </h1>
          <p className="font-medium opacity-90">
            {isSuccess 
              ? `Your ticket has been successfully booked. PNR will be generated shortly.` 
              : `We could not confirm your seats. Any deducted amount will be refunded within 3-5 working days.`}
          </p>
        </div>

        {/* Ticket Details Body */}
        <div className="bg-white p-8 rounded-b-3xl shadow-xl border border-gray-100">
          
          <div className="flex justify-between items-center border-b pb-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Booking ID</p>
              <p className="text-lg font-bold text-gray-900">{bookingId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {bookingDetails.status}
              </span>
            </div>
          </div>

          {/* Render passenger status only if successful */}
          {isSuccess && bookingDetails.passengers && (
             <div className="space-y-4 mb-8">
               <h3 className="font-bold text-gray-800 border-b pb-2">Passenger Roster</h3>
               {bookingDetails.passengers.map((p, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                   <div>
                     <p className="font-bold text-gray-900">{p.name}</p>
                     <p className="text-xs text-gray-500">{p.age} yrs | {p.gender}</p>
                   </div>
                   <div className="text-right">
                     <p className={`font-bold ${p.status === 'CONFIRMED' ? 'text-green-600' : 'text-orange-500'}`}>
                       {p.status}
                     </p>
                     {p.seatNumber && <p className="text-xs text-gray-600">Coach: {p.coach} | Seat: {p.seatNumber}</p>}
                   </div>
                 </div>
               ))}
             </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            {isSuccess && (
              <button className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#0b1b36] text-white rounded-xl font-bold hover:bg-blue-900 transition">
                <Download className="w-4 h-4" /> Download Ticket
              </button>
            )}
            <button 
              onClick={() => navigate('/')}
              className={`flex-1 flex justify-center items-center gap-2 py-3 border-2 rounded-xl font-bold transition ${isSuccess ? 'border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-black'}`}
            >
              <Home className="w-4 h-4" /> Return to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TicketConfirmation;