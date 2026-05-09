import React, { useEffect, useState } from 'react';
import { Database, Play, Train as TrainIcon, Settings, AlertCircle, CheckCircle2, Home } from 'lucide-react';
import api from '../../api/axiosSetup';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [targetDate, setTargetDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobStatus, setJobStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      // Assuming you have your AdminController set up at this endpoint
      const response = await api.get('/admin/trains');
      setTrains(response.data);
    } catch (error) {
      console.error("Failed to fetch master data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBatchJob = async () => {
    if (!targetDate) {
      setJobStatus({ type: 'error', message: 'Please select a target date first.' });
      return;
    }

    setIsGenerating(true);
    setJobStatus(null);

    try {
      const response = await api.post(`/admin/inventory/generate?targetDate=${targetDate}`);
      setJobStatus({ type: 'success', message: response.data });
    } catch (error) {
      setJobStatus({ type: 'error', message: 'Job failed. Check server logs.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Sidebar (Optional, but good for future expansion) */}
      <div className="w-64 bg-[#0b1b36] text-white p-6 hidden md:block">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
          <Settings className="w-6 h-6" /> IRCTC Admin
        </h2>
        <ul className="space-y-4 font-semibold text-gray-300">
          <li className="text-white bg-blue-900 px-4 py-2 rounded-lg cursor-pointer">Dashboard</li>
          <li className="px-4 py-2 hover:text-white cursor-pointer transition">Manage Trains</li>
          <li className="px-4 py-2 hover:text-white cursor-pointer transition">User Directory</li>
        </ul>
        {/* 🔹 NEW: Return to Home Button */}
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="w-full py-4 mt-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition flex justify-center items-center gap-2"
            >
              <Home/> Return Home
            </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-black text-gray-800 mb-8">System Operations</h1>

        {/* Section 1: Database Operations Engine */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Seat Inventory Engine</h2>
          </div>
          <p className="text-gray-500 mb-6 text-sm">
            Manually trigger the daily inventory generation batch job. In production, this runs automatically at midnight for T+60 days.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <input 
              type="date" 
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-600 focus:ring-0 outline-none"
            />
            <button 
              onClick={handleRunBatchJob}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <Play className="w-5 h-5" />}
              {isGenerating ? 'Running Job...' : 'Generate Inventory'}
            </button>

          </div>

          {/* Job Status Alerts */}
          {jobStatus && (
            <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 font-bold ${jobStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {jobStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {jobStatus.message}
            </div>
          )}
        </div>

        {/* Section 2: Master Train Data */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <TrainIcon className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">Train Master Data</h2>
            </div>
            <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition">
              + Add New Train
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500 font-semibold animate-pulse">Loading Database...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b-2 border-gray-200">
                    <th className="p-4 font-bold">Train No.</th>
                    <th className="p-4 font-bold">Name</th>
                    <th className="p-4 font-bold">Route</th>
                    <th className="p-4 font-bold">Runs On</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trains.map((train) => (
                    <tr key={train.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 font-black text-gray-900">{train.trainNo}</td>
                      <td className="p-4 font-bold text-gray-700">{train.trainName}</td>
                      <td className="p-4 text-sm font-semibold text-gray-500">{train.sourceStation} → {train.destinationStation}</td>
                      <td className="p-4 text-sm font-bold text-gray-600">{train.runsOn}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${train.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {train.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {trains.length === 0 && (
                     <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500">No trains found in master database.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;