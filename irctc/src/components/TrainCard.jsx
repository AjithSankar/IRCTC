import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosSetup';
import { Loader2, RefreshCw, X } from 'lucide-react';

// Helper to map short codes to full IRCTC class names
const CLASS_NAMES = {
    'SL': 'Sleeper (SL)',
    '3A': 'AC 3 Tier (3A)',
    '2A': 'AC 2 Tier (2A)',
    '1A': 'AC First Class (1A)',
    'CC': 'AC Chair car (CC)',
    '2S': 'Second Sitting (2S)',
    '3E': 'AC 3 Economy (3E)'
};

const TrainCard = ({ train, journeyDate }) => {
    const navigate = useNavigate();

    const [activeClass, setActiveClass] = useState(null);
    const [availabilityData, setAvailabilityData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState(null);

    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            try {
                const classCode = activeClass.classType || 'SL';
                const response = await api.get(`/trains/${train.trainNo}/availability`, {
                    params: { classType: classCode, startDate: journeyDate }
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

    // Helper to format date like "Mon, 11 May"
    const formatIRCTCDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="bg-white border border-gray-300 shadow-sm mb-4">

            {/* 🔹 HEADER: Bold Title, Spaced Runs On, Blue Link */}
            <div className="bg-[#f5f5f5] px-4 py-2 flex justify-between items-center border-b border-gray-200">
                <h2 className="font-bold text-gray-900 text-[15px] tracking-wide uppercase">
                    {train.trainName} ({train.trainNo})
                </h2>
                <div className="text-[13px] flex items-center gap-6">
                    <span className="text-gray-700">Runs On: <span className="font-medium text-gray-900 tracking-[0.2em]">{train.runsOn || 'M T W T F S S'}</span></span>
                    <span className="text-[#085294] font-medium cursor-pointer hover:underline">Train Schedule</span>
                </div>
            </div>

            {/* 🔹 TIME & ROUTE: Authentic IRCTC spacing and pipe separators */}
            <div className="px-4 pt-4 pb-2 flex justify-between items-center bg-white text-[14px]">
                <div className="flex gap-1 items-center">
                    <span className="text-[18px] font-bold text-black">{train.departureTime}</span>
                    <span className="text-black-500 mx-1">|</span>
                    <span className="text-black-700 uppercase">{train.sourceStation}</span>
                    <span className="text-black-500 mx-1">|</span>
                    <span className="text-black-700">{formatIRCTCDate(journeyDate)}</span>
                </div>

                <div className="text-black font-bold text-[12px] tracking-widest">
                    ----- {train.duration} -----
                </div>

                <div className="flex gap-1 items-center">
                    <span className="text-[18px] font-bold text-black">{train.arrivalTime}</span>
                    <span className="text-black-500 mx-1">|</span>
                    <span className="text-black-700 uppercase">{train.destinationStation}</span>
                    <span className="text-black-500 mx-1">|</span>
                    <span className="text-black-700">{formatIRCTCDate(journeyDate)}</span>
                </div>
            </div>

            {/* 🔹 DYNAMIC CLASS SELECTION AREA */}
            {!activeClass ? (
                // STATE 1: No class selected (Show boxes with Refresh)
                <div className="px-4 py-2 flex gap-3 overflow-x-auto">
                    {train.classes.map((cls, idx) => {
                        const classCode = cls.className || cls.classType;
                        const fullName = CLASS_NAMES[classCode] || classCode;

                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveClass(cls)}
                                className="min-w-[140px] text-left px-3 py-2 border border-gray-300 rounded-[4px] bg-white hover:shadow-sm transition-colors"
                            >
                                <div className="font-bold text-[13px] text-gray-900 mb-1">{fullName}</div>
                                <div className="flex items-center gap-1 text-[13px] text-gray-700">
                                    Refresh <RefreshCw className="w-3 h-3" strokeWidth={3} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                // STATE 2: Class selected (Show IRCTC text tabs with orange underline and X button)
                <div className="flex justify-between items-center px-4 mt-2 border-b border-gray-200">
                    <div className="flex gap-6 overflow-x-auto">
                        {train.classes.map((cls, idx) => {
                            const classCode = cls.className || cls.classType;
                            const fullName = CLASS_NAMES[classCode] || classCode;
                            const isActive = (activeClass.className || activeClass.classType) === classCode;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveClass(cls)}
                                    className={`py-2 font-bold text-[13px] transition-colors border-b-2 ${isActive
                                            ? 'border-[#fb792b] text-black'
                                            : 'border-transparent text-gray-800 hover:text-black'
                                        }`}
                                >
                                    {fullName}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => {
                            setActiveClass(null);
                            setSelectedAvailability(null);
                        }}
                        className="p-1 text-gray-900 hover:text-black"
                        title="Close"
                    >
                        <X className="w-4 h-4 font-black" strokeWidth={3} />
                    </button>
                </div>
            )}

            {/* 🔹 6-DAY AVAILABILITY SLIDER */}
            {activeClass && (
                <div className="px-4 pb-2 pt-1 animate-in fade-in duration-200">
                    {loading ? (
                        <div className="h-[70px] flex items-center justify-center border border-gray-200 rounded-[4px] bg-gray-50 mb-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                            <span className="font-bold text-[13px] text-gray-500">Checking Availability...</span>
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full overflow-hidden mb-3">
                            {availabilityData.map((item, idx) => {
                                const isAvailable = item.availabilityStatus.startsWith('AVAILABLE');
                                const isWL = item.availabilityStatus.startsWith('WL');
                                const isSelected = selectedAvailability?.date === item.date;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedAvailability(item)}
                                        className={`flex-1 min-w-[120px] border rounded-[4px] p-2 text-center cursor-pointer transition-all ${isSelected
                                                ? 'border-orange-500 bg-orange-50/20 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <div className="text-[12px] font-bold text-gray-800 mb-1">
                                            {formatIRCTCDate(item.date)}
                                        </div>
                                        <div className={`text-[13px] font-bold ${isAvailable ? 'text-[#21c06d]' : isWL ? 'text-[#e53935]' : 'text-gray-800'}`}>
                                            {item.availabilityStatus}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* 🔹 ACTION AREA: Warning text + Buttons */}
            <div className="px-4 pb-4">
                <div className="text-[12px] font-bold text-gray-900 mb-3">
                    Please check <span className="text-[#085294] cursor-pointer hover:underline">NTES website</span> or <span className="text-[#085294] cursor-pointer hover:underline">NTES app</span> for actual time before boarding
                </div>

                <div className="flex gap-2">
                    {/* Authentic IRCTC "Book Now" Button Style */}
                    <button
                        onClick={handleBookNow}
                        disabled={!selectedAvailability || (!selectedAvailability.availabilityStatus.startsWith('AVAILABLE') && !selectedAvailability.availabilityStatus.startsWith('WL'))}
                        className={`px-6 py-1.5 text-[13px] font-bold rounded-[3px] transition ${selectedAvailability && (selectedAvailability.availabilityStatus.startsWith('AVAILABLE') || selectedAvailability.availabilityStatus.startsWith('WL'))
                                ? 'bg-[#fb792b] text-white hover:bg-[#e66b26]'
                                : 'bg-[#ffebd6] text-white border border-[#ffcd9a] cursor-not-allowed'
                            }`}
                    >
                        Book Now
                    </button>

                    {/* Authentic "OTHER DATES" Button */}
                    <button className="px-4 py-1.5 text-[13px] font-bold rounded-[3px] bg-[#f5f5f5] border border-gray-300 text-gray-800 hover:bg-gray-200 transition uppercase">
                        Other Dates
                    </button>

                    {selectedAvailability && !loading && activeClass && (
                        <div className="ml-2 flex items-center text-[15px] font-bold text-gray-900">
                            ₹{activeClass.price}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default TrainCard;