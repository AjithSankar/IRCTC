import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, RefreshCw } from 'lucide-react';
import { formatDateForDisplay, getClassNameForType } from './Checkout';

const ReviewJourney = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the data passed from Checkout.jsx
  const { passengers, checkoutData, journeyDate, totalFare, userData } = location.state || {};

  // Captcha State
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // Generate a random 5-character alphanumeric captcha on load
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like I, O, 1, 0
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  useEffect(() => {
    // Security check: If someone navigates directly to /review without data, kick them back
    if (!passengers || !checkoutData) {
      navigate('/');
    } else {
      generateCaptcha();
    }
  }, [passengers, checkoutData, navigate]);

  const handleProceedToPayment = () => {
    if (captchaInput.toUpperCase() !== captchaText) {
      setCaptchaError(true);
      generateCaptcha();
      return;
    }
    
    // Navigate to Step 3
    navigate('/payment', { 
      state: { passengers, checkoutData, journeyDate, totalFare, userData } 
    });
  };

  if (!checkoutData) return null; // Prevent flash before redirect

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12 font-sans">
      
      {/* 🔹 HEADER BAR */}
      <div className="bg-[#0b1b36] text-white p-3 shadow-md">
        <div className="w-full px-4 lg:px-8 mx-auto flex items-center justify-between">
          <div className="font-bold text-[15px]">Review Journey</div>
          <div className="text-[13px] text-gray-300">
            Welcome {userData?.fullName || 'User'} <span className="text-green-500">✔</span>
          </div>
        </div>
      </div>

      {/* 🔹 PROGRESS BAR (Step 2 Active) */}
      <div className="w-full bg-white border-b border-gray-200 py-4 mb-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center relative px-12">
          <div className="absolute top-1/2 left-20 right-20 h-[2px] bg-gray-200 -z-10 -translate-y-1/2">
             <div className="h-full bg-[#fb792b] w-1/2 transition-all duration-500"></div>
          </div>
          
          <div className="flex flex-col items-center bg-white px-2 cursor-pointer" onClick={() => navigate(-1)}>
            <div className="w-8 h-8 rounded-full bg-[#fb792b] text-white flex items-center justify-center font-bold text-sm mb-1 shadow-sm">✔</div>
            <span className="text-[13px] font-bold text-gray-800">Passenger Details</span>
          </div>
          
          <div className="flex flex-col items-center bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-[#fb792b] text-white flex items-center justify-center font-bold text-sm mb-1 shadow-sm ring-4 ring-orange-100">2</div>
            <span className="text-[13px] font-bold text-gray-800">Review Journey</span>
          </div>
          
          <div className="flex flex-col items-center bg-white px-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-sm mb-1">3</div>
            <span className="text-[13px] font-bold text-gray-600">Payment</span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 mx-auto flex flex-col lg:flex-row gap-4">
        
        {/* 🔹 LEFT COLUMN: Review Details */}
        <div className="flex-1 space-y-4">
          
          {/* Journey Summary Card (Read Only) */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm">
            <div className="bg-[#f5f5f5] px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-[16px] text-gray-900 uppercase">
                {checkoutData.trainName} ({checkoutData.trainNo})
              </h2>
              <MapPin className="w-4 h-4 text-gray-600" />
            </div>
            
            <div className="p-4 flex justify-between items-center text-[14px]">
              <div>
                <div className="text-[18px] font-bold text-black">{checkoutData.departureTime} | {checkoutData.srcStationName}</div>
                <div className="text-black-600 font-bold text-[17px] mt-1">{formatDateForDisplay(journeyDate)}</div>
              </div>
              <div className="text-black-800 font-bold tracking-widest text-[15px]">---{checkoutData.duration}---</div>
              <div className="text-right">
                <div className="text-[18px] font-bold text-black">{checkoutData.arrivalTime} | {checkoutData.destStationName}</div>
                <div className="text-black-800 font-bold text-[17px] mt-1">{formatDateForDisplay(journeyDate)}</div>
              </div>
            </div>

            <div className="px-4 pb-4 border-b border-gray-100 flex justify-center">
              <span className={`font-bold text-[14px] ${getClassNameForType(checkoutData.classType)}`}>
                {getClassNameForType(checkoutData.classType)} | General | Boarding at {checkoutData.srcStationName}
              </span>
            </div>
          </div>

          {/* Passenger List Confirmation */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm">
            <div className="bg-[#f5f5f5] p-3 border-b border-gray-200">
               <h3 className="font-bold text-[15px] text-gray-900">Passenger Details ({passengers.length})</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 flex flex-wrap justify-between items-center hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-[#085294] font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-[14px] text-gray-900 uppercase">{p.name}</div>
                      <div className="text-[12px] text-gray-600">
                        {p.age} yrs | {p.gender} | {p.nationality}
                      </div>
                    </div>
                  </div>
                  <div className="text-[13px] font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded">
                    {p.preference}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details Block */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm p-4">
             <h3 className="font-bold text-[14px] text-gray-900 mb-2">Ticket details will be sent to:</h3>
             <div className="text-[13px] text-gray-700 font-medium">
               Email: <span className="font-bold text-black">{userData?.email || 'user@example.com'}</span>
             </div>
          </div>

          {/* 🔹 CAPTCHA VERIFICATION */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm p-4">
             <h3 className="font-bold text-[14px] text-gray-900 mb-4">Captcha Verification</h3>
             
             {captchaError && (
               <div className="mb-3 text-[12px] text-red-600 flex items-center gap-1 font-bold">
                 <AlertTriangle className="w-3 h-3" /> Invalid Captcha. Please try again.
               </div>
             )}

             <div className="flex items-center gap-4">
               {/* Distorted Captcha Box */}
               <div className="bg-[#eef2f5] border border-gray-300 px-6 py-2 rounded-sm text-2xl font-black tracking-[0.2em] text-[#085294] select-none italic line-through decoration-gray-400 decoration-2">
                 {captchaText}
               </div>
               
               <button onClick={generateCaptcha} className="text-gray-500 hover:text-black transition" title="Refresh Captcha">
                 <RefreshCw className="w-5 h-5" />
               </button>

               <input 
                 type="text" 
                 value={captchaInput}
                 onChange={(e) => setCaptchaInput(e.target.value)}
                 placeholder="Type Captcha Here" 
                 className={`px-3 py-2 border text-[14px] rounded-sm focus:outline-none w-48 font-bold uppercase ${captchaError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                 maxLength={5}
               />
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button 
              onClick={() => navigate(-1)} 
              className="px-8 py-2 bg-white border border-gray-300 text-gray-800 font-bold text-[13px] rounded-sm hover:bg-gray-50 shadow-sm transition"
            >
              Back
            </button>
            <button 
              onClick={handleProceedToPayment} 
              disabled={captchaInput.length < 5}
              className={`px-8 py-2 text-white font-bold text-[13px] rounded-sm shadow-sm uppercase tracking-wide transition ${
                captchaInput.length === 5 ? 'bg-[#fb792b] hover:bg-[#e66b26]' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>

        {/* 🔹 RIGHT COLUMN: Fare Summary Sidebar */}
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

export default ReviewJourney;