import DashboardSidebar from "../components/DashboardSidebar";
import { MessageSquare, ToggleRight, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function WaitMessage() {
  const [config, setConfig] = useState({
    enabled: false,
    message: "Please wait, result is coming soon",
  });
  const [tempMessage, setTempMessage] = useState(config.message);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("dreamDigitWaitMessage");
    if (stored) {
      const parsed = JSON.parse(stored);
      setConfig(parsed);
      setTempMessage(parsed.message);
    }
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newConfig = { ...config, enabled: !config.enabled };
      setConfig(newConfig);
      localStorage.setItem("dreamDigitWaitMessage", JSON.stringify(newConfig));

      setMessage({
        type: "success",
        text: `Wait message ${newConfig.enabled ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update message. Please try again.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMessage = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!tempMessage.trim()) {
      setMessage({
        type: "error",
        text: "Message cannot be empty",
      });
      return;
    }

    if (tempMessage.length > 200) {
      setMessage({
        type: "error",
        text: "Message must be less than 200 characters",
      });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newConfig = { ...config, message: tempMessage };
      setConfig(newConfig);
      localStorage.setItem("dreamDigitWaitMessage", JSON.stringify(newConfig));

      setMessage({
        type: "success",
        text: "Message saved successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save message. Please try again.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefault = () => {
    setTempMessage("Please wait, result is coming soon");
  };

  return (
    <DashboardSidebar>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Wait Message</h1>
          <p className="text-gray-600">
            Set a custom message to display when results are not yet available.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Message Configuration */}
          <div className="lg:col-span-2">
            <div className="admin-card mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Message Status</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {config.enabled ? "Message is currently enabled" : "Message is currently disabled"}
                  </p>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    config.enabled
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ToggleRight className={`h-5 w-5 transition-transform ${config.enabled ? "" : ""}`} />
                  {config.enabled ? "On" : "Off"}
                </button>
              </div>

              {message && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border mb-6 ${
                    message.type === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
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
            </div>

            {/* Message Editor */}
            <div className="admin-card">
              <form onSubmit={handleSaveMessage} className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    Message Text
                  </label>
                  <textarea
                    id="message"
                    value={tempMessage}
                    onChange={(e) => setTempMessage(e.currentTarget.value)}
                    disabled={isLoading}
                    className="w-full admin-input !py-3 resize-none"
                    rows={4}
                    maxLength={200}
                    placeholder="Enter your wait message..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {tempMessage.length}/200 characters
                    </p>
                    <button
                      type="button"
                      onClick={resetToDefault}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || tempMessage === config.message}
                  className="w-full admin-button h-11"
                >
                  {isLoading ? "Saving..." : "Save Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Preview and Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preview */}
            <div className="admin-card">
              <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
              <div
                className={`p-6 rounded-lg text-center border-2 transition-all ${
                  config.enabled
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {config.enabled ? (
                  <>
                    <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-900 font-medium mb-2">{config.message}</p>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Message disabled</p>
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="admin-card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Tips
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Keep message short and clear</li>
                <li>• Use 200 characters max</li>
                <li>• Toggle ON/OFF as needed</li>
                <li>• Changes save immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  );
}