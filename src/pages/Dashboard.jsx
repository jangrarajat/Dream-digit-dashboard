import { Link } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import {
  BarChart3,
  Calendar,
  ImageUp,
  MessageSquare,
  TrendingUp,
  Clock,
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

const API_BASE_URL = 'https://dream-digit-server.onrender.com/api';

export default function Dashboard() {
  const [todayData, setTodayData] = useState(null);
  const [yesterdayData, setYesterdayData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [lastAddedNumber, setLastAddedNumber] = useState(null);
  const [lastAddedSlot, setLastAddedSlot] = useState(null);
  const [stats, setStats] = useState({
    totalResults: 0,
    totalNumbers: 0,
    completeDays: 0,
    partialDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Get last added number from today's results
  const getLastAddedNumber = (data) => {
    if (!data?.numbers) return null;
    
    const slots = ["index1", "index2", "index3", "index4"];
    const slotNames = {
      index1: "Morning (06:00 AM)",
      index2: "Day (05:00 PM)",
      index3: "Evening (08:00 PM)",
      index4: "Night (11:00 PM)"
    };
    
    // Find the last filled slot (the one with highest index that has value)
    for (let i = slots.length - 1; i >= 0; i--) {
      const slot = slots[i];
      const value = data.numbers[slot];
      if (value && value !== "") {
        return {
          number: value,
          slot: slotNames[slot],
          slotKey: slot
        };
      }
    }
    return null;
  };

  // Fetch today's results
  const fetchTodayResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/results/today`);
      const data = await response.json();
      if (data.success && data.data) {
        setTodayData(data.data);
        const lastNumber = getLastAddedNumber(data.data);
        setLastAddedNumber(lastNumber);
      } else {
        setTodayData(null);
        setLastAddedNumber(null);
      }
    } catch (error) {
      console.error("Error fetching today's results:", error);
      setTodayData(null);
      setLastAddedNumber(null);
    }
  };

  // Fetch yesterday's results
  const fetchYesterdayResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/results/yesterday`);
      const data = await response.json();
      if (data.success && data.data) {
        setYesterdayData(data.data);
      } else {
        setYesterdayData(null);
      }
    } catch (error) {
      console.error("Error fetching yesterday's results:", error);
      setYesterdayData(null);
    }
  };

  // Fetch history and calculate stats
  const fetchHistoryAndStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/results/history`);
      const data = await response.json();
      if (data.success && data.data) {
        setHistoryData(data.data);
        
        // Calculate statistics
        let totalNumbers = 0;
        let completeDays = 0;
        let partialDays = 0;
        
        data.data.forEach(item => {
          const filledCount = Object.values(item.numbers).filter(n => n && n !== "").length;
          totalNumbers += filledCount;
          
          if (item.isComplete || filledCount === 4) {
            completeDays++;
          } else if (filledCount > 0) {
            partialDays++;
          }
        });
        
        setStats({
          totalResults: data.data.length,
          totalNumbers: totalNumbers,
          completeDays: completeDays,
          partialDays: partialDays,
        });
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTodayResults(),
      fetchYesterdayResults(),
      fetchHistoryAndStats(),
    ]);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get today's filled slots count
  const getTodayFilledCount = () => {
    if (!todayData?.numbers) return 0;
    return Object.values(todayData.numbers).filter(n => n && n !== "").length;
  };

  // Get today's result display - Now shows last added number
  const getTodayDisplay = () => {
    if (!todayData || getTodayFilledCount() === 0) {
      return "No result yet";
    }
    if (lastAddedNumber) {
      return lastAddedNumber.number;
    }
    return "No result yet";
  };

  // Get today's result subtitle
  const getTodaySubtitle = () => {
    if (!todayData || getTodayFilledCount() === 0) {
      return "Add today's first number";
    }
    if (lastAddedNumber) {
      return `Last added: ${lastAddedNumber.slot}`;
    }
    return `${getTodayFilledCount()}/4 slots filled`;
  };

  // Get yesterday's result display
  const getYesterdayDisplay = () => {
    if (!yesterdayData?.numbers) return "No results";
    const filledCount = Object.values(yesterdayData.numbers).filter(n => n && n !== "").length;
    if (filledCount === 0) return "No results";
    
    // Get yesterday's last added number
    const slots = ["index1", "index2", "index3", "index4"];
    for (let i = slots.length - 1; i >= 0; i--) {
      const slot = slots[i];
      const value = yesterdayData.numbers[slot];
      if (value && value !== "") {
        return value;
      }
    }
    return "No results";
  };

  // Get yesterday's subtitle
  const getYesterdaySubtitle = () => {
    if (!yesterdayData?.numbers) return "No data available";
    const filledCount = Object.values(yesterdayData.numbers).filter(n => n && n !== "").length;
    if (filledCount === 0) return "No results added";
    return `${filledCount}/4 slots filled`;
  };

  // Get today's status color
  const getTodayStatusColor = () => {
    const filledCount = getTodayFilledCount();
    if (filledCount === 0) return "text-gray-600";
    return "text-green-600";
  };

  return (
    <DashboardSidebar>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome to Dream Digit Admin Dashboard</p>
              {lastUpdate && (
                <p className="text-xs text-gray-400 mt-2">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Result Card - Shows Last Added Number */}
          <div className="admin-card hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Last Number</p>
                <p className={`text-3xl font-bold ${getTodayStatusColor()}`}>
                  {loading ? "..." : getTodayDisplay()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? "Loading..." : getTodaySubtitle()}
                </p>
                {todayData && getTodayFilledCount() > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-green-600">
                      {getTodayFilledCount()} number{getTodayFilledCount() !== 1 ? 's' : ''} added today
                    </p>
                  </div>
                )}
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Award className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Yesterday's Result Card */}
          <div className="admin-card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Yesterday's Last Number</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : getYesterdayDisplay()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? "Loading..." : getYesterdaySubtitle()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Results Card */}
          <div className="admin-card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalResults}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalNumbers} numbers total
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Database className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Complete Days Card */}
          <div className="admin-card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Complete Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.completeDays}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.partialDays} days partial
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Detailed View with Last Added Highlight */}
        {todayData && getTodayFilledCount() > 0 && (
          <div className="admin-card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Today's Results</h2>
              {lastAddedNumber && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 font-semibold">
                    Last Added: {lastAddedNumber.number} ({lastAddedNumber.slot})
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["index1", "index2", "index3", "index4"].map((slot) => {
                const value = todayData.numbers[slot];
                const slotNames = {
                  index1: "🌅 Morning (06:00 AM)",
                  index2: "☀️ Day (05:00 PM)", 
                  index3: "🌆 Evening (08:00 PM)",
                  index4: "🌙 Night (11:00 PM)"
                };
                const isLastAdded = lastAddedNumber && lastAddedNumber.slotKey === slot;
                
                return (
                  <div 
                    key={slot} 
                    className={`p-4 rounded-lg text-center transition-all ${
                      value 
                        ? isLastAdded 
                          ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg transform scale-105" 
                          : "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <p className={`text-xs mb-1 ${value && !isLastAdded ? 'text-gray-600' : value && isLastAdded ? 'text-white opacity-90' : 'text-gray-500'}`}>
                      {slotNames[slot]}
                    </p>
                    <p className={`text-3xl font-bold ${value && !isLastAdded ? 'text-gray-900' : value && isLastAdded ? 'text-white' : 'text-gray-400'}`}>
                      {value || "—"}
                    </p>
                    {isLastAdded && (
                      <p className="text-xs mt-1 text-white opacity-90">⬅️ Just Added</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Completion Rate */}
          <div className="admin-card">
            <h3 className="font-semibold text-gray-900 mb-4">Completion Rate</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Complete Days</span>
                  <span>{stats.completeDays} / {stats.totalResults}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalResults ? (stats.completeDays / stats.totalResults) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Partial Days</span>
                  <span>{stats.partialDays} / {stats.totalResults}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalResults ? (stats.partialDays / stats.totalResults) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="admin-card">
            <h3 className="font-semibold text-gray-900 mb-4">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Date:</span>
                <span className="font-semibold">{format(new Date(), "dd MMM yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Time:</span>
                <span className="font-semibold">{format(new Date(), "hh:mm:ss a")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Status:</span>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  Connected
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auto-Refresh:</span>
                <span className="text-blue-600 font-semibold">Every 30 seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/dashboard/today-result"
              className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-blue-200 group"
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Enter Today's Result
                </h3>
                <p className="text-sm text-gray-600">Add or update today's winning numbers</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0" />
            </Link>

            <Link
              to="/dashboard/chart-upload"
              className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-blue-200 group"
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Upload Chart
                </h3>
                <p className="text-sm text-gray-600">Upload daily chart images</p>
              </div>
              <ImageUp className="h-6 w-6 text-blue-600 flex-shrink-0" />
            </Link>

            <Link
              to="/dashboard/yesterday-result"
              className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-blue-200 group"
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  View Yesterday Result
                </h3>
                <p className="text-sm text-gray-600">Check previous day's complete results</p>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-600 flex-shrink-0" />
            </Link>

            <Link
              to="/dashboard/wait-message"
              className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-blue-200 group"
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Manage Wait Message
                </h3>
                <p className="text-sm text-gray-600">Edit or toggle wait message</p>
              </div>
              <MessageSquare className="h-6 w-6 text-blue-600 flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-card">
            <div className="flex gap-4">
              <Clock className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
                <p className="text-sm text-gray-600">
                  Each section of the dashboard has its own detailed instructions. Navigate using the
                  sidebar menu to manage daily results, upload charts, set wait messages, and more.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Important Notes</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Maximum 4 numbers per day (one per slot)</li>
                  <li>Numbers are 2-digit (00-99)</li>
                  <li>Results update automatically on frontend</li>
                  <li>Dashboard shows the last added number for today</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-900">Updating dashboard data...</p>
            </div>
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}