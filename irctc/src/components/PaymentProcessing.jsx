import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import api from '../api/axiosSetup';

const PaymentProcessing = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Poll the backend every 2.5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/v1/bookings/${bookingId}`);
        const currentStatus = response.data.status;

        console.log(`Polling attempt ${attempt + 1}: Status is ${currentStatus}`);
        setAttempt(prev => prev + 1);

        // Check if the worker is finished
        if (currentStatus === 'CONFIRMED' || currentStatus === 'PARTIALLY_CONFIRMED') {
          clearInterval(interval);
          navigate(`/ticket/${bookingId}?status=success`);
        } else if (currentStatus === 'FAILED' || currentStatus === 'NOT_BOOKED') {
          clearInterval(interval);
          navigate(`/ticket/${bookingId}?status=failed`);
        }
        
        // If status is INITIATED or PROCESSING, we do nothing and let it poll again.

        // Fallback: If it takes longer than 60 seconds (approx 24 attempts), assume a timeout
        if (attempt > 24) {
           clearInterval(interval);
           navigate(`/ticket/${bookingId}?status=timeout`);
        }

      } catch (error) {
        console.error("Error polling booking status:", error);
      }
    }, 2500);

    // Cleanup the interval if the user navigates away manually
    return () => clearInterval(interval);
  }, [bookingId, navigate, attempt]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full text-center border border-gray-100">
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-[#0b1b36] p-5 rounded-full">
             <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
        <p className="text-gray-500 font-medium mb-8">
          Please do not refresh or close this window. We are securely communicating with your bank and confirming your seats.
        </p>

        <div className="flex items-center gap-3 text-blue-600 font-bold bg-blue-50 px-6 py-3 rounded-full">
          <Loader2 className="w-5 h-5 animate-spin" />
          Allocating Seats...
        </div>
        
        <p className="text-xs text-gray-400 mt-8">Booking Reference: {bookingId}</p>
      </div>
    </div>
  );
};

export default PaymentProcessing;