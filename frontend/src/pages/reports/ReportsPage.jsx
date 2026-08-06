import { useState, useMemo } from "react";
import { Plus, RefreshCw, Download, FileText } from "lucide-react";
import mockReports from "@/data/mockReports";
import ReportsSummaryCards from "@/components/reports/ReportsSummaryCards";
import ReportFilters from "@/components/reports/ReportFilters";
import SearchBar from "@/components/common/SearchBar";
import ReportsTable from "@/components/reports/ReportsTable";
import Pagination from "@/components/common/Pagination";
import ReportPreviewDrawer from "@/components/reports/ReportPreviewDrawer";
import GenerateReportDialog from "@/components/reports/GenerateReportDialog";

const PAGE_SIZE = 10;

const initialFilters = {
  reportType: "All",
  status: "All",
  dateRange: "All Time",
};

function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const filteredReports = useMemo(() => {
    let result = [...mockReports];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (report) =>
          report.name.toLowerCase().includes(query) ||
          report.id.toLowerCase().includes(query) ||
          report.type.toLowerCase().includes(query) ||
          report.generatedBy.toLowerCase().includes(query)
      );
    }

    if (filters.reportType !== "All") {
      result = result.filter((report) => report.type === filters.reportType);
    }
    if (filters.status !== "All") {
      result = result.filter((report) => report.status === filters.status);
    }
    if (filters.dateRange !== "All Time") {
      const now = new Date();
      let cutoffDate;
      switch (filters.dateRange) {
        case "Today":
          cutoffDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "Last 7 Days":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "Last 30 Days":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "Last 90 Days":
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }
      if (cutoffDate) {
        result = result.filter(
          (report) => new Date(report.generatedDate) >= cutoffDate
        );
      }
    }

    return result;
  }, [searchQuery, filters]);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
  };

  const handleCloseDrawer = () => {
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Generate and export security reports for your honeypot network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <RefreshCw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <FileText className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={() => setShowGenerateDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Generate Report</span>
          </button>
        </div>
      </div>

      <ReportsSummaryCards reports={filteredReports} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search reports..."
          ariaLabel="Search reports"
          className="w-full sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      <ReportFilters filters={filters} onFilterChange={handleFilterChange} />

      <ReportsTable reports={paginatedReports} onViewDetails={handleViewDetails} />

      {filteredReports.length > PAGE_SIZE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredReports.length}
          pageSize={PAGE_SIZE}
          itemLabel="reports"
        />
      )}

      {selectedReport && (
        <ReportPreviewDrawer report={selectedReport} onClose={handleCloseDrawer} />
      )}

      {showGenerateDialog && (
        <GenerateReportDialog onClose={() => setShowGenerateDialog(false)} />
      )}
    </div>
  );
}

export default ReportsPage;
