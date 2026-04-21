import DashboardSidebar from "../components/DashboardSidebar";
import { Calendar, TrendingUp, Clock, CheckCircle, XCircle, Database } from "lucide-react";
import { format, subDays } from "date-fns";
import { useState, useEffect } from "react";

const API_BASE_URL = 'https://dream-digit-server.onrender.com/api';

export default function YesterdayResult() {
  const [yesterdayData, setYesterdayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const yesterdayDate = subDays(new Date(), 1);

  // Fetch yesterday's results
  const fetchYesterdayResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/results/yesterday`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setYesterdayData(data.data);
        setLastFetchTime(new Date());
      } else {
        setYesterdayData(null);
        if (data.message) {
          setError(data.message);
        }
      }
    } catch (error) {
      console.error("Error fetching yesterday's results:", error);
      setError("Failed to fetch yesterday's results. Please check your connection.");
      setYesterdayData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYesterdayResults();
    
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchYesterdayResults();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get slot display name
  const getSlotName = (slot) => {
    const slots = {
      index1: { name: "Morning", time: "06:00 AM", icon: "🌅" },
      index2: { name: "Day", time: "05:00 PM", icon: "☀️" },
      index3: { name: "Evening", time: "08:00 PM", icon: "🌆" },
      index4: { name: "Night", time: "11:00 PM", icon: "🌙" }
    };
    return slots[slot] || { name: slot, time: "", icon: "🎯" };
  };

  // Get all filled slots count
  const getFilledSlotsCount = () => {
    if (!yesterdayData?.numbers) return 0;
    return Object.values(yesterdayData.numbers).filter(n => n && n !== "").length;
  };

  // Check if all slots are filled
  const isComplete = () => {
    if (!yesterdayData) return false;
    return yesterdayData.isComplete || getFilledSlotsCount() === 4;
  };

  return (
    <DashboardSidebar>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Yesterday's Results</h1>
          <p className="text-gray-600">
            Complete results for {format(yesterdayDate, "EEEE, MMMM dd, yyyy")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Date</p>
                <p className="text-2xl font-bold">{format(yesterdayDate, "dd MMM yyyy")}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Numbers Added</p>
                <p className="text-2xl font-bold">{getFilledSlotsCount()}/4</p>
              </div>
              <Database className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className={`rounded-xl p-6 text-white shadow-lg ${
            isComplete() 
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : "bg-gradient-to-r from-yellow-500 to-yellow-600"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Status</p>
                <p className="text-2xl font-bold">
                  {isComplete() ? "Complete" : "Partial"}
                </p>
              </div>
              {isComplete() ? (
                <CheckCircle className="h-8 w-8 opacity-80" />
              ) : (
                <Clock className="h-8 w-8 opacity-80" />
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* All Slots Results */}
          <div className="lg:col-span-2">
            <div className="admin-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Results for {format(yesterdayDate, "dd MMM yyyy")}
                </h2>
                {lastFetchTime && (
                  <p className="text-xs text-gray-500">
                    Last updated: {lastFetchTime.toLocaleTimeString()}
                  </p>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading yesterday's results...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <XCircle className="h-16 w-16 text-red-400 mb-4" />
                  <p className="text-red-600 font-semibold mb-2">{error}</p>
                  <button 
                    onClick={fetchYesterdayResults}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : !yesterdayData || getFilledSlotsCount() === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No results available for yesterday</p>
                  <p className="text-sm text-gray-400">
                    Results will appear here once they are added.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* All 4 Slots Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["index1", "index2", "index3", "index4"].map((slot) => {
                      const slotInfo = getSlotName(slot);
                      const value = yesterdayData.numbers[slot];
                      const isFilled = value && value !== "";
                      
                      return (
                        <div 
                          key={slot} 
                          className={`p-6 rounded-xl border-2 transition-all ${
                            isFilled 
                              ? "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300" 
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-3xl">{slotInfo.icon}</span>
                                <h3 className="text-xl font-bold text-gray-900">
                                  {slotInfo.name}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{slotInfo.time}</p>
                            </div>
                            {isFilled ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          
                          {isFilled ? (
                            <div className="text-center py-6">
                              <p className="text-sm text-gray-600 mb-2">Winning Number</p>
                              <p className="text-6xl font-extrabold text-purple-700 tracking-wider">
                                {value}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-400 text-lg">No result added</p>
                              <p className="text-xs text-gray-400 mt-2">—</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Section */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Numbers</p>
                        <p className="text-2xl font-bold text-purple-700">{getFilledSlotsCount()}/4</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Complete Status</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {isComplete() ? "✅ Yes" : "⏳ No"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {yesterdayData.updatedAt 
                            ? format(new Date(yesterdayData.updatedAt), "hh:mm a")
                            : "Not updated"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {format(yesterdayDate, "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* All Numbers Combined View */}
                  {isComplete() && (
                    <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                      <h3 className="text-lg font-bold text-green-900 mb-3 text-center">
                        🎯 Complete Winning Numbers for Yesterday 🎯
                      </h3>
                      <div className="flex justify-center gap-4 flex-wrap">
                        {["index1", "index2", "index3", "index4"].map((slot) => {
                          const value = yesterdayData.numbers[slot];
                          const slotInfo = getSlotName(slot);
                          return value ? (
                            <div key={slot} className="text-center">
                              <p className="text-xs text-gray-600">{slotInfo.name}</p>
                              <p className="text-3xl font-bold text-green-700">{value}</p>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="admin-card mt-8">
          <div className="flex gap-4">
            <Calendar className="h-6 w-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">About Yesterday's Results</h3>
              <p className="text-sm text-gray-600">
                Yesterday's results are automatically fetched from the database. The page displays 
                all four time slots (Morning, Day, Evening, Night) with their respective winning numbers. 
                Results are updated in real-time as they are added by the admin.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
                  <span>Filled Slot</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                  <span>Empty Slot</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Number Added</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-refresh Indicator */}
        <div className="fixed bottom-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
          🔄 Auto-refreshes every 30 seconds
        </div>
      </div>
    </DashboardSidebar>
  );
}