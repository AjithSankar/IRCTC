import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, X, Plus, Loader2 } from 'lucide-react';
import api from '../api/axiosSetup'; // 

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL Context
  const trainId = searchParams.get('trainId');
  const classCode = searchParams.get('class');
  const journeyDate = searchParams.get('date');

  // 🔹 NEW STATE: Backend Data, Loading, and Errors
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State: Dynamic Passenger List
  const [passengers, setPassengers] = useState([
    { id: 1, name: '', age: '', gender: '', nationality: 'India', preference: 'No Preference' }
  ]);

  // 🔹 FETCH DATA ON MOUNT
  useEffect(() => {
    const fetchCheckoutDetails = async () => {
      if (!trainId || !classCode || !journeyDate) {
        setError("Invalid booking link. Please search for a train again.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/trains/${trainId}/checkout-info`, {
          params: { classType: classCode }
        });
        setCheckoutData(response.data);
      } catch (err) {
        console.error("Failed to fetch checkout details:", err);
        setError("Could not load train details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutDetails();
  }, [trainId, classCode, journeyDate]);

  // Form Handlers
  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      alert("Maximum 6 passengers allowed per ticket.");
      return;
    }
    setPassengers([...passengers, { id: Date.now(), name: '', age: '', gender: '', nationality: 'India', preference: 'No Preference' }]);
  };

  const handleRemovePassenger = (id) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter(p => p.id !== id));
  };

  const handlePassengerChange = (id, field, value) => {
    setPassengers(passengers.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

const handleContinue = (e) => {
    e.preventDefault();
    const isValid = passengers.every(p => p.name.trim() !== '' && p.age !== '' && p.gender !== '');
    if (!isValid) {
      alert("Please fill in all passenger details (Name, Age, Gender).");
      return;
    }
    
    // 🔹 PASS STATE TO THE REVIEW PAGE
    navigate('/review', { 
      state: { 
        passengers, 
        checkoutData, 
        journeyDate, 
        totalFare,
        userData
      } 
    });
  };

  // 🔹 Helper function to format date from YYYY-MM-DD to "Sun,10 May"
  const formatDateForDisplay = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayOfWeek = dayNames[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = monthNames[date.getMonth()];
    
    return `${dayOfWeek},${dayOfMonth} ${month}`;
  };


  const getClassNameForType = (type) => {
    switch (type) {
      case 'SL': return 'SLEEPER';
      case '3A': return 'AC 3 Tier';
      case '2A': return 'AC 2 Tier';
      case '1A': return 'AC 1 Tier';
      default: return 'SLEEPER';
    }
  };

  // 🔹 LOADING & ERROR SCREENS
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#fb792b] mb-4" />
        <h2 className="text-gray-700 font-bold">Securing your session...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-sm text-center border-t-4 border-red-500">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">{error}</h2>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#085294] text-white font-bold rounded">Return Home</button>
        </div>
      </div>
    );
  }

  // 🔹 DYNAMIC CALCULATION
  const baseFare = checkoutData?.baseFare || 0;
  const totalFare = (baseFare * passengers.length).toFixed(2);

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12 font-sans">
      {/* HEADER & PROGRESS BAR REMAIN THE SAME */}
      <div className="bg-[#0b1b36] text-white p-3 shadow-md">
        <div className="w-full px-4 lg:px-8 mx-auto flex items-center justify-between">
          <div className="font-bold text-[15px]">Passenger Details</div>
        </div>
      </div>

      <div className="w-full bg-white border-b border-gray-200 py-4 mb-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center relative px-12">
          <div className="absolute top-1/2 left-20 right-20 h-[2px] bg-gray-200 -z-10 -translate-y-1/2"></div>
          <div className="flex flex-col items-center bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-[#fb792b] text-white flex items-center justify-center font-bold text-sm mb-1 shadow-sm">1</div>
            <span className="text-[13px] font-bold text-gray-800">Passenger Details</span>
          </div>
          <div className="flex flex-col items-center bg-white px-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-sm mb-1">2</div>
            <span className="text-[13px] font-bold text-gray-600">Review Journey</span>
          </div>
          <div className="flex flex-col items-center bg-white px-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-sm mb-1">3</div>
            <span className="text-[13px] font-bold text-gray-600">Payment</span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 mx-auto flex flex-col lg:flex-row gap-4">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-4">
          
          <div className="bg-[#fff3cd] border border-[#ffeeba] text-[#856404] p-2 text-[13px] font-medium flex items-center gap-2 rounded-sm">
            <AlertTriangle className="w-4 h-4" />
            Senior Citizen concession not allowed for this Train/Quota/Class. Person With Disability/ Journalist may check after entering details.
          </div>

          {/* 🔹 DYNAMIC Journey Summary Card */}
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
                {getClassNameForType(checkoutData.classType)} | General
              </span>
            </div>

            <div className="p-4 bg-[#fcfcfc]">
              <div className="font-bold text-[12px] text-gray-800 uppercase mb-2 tracking-wide">Change Boarding Station</div>
              <select className="w-full p-2 border border-gray-300 text-[13px] text-gray-800 rounded-sm bg-white focus:outline-none focus:border-blue-500">
                <option>Boarding Station | {checkoutData.srcStationName} | Arrival: -- | Departure: {checkoutData.departureTime} | Day: 1</option>
              </select>
            </div>
          </div>

          {/* Passenger Details Form (Unchanged from previous logic) */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm">
            <div className="bg-[#fff9f9] border-b border-[#ffe6e6] p-3 text-[12px] text-gray-700 space-y-1">
              <div className="flex gap-2 items-start"><span className="text-red-500">•</span> Note: Please submit full name of the passengers instead of initials.</div>
              <div className="flex gap-2 items-start"><span className="text-red-500">•</span> Note: The ID card will be required during journey</div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-[16px] text-gray-900 mb-4">Passenger Details</h3>
              <div className="space-y-4">
                {passengers.map((passenger) => (
                  <div key={passenger.id} className="flex flex-wrap gap-3 items-start relative group">
                    <input type="text" placeholder="Passenger Name" value={passenger.name} onChange={(e) => handlePassengerChange(passenger.id, 'name', e.target.value)} className="flex-1 min-w-[200px] p-2 border border-gray-300 text-[13px] rounded-sm focus:outline-none focus:border-blue-500" />
                    <input type="number" placeholder="Age" value={passenger.age} onChange={(e) => handlePassengerChange(passenger.id, 'age', e.target.value)} className="w-[80px] p-2 border border-gray-300 text-[13px] rounded-sm focus:outline-none focus:border-blue-500" />
                    <select value={passenger.gender} onChange={(e) => handlePassengerChange(passenger.id, 'gender', e.target.value)} className="w-[110px] p-2 border border-gray-300 text-[13px] rounded-sm bg-white focus:outline-none focus:border-blue-500">
                      <option value="" disabled>Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <select value={passenger.nationality} onChange={(e) => handlePassengerChange(passenger.id, 'nationality', e.target.value)} className="w-[120px] p-2 border border-gray-300 text-[13px] rounded-sm bg-white focus:outline-none focus:border-blue-500">
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                    <select value={passenger.preference} onChange={(e) => handlePassengerChange(passenger.id, 'preference', e.target.value)} className="w-[160px] p-2 border border-gray-300 text-[13px] rounded-sm bg-white focus:outline-none focus:border-blue-500">
                      <option value="No Preference">No Preference</option>
                      <option value="Lower">Lower</option>
                      <option value="Middle">Middle</option>
                      <option value="Upper">Upper</option>
                      <option value="Side Lower">Side Lower</option>
                      <option value="Side Upper">Side Upper</option>
                      <option value="Window">Window Seat</option>
                    </select>
                    {passengers.length > 1 && (
                      <button onClick={() => handleRemovePassenger(passenger.id)} className="p-2 text-gray-400 hover:text-red-500 mt-1">
                        <X className="w-4 h-4 font-bold" strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleAddPassenger} className="mt-4 flex items-center gap-1 text-[13px] font-bold text-[#085294] hover:underline">
                <Plus className="w-4 h-4" /> Add Passenger
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button onClick={() => navigate(-1)} className="px-8 py-2 bg-white border border-gray-300 text-gray-800 font-bold text-[13px] rounded-sm hover:bg-gray-50 shadow-sm">Back</button>
            <button onClick={handleContinue} className="px-8 py-2 bg-[#fb792b] text-white font-bold text-[13px] rounded-sm hover:bg-[#e66b26] shadow-sm uppercase tracking-wide">Continue</button>
          </div>
        </div>

        {/* 🔹 DYNAMIC Fare Summary Sidebar */}
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

export default Checkout;