import DashboardSidebar from "../components/DashboardSidebar";
import { ImageUp, Upload, Trash2, FileImage, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function ChartUpload() {
  const [charts, setCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("dreamDigitCharts");
    if (stored) {
      setCharts(JSON.parse(stored));
    }
  }, []);

  const handleFileUpload = async (e) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
        setMessage({
          type: "error",
          text: "Please upload an image or PDF file",
        });
        setIsLoading(false);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "File size must be less than 10MB",
        });
        setIsLoading(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const today = format(new Date(), "yyyy-MM-dd");
      const newChart = {
        id: `chart-${Date.now()}`,
        date: today,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        timestamp: new Date().toLocaleString(),
      };

      const newCharts = [newChart, ...charts];
      setCharts(newCharts);
      localStorage.setItem("dreamDigitCharts", JSON.stringify(newCharts));
      setMessage({
        type: "success",
        text: `Chart "${file.name}" uploaded successfully!`,
      });

      // Reset input
      e.currentTarget.value = "";
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to upload chart. Please try again.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    const newCharts = charts.filter((c) => c.id !== id);
    setCharts(newCharts);
    localStorage.setItem("dreamDigitCharts", JSON.stringify(newCharts));
    setMessage({
      type: "success",
      text: "Chart deleted successfully!",
    });
  };

  return (
    <DashboardSidebar>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Chart Upload</h1>
          <p className="text-gray-600">
            Upload daily chart images. Charts are stored permanently and organized by date.
          </p>
        </div>

        {/* Upload Section */}
        <div className="admin-card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Chart</h2>

          {message && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg border mb-6 ${
                message.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <div className="h-5 w-5 text-green-600">✓</div>
              ) : (
                <div className="h-5 w-5 text-red-600">✕</div>
              )}
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <div>
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                />
                <ImageUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 mb-1">
                  {isLoading ? "Uploading..." : "Drop chart here or click to upload"}
                </p>
                <p className="text-sm text-gray-600">
                  JPG, PNG, PDF • Max 10MB • Only today's date
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Charts List */}
        {charts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Charts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {charts.map((chart) => (
                <div key={chart.id} className="admin-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileImage className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate">{chart.name}</p>
                        <p className="text-xs text-gray-500">{chart.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(chart.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete chart"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-border">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(chart.date + "T00:00:00"), "MMMM dd, yyyy")}</span>
                    <span>•</span>
                    <span>{chart.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {charts.length === 0 && (
          <div className="text-center py-12">
            <ImageUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No charts uploaded yet</p>
            <p className="text-sm text-gray-500">
              Upload your first chart using the upload section above
            </p>
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}