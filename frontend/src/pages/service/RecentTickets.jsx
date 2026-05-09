import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  User,
  Wrench,
  Truck,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  DownloadCloud,
} from "lucide-react";
import { api } from "../../contexts/AuthContext";
import RecentTicketsSkeleton from '../../components/skeletons/RecentTicketsSkeleton';

export default function RecentTickets() {
  const [completedTickets, setCompletedTickets] = useState([]);
  const [jobCardsMap, setJobCardsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  useEffect(() => {
    fetchCompletedTickets();
    setLastRefreshTime(Date.now());
  }, []);

  const fetchCompletedTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tickets");
      const tickets = data.tickets || data.data || [];
      
      // Filter tickets that are dispatched or closed (completed/ready to be closed) OR submitted to sales
      const completed = tickets.filter((t) => 
        t.status === "dispatched" || t.status === "closed" || t.serviceReport?.submittedToSales
      );
      setCompletedTickets(completed.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      ));

      // Fetch jobcards for completed tickets
      const jobCardsRes = await api.get("/jobcards");
      const allJobCards = jobCardsRes.data.jobCards || jobCardsRes.data.data || [];
      
      // Create a map of ticket ID to jobcard
      const cardMap = {};
      allJobCards.forEach((card) => {
        const ticketId = card.ticket?._id || card.ticket;
        cardMap[ticketId] = card;
      });
      setJobCardsMap(cardMap);
      setLastRefreshTime(Date.now());
    } catch (error) {
      if (error.response?.status === 429) {
        showMessage("error", "Rate limit exceeded. Please wait before refreshing again.");
      } else {
        showMessage("error", error.response?.data?.message || "Failed to load completed tickets");
      }
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleRefresh = async () => {
    // Debounce: prevent refresh if less than 5 seconds since last refresh
    const timeSinceLastRefresh = Date.now() - lastRefreshTime;
    if (timeSinceLastRefresh < 5000) {
      showMessage("error", "Please wait 5 seconds before refreshing again");
      return;
    }
    await fetchCompletedTickets();
  };

  const downloadReportAsText = (ticket, jobCard) => {
    if (!jobCard) {
      showMessage("error", "Job card not found");
      return;
    }

    const reportContent = `
╔════════════════════════════════════════════════════════════════╗
║          SERVICE COMPLETION REPORT - FINAL                     ║
╚════════════════════════════════════════════════════════════════╝

TICKET INFORMATION
─────────────────────────────────────────────────────────────────
Ticket ID:            ${ticket.ticketId || "N/A"}
Customer:             ${ticket.customer?.name || "N/A"}
Status:               ${ticket.status?.toUpperCase() || "N/A"}
Created Date:         ${new Date(ticket.createdAt).toLocaleDateString() || "N/A"}
Last Updated:         ${new Date(ticket.updatedAt).toLocaleDateString() || "N/A"}

JOB CARD DETAILS
─────────────────────────────────────────────────────────────────
Job Card ID:          ${jobCard.jobCardId || "N/A"}
Engineer:             ${jobCard.engineer?.name || "N/A"}
Received Date:        ${jobCard.receivedDate ? new Date(jobCard.receivedDate).toLocaleDateString() : "N/A"}
Unit Condition:       ${jobCard.unitCondition || "N/A"}

DIAGNOSTIC INFORMATION
─────────────────────────────────────────────────────────────────
Error Code:           ${jobCard.diagnostic?.errorCode || "N/A"}
Fault Identified:     ${jobCard.diagnostic?.faultIdentified || "N/A"}
Root Cause:           ${jobCard.diagnostic?.rootCause || "N/A"}

REPAIR DECISION
─────────────────────────────────────────────────────────────────
Decision:             ${jobCard.repairDecision?.toUpperCase() || "PENDING"}
${jobCard.repairDecision === "non_repairable" ? `Reason:               ${jobCard.nonRepairableReason || "N/A"}\n` : ""}Repair Start:         ${jobCard.repairStartDate ? new Date(jobCard.repairStartDate).toLocaleDateString() : "N/A"}
Repair Completion:    ${jobCard.repairCompletionDate ? new Date(jobCard.repairCompletionDate).toLocaleDateString() : "N/A"}
Notes:                ${jobCard.repairNotes || "N/A"}

SPARE PARTS USED
─────────────────────────────────────────────────────────────────
${jobCard.sparesUsed && jobCard.sparesUsed.length > 0 
  ? jobCard.sparesUsed.map((s) => 
      `  • ${s.componentName} (Part: ${s.partNumber || "N/A"}) - Qty: ${s.quantity} - Cost: ₹${(parseFloat(s.unitCost) || 0).toLocaleString("en-IN")}`
    ).join("\n")
  : "None"}

TESTING & QUALITY CHECK
─────────────────────────────────────────────────────────────────
Test Date:            ${jobCard.testing?.testDate ? new Date(jobCard.testing.testDate).toLocaleDateString() : "N/A"}
Test Engineer:        ${jobCard.testing?.testEngineer?.name || "N/A"}
Test Result:          ${jobCard.testing?.testResult?.toUpperCase() || "PENDING"}
QC Passed:            ${jobCard.testing?.qualityCheckPassed ? "YES ✓" : "NO ✗"}
QC Remarks:           ${jobCard.testing?.remarks || "N/A"}

DISPATCH INFORMATION
─────────────────────────────────────────────────────────────────
Packing Completed:    ${jobCard.dispatch?.packingCompleted ? "YES ✓" : "NO"}
Packing Material:     ${jobCard.dispatch?.packingMaterial || "N/A"}
Dispatch Date:        ${jobCard.dispatch?.dispatchDate ? new Date(jobCard.dispatch.dispatchDate).toLocaleDateString() : "N/A"}
Courier Service:      ${jobCard.dispatch?.courierName || "N/A"}
Tracking Number:      ${jobCard.dispatch?.trackingNumber || "N/A"}
Dispatched By:        ${jobCard.dispatch?.dispatchedBy?.name || "N/A"}

═══════════════════════════════════════════════════════════════════
Generated on: ${new Date().toLocaleString()}
Report Status: FINAL - SERVICE COMPLETED
═══════════════════════════════════════════════════════════════════
    `.trim();

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent)
    );
    element.setAttribute("download", `Report_${ticket.ticketId}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showMessage("success", "Report downloaded successfully!");
  };

  const viewTicketDetails = (ticket) => {
    // For now, show a modal-like alert with ticket details
    const details = `
TICKET ID: ${ticket.ticketId}
CUSTOMER: ${ticket.customer?.name || "N/A"}
STATUS: ${ticket.status?.toUpperCase()}
CREATED: ${new Date(ticket.createdAt).toLocaleDateString()}

For full details, expand the ticket section below.
    `;
    alert(details);
  };

  const exportToCSV = () => {
    if (completedTickets.length === 0) {
      showMessage("error", "No tickets to export");
      return;
    }

    let csv = "Ticket ID,Customer,Engineer,Status,Repair Decision,Completion Date,Testing Result,QC Status\n";
    
    completedTickets.forEach((ticket) => {
      const jobCard = jobCardsMap[ticket._id];
      csv += `"${ticket.ticketId}","${ticket.customer?.name || 'N/A'}","${jobCard?.engineer?.name || 'N/A'}","${ticket.status}","${jobCard?.repairDecision || 'N/A'}","${jobCard?.repairCompletionDate ? new Date(jobCard.repairCompletionDate).toLocaleDateString() : 'N/A'}","${jobCard?.testing?.testResult || 'N/A'}","${jobCard?.testing?.qualityCheckPassed ? 'Pass' : 'Fail'}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recent-tickets-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showMessage("success", "Report exported successfully!");
  };

  const getRepairDecisionColor = (decision) => {
    switch (decision) {
      case "repairable":
        return "bg-green-100 text-green-800";
      case "non_repairable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getTestResultColor = (result) => {
    switch (result) {
      case "pass":
        return "text-green-600";
      case "fail":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={32} />
              Service Completed / Dispatched Tickets
            </h1>
            <p className="text-slate-600 mt-2">Final reports, testing results, and dispatch status</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Click to refresh dispatched tickets (minimum 5 seconds between refreshes)"
            >
              <CheckCircle size={18} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Completed</p>
                <p className="text-2xl font-bold text-slate-900">{completedTickets.length}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-600 text-sm font-medium">Repaired Units</p>
                <p className="text-2xl font-bold text-slate-900">
                  {completedTickets.filter(
                    (t) => jobCardsMap[t._id]?.repairDecision === "repairable"
                  ).length}
                </p>
              </div>
              <Wrench className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-600 text-sm font-medium">Non-Repairable</p>
                <p className="text-2xl font-bold text-slate-900">
                  {completedTickets.filter(
                    (t) => jobCardsMap[t._id]?.repairDecision === "non_repairable"
                  ).length}
                </p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <RecentTicketsSkeleton />
      )}

      {/* Empty State */}
      {!loading && completedTickets.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No Tickets Dispatched Yet</h2>
          <p className="text-slate-600">Once you dispatch a ticket from the Service Dashboard, it will appear here</p>
        </div>
      )}

      {/* Tickets List */}
      {!loading && completedTickets.length > 0 && (
        <div className="space-y-4">
          {completedTickets.map((ticket) => {
            const jobCard = jobCardsMap[ticket._id];
            const isExpanded = expandedTicket === ticket._id;

            return (
              <div
                key={ticket._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedTicket(isExpanded ? null : ticket._id)
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex-shrink-0">
                      <CheckCircle className="text-green-600" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">
                        {ticket.ticketId}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {ticket.customer?.name || "Unknown Customer"}
                      </p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-slate-700">
                        {jobCard?.engineer?.name || "Unassigned"}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getRepairDecisionColor(
                          jobCard?.repairDecision
                        )}`}
                      >
                        {jobCard?.repairDecision === "repairable"
                          ? "✓ Repaired"
                          : jobCard?.repairDecision === "non_repairable"
                          ? "✗ Non-Repairable"
                          : "⏳ Pending"}
                      </span>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewTicketDetails(ticket);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        title="View Details"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadReportAsText(ticket, jobCard);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                        title="Download as Text"
                      >
                        <DownloadCloud size={16} />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={24} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={24} className="text-slate-400" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && jobCard && (
                  <div className="border-t bg-slate-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            <User size={14} className="inline mr-2" />
                            Engineer
                          </label>
                          <p className="text-slate-900 font-medium">
                            {jobCard.engineer?.name || "N/A"}
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            <Wrench size={14} className="inline mr-2" />
                            Repair Decision
                          </label>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getRepairDecisionColor(
                              jobCard.repairDecision
                            )}`}
                          >
                            {jobCard.repairDecision === "repairable"
                              ? "✓ Repaired"
                              : jobCard.repairDecision === "non_repairable"
                              ? "✗ Non-Repairable"
                              : "⏳ Pending"}
                          </span>
                          {jobCard.nonRepairableReason && (
                            <p className="text-sm text-slate-700 mt-2">
                              Reason: {jobCard.nonRepairableReason}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            <Calendar size={14} className="inline mr-2" />
                            Repair Completion
                          </label>
                          <p className="text-slate-900 font-medium">
                            {jobCard.repairCompletionDate
                              ? new Date(
                                  jobCard.repairCompletionDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            <FileText size={14} className="inline mr-2" />
                            Testing Result
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`font-semibold text-sm ${getTestResultColor(
                                jobCard.testing?.testResult
                              )}`}
                            >
                              {jobCard.testing?.testResult === "pass"
                                ? "✓ PASS"
                                : jobCard.testing?.testResult === "fail"
                                ? "✗ FAIL"
                                : "⏳ PENDING"}
                            </span>
                            {jobCard.testing?.qualityCheckPassed && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                QC Passed
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            <Truck size={14} className="inline mr-2" />
                            Dispatch Status
                          </label>
                          {jobCard.dispatch?.dispatchDate ? (
                            <>
                              <p className="text-slate-900 font-medium">
                                Dispatched{" "}
                                {new Date(
                                  jobCard.dispatch.dispatchDate
                                ).toLocaleDateString()}
                              </p>
                              {jobCard.dispatch?.trackingNumber && (
                                <p className="text-sm text-slate-600 mt-1">
                                  Tracking: {jobCard.dispatch.trackingNumber}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-slate-600">Not Dispatched</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Repair Notes */}
                    {jobCard.repairNotes && (
                      <div className="mt-6 pt-6 border-t">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Repair Notes
                        </label>
                        <p className="text-slate-700 mt-2 p-3 bg-white rounded border">
                          {jobCard.repairNotes}
                        </p>
                      </div>
                    )}

                    {/* Spares Used */}
                    {jobCard.sparesUsed && jobCard.sparesUsed.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Spares Used
                        </label>
                        <div className="mt-3 space-y-2">
                          {jobCard.sparesUsed.map((spare, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-2 bg-white rounded border text-sm"
                            >
                              <div>
                                <p className="font-medium text-slate-900">
                                  {spare.componentName}
                                </p>
                                {spare.partNumber && (
                                  <p className="text-xs text-slate-600">
                                    Part: {spare.partNumber}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-slate-900">
                                  Qty: {spare.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
