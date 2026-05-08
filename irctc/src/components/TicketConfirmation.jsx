import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Download, Home, AlertCircle, Trash2 } from 'lucide-react';
import api from '../api/axiosSetup';

const TicketConfirmation = () => {
    const { bookingId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const statusParam = searchParams.get('status');
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    // 🔹 NEW: Track which passengers are selected for cancellation
    const [selectedPassengers, setSelectedPassengers] = useState([]);

    // Fetch the final booking details to display the ticket
    const fetchFinalDetails = async () => {
        try {
            const response = await api.get(`/v1/bookings/${bookingId}`);
            setBookingDetails(response.data);
            setSelectedPassengers([]); // Reset selections on reload
        } catch (error) {
            console.error("Failed to load final ticket details", error);
        }
    };

    useEffect(() => {
        fetchFinalDetails();
    }, [bookingId]);

    // Handle Checkbox Toggle
    const togglePassengerSelection = (passengerId) => {
        setSelectedPassengers(prev =>
            prev.includes(passengerId)
                ? prev.filter(id => id !== passengerId)
                : [...prev, passengerId]
        );
    };


    // 🔹 The Cancellation Handler
    const handleCancelTicket = async () => {

        if (selectedPassengers.length === 0) {
            alert("Please select at least one passenger to cancel.");
            return;
        }

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this ticket? This action cannot be undone and standard IRCTC cancellation charges will apply."
        );

        if (!confirmCancel) return;

        setIsCancelling(true);

        try {
            // 🔹 Send the selected IDs to the new payload structure
            await api.post(`/v1/bookings/${bookingId}/cancel`, {
                passengerIdsToCancel: selectedPassengers
            });

            alert("Ticket cancelled successfully. Refund will be processed in 3-5 working days.");
            fetchFinalDetails(); // Refresh the page to show CANCELLED status
        } catch (error) {
            console.error("Failed to cancel ticket:", error);
            alert("Failed to cancel ticket. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    if (!bookingDetails) return null; // Or a small loading spinner

    const isSuccess = ['CONFIRMED', 'PARTIALLY_CONFIRMED', 'PARTIALLY_CANCELLED'].includes(bookingDetails.status);
    const isFullyCancelled = bookingDetails.status === 'CANCELLED';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Status Header */}
                <div className={`rounded-t-3xl p-8 text-center text-white ${isSuccess ? 'bg-green-600' : isFullyCancelled ? 'bg-gray-600' : 'bg-red-600'}`}>
                    <div className="flex justify-center mb-4">
                        {isSuccess ? <CheckCircle2 className="w-16 h-16" /> : isFullyCancelled ? <AlertCircle className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
                    </div>
                    <h1 className="text-3xl font-black mb-2">
                        {bookingDetails.status.replace('_', ' ')}
                    </h1>
                </div>


                {/* Ticket Details Body */}
                <div className="bg-white p-8 rounded-b-3xl shadow-xl border border-gray-100">

                    <div className="flex justify-between items-center border-b pb-6 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Booking ID</p>
                            <p className="text-lg font-bold text-gray-900">{bookingId}</p>
                        </div>
                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {bookingDetails.status}
                            </span>
                        </div>
                    </div>

                    {/* Passenger Roster with Checkboxes */}
                    {(isSuccess || isFullyCancelled) && bookingDetails.passengers && (
                        <div className="space-y-4 mb-8">
                            <h3 className="font-bold text-gray-800 border-b pb-2 flex justify-between items-center">
                                Passenger Details
                                {!isFullyCancelled && <span className="text-xs text-gray-500 font-normal">Select to cancel</span>}
                            </h3>

                            {bookingDetails.passengers.map((p) => {
                                const isPassCancelled = p.status === 'CANCELLED';

                                return (
                                    <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-transparent hover:border-gray-200 transition">
                                        <div className="flex items-center gap-4">
                                            {/* 🔹 THE CHECKBOX */}
                                            {!isFullyCancelled && !isPassCancelled && (
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                    checked={selectedPassengers.includes(p.id)}
                                                    onChange={() => togglePassengerSelection(p.id)}
                                                />
                                            )}

                                            <div>
                                                <p className={`font-bold ${isPassCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.age} yrs | {p.gender}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className={`font-bold ${p.status === 'CONFIRMED' ? 'text-green-600' : isPassCancelled ? 'text-red-500' : 'text-orange-500'}`}>
                                                {p.status}
                                            </p>
                                            {p.seatNumber && <p className="text-xs text-gray-600">Coach: {p.coach} | Seat: {p.seatNumber}</p>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 mt-8 flex-wrap">
                        {!isFullyCancelled && (
                            <>
                                <button className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#0b1b36] text-white rounded-xl font-bold hover:bg-blue-900 transition">
                                    <Download className="w-4 h-4" /> Download Ticket
                                </button>
                                {/* Cancel Button now only triggers if passengers are selected */}
                                <button
                                    onClick={handleCancelTicket}
                                    disabled={isCancelling || selectedPassengers.length === 0}
                                    className="flex-1 flex justify-center items-center gap-2 py-3 border-2 border-red-100 text-red-600 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {isCancelling ? 'Cancelling...' : selectedPassengers.length > 0 ? `Cancel ${selectedPassengers.length} Selected` : 'Cancel Passengers'}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="w-full flex justify-center items-center gap-2 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                        >
                            <Home className="w-4 h-4" /> Return to Bookings
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TicketConfirmation;