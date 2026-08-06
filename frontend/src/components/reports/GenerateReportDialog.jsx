import { useState } from "react";
import { X, FileText, Loader } from "lucide-react";

const reportTypes = [
  "Daily Summary",
  "Weekly Report",
  "Compliance",
  "Incident Report",
  "Analytics",
];

const timeRanges = [
  "Last 24 Hours",
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "Custom Range",
];

const formats = ["PDF", "CSV", "HTML", "JSON"];

function GenerateReportDialog({ onClose }) {
  const [formData, setFormData] = useState({
    reportName: "",
    reportType: "Daily Summary",
    timeRange: "Last 24 Hours",
    format: "PDF",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
    }, 2000);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <FileText className="size-4 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Generate Report</h2>
                <p className="text-xs text-muted-foreground">Create a new security report</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close dialog"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Report Name</label>
                <input
                  type="text"
                  value={formData.reportName}
                  onChange={(e) =>
                    setFormData({ ...formData, reportName: e.target.value })
                  }
                  placeholder="e.g., Weekly Threat Summary"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Report Type</label>
                  <select
                    value={formData.reportType}
                    onChange={(e) =>
                      setFormData({ ...formData, reportType: e.target.value })
                    }
                    className="mt-1.5 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {reportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Time Range</label>
                  <select
                    value={formData.timeRange}
                    onChange={(e) =>
                      setFormData({ ...formData, timeRange: e.target.value })
                    }
                    className="mt-1.5 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {timeRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Export Format</label>
                <div className="mt-1.5 flex gap-2">
                  {formats.map((format) => (
                    <button
                      key={format}
                      onClick={() => setFormData({ ...formData, format })}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        formData.format === format
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="size-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default GenerateReportDialog;
