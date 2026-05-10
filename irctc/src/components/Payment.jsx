import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Globe, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../api/axiosSetup';
import { useAuth } from './auth/AuthContext'; // 🔹 Restored AuthContext

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // 🔹 Get logged-in user

  // Extract the data passed from the Review page
  const { passengers, checkoutData, journeyDate, totalFare } = location.state || {};

  const [activeTab, setActiveTab] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false); // Protect against double-clicks

  useEffect(() => {
    // Security check
    if (!checkoutData || !user) {
      navigate('/');
    }
  }, [checkoutData, user, navigate]);

  const handlePayAndBook = async () => {
    if (!user) {
      alert("Session expired. Please log in again.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Generate Idempotency Key (From your original BookTicket.jsx)
      const idempotencyKey = crypto.randomUUID();

      // 2. Construct the exact payload your Spring Boot backend expects
      const bookingPayload = {
        userId: user.id, // 🔹 Using true user ID from AuthContext
        trainNumber: parseInt(checkoutData.trainNo),
        journeyDate: journeyDate,
        sourceStation: checkoutData.sourceStation,
        destinationStation: checkoutData.destinationStation,
        classType: checkoutData.classType,
        category: "GENERAL",
        passengers: passengers.map(p => ({
          name: p.name,
          age: parseInt(p.age),
          gender: p.gender
        }))
      };

      // 3. Fire the POST request to create the PNR/Booking
      const response = await api.post('/v1/bookings', bookingPayload, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });

      // 4. Instantly redirect to your Processing screen with the new Booking ID
      if (response.data && response.data.bookingId) {
        navigate(`/processing/${response.data.bookingId}`);
      } else {
        throw new Error("No booking ID returned from server");
      }
    } catch (error) {
      console.error("Booking initiation failed:", error);
      alert("Failed to initiate booking. Please check your connection and try again.");
      setIsProcessing(false);
    }
  };

  if (!checkoutData || !user) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12 font-sans">
      
      {/* 🔹 HEADER BAR */}
      <div className="bg-[#0b1b36] text-white p-3 shadow-md">
        <div className="w-full px-4 lg:px-8 mx-auto flex items-center justify-between">
          <div className="font-bold text-[15px]">Payment Options</div>
          <div className="text-[13px] text-gray-300">
            Welcome {user.fullName || user.username || 'User'} <span className="text-green-500">✔</span>
          </div>
        </div>
      </div>

      {/* 🔹 PROGRESS BAR (Step 3 Active) */}
      <div className="w-full bg-white border-b border-gray-200 py-4 mb-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center relative px-12">
          <div className="absolute top-1/2 left-20 right-20 h-[2px] bg-[#fb792b] -z-10 -translate-y-1/2"></div>
          
          <div className="flex flex-col items-center bg-white px-2 cursor-pointer" onClick={() => !isProcessing && navigate(-2)}>
            <div className="w-8 h-8 rounded-full bg-[#fb792b] text-white flex items-center justify-center font-bold text-sm mb-1 shadow-sm">✔</div>
            <span className="text-[13px] font-bold text-gray-800">Passenger Details</span>
          </div>
          
          <div className="flex flex-col items-center bg-white px-2 cursor-pointer" onClick={() => !isProcessing && navigate(-1)}>
            <div className="w-8 h-8 rounded-full bg-[#fb792b] text-white flex items-center justify-center font-bold text-sm mb-1 shadow-sm">✔</div>
            <span className="text-[13px] font-bold text-gray-800">Review Journey</span>
          </div>
          
          <div className="flex flex-col items-center bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-[#fb792b] text-white flex items-center justify-center font-bold text-sm mb-1 shadow-sm ring-4 ring-orange-100">3</div>
            <span className="text-[13px] font-bold text-gray-800">Payment</span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 mx-auto flex flex-col lg:flex-row gap-4">
        
        {/* LEFT COLUMN: Payment Methods */}
        <div className="flex-1 bg-white border border-gray-300 shadow-sm rounded-sm flex">
          
          <div className="w-1/3 bg-[#f8f9fa] border-r border-gray-200">
            {['UPI', 'CARD', 'NETBANKING'].map((method) => (
              <button 
                key={method}
                onClick={() => !isProcessing && setActiveTab(method)}
                disabled={isProcessing}
                className={`w-full text-left px-4 py-4 text-[14px] font-bold border-b border-gray-200 flex items-center gap-3 transition ${activeTab === method ? 'bg-white border-l-4 border-l-[#fb792b] text-[#085294]' : 'text-gray-700 hover:bg-gray-100'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {method === 'UPI' && <Smartphone className="w-5 h-5" />}
                {method === 'CARD' && <CreditCard className="w-5 h-5" />}
                {method === 'NETBANKING' && <Globe className="w-5 h-5" />}
                {method === 'UPI' ? 'BHIM / UPI' : method === 'CARD' ? 'Credit & Debit Cards' : 'Net Banking'}
              </button>
            ))}
          </div>

          <div className="w-2/3 p-6 bg-white">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 text-[#085294]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-[15px]">100% Secure Payment</h3>
            </div>

            {/* ... Payment Tab Content (Unchanged) ... */}
            {activeTab === 'UPI' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="text-[13px] text-gray-600 font-medium">Pay instantly using your favorite UPI App.</p>
                <div className="border border-gray-300 rounded p-4 bg-[#fafbfc] hover:border-blue-400 transition cursor-pointer">
                   <div className="font-bold text-[14px] text-gray-800">Powered by Paytm / PhonePe</div>
                   <div className="text-[12px] text-gray-500 mt-1">Accepts all UPI Apps (GPay, PhonePe, Paytm, Amazon Pay)</div>
                </div>
              </div>
            )}

            {/* 🔹 FINAL PAY BUTTON W/ ORIGINAL API LOGIC */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button 
                onClick={handlePayAndBook}
                disabled={isProcessing}
                className={`w-full py-3 text-white font-black text-[15px] rounded shadow-sm transition uppercase tracking-wide flex justify-center items-center gap-2 ${isProcessing ? 'bg-orange-400 cursor-not-allowed' : 'bg-[#fb792b] hover:bg-[#e66b26]'}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  `Pay & Book ₹ ${totalFare}`
                )}
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Fare Summary (Unchanged) */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm sticky top-20">
            <div className="bg-[#f5f5f5] p-3 border-b border-gray-200">
              <h2 className="font-bold text-[16px] text-gray-900">Fare Summary</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-[13px] text-gray-800">
                <span>Ticket Fare ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})</span>
                <span className="font-bold">₹ {totalFare}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] text-gray-800">
                <span>Convenience Fee</span>
                <span className="font-bold">₹ 0.00</span>
              </div>
            </div>
            <div className="bg-[#1f3b6c] text-white p-4 flex justify-between items-center">
              <span className="font-bold text-[15px]">Total Fare</span>
              <span className="font-bold text-[16px]">₹ {totalFare}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;