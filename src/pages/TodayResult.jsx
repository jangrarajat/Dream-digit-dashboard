import { useState, useEffect } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { Calendar, Upload, Clock, AlertCircle, CheckCircle, Trash2, Database, TrendingUp, Edit2, Save, X, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";

const API_BASE_URL = 'https://dream-digit-server.onrender.com/api';

export default function TodayResult() {
  const [number, setNumber] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("index1");
  const [results, setResults] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [remainingSlots, setRemainingSlots] = useState(4);
  const [isComplete, setIsComplete] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch today's results
  const fetchTodayResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/results/today`);
      const data = await response.json();
      if (data.success && data.data) {
        setTodayData(data.data);
        const filledCount = Object.values(data.data.numbers).filter(n => n && n !== "" && n !== "WAIT").length;
        setRemainingSlots(4 - filledCount);
        setIsComplete(data.data.isComplete || filledCount === 4);
      } else {
        setTodayData(null);
        setRemainingSlots(4);
        setIsComplete(false);
      }
    } catch (error) {
      console.error("Error fetching today's results:", error);
      setTodayData(null);
      setRemainingSlots(4);
      setIsComplete(false);
    }
  };

  // Fetch all results history
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/results/history`);
      const data = await response.json();
      if (data.success && data.data) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchTodayResults();
    fetchHistory();
  }, []);

  const getSlotName = (slot) => {
    const slots = {
      index1: "🌅 Morning (06:00 AM)",
      index2: "☀️ Day (05:00 PM)",
      index3: "🌆 Evening (08:00 PM)",
      index4: "🌙 Night (11:00 PM)"
    };
    return slots[slot] || slot;
  };

  const getCurrentSlotValue = () => {
    if (!todayData?.numbers) return "";
    return todayData.numbers[selectedSlot] || "";
  };

  // Handle save result
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!number.trim()) {
      setMessage({ type: "error", text: "Please enter a number" });
      return;
    }

    if (!/^\d+$/.test(number)) {
      setMessage({ type: "error", text: "Please enter only digits" });
      return;
    }

    if (number.length > 2) {
      setMessage({ type: "error", text: "Number should be 1-2 digits (00-99)" });
      return;
    }

    if (getCurrentSlotValue() && getCurrentSlotValue() !== "" && getCurrentSlotValue() !== "WAIT") {
      setMessage({ type: "error", text: `${getSlotName(selectedSlot)} already has a number. Use edit option to update.` });
      return;
    }

    if (isComplete) {
      setMessage({ type: "error", text: "All 4 slots for today are already filled!" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/results/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: selectedSlot,
          number: number.padStart(2, "0")
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: `Result saved successfully for ${getSlotName(selectedSlot)}!` });
        setNumber("");
        await fetchTodayResults();
        await fetchHistory();
        
        if (data.data?.isComplete) {
          setMessage({ type: "success", text: `🎉 All slots filled! Today's results are complete!` });
        }
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save result" });
      }
    } catch (error) {
      console.error("Error saving result:", error);
      setMessage({ type: "error", text: "Failed to save result. Please check your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit slot
  const handleEditSlot = (slot, currentValue) => {
    setEditingSlot(slot);
    setEditValue(currentValue);
  };

  // Handle update slot
  const handleUpdateSlot = async () => {
    if (!editValue.trim() || !/^\d+$/.test(editValue) || editValue.length > 2) {
      setMessage({ type: "error", text: "Please enter valid 1-2 digit number" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/results/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          index: editingSlot,
          number: editValue.padStart(2, "0")
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: `Updated ${getSlotName(editingSlot)} to ${editValue}!` });
        setEditingSlot(null);
        setEditValue("");
        await fetchTodayResults();
        await fetchHistory();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update" });
      }
    } catch (error) {
      console.error("Error updating:", error);
      setMessage({ type: "error", text: "Failed to update" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete single slot
  const handleDeleteSlot = async (slot) => {
    if (!window.confirm(`Delete ${getSlotName(slot)}? This action cannot be undone.`)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/results/delete/${today}/${slot}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: `Deleted ${getSlotName(slot)} successfully!` });
        await fetchTodayResults();
        await fetchHistory();
        setSelectedIndices([]);
        setBulkDeleteMode(false);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete" });
      }
    } catch (error) {
      console.error("Error deleting:", error);
      setMessage({ type: "error", text: "Failed to delete" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk delete selected indices
  const handleBulkDelete = async () => {
    if (selectedIndices.length === 0) {
      setMessage({ type: "error", text: "Please select at least one slot to delete" });
      return;
    }

    if (!window.confirm(`Delete ${selectedIndices.length} selected slot(s)? This action cannot be undone.`)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/results/bulk-delete-indices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          indices: selectedIndices
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        await fetchTodayResults();
        await fetchHistory();
        setSelectedIndices([]);
        setBulkDeleteMode(false);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete" });
      }
    } catch (error) {
      console.error("Error bulk deleting:", error);
      setMessage({ type: "error", text: "Failed to delete" });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle index selection for bulk delete
  const toggleIndexSelection = (slot) => {
    if (selectedIndices.includes(slot)) {
      setSelectedIndices(selectedIndices.filter(s => s !== slot));
    } else {
      setSelectedIndices([...selectedIndices, slot]);
    }
  };

  // Handle delete from history
  const handleDeleteHistory = async (date) => {
    if (!window.confirm(`Delete all results for ${date}? This action cannot be undone.`)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/results/delete-day/${date}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: `Deleted results for ${date}` });
        await fetchHistory();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete" });
      }
    } catch (error) {
      console.error("Error deleting history:", error);
      setMessage({ type: "error", text: "Failed to delete" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardSidebar>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Today's Result Management</h1>
          <p className="text-gray-600">Manage today's winning numbers for all time slots. Maximum 4 numbers per day.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Date</p>
                <p className="text-2xl font-bold">{format(new Date(), "dd MMM yyyy")}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Numbers Added</p>
                <p className="text-2xl font-bold">{4 - remainingSlots}/4</p>
              </div>
              <Database className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Status</p>
                <p className="text-2xl font-bold">{isComplete ? "Complete" : `${remainingSlots} Slots Left`}</p>
              </div>
              {isComplete ? <CheckCircle className="h-8 w-8 opacity-80" /> : <Clock className="h-8 w-8 opacity-80" />}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Bulk Delete</p>
                <button
                  onClick={() => setBulkDeleteMode(!bulkDeleteMode)}
                  className="text-sm bg-white text-orange-600 px-3 py-1 rounded-lg mt-1"
                >
                  {bulkDeleteMode ? "Cancel" : "Select Multiple"}
                </button>
              </div>
              <Trash2 className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <div className="admin-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Select Time Slot</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["index1", "index2", "index3", "index4"].map((slot) => {
                      const currentValue = todayData?.numbers?.[slot] || "";
                      const isFilled = currentValue !== "" && currentValue !== "WAIT";
                      const isSelected = bulkDeleteMode && selectedIndices.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => bulkDeleteMode ? toggleIndexSelection(slot) : setSelectedSlot(slot)}
                          className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                            selectedSlot === slot && !bulkDeleteMode
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          } ${isFilled ? "opacity-75" : ""} ${isSelected ? "border-green-500 bg-green-50" : ""}`}
                        >
                          {bulkDeleteMode && (
                            <div className="absolute top-2 right-2">
                              {isSelected ? <CheckSquare className="h-5 w-5 text-green-600" /> : <Square className="h-5 w-5 text-gray-400" />}
                            </div>
                          )}
                          <p className="font-semibold text-sm">{getSlotName(slot)}</p>
                          {isFilled ? (
                            <p className="text-xs text-green-600 mt-1">✓ Added: {currentValue}</p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-1">Not added yet</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {bulkDeleteMode && selectedIndices.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Selected ({selectedIndices.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIndices([])}
                      className="px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {!bulkDeleteMode && (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Selected: <span className="font-semibold">{getSlotName(selectedSlot)}</span></p>
                      {getCurrentSlotValue() && getCurrentSlotValue() !== "WAIT" && (
                        <p className="text-sm text-green-600 mt-1">Current value: <span className="font-bold">{getCurrentSlotValue()}</span></p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Winning Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={number}
                          onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
                          className="admin-input text-3xl font-bold text-center tracking-widest py-4"
                          placeholder="00"
                          maxLength={2}
                          disabled={isLoading || (getCurrentSlotValue() !== "" && getCurrentSlotValue() !== "WAIT") || isComplete}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Enter 1-2 digits (00-99)</p>
                    </div>

                    {message && (
                      <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                        message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}>
                        {message.type === "success" ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>{message.text}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || isComplete || (getCurrentSlotValue() !== "" && getCurrentSlotValue() !== "WAIT")}
                      className={`w-full admin-button h-12 text-base gap-2 ${
                        (isComplete || (getCurrentSlotValue() !== "" && getCurrentSlotValue() !== "WAIT")) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Upload className="h-5 w-5" />
                      {isLoading ? "Saving..." : "Save Result"}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Info Box */}
          <div className="lg:col-span-1">
            <div className="admin-card space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Rules & Guidelines</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Maximum 4 numbers per day</li>
                    <li>• One number per time slot</li>
                    <li>• Enter 1-2 digits (00-99)</li>
                    <li>• Use Edit to update existing numbers</li>
                    <li>• Use Bulk Delete to remove multiple slots</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Today's Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${((4 - remainingSlots) / 4) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{4 - remainingSlots} of 4 slots filled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Results Preview with Edit/Delete */}
        {todayData && Object.values(todayData.numbers).some(n => n && n !== "" && n !== "WAIT") && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Results Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {["index1", "index2", "index3", "index4"].map((slot) => {
                const value = todayData.numbers[slot];
                const isFilled = value && value !== "" && value !== "WAIT";
                const isEditing = editingSlot === slot;
                
                return (
                  <div key={slot} className={`admin-card ${isFilled ? 'border-l-4 border-l-green-500' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{getSlotName(slot)}</p>
                        {isEditing ? (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value.replace(/\D/g, ""))}
                              className="border rounded px-2 py-1 w-20 text-center"
                              maxLength={2}
                              autoFocus
                            />
                            <button onClick={handleUpdateSlot} className="text-green-600 hover:text-green-700">
                              <Save className="h-5 w-5" />
                            </button>
                            <button onClick={() => setEditingSlot(null)} className="text-gray-600 hover:text-gray-700">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-3xl font-bold text-gray-900">{isFilled ? value : "—"}</p>
                        )}
                      </div>
                      {isFilled && !isEditing && (
                        <div className="flex gap-2">
                          <button onClick={() => handleEditSlot(slot, value)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteSlot(slot)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results History with Delete Option */}
        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Results History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-900">Morning</th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-900">Day</th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-900">Evening</th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-900">Night</th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-900">Status</th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.date} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{format(new Date(result.date), "dd MMM yyyy")}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                          result.numbers?.index1 && result.numbers.index1 !== "WAIT" ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}>{result.numbers?.index1 && result.numbers.index1 !== "WAIT" ? result.numbers.index1 : "—"}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                          result.numbers?.index2 && result.numbers.index2 !== "WAIT" ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}>{result.numbers?.index2 && result.numbers.index2 !== "WAIT" ? result.numbers.index2 : "—"}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                          result.numbers?.index3 && result.numbers.index3 !== "WAIT" ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}>{result.numbers?.index3 && result.numbers.index3 !== "WAIT" ? result.numbers.index3 : "—"}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                          result.numbers?.index4 && result.numbers.index4 !== "WAIT" ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}>{result.numbers?.index4 && result.numbers.index4 !== "WAIT" ? result.numbers.index4 : "—"}</span>
                      </td>
                      <td className="p-3 text-center">
                        {result.isComplete ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">✓ Complete</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">⏳ Partial</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteHistory(result.date)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}