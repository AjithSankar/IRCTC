import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosSetup';
import { Loader2, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';

const TrainCard = ({ train, journeyDate }) => {
    const navigate = useNavigate();

    // 1. State for the currently selected class tab
    const [activeClass, setActiveClass] = useState(null);

    // 2. State for the 6-day availability data
    const [availabilityData, setAvailabilityData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 NEW STATE: Track which specific day in the slider is selected
    const [selectedAvailability, setSelectedAvailability] = useState(null);

    // 3. Fetch 6-day data whenever the tab or date changes
    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            try {
                const classCode = activeClass.classType || 'SL';
                const response = await api.get(`/trains/${train.trainNo}/availability`, {
                    params: {
                        classType: classCode,
                        startDate: journeyDate
                    }
                });
                setAvailabilityData(response.data);
                if (response.data.length > 0) {
                    setSelectedAvailability(response.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch 6-day availability:", error);
            } finally {
                setLoading(false);
            }
        };

        if (train.trainNo && activeClass) {
            fetchAvailability();
        }
    }, [activeClass, journeyDate, train.trainNo]);


    const handleBookNow = () => {
        if (!selectedAvailability) return;
        const classCode = activeClass.classType || 'SL';
        navigate(`/book?trainId=${train.trainNo}&class=${classCode}&date=${selectedAvailability.date}`);
    };

    return (
        <div className="bg-white border border-gray-300 shadow-sm overflow-hidden rounded-sm mb-4">

            {/* Header: Train Name & Runs On */}
            <div className="bg-[#f0f0f0] px-4 py-2 flex justify-between items-center border-b border-gray-300">
                <h2 className="font-bold text-gray-900 text-[15px]">
                    {train.trainName} ({train.trainNo})
                </h2>
                <div className="text-gray-600 text-[13px] font-medium flex items-center gap-6">
                    <span>Runs On: <span className="font-bold tracking-widest text-gray-800">{train.runsOn || 'M T W T F S S'}</span></span>
                    <span className="text-blue-600 cursor-pointer hover:underline">Train Schedule</span>
                </div>
            </div>

            {/* 🔹 FIX: Condensed Times & Route layout */}
            <div className="px-4 py-3 flex justify-between items-center bg-white text-[13px]">
                <div className="flex gap-2 items-center">
                    <span className="text-xl font-bold text-gray-900">{train.departureTime}</span>
                    <span className="text-gray-500">| {train.sourceStation} | {journeyDate}</span>
                </div>
                <div className="text-gray-400 font-light tracking-widest">
                    ----- {train.duration} -----
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-xl font-bold text-gray-900">{train.arrivalTime}</span>
                    <span className="text-gray-500">| {train.destinationStation} | {journeyDate}</span>
                </div>
            </div>

            {/* Class Tabs */}
            <div className="flex bg-white border-y border-gray-200">
                <div className="flex flex-1">
                    {train.classes.map((cls, idx) => {
                        const classCode = cls.className || cls.classType;
                        const isActive = activeClass && (activeClass.className || activeClass.classType) === classCode;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveClass(isActive ? null : cls)} // Click again to close
                                className={`px-6 py-2.5 font-bold text-[13px] border-r border-gray-200 transition-colors ${isActive
                                    ? 'text-orange-500 border-b-2 border-b-orange-500 bg-orange-50/20'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {classCode}
                            </button>
                        );
                    })}
                </div>
                {/* Optional: A close button on the far right if a tab is open */}
                {activeClass && (
                    <button onClick={() => setActiveClass(null)} className="px-4 text-gray-400 hover:text-gray-800 border-l border-gray-200">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* 🔹 FIX: Only render the slider and book button if a class is actively selected */}
            {activeClass && (
                <div className="p-4 bg-white animate-in slide-in-from-top-2">
                    {loading ? (
                        <div className="h-20 flex items-center justify-center border border-gray-100 rounded bg-gray-50">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                            <span className="font-bold text-[13px] text-gray-500">Checking Availability...</span>
                        </div>
                    ) : (
                        <div className="relative flex items-center group">
                            <div className="flex gap-2 w-full overflow-hidden">
                                {availabilityData.map((item, idx) => {
                                    const isAvailable = item.availabilityStatus.startsWith('AVAILABLE');
                                    const isWL = item.availabilityStatus.startsWith('WL');
                                    const isSelected = selectedAvailability?.date === item.date;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedAvailability(item)}
                                            className={`flex-1 min-w-[120px] border rounded p-2 text-center cursor-pointer transition ${isSelected
                                                    ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                                                    : 'border-gray-200 hover:shadow-sm bg-white'
                                                }`}
                                        >
                                            <div className={`text-[12px] font-bold mb-1 ${isSelected ? 'text-orange-600' : 'text-gray-800'}`}>
                                                {new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className={`text-[13px] font-black ${isAvailable ? 'text-green-600' : isWL ? 'text-red-500' : 'text-gray-800'}`}>
                                                {item.availabilityStatus}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Master Book Now Button */}
                    {selectedAvailability && !loading && (
                        <div className="mt-4 flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[22px] font-black text-gray-800">₹{activeClass.price}</span>
                            </div>
                            <button
                                onClick={handleBookNow}
                                disabled={!selectedAvailability.availabilityStatus.startsWith('AVAILABLE') && !selectedAvailability.availabilityStatus.startsWith('WL')}
                                className={`px-8 py-2 text-[13px] font-black rounded shadow transition text-white ${selectedAvailability.availabilityStatus.startsWith('AVAILABLE') ? 'bg-[#21c06d] hover:bg-green-600' :
                                        selectedAvailability.availabilityStatus.startsWith('WL') ? 'bg-[#fb792b] hover:bg-orange-600' :
                                            'bg-gray-400 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                Book Now
                            </button>
                            <div className="ml-auto text-[11px] text-gray-500">
                                Selected: {selectedAvailability.date}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrainCard;