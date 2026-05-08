import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, ShieldCheck, Info } from 'lucide-react';
import api from '../api/axiosSetup';
import { useAuth } from './auth/AuthContext';

const BookTicket = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {user} = useAuth(); // Get the logged-in user details from AuthContext

  const from = searchParams.get('from'); 
  const to = searchParams.get('to');
  const trainId = searchParams.get('trainId');
  const classType = searchParams.get('class');
  const date = searchParams.get('date');

  // Passenger State: Array of passenger objects
  const [passengers, setPassengers] = useState([
    { name: '', age: '', gender: '', preference: 'No Preference' }
  ]);

  // Mock Fare (In a real app, you would fetch this from the backend)
  const baseFare = classType === 'SL' ? 350 : classType === '3A' ? 950 : 1350;
  const totalFare = baseFare * passengers.length;

  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      alert("Maximum 6 passengers allowed per booking.");
      return;
    }
    setPassengers([...passengers, { name: '', age: '', gender: '', preference: 'No Preference' }]);
  };

  const handleRemovePassenger = (index) => {
    const updatedPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(updatedPassengers);
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    // Validate passengers
    const isValid = passengers.every(p => p.name.trim() !== '' && p.age !== '' && p.gender !== '');
    if (!isValid) {
      alert("Please fill in all passenger details.");
      return;
    }

    try {
      // 2. Generate the unique idempotency key for this specific transaction attempt
      const idempotencyKey = crypto.randomUUID();

      // 3. Construct the payload matching your backend BookingRequestDTO
      const bookingPayload = {
        userId: user.id, // Use the logged-in user's ID from AuthContext
        trainNumber: parseInt(trainId),
        journeyDate: date,
        sourceStation: from,
        destinationStation: to,
        classType: classType,
        category: "GENERAL",
        passengers: passengers.map(p => ({
          name: p.name,
          age: parseInt(p.age),
          gender: p.gender
        }))
      };

      // 4. Send the POST request
      const response = await api.post('/v1/bookings', bookingPayload, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });

      // 5. Instantly redirect to the processing screen using the returned bookingId
      if (response.data && response.data.bookingId) {
        navigate(`/processing/${response.data.bookingId}`);
      }
    } catch (error) {
      console.error("Booking initiation failed:", error);
      alert("Failed to initiate booking. Please try again.");
    }

    // In the next phase, we will submit this data to our Spring Boot backend!
    console.log("Proceeding to payment with:", { trainId, classType, date, passengers, totalFare });
    alert("Passenger Details Saved! Ready for Payment Phase.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Passenger Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Train Summary Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-[#0b1b36]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Train No: {trainId}</h2>
                <p className="text-gray-500 font-medium mt-1">Journey Date: <span className="text-gray-800">{date}</span></p>
                <p className="text-gray-500 font-medium">Class: <span className="text-gray-800">{classType}</span></p>
              </div>
              <span className="px-4 py-1 bg-green-100 text-green-700 font-bold rounded-full text-sm">
                Available
              </span>
            </div>
          </div>

          {/* Passenger Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-orange-500" />
              Passenger Details
            </h3>

            <form id="booking-form" onSubmit={handleProceedToPayment} className="space-y-6">
              {passengers.map((passenger, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                  
                  {/* Remove Button */}
                  {passengers.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemovePassenger(index)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <h4 className="font-bold text-gray-700 mb-4">Passenger {index + 1}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <input 
                        type="number" 
                        placeholder="Age" 
                        min="1" max="120"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <select 
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        required
                      >
                        <option value="" disabled>Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <select 
                        value={passenger.preference}
                        onChange={(e) => handlePassengerChange(index, 'preference', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="No Preference">No Preference</option>
                        <option value="Lower">Lower</option>
                        <option value="Middle">Middle</option>
                        <option value="Upper">Upper</option>
                        <option value="Side Lower">Side Lower</option>
                        <option value="Side Upper">Side Upper</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleAddPassenger}
                className="text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                + Add Passenger
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Fare Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">Fare Summary</h3>
            
            <div className="space-y-3 mb-6 text-gray-700 font-medium">
              <div className="flex justify-between">
                <span>Ticket Fare ({passengers.length} x ₹{baseFare})</span>
                <span>₹{totalFare}</span>
              </div>
              <div className="flex justify-between">
                <span>IRCTC Convenience Fee</span>
                <span>₹17.70</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Travel Insurance</span>
                <span>₹0.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4 mb-6">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-black text-[#0b1b36]">₹{totalFare + 17.7}</span>
            </div>

            <button 
              type="submit" 
              form="booking-form"
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> Proceed to Pay
            </button>
            
            <div className="mt-4 flex gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <p>By clicking Proceed, you agree to the Terms and Conditions of Indian Railways.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookTicket;