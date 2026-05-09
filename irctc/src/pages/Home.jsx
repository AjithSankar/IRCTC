import React from 'react';
import { useNavigate } from "react-router-dom";
import SearchForm from "../components/SearchForm"; // Your custom form component
import {
  MapPin, User, Bell, Home as HomeIcon, ChevronRight
} from 'lucide-react';
import { useAuth } from "../components/auth/AuthContext"; // Importing the AuthContext for authentication state
import trainImg from "../assets/vande-bharat.jpg";

export default function Home() {
  // Authentication State
  const { isUserLoggedIn, logout, user } = useAuth();

  if (user?.role !== null && user?.role !== undefined) {
    console.log("User Role:", user.role); // Log the user's role for debugging
  }

  // Initialize navigate function
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLogoutClick = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    await logout(); // Call the logout function from AuthContext

    navigate("/login"); // Or navigate("/logout") if you have a dedicated route
  };

  return (
    <div className="min-h-screen relative font-sans text-gray-800 bg-gray-50 overflow-x-hidden">

      {/* BACKGROUND IMAGE OVERLAY */}
      <div className="absolute inset-0 z-0 h-[85vh]">
        <img
          src={trainImg}
          alt="Train Background"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent"></div>
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 md:px-12 lg:px-24">

        {/* --- TOP UTILITY BAR --- */}
        <header className="flex justify-between items-center py-3 text-sm font-medium border-b border-gray-300/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
              IR
            </div>
            <span className="font-bold tracking-wide text-gray-900">INDIAN RAILWAYS</span>
          </div>

          <div className="flex items-center gap-6 text-gray-700">
            <span className="hidden md:block">03 May 2026 17:37:22</span>
            <div className="flex gap-3">
              <button className="hover:text-blue-600">A-</button>
              <button className="hover:text-blue-600">A</button>
              <button className="hover:text-blue-600">A+</button>
            </div>
            <button className="hover:text-blue-600 font-semibold">हिंदी</button>
            <Bell className="w-5 h-5 cursor-pointer hover:text-blue-600" />

            <div className="flex flex-col items-center leading-none text-blue-900">
              <span className="font-bold text-xl">IRCTC</span>
            </div>
          </div>
        </header>

        {/* --- MAIN NAVIGATION & AUTH BUTTONS --- */}
        <nav className="mt-4 flex justify-center">
          <div className="bg-white/95 backdrop-blur-md shadow-sm rounded-full px-2 py-2 flex items-center gap-1 md:gap-4 lg:gap-8 border border-white">
            <button className="p-3 hover:bg-gray-100 rounded-full transition">
              <HomeIcon className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full font-semibold">Trains</button>
            <button className="px-4 py-2 hover:bg-gray-50 rounded-full font-medium transition">Meals</button>
            <button className="px-4 py-2 hover:bg-gray-50 rounded-full font-medium transition">E-Wallet</button>

          
            {/* Conditional Auth Buttons */}
            <div className="ml-4 flex items-center gap-2">
              {isUserLoggedIn ? (
                <>
                  {/* 🔹 ONLY SHOW IF USER IS ADMIN */}
                  {user?.role === 'ADMIN' && (
                    <button 
                      onClick={() => navigate('/admin')} 
                      className="px-6 py-3 bg-[#0b1b36] text-white rounded-full font-bold hover:bg-blue-900 transition shadow-md"
                    >
                      Admin Panel
                    </button>
                  )}

                  {/* Existing My Bookings & Logout buttons */}
                  <button onClick={() => navigate('/my-bookings')} className="px-6 py-3 bg-[#0b1b36] text-white rounded-full font-semibold hover:bg-blue-900 transition shadow-md">My Bookings</button>
                  <button onClick={handleLogoutClick} className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition shadow-md">Logout</button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="px-6 py-3 bg-[#0b1b36] text-white rounded-full font-semibold hover:bg-blue-900 transition shadow-md"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="px-6 py-3 bg-[#0b1b36] text-white rounded-full font-semibold hover:bg-blue-900 transition shadow-md"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* --- MAIN HERO SECTION --- */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">

          {/* LEFT: BOOKING WIDGET */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 h-fit">

            {/* Optional Tabs */}
            <div className="flex gap-4 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl font-semibold border border-gray-200">
                <MapPin className="w-4 h-4" /> PNR Status
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 rounded-xl font-medium text-gray-500 transition">
                <User className="w-4 h-4" /> Charts / Vacancy
              </button>
            </div>

            <h2 className="text-3xl font-bold mb-6 text-gray-800">Book Ticket</h2>

            {/* Injected the isolated SearchForm component here */}
            <SearchForm />

          </div>

          {/* RIGHT: HERO TEXT */}
          <div className="lg:col-span-7 flex flex-col justify-start pt-10 pl-8">
            <h1 className="text-6xl font-black text-[#0b1b36] tracking-tight mb-4 drop-shadow-sm">
              INDIAN RAILWAYS
            </h1>
            <p className="text-xl text-gray-800 font-bold tracking-widest flex gap-3 drop-shadow-md">
              <span>Safety</span>
              <span className="text-blue-600">•</span>
              <span>Security</span>
              <span className="text-blue-600">•</span>
              <span>Punctuality</span>
            </p>
          </div>

        </main>

      </div>
    </div>
  );
}