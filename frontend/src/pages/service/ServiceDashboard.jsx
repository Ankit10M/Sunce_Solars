import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Package,
  Activity,
  Wrench,
  Layers,
  Truck,
  Plus,
  Trash2,
  Download,
  Send,
  AlertCircle,
  FileText,
  Home,
  ShieldCheck,
} from "lucide-react";
import { api, useAuth } from "../../contexts/AuthContext";
import ServiceDashboardSkeleton from '../../components/skeletons/ServiceDashboardSkeleton';

const ACCESSORY_OPTIONS = [
  "Remote",
  "Power Cable",
  "Manual",
  "Original Box",
  "Wall Mount",
];
const COMPONENT_OPTIONS = [
  "IGBT module",
  "Capacitors",
  "Control board",
  "Cooling fan",
  "Power module",
  "Other"
];

const VALID_TRANSITIONS = {
  ticket_created: ["pickup_scheduled"],
  pickup_scheduled: ["on_transit"],
  on_transit: ["received"],
  received: ["under_diagnosis"],
  under_diagnosis: ["under_repair", "closed"],
  under_repair: ["ready_to_dispatch"],
  ready_to_dispatch: ["dispatched"],
  dispatched: ["closed"],
};

const STATUS_LABELS = {
  ticket_created: "📋 Ticket Created",
  pickup_scheduled: "📅 Pick-up Scheduled",
  on_transit: "🚚 On Transit",
  received: "📦 Received",
  under_diagnosis: "🔍 Under Diagnosis",
  under_repair: "🔧 Under Repair",
  ready_to_dispatch: "✅ Ready to Dispatch",
  dispatched: "🚛 Dispatched",
  closed: "✔️ Closed",
};

function StepDiagnostics({
  formData = {},
  updateForm = () => {},
  updateDiagnosis = () => {},
  showMessage = () => {},
  jobCard = null,
  savedJobCardId = '',
}) {
  if (!formData || !updateForm) return null;
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">
          🔍 6.3 Diagnostic Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Diagnosis Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={formData.diagnosisDate}
              onChange={(e) => {
                updateForm("diagnosisDate", e.target.value);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Diagnosed By (Engineer Name)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Enter engineer name"
              value={formData.diagnosedBy}
              onChange={(e) => updateForm("diagnosedBy", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Error Code
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. ERR-02"
              value={formData.errorCode}
              onChange={(e) => updateForm("errorCode", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Root Cause Analysis
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. Surge protection failed"
              value={formData.rootCause}
              onChange={(e) => updateForm("rootCause", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fault Identified
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Describe the identified fault in detail..."
              value={formData.faultIdentified}
              onChange={(e) => updateForm("faultIdentified", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">
          🛠️ Repair Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Card ID
            </label>
            <input
              type="text"
              disabled
              className="w-full px-4 py-2 border rounded-xl bg-slate-100 font-mono text-slate-600"
              value={formData.jobCardId}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Repair Start Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={formData.repairStart}
              onChange={(e) => updateForm("repairStart", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Repair Completion Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={formData.repairCompletion}
              onChange={(e) => updateForm("repairCompletion", e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Repair Notes & Work Details
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Detail the repair process, components replaced, testing done..."
              value={formData.repairNotes}
              onChange={(e) => updateForm("repairNotes", e.target.value)}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

function StepDecision({ formData = {}, updateForm = () => {}, updateRepairDecision = ()=> {} }) {
  if (!formData || !updateForm) return null;
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-800 border-b pb-2">
        6.5 Repair Decision Logic
      </h3>

      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() =>{ updateForm("isRepairable", true);
          setTimeout(()=> updateRepairDecision(),0);
          }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${formData.isRepairable ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
        >
          Repairable
        </button>
        <button
          onClick={() => {updateForm("isRepairable", false);
            setTimeout(()=>updateRepairDecision(),0)
          }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${!formData.isRepairable ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
        >
          Non-Repairable
        </button>
      </div>

      {!formData.isRepairable && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl space-y-4 animate-fade-in-up">
          <div>
            <label className="block text-sm font-medium text-red-900 mb-1">
              Reason for Non-Repairable
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500"
              value={formData.nonRepairReason}
              onChange={(e) => updateForm("nonRepairReason", e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyCust"
              className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              checked={formData.notifyCustomer}
              onChange={(e) => updateForm("notifyCustomer", e.target.checked)}
            />
            <label
              htmlFor="notifyCust"
              className="ml-3 block text-sm font-medium text-red-900"
            >
              Notify Customer regarding replacement
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-red-900 mb-1">
              Replacement Recommendation
            </label>
            <input
              type="text"
              placeholder="e.g. Upgrade to SolarMax 5000"
              className="w-full px-4 py-2 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500"
              value={formData.replacementRecommendation}
              onChange={(e) =>
                updateForm("replacementRecommendation", e.target.value)
              }
            />
          </div>
        </div>
      )}
      {formData.isRepairable && (
        <div className="p-6 bg-green-50 text-green-800 rounded-2xl border border-green-200 flex items-center">
          <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
          <p className="font-medium">
            Unit is marked repairable. You can proceed to Spare Parts
            Consumption.
          </p>
        </div>
      )}
    </div>
  );
}

function StepSpares({
  formData = {},
  // updateForm = () => {},
  updateSpare = () => {},
  addSpare = () => {},
  removeSpare = () => {},
  showMessage = () => {},
  submitSpares = () => {},
  onSkip = () => {},
}) {
  if (!formData) return null;
  const spares = formData.spares || [];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-2 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            📦 6.6 Spare Parts Consumption
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Record all spare parts used during repair{" "}
            <span className="text-amber-600 font-medium">(Optional)</span>
          </p>
        </div>
        <button
          onClick={addSpare}
          className="flex items-center px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Part
        </button>
      </div>

      {spares.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <Layers className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            No spare parts added yet. Click "Add Part" to record consumption.
          </p>
          <p className="text-slate-400 text-sm mt-2">
            If no spare parts were used, you can skip this step.
          </p>
          <button
            onClick={onSkip}
            className="mt-4 px-6 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors inline-flex items-center gap-2"
          >
            Skip — No Spares Needed <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {spares.map((spare, index) => (
            <div
              key={spare.id}
              className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4 hover:border-brand-300 transition-colors"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-800">
                  Part #{index + 1}
                </h4>
                <button
                  onClick={() => removeSpare(spare.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Component Name
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                    value={spare.component || ""}
                    onChange={(e) =>
                      updateSpare(spare.id, "component", e.target.value)
                    }
                  >
                    <option value="">Select component...</option>
                    {COMPONENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Part Number / SKU
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="e.g. PN-12345"
                    value={spare.partNumber || ""}
                    onChange={(e) =>
                      updateSpare(spare.id, "partNumber", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity Used
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={spare.quantity}
                    onChange={(e) =>
                      updateSpare(
                        spare.id,
                        "quantity",
                        parseInt(e.target.value) || 1,
                      )
                    }
                  />
                </div>

                <div className="flex items-center space-x-3 border border-slate-300 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    id={`store-${spare.id}`}
                    className="w-5 h-5 text-brand-500 rounded focus:ring-brand-500"
                    checked={spare.issuedFromStore || false}
                    onChange={(e) =>
                      updateSpare(spare.id, "issuedFromStore", e.target.checked)
                    }
                  />
                  <label
                    htmlFor={`store-${spare.id}`}
                    className="font-medium text-slate-700"
                  >
                    Issued from Store
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Engineer Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Who used this part?"
                    value={spare.engineerName || ""}
                    onChange={(e) =>
                      updateSpare(spare.id, "engineerName", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Used
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={spare.dateUsed || ""}
                    onChange={(e) =>
                      updateSpare(spare.id, "dateUsed", e.target.value)
                    }
                  />
                </div>
                <div className=" md:col-span-2 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className=" grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label className=" block text-sm font-medium text-emerald-800 mb-2">
                        Unit Cost in ₹{" "}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="0"
                        value={spare.unitCost || ""}
                        onChange={(e) =>
                          updateSpare(
                            spare.id,
                            "unitCost",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className=" text-right">
                      <p className=" text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                        Spare Total
                      </p>
                      <p className="text-2xl font-black text-emerald-700">
                        ₹
                        {(
                          (parseFloat(spare.unitCost) || 0) *
                          (parseInt(spare.quantity) || 1)
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {spares.length > 0 && (
        <button
          onClick={() => {
            const incomplete = formData.spares.some(
              (s) => !s.component || !s.partNumber || !s.engineerName,
            );
            if (incomplete) {
              showMessage("error", "Please fill all fields for each spare part");
              return;
            }
            submitSpares();
          }}
          className="w-full px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors mt-4"
        >
          Save Spare Parts
        </button>
      )}
    </div>
  );
}

function StepQC({
  formData = {},
  updateForm = () => {},
  showMessage = () => {},
  submitDispatch = () => {},
}) {
  if (!formData || !updateForm) return null;
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">
          ✅ 6.7 Quality Control & Testing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Test Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={formData.testDate}
              onChange={(e) => updateForm("testDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Test Engineer Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Enter engineer name"
              value={formData.testEngineer}
              onChange={(e) => updateForm("testEngineer", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Test Result
            </label>
            <select
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={formData.testResult}
              onChange={(e) => updateForm("testResult", e.target.value)}
            >
              <option value="pending">Select result...</option>
              <option value="pass">✓ Pass</option>
              <option value="fail">✗ Fail</option>
              <option value="hold">⏸️ Hold / Needs Review</option>
            </select>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border">
            <input
              type="checkbox"
              id="qcPassed"
              className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500"
              checked={formData.qcPassed}
              onChange={(e) => updateForm("qcPassed", e.target.checked)}
            />
            <label htmlFor="qcPassed" className="font-medium text-slate-700">
              Quality Check Passed
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              QC Remarks & Observations
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Any issues found or special observations..."
              value={formData.qcRemarks}
              onChange={(e) => updateForm("qcRemarks", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">
          🚛 6.8 Dispatch Preparation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border md:col-span-2">
            <input
              type="checkbox"
              id="packComp"
              className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500"
              checked={formData.packingCompleted}
              onChange={(e) => updateForm("packingCompleted", e.target.checked)}
            />
            <label htmlFor="packComp" className="font-medium text-slate-700">
              Packing Completed ✓
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Packing Material Used
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. Foam + Corrugated box + Bubble wrap"
              value={formData.packingMaterial}
              onChange={(e) => updateForm("packingMaterial", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dispatch Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={formData.dispatchDate || ""}
              onChange={(e) => updateForm("dispatchDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Courier Service Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. FedEx, DHL, Local Courier"
              value={formData.courierName}
              onChange={(e) => updateForm("courierName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tracking Number
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. TRK123456789"
              value={formData.trackingNumber}
              onChange={(e) => updateForm("trackingNumber", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={() => {
          if (
            !formData.testResult ||
            !formData.courierName ||
            !formData.trackingNumber
          ) {
            showMessage("error", "Please fill all dispatch details");
            return;
          }
          submitDispatch();
        }}
        className="w-full px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
      >
        Submit QC & Dispatch
      </button>
    </div>
  );
}
function StepReport({
  formData = {},
  jobCard,
  selectedTicket,
  loading,
  // calculateEstimatedCost = () => 0,
  generateReport = () => {},
  updateForm = () => {},
  submitReportToSales = () => {},
  estimatedCost = 0,
  updateDiagnosis = () => {},
  updateRepairDecision = () => {},
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(formData);

  useEffect(() => {
    setEditFormData(formData);
  }, [formData]);

  if (!formData) return null;

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = () => {
    // Update all form data
    Object.keys(editFormData).forEach((key) => {
      if (editFormData[key] !== formData[key]) {
        updateForm(key, editFormData[key]);
      }
    });
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditFormData(formData);
    setIsEditMode(false);
  };

  const renderReportField = (label, value, editField, fieldType = "text") => {
    if (isEditMode) {
      if (fieldType === "textarea") {
        return (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {label}
            </label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
              value={editFormData[editField] || ""}
              onChange={(e) => handleEditChange(editField, e.target.value)}
            />
          </div>
        );
      } else if (fieldType === "date") {
        return (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {label}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
              value={editFormData[editField] || ""}
              onChange={(e) => handleEditChange(editField, e.target.value)}
            />
          </div>
        );
      } else {
        return (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {label}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
              value={editFormData[editField] || ""}
              onChange={(e) => handleEditChange(editField, e.target.value)}
            />
          </div>
        );
      }
    }

    return (
      <div key={label} className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Title and Edit Mode Toggle */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-200">
        <div>
          <h3 className="text-3xl font-bold text-slate-800 flex items-center">
            <FileText className="w-7 h-8 mr-2 text-brand-500" />
             Service Completion Report
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            All service steps completed - Review, edit, and submit the final
            report
          </p>
        </div>
        {!isEditMode ? (
          <button
            onClick={() => setIsEditMode(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-semibold whitespace-nowrap"
          >
             Edit Report
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
               Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
            >
              ✕ Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Report Content - Always Visible */}
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-brand-500">
            <p className="text-xs text-slate-500 font-semibold mb-1">
              Job Card ID
            </p>
            <p className="text-lg font-bold text-slate-800 font-mono">
              {jobCard?.jobCardId || formData.jobCardId || "—"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-xs text-slate-500 font-semibold mb-1">
              Ticket ID
            </p>
            <p className="text-lg font-bold text-slate-800">
              {selectedTicket?.ticketId || "—"}
            </p>
          </div>
          <div
            className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${jobCard?.repairDecision === "repairable" ? "border-green-500" : "border-red-500"}`}
          >
            <p className="text-xs text-slate-500 font-semibold mb-1">
              Repair Status
            </p>
            <p
              className={`text-lg font-bold ${jobCard?.repairDecision === "repairable" ? "text-green-600" :
                 jobCard?.repairDecision==='non_repairable'?  "text-red-600":
                 formData.isRepairable? ' text-green-600':' text-red-600'}`}
            >
              {(()=>{
                const d= jobCard?.repairDecision;
                if(d === 'repairable') return 'REPAIRABLE ✓';
                if(d === 'non_repairable') return 'NON-REPAIRABLE ✕';
                return formData.isRepairable ? 'REPAIRABLE ✓':'NON-REPAIRABLE ✕'
              })()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500">
            <p className="text-xs text-slate-500 font-semibold mb-1">
              Est. Cost
            </p>
            <p className="text-lg font-bold text-slate-800">
              ₹{estimatedCost != null && estimatedCost >=0 ? `${estimatedCost.toLocaleString('en-IN')}` : "—"}
            </p>
          </div>
        </div>

        {/* Step 1: Receiving Information */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-6 rounded-2xl">
          <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />  Receiving Information
          </h4>
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderReportField(
                "Received By",
                formData.receivedBy,
                "receivedBy",
              )}
              {renderReportField(
                "Date Received",
                formData.dateReceived,
                "dateReceived",
                "date",
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Physical Condition
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
                  value={editFormData.condition || ""}
                  onChange={(e) =>
                    handleEditChange("condition", e.target.value)
                  }
                >
                  <option value="">Select condition...</option>
                  <option value="good">Good - No visible damage</option>
                  <option value="damaged">
                    Damaged - Minor scratches/dents
                  </option>
                  <option value="partial">
                    Partial Damage - Significant damage
                  </option>
                  <option value="unknown">Unknown - Requires inspection</option>
                </select>
              </div>
              <div className="md:col-span-3">
                {renderReportField(
                  "Accessories Received",
                  formData.accessories?.join(", "),
                  "accessories",
                )}
              </div>
              <div className="md:col-span-3">
                {renderReportField(
                  "Receiving Remarks",
                  formData.receivingRemarks,
                  "receivingRemarks",
                  "textarea",
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderReportField("Received By", formData.receivedBy)}
              {renderReportField("Date Received", formData.dateReceived)}
              {renderReportField("Physical Condition", formData.condition)}
              <div className="md:col-span-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Accessories Received
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.accessories && formData.accessories.length > 0 ? (
                    formData.accessories.map((acc) => (
                      <span
                        key={acc}
                        className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {acc}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">None</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-3">
                {renderReportField(
                  "Receiving Remarks",
                  formData.receivingRemarks,
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Diagnostic Information */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-6 rounded-2xl">
          <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />  Diagnostic Analysis
          </h4>
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderReportField(
                "Diagnosis Date",
                formData.diagnosisDate,
                "diagnosisDate",
                "date",
              )}
              {renderReportField(
                "Diagnosed By",
                formData.diagnosedBy,
                "diagnosedBy",
              )}
              {renderReportField("Error Code", formData.errorCode, "errorCode")}
              {renderReportField("Root Cause", formData.rootCause, "rootCause")}
              <div className="md:col-span-2">
                {renderReportField(
                  "Fault Identified",
                  formData.faultIdentified,
                  "faultIdentified",
                  "textarea",
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderReportField("Diagnosis Date", formData.diagnosisDate)}
              {renderReportField("Diagnosed By", formData.diagnosedBy)}
              {renderReportField("Error Code", formData.errorCode)}
              {renderReportField("Root Cause analysis", formData.rootCause)}
              <div className="md:col-span-2">
                {renderReportField(
                  "Fault Identified",
                  formData.faultIdentified,
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Repair Decision */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-2xl">
          <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
            <Wrench className="w-5 h-5 mr-2" />  Repair Decision
          </h4>
          {isEditMode ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleEditChange("isRepairable", true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${editFormData.isRepairable ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"}`}
                >
                  Repairable
                </button>
                <button
                  onClick={() => handleEditChange("isRepairable", false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${!editFormData.isRepairable ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600"}`}
                >
                  Non-Repairable
                </button>
              </div>
              {!editFormData.isRepairable && (
                <div>
                  {renderReportField(
                    "Non-Repairable Reason",
                    editFormData.nonRepairReason,
                    "nonRepairReason",
                    "textarea",
                  )}
                </div>
              )}
              {editFormData.isRepairable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderReportField(
                    "Repair Start Date",
                    editFormData.repairStart,
                    "repairStart",
                    "date",
                  )}
                  {renderReportField(
                    "Repair Completion Date",
                    editFormData.repairCompletion,
                    "repairCompletion",
                    "date",
                  )}
                  <div className="md:col-span-2">
                    {renderReportField(
                      "Repair Notes",
                      editFormData.repairNotes,
                      "repairNotes",
                      "textarea",
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full font-medium text-sm ${formData.isRepairable ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                >
                  {formData.isRepairable ? "✓ REPAIRABLE" : "✗ NON-REPAIRABLE"}
                </span>
              </div>
              {!formData.isRepairable && (
                <div>
                  {renderReportField(
                    "Non-Repairable Reason",
                    formData.nonRepairReason,
                  )}
                </div>
              )}
              {formData.isRepairable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderReportField("Repair Start Date", formData.repairStart)}
                  {renderReportField(
                    "Repair Completion Date",
                    formData.repairCompletion,
                  )}
                  <div className="md:col-span-2">
                    {renderReportField("Repair Notes", formData.repairNotes)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 4: Spare Parts Used */}

        {formData.isRepairable &&
          (() => {
            const localSpares = formData.spares || [];
            const backendSpares = jobCard?.sparesUsed || [];
            const sparesToShow =
              localSpares.length > 0 ? localSpares : backendSpares;
            const isLocal = localSpares.length > 0;
            if (sparesToShow.length === 0) return null;
            const grandTotal = sparesToShow.reduce((sum, s) => {
              return (
                sum +
                (isLocal
                  ? (parseFloat(s.unitCost) || 0) * (parseInt(s.quantity) || 1)
                  : 0)
              );
            }, 0);
            return (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center">
                    <Layers className="w-5 h-5 mr-2" />  Spare Parts Used
                  </span>
                  {isLocal && grandTotal > 0 && (
                    <span className="text-sm font-semibold text-green-700 bg-green-200 px-3 py-1 rounded-full">
                      Spare Total: ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  )}
                </h4>
                <div className="space-y-3">
                  {sparesToShow.map((spare, idx) => {
                    const lineTotal = isLocal
                      ? (parseFloat(spare.unitCost) || 0) *
                        (parseInt(spare.quantity) || 1)
                      : null;
                    return (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-lg border border-green-100"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <p className="text-xs text-slate-500 font-semibold">
                              Component
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {isLocal ? spare.component : spare.componentName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-semibold">
                              Part No.
                            </p>
                            <p className="text-sm font-medium text-slate-800 font-mono">
                              {spare.partNumber || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-semibold">
                              Qty
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {spare.quantity}
                            </p>
                          </div>
                          {isLocal && (
                            <div>
                              <p className="text-xs text-slate-500 font-semibold">
                                Unit Cost
                              </p>
                              <p className="text-sm font-medium text-slate-800">
                                ₹
                                {(
                                  parseFloat(spare.unitCost) || 0
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-slate-500 font-semibold">
                              {isLocal ? "Line Total" : "Date Used"}
                            </p>
                            <p className="text-sm font-bold text-emerald-700">
                              {isLocal
                                ? `₹${lineTotal.toLocaleString("en-IN")}`
                                : spare.issuedAt
                                  ? new Date(
                                      spare.issuedAt,
                                    ).toLocaleDateString()
                                  : "—"}
                            </p>
                          </div>
                        </div>
                        {isLocal && spare.engineerName && (
                          <p className="text-xs text-slate-500 mt-2">
                            Engineer: {spare.engineerName}
                            {spare.dateUsed ? ` · ${spare.dateUsed}` : ""}
                          </p>
                        )}
                        {spare.remarks && (
                          <p className="text-xs text-slate-600 mt-1">
                            <strong>Remarks:</strong> {spare.remarks}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        {/* Step 5: Quality Control & Testing */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 p-6 rounded-2xl">
          <h4 className="text-lg font-bold text-cyan-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />  Quality Control &
            Testing
          </h4>
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderReportField(
                "Test Date",
                editFormData.testDate,
                "testDate",
                "date",
              )}
              {renderReportField(
                "Test Engineer",
                editFormData.testEngineer,
                "testEngineer",
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Test Result
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
                  value={editFormData.testResult || ""}
                  onChange={(e) =>
                    handleEditChange("testResult", e.target.value)
                  }
                >
                  <option value="">Select result...</option>
                  <option value="pass">✓ Pass</option>
                  <option value="fail">✗ Fail</option>
                  <option value="pending">⏸️ Pending</option>
                </select>
              </div>
              <div className="md:col-span-3">
                {renderReportField(
                  "QC Remarks",
                  editFormData.qcRemarks,
                  "qcRemarks",
                  "textarea",
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderReportField("Test Date", formData.testDate)}
              {renderReportField("Test Engineer", formData.testEngineer)}
              {renderReportField("Test Result", formData.testResult)}
              <div className="md:col-span-3">
                {renderReportField("QC Remarks", formData.qcRemarks)}
              </div>
            </div>
          )}
        </div>

        {/* Step 6: Dispatch Information */}
        <div className="bg-gradient-to-br from-teal-50 to-green-50 border border-teal-200 p-6 rounded-2xl">
          <h4 className="text-lg font-bold text-teal-900 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2" />  Dispatch Information
          </h4>
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Packing Completed
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editFormData.packingCompleted || false}
                    onChange={(e) =>
                      handleEditChange("packingCompleted", e.target.checked)
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">
                    {editFormData.packingCompleted ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              {renderReportField(
                "Packing Material",
                editFormData.packingMaterial,
                "packingMaterial",
              )}
              {renderReportField(
                "Courier Name",
                editFormData.courierName,
                "courierName",
              )}
              {renderReportField(
                "Tracking Number",
                editFormData.trackingNumber,
                "trackingNumber",
              )}
              {renderReportField(
                "Dispatch Date",
                editFormData.dispatchDate,
                "dispatchDate",
                "date",
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderReportField(
                "Packing Completed",
                formData.packingCompleted ? "Yes ✓" : "No",
              )}
              {renderReportField("Packing Material", formData.packingMaterial)}
              {renderReportField("Courier Name", formData.courierName)}
              {renderReportField("Tracking Number", formData.trackingNumber)}
              {renderReportField("Dispatch Date", formData.dispatchDate)}
            </div>
          )}
        </div>

        {/* Non-Repairable Notice */}
        {jobCard?.repairDecision === "non_repairable" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" /> Non-Repairable Unit
            </h4>
            <p className="text-red-800 mb-2">
              <strong>Reason:</strong>{" "}
              {jobCard?.nonRepairableReason || "Not specified"}
            </p>
            {jobCard?.replacementRecommended && (
              <p className="text-red-800 font-semibold">
                💡 Replacement Recommended:{" "}
                {formData.replacementRecommendation || "—"}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isEditMode && (
          <div className="space-y-3 mt-8 pt-6 border-t-2 border-slate-300">
            <div className="flex gap-3">
              <button
                onClick={generateReport}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
              >
                <Download className="w-5 h-5 mr-2" /> Download Report (Text)
              </button>
              <button
                onClick={submitReportToSales}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 mr-2" />
                {loading ? "Submitting..." : " Submit to Sales Dashboard"}
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Once submitted, the sales team will be notified and the customer
              will receive a comprehensive service report
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const STEPS = [
  { title: "Receiving", icon: Package },
  { title: "Diagnostics", icon: Activity },
  { title: "Decision", icon: Wrench },
  { title: "Spares", icon: Layers },
  { title: "QC & Dispatch", icon: Truck },
  { title: "Report", icon: FileText },
];
export default function ServiceDashboard() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [jobCard, setJobCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [savedJobCardId, setSavedJobCardId] = useState('');

  const [formData, setFormData] = useState({
    ticketId: "",
    dateReceived: new Date().toISOString().split("T")[0],
    receivedBy: "",
    condition: "unknown",
    accessories: [],
    receivingRemarks: "",

    diagnosisDate: new Date().toISOString().split("T")[0],
    diagnosedBy: "",
    errorCode: "",
    faultIdentified: "",
    rootCause: "",

    jobCardId: "",
    repairStart: "",
    repairCompletion: "",
    repairNotes: "",

    repairDecision: "pending",
    nonRepairReason: "",
    customerNotified: false,
    replacementRecommended: false,

    spares: [],

    testDate: new Date().toISOString().split("T")[0],
    testEngineer: "",
    testResult: "pending",
    qcPassed: false,
    qcRemarks: "",

    packingCompleted: false,
    packingMaterial: "",
    dispatchDate: "",
    courierName: "",
    trackingNumber: "",
    isRepairable: true,
    notifyCustomer: false,
    replacementRecommendation: "",
    finalTesting: false,
  });

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tickets");
      const allTickets = data.tickets || data.data || [];
      // Engineer should not see tickets submitted to sales or already dispatched/closed
      const activeTickets = allTickets.filter(t => 
        !t.serviceReport?.submittedToSales && t.status !== "dispatched" && t.status !== "closed"
      );
      setTickets(activeTickets);
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load tickets",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setFormData((prev) => ({
      ...prev,
      ticketId: ticket.ticketId,
    }));

    // Check if job card exists for THIS ENGINEER and THIS TICKET
    try {
      const { data } = await api.get(`/jobcards`);
      const cards = data.jobCards || data.data || [];
      // Filter by both ticket AND engineer, since each engineer has their own jobcard per ticket
      const existing = cards.find(
        (c) => {
          const ticketMatch = c.ticket?._id === ticket._id || c.ticket === ticket._id;
          const engineerMatch = c.engineer?._id === user._id || c.engineer === user._id;
          return ticketMatch && engineerMatch;
        }
      );
      if (existing) {
        setJobCard(existing);
        setSavedJobCardId(existing.jobCardId || "");
        setFormData((prev) => ({
          ...prev,
          jobCardId: existing.jobCardId || "", // ← correct field name
          condition: existing.unitCondition || "unknown",
          accessories: existing.accessoriesReceived || [],
          receivingRemarks: existing.receivingRemarks || "",
        }));
      } else {
        setJobCard(null);
      }
    } catch (error) {
      console.log("No job card yet");
      setJobCard(null);
    }
  };

  const createJobCard = async () => {
    if (!selectedTicket || !formData.condition) {
      showMessage("error", "Please fill all required fields");
      return;
    }

    if (!user?._id) {
      showMessage("error", "User not authenticated");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/jobcards", {
        ticketId: selectedTicket._id,
        engineerId: user?._id,  // Send the current engineer's ID
        unitCondition: formData.condition,
        accessoriesReceived: formData.accessories,
        receivingRemarks: formData.receivingRemarks,
      });
      setJobCard(data.jobCard);
      setSavedJobCardId(data.jobCard.jobCardId || "");
      setFormData((prev) => ({
        ...prev,
        jobCardId: data.jobCard.jobCardId || "",
      }));
      setSelectedTicket(prev => ({ ...prev, status: 'received' }));
      setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, status: 'received' } : t));
      showMessage(
        "success",
        "Job Card created successfully! Now authenticating product...",
      );
    } catch (error) {
      const msg = error.response?.data?.message || "";
      if (error.response?.status === 400 && msg.includes("already exists")) {
        try {
          const { data } = await api.get("/jobcards");
          const cards = data.jobCards || data.data || [];
          const existing = cards.find(
            (c) =>
              c.ticket?._id === selectedTicket._id ||
              c.ticket === selectedTicket._id,
          );
          if (existing) {
            setJobCard(existing);
            setSavedJobCardId(existing.jobCardId || "");
            setFormData((prev) => ({
              ...prev,
              jobCardId: existing.jobCardId || "",
              condition: existing.unitCondition || formData.condition,
              accessories: existing.accessoriesReceived || formData.accessories,
              receivingRemarks:
                existing.receivingRemarks || formData.receivingRemarks,
            }));
            showMessage("success", "Existing job card loaded.");
            return;
          }
        } catch (error) {}
      }
      showMessage(
        "error",
        error.response?.data?.message || "Failed to create job card",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateDiagnosis = async () => {
    if (!jobCard) {
      showMessage("error", "Job card not found");
      return;
    }

    if (!selectedTicket) {
      showMessage("error", "Ticket information not found");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.put(`/jobcards/${jobCard._id}/diagnosis`, {
        errorCode: formData.errorCode,
        faultIdentified: formData.faultIdentified,
        rootCause: formData.rootCause,
      });
      setJobCard((prev) => ({ ...prev, diagnostic: data.diagnostic }));
      
      try {
        let currentStatus = selectedTicket.status;
        // Catch up stuck tickets
        if (currentStatus === 'on_transit') {
          await api.patch(`/tickets/${selectedTicket._id}/status`, {
            status: 'received', remarks: 'Auto-received for diagnosis'
          });
          currentStatus = 'received';
        }
        
        if (currentStatus === 'received') {
          await api.patch(`/tickets/${selectedTicket._id}/status`, {
            status: 'under_diagnosis',
            remarks: `Diagnosis initiated - Error Code: ${formData.errorCode || 'N/A'}`,
          });
          setSelectedTicket(prev => ({ ...prev, status: 'under_diagnosis' }));
          setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, status: 'under_diagnosis' } : t));
        }
      } catch (err) {
        console.log("Could not transition to under_diagnosis:", err.response?.data?.message || err.message);
      }
      
      showMessage("success", "Diagnosis updated successfully!");
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update diagnosis",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateRepairDecision = async () => {
    if (!jobCard) {
      showMessage("error", "Job card not found");
      return;
    }

    if (!selectedTicket) {
      showMessage("error", "Ticket information not found");
      return;
    }

    try {
      setLoading(true);
      const decision = formData.isRepairable ? "repairable" : "non_repairable";
      const { data } = await api.put(`/jobcards/${jobCard._id}/decision`, {
        repairDecision: decision,
        nonRepairableReason: formData.nonRepairReason,
        replacementRecommended: !formData.isRepairable,
        repairNotes: formData.repairNotes,
      });
      setJobCard(data.jobCard);
      
      try {
        let currentStatus = selectedTicket.status;
        if (currentStatus === 'on_transit') {
          await api.patch(`/tickets/${selectedTicket._id}/status`, { status: 'received', remarks: 'Auto-caught up' });
          currentStatus = 'received';
        }
        if (currentStatus === 'received') {
          await api.patch(`/tickets/${selectedTicket._id}/status`, { status: 'under_diagnosis', remarks: 'Auto-caught up' });
          currentStatus = 'under_diagnosis';
        }

        // Update ticket status based on repair decision
        if (decision === "repairable") {
          await api.patch(`/tickets/${selectedTicket._id}/status`, {
            status: 'under_repair',
            remarks: `Unit is repairable - moving to repair phase`,
          });
          setSelectedTicket(prev => ({ ...prev, status: 'under_repair' }));
          setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, status: 'under_repair' } : t));
        } else {
          await api.patch(`/tickets/${selectedTicket._id}/status`, {
            status: 'closed',
            remarks: `Unit declared non-repairable - ${formData.nonRepairReason}`,
          });
          setSelectedTicket(prev => ({ ...prev, status: 'closed' }));
          setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, status: 'closed' } : t));
        }
      } catch (err) {
        console.log("Could not transition ticket status:", err.response?.data?.message || err.message);
      }
      
      showMessage("success", `Repair decision saved: ${decision}`);
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update repair decision",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitSpares = async () => {
    if ((formData.spares?.length || 0) === 0) {
      showMessage("error", "Please add at least one spare part");
      return;
    }

    try {
      setLoading(true);
      for (const spare of formData.spares) {
        await api.post(`/jobcards/${jobCard._id}/spares`, {
          componentName: spare.component,
          partNumber: spare.partNumber,
          quantity: spare.quantity,
          unitCost:parseFloat(spare.unitCost),
          remarks: `Used by ${spare.engineerName} on ${spare.dateUsed}`,
        });
      }
      const {data: refreshed} = await api.get('/jobcards');
      const cards = refreshed.jobCards || refreshed.data || [];
      const updated = cards.find(c=> c._id === jobCard._id || c.ticket?._id === selectedTicket._id || c.ticket === selectedTicket._id)
      if(updated) setJobCard(updated)
      showMessage("success", "All spare parts recorded successfully!");
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to add spares",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitTestingReport = async () => {
    if (!jobCard) {
      showMessage("error", "Job card not found");
      return;
    }

    if (!selectedTicket) {
      showMessage("error", "Ticket information not found");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.put(`/jobcards/${jobCard._id}/testing`, {
        testDate: formData.testDate,
        testResult: formData.testResult,
        qualityCheckPassed: formData.qcPassed,
        remarks: formData.qcRemarks,
      });
      setJobCard(data.jobCard);
      
      // Update ticket status to "ready_to_dispatch" if QC passed and test passed
      if (formData.qcPassed && formData.testResult === 'pass') {
        try {
          let currentStatus = selectedTicket.status;
          if (currentStatus === 'on_transit') {
            await api.patch(`/tickets/${selectedTicket._id}/status`, { status: 'received', remarks: 'Auto-caught up' });
            currentStatus = 'received';
          }
          if (currentStatus === 'received') {
            await api.patch(`/tickets/${selectedTicket._id}/status`, { status: 'under_diagnosis', remarks: 'Auto-caught up' });
            currentStatus = 'under_diagnosis';
          }
          if (currentStatus === 'under_diagnosis') {
            await api.patch(`/tickets/${selectedTicket._id}/status`, { status: 'under_repair', remarks: 'Auto-caught up' });
            currentStatus = 'under_repair';
          }
          if (currentStatus === 'under_repair') {
            await api.patch(`/tickets/${selectedTicket._id}/status`, {
              status: 'ready_to_dispatch',
              remarks: `Quality check passed - Unit ready for dispatch`,
            });
            setSelectedTicket(prev => ({ ...prev, status: 'ready_to_dispatch' }));
            setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, status: 'ready_to_dispatch' } : t));
          }
        } catch (err) {
          console.log("Could not transition to ready_to_dispatch:", err.response?.data?.message || err.message);
        }
      }
      
      showMessage("success", "Testing report submitted successfully!");
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to submit testing report",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitDispatch = async () => {
    if (!jobCard) {
      showMessage("error", "Job card not found");
      return;
    }

    if (!selectedTicket) {
      showMessage("error", "Ticket information not found");
      return;
    }

    try {
      setLoading(true);
      
      // Update job card dispatch details
      const { data } = await api.put(`/jobcards/${jobCard._id}/dispatch`, {
        packingCompleted: formData.packingCompleted,
        packingMaterial: formData.packingMaterial,
        dispatchDate: formData.dispatchDate,
        courierName: formData.courierName,
        trackingNumber: formData.trackingNumber,
      });
      setJobCard(data.jobCard);
      
      // Step 1: Ensure ticket is in "ready_to_dispatch" status (if not already at dispatched)
      const currentStatus = selectedTicket.status;
      
      if (currentStatus !== 'dispatched' && currentStatus !== 'ready_to_dispatch') {
        // Transition through the missing statuses first
        // This handles cases where the steps weren't properly transitioned
        const statusPath = {
          'on_transit': 'received',
          'received': 'under_diagnosis',
          'under_diagnosis': 'under_repair',
          'under_repair': 'ready_to_dispatch'
        };
        
        const nextStatus = statusPath[currentStatus];
        if (nextStatus) {
          await api.patch(`/tickets/${selectedTicket._id}/status`, {
            status: nextStatus,
            remarks: `Auto-transitioned while completing service workflow`,
          });
        }
      }
      
      // Step 2: Update ticket status to "dispatched"
      if (currentStatus !== 'dispatched') {
        await api.patch(`/tickets/${selectedTicket._id}/status`, {
          status: 'dispatched',
          remarks: `Product dispatched via ${formData.courierName || 'Courier'} with tracking ${formData.trackingNumber || 'N/A'}`,
        }).then(() => {
          setSelectedTicket(prev => ({ ...prev, status: 'dispatched' }));
          setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, status: 'dispatched' } : t));
        });
      }
      
      showMessage("success", "✓ Product dispatched! Status updated to 'Dispatched'. Sales team has been notified.");
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update dispatch info",
      );
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!jobCard) {
      showMessage("error", "Job card not found");
      return;
    }

    const reportContent = `
╔════════════════════════════════════════════════════════════════╗
║          SERVICE COMPLETION REPORT - JOB CARD                  ║
╚════════════════════════════════════════════════════════════════╝

JOB CARD DETAILS
─────────────────────────────────────────────────────────────────
Job Card ID:          ${jobCard.jobCardId || "N/A"}
Date Created:         ${new Date(jobCard.receivedDate).toLocaleDateString() || "N/A"}
Ticket ID:            ${selectedTicket?.ticketId || "N/A"}

RECEIVING INFORMATION
─────────────────────────────────────────────────────────────────
Received By:          ${formData.receivedBy || "N/A"}
Date Received:        ${formData.dateReceived}
Unit Condition:       ${jobCard.unCondition || "N/A"}
Accessories:          ${jobCard.accessoriesReceived?.join(", ") || "None"}
Receiving Remarks:    ${jobCard.receivingRemarks || "N/A"}

DIAGNOSTIC REPORT
─────────────────────────────────────────────────────────────────
Error Code:           ${jobCard.diagnostic?.errorCode || "N/A"}
Fault Identified:     ${jobCard.diagnostic?.faultIdentified || "N/A"}
Root Cause:           ${jobCard.diagnostic?.rootCause || "N/A"}

REPAIR DECISION
─────────────────────────────────────────────────────────────────
Repair Status:        ${jobCard.repairDecision?.toUpperCase() || "PENDING"}
${jobCard.repairDecision === "non_repairable" ? `Non-Repairable Reason: ${jobCard.nonRepairableReason || "N/A"}` : ""}
${jobCard.replacementRecommended ? `Replacement Recommended:` : ""}${jobCard.replacementRecommended ? "YES" : "NO"}

REPAIR COMPLETION
─────────────────────────────────────────────────────────────────
Repair Start Date:    ${formData.repairStart || "N/A"}
Repair End Date:      ${formData.repairCompletion || "N/A"}
Repair Notes:         ${formData.repairNotes || "N/A"}

SPARE PARTS USED
─────────────────────────────────────────────────────────────────
${jobCard.sparesUsed && jobCard.sparesUsed.length > 0 ? jobCard.sparesUsed.map((s) => `  • ${s.componentName} (Part: ${s.partNumber}) - Qty: ${s.quantity}`).join("\n") : "None"}

QUALITY CHECK & TESTING
─────────────────────────────────────────────────────────────────
Test Date:            ${formData.testDate || "N/A"}
Test Result:          ${jobCard.testing?.testResult?.toUpperCase() || "PENDING"}
QC Passed:            ${jobCard.testing?.qualityCheckPassed ? "YES" : "NO"}
QC Remarks:           ${formData.qcRemarks || "N/A"}

DISPATCH INFORMATION
─────────────────────────────────────────────────────────────────
Packing Completed:    ${jobCard.dispatch?.packingCompleted ? "YES" : "NO"}
Courier Name:         ${jobCard.dispatch?.courierName || "N/A"}
Tracking Number:      ${jobCard.dispatch?.trackingNumber || "N/A"}
Dispatch Date:        ${jobCard.dispatch?.dispatchDate ? new Date(jobCard.dispatch.dispatchDate).toLocaleDateString() : "N/A"}

═══════════════════════════════════════════════════════════════════
Generated on: ${new Date().toLocaleString()}
Status: ${jobCard.repairDecision === "closed" ? "CLOSED" : "IN PROGRESS"}
═══════════════════════════════════════════════════════════════════
    `.trim();

    downloadReport(reportContent, `ServiceReport_${jobCard.jobCardId}.txt`);
  };

  const downloadReport = (content, filename) => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content),
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showMessage("success", "Report downloaded successfully!");
  };

  const submitReportToSales = async () => {
    let card = jobCard;
    
    // If jobCard is missing but we have jobCardId, fetch it
    if (!card && formData.jobCardId) {
      try {
        const { data } = await api.get(`/jobcards`);
        const cards = data.jobCards || data.data || [];
        const found = cards.find(c => c.jobCardId === formData.jobCardId);
        if (found) {
          card = found;
          setJobCard(found); // Update state for consistency
        }
      } catch (error) {
        console.log("Could not reload job card");
      }
    }

    if (!card) {
      showMessage("error", "Job card not found");
      return;
    }

    try {
      setLoading(true);

      // Prepare comprehensive report data for sales team
      const reportData = {
        jobCardId: card.jobCardId,
        ticketId: selectedTicket?._id,
        ticketStringId: selectedTicket?.ticketId,
        customerId: selectedTicket?.customer?._id || selectedTicket?.customerId,

        productDetails: {
          modelName: selectedTicket?.productModel || "Not specified",
          serialNumber: selectedTicket?.serialNumber || "Not specified",
          warranty: selectedTicket?.warrantyStatus || "Unknown",
        },
        serviceReport: {
          receivedDate: card.receivedDate,
          status: card.repairDecision,
          repairable: card.repairDecision === "repairable",
          diagnosticFindings: card.diagnostic?.faultIdentified || "N/A",
          errorCodes: card.diagnostic?.errorCode || "N/A",
          rootCause: card.diagnostic?.rootCause || "N/A",
        },
        repairDetails: {
          repairStartDate: formData.repairStart,
          repairCompletionDate: formData.repairCompletion,
          sparesUsed: card.sparesUsed || [],
          totalSpareCost: (card.sparesUsed?.length || 0) * 100,
        },
        testingResults: {
          testResult: card.testing?.testResult || "pending",
          qualityCheckPassed: card.testing?.qualityCheckPassed || false,
          testDate: formData.testDate,
        },
        dispatchInfo: {
          courierName: card.dispatch?.courierName || "N/A",
          trackingNumber: card.dispatch?.trackingNumber || "N/A",
          dispatchDate: card.dispatch?.dispatchDate,
        },
        nonRepairableReason: card.nonRepairableReason || null,
        replacementRecommended: card.replacementRecommended || false,
        replacementRecommendation: formData.replacementRecommendation || null,
        estimatedCost: calculateEstimatedCost(),
        submittedAt: new Date().toISOString(),
        submittedBy: formData.testEngineer || "Service Engineer",
        
        faultDescription: card.diagnostic?.faultIdentified || formData.faultIdentified || selectedTicket?.faultDescription || "N/A",
        solution: formData.repairNotes || card.repairNotes || "N/A",
        spareParts: card.sparesUsed || [],
        serviceCost: calculateEstimatedCost()
      };

      // Send to backend - this will create a report and notify sales
      await api.patch(`/tickets/${selectedTicket._id}/submit-to-sales`, reportData).catch((err) => {
      //   console.error("Report submitted error:", err.response?.data || err.message);
      });

      showMessage(
        "success",
        "✅ Service Report Submitted! Sales team will review and contact the customer within 24 hours.",
      );
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to submit report",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedCost = () => {
    const localSpares = formData.spares || [];
    const localHasCost = localSpares.some(s => parseFloat(s.unitCost) > 0);
 
    if (localHasCost) {
      // User has entered unit costs in the Spares step — use local data
      return localSpares.reduce(
        (sum, s) => sum + (parseFloat(s.unitCost) || 0) * (parseInt(s.quantity) || 1),
        0
      );
    }
    // Fall back to backend sparesUsed (populated after submitSpares re-fetch)
    const backendSpares = jobCard?.sparesUsed || [];
    return backendSpares.reduce(
      (sum, s) => sum + (parseFloat(s.unitCost) || 0) * (parseInt(s.quantity) || 1),
      0
    );
  };
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const updateForm = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }));
  }, []);

  const toggleAccessory = (acc) => {
    setFormData((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(acc)
        ? prev.accessories.filter((a) => a !== acc)
        : [...prev.accessories, acc],
    }));
  };

  const addSpare = () => {
    setFormData((prev) => ({
      ...prev,
      spares: [
        ...prev.spares,
        {
          id: Date.now(),
          component: "",
          partNumber: "",
          quantity: 1,
          issuedFromStore: false,
          engineerName: "",
          dateUsed: "",
        },
      ],
    }));
  };

  const updateSpare = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      spares: prev.spares.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          console.log("Updated spare:", updated); // Debug
          return updated;
        }
        return s;
      }),
    }));
  };

  const removeSpare = (id) => {
    setFormData((prev) => ({
      ...prev,
      spares: prev.spares.filter((s) => s.id !== id),
    }));
  };

  const handleNext = () =>
    setActiveStep((p) => Math.min(p + 1, STEPS.length - 1));
  const handlePrev = () => setActiveStep((p) => Math.max(p - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Alert Message */}
      {message.text && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg font-semibold text-white z-50 animate-slide-in ${message.type === "error" ? "bg-red-500" : "bg-green-500"}`}
        >
          {message.text}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4">
        {!selectedTicket ? (
          /* TICKET SELECTION SCREEN */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-brand-900 text-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-2">
                <Home className="w-6 h-6 mr-3" />
                <h1 className="text-3xl font-bold">Service Dashboard</h1>
              </div>
              <p className="text-slate-200">
                Select a ticket to begin the service process
              </p>
            </div>

            {/* Tickets List */}
            <div className="grid gap-4">
              {loading && (
                <ServiceDashboardSkeleton />
              )}

              {!loading && tickets.length === 0 && (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    No tickets available for service
                  </p>
                </div>
              )}

              {!loading &&
                tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => selectTicket(ticket)}
                    className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-lg hover:border-brand-300 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                          {ticket.ticketId}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {ticket.faultDescription}
                        </p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium">
                            {STATUS_LABELS[ticket.status] || ticket.status}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              ticket.priority === "critical"
                                ? "bg-red-100 text-red-700"
                                : ticket.priority === "high"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {ticket.priority?.toUpperCase()}
                          </span>
                          {ticket.isAmcCovered && (
                            <span className="text-xs px-2 py-1 rounded-full font-bold bg-green-100 text-green-700 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> AMC
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          /* SERVICE WORKFLOW SCREEN */
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-brand-900 text-white px-8 py-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {selectedTicket.ticketId}
                  </h1>
                  {selectedTicket.isAmcCovered && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-400/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> AMC COVERED
                    </span>
                  )}
                </div>
                <p className="text-slate-200 text-sm mt-1">
                  {selectedTicket.faultDescription.substring(0, 80)}...
                </p>
                {selectedTicket.isAmcCovered && (
                  <p className="text-green-300 text-xs mt-1 font-medium">⚡ Labour charges waived under AMC contract</p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setJobCard(null);
                  setActiveStep(0);
                  setSavedJobCardId('')
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
              >
                ← Back to Tickets
              </button>
            </div>

            {/* Stepper */}
            <div className="border-b bg-slate-50 px-8 py-4 overflow-x-auto">
              <div className="flex justify-between items-center min-w-[800px]">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === activeStep;
                  const isCompleted = index < activeStep;

                  return (
                    <div
                      key={step.title}
                      className="flex flex-col items-center relative flex-1"
                    >
                      {index !== 0 && (
                        <div
                          className={`absolute top-5 left-0 w-full h-1 -translate-x-1/2 -z-10 transition-colors duration-500 ${isCompleted ? "bg-brand-500" : "bg-slate-200"}`}
                        />
                      )}

                      <div
                        onClick={() => setActiveStep(index)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${isActive ? "bg-brand-500 text-white ring-4 ring-brand-100" : isCompleted ? "bg-brand-500 text-white" : "bg-slate-200 text-slate-400"}`}
                      >
                        {isCompleted && !isActive ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-semibold text-center ${isActive ? "text-brand-600" : isCompleted ? "text-slate-700" : "text-slate-400"}`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 min-h-[500px]">
              {activeStep === 0 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-slate-800 border-b pb-2">
                    📦 Receiving & Authentication
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Received By (Engineer Name)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500"
                        placeholder="Your name"
                        value={formData.receivedBy}
                        onChange={(e) =>
                          updateForm("receivedBy", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date Received
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500"
                        value={formData.dateReceived}
                        onChange={(e) =>
                          updateForm("dateReceived", e.target.value)
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Physical Condition
                      </label>
                      <select
                        value={formData.condition}
                        onChange={(e) =>
                          updateForm("condition", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Select condition...</option>
                        <option value="good">Good - No visible damage</option>
                        <option value="damaged">
                          Damaged - Minor scratches/dents
                        </option>
                        <option value="partial">
                          Partial Damage - Significant damage
                        </option>
                        <option value="unknown">
                          Unknown - Requires inspection
                        </option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Accessories Received with Inverter
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ACCESSORY_OPTIONS.map((acc) => (
                          <button
                            key={acc}
                            onClick={() => toggleAccessory(acc)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.accessories.includes(acc) ? "bg-brand-500 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                          >
                            {acc}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Additional Remarks
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500"
                        placeholder="Note any special observations..."
                        value={formData.receivingRemarks}
                        onChange={(e) =>
                          updateForm("receivingRemarks", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={createJobCard}
                    disabled={
                      loading || !formData.condition || !formData.receivedBy
                    }
                    className="w-full mt-4 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading
                      ? "Creating Job Card..."
                      : "✓ Create Job Card & Authenticate Product"}
                  </button>
                </div>
              )}
              {activeStep === 1 && (
                <StepDiagnostics
                  formData={formData}
                  updateForm={updateForm}
                  updateDiagnosis={updateDiagnosis}
                  showMessage={showMessage}
                  jobCard = {jobCard}
                />
              )}
              {activeStep === 2 && (
                <StepDecision formData={formData} updateForm={updateForm} />
              )}
              {activeStep === 3 && (
                <StepSpares
                  formData={formData}
                  updateSpare={updateSpare}
                  addSpare={addSpare}
                  removeSpare={removeSpare}
                  showMessage={showMessage}
                  submitSpares={submitSpares}
                  onSkip={handleNext}
                />
              )}
              {activeStep === 4 && (
                <StepQC
                  formData={formData}
                  updateForm={updateForm}
                  showMessage={showMessage}
                  submitDispatch={submitDispatch}
                />
              )}
              {activeStep === 5 && (
                <StepReport
                  formData={formData}
                  jobCard={jobCard}
                  selectedTicket={selectedTicket}
                  loading={loading}
                  estimatedCost={calculateEstimatedCost()}
                  generateReport={generateReport}
                  updateForm={updateForm}
                  updateDiagnosis={updateDiagnosis}
                  updateRepairDecision={updateRepairDecision}
                  submitReportToSales={submitReportToSales}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t bg-slate-50 flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={activeStep === 0}
                className="flex items-center px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </button>

              <div className="flex gap-3">
                {activeStep === 0 && jobCard && (
                  <button
                    onClick={() => handleNext()}
                    className="flex items-center px-6 py-2.5 rounded-xl font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                  >
                    Proceed <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
                {activeStep === 1 && (
                  <button
                    onClick={() => {
                      updateDiagnosis();
                      setTimeout(handleNext, 500);
                    }}
                    disabled={loading}
                    className="flex items-center px-6 py-2.5 rounded-xl font-semibold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                  >
                    Save Diagnosis <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
                {activeStep === 2 && (
                  <button
                    onClick={() => {
                      updateRepairDecision();
                      setTimeout(handleNext, 500);
                    }}
                    disabled={loading}
                    className="flex items-center px-6 py-2.5 rounded-xl font-semibold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                  >
                    Save Decision <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
                {activeStep === 3 && formData.isRepairable && formData.spares.length > 0 && (
                  <button
                    onClick={() => {
                      submitSpares();
                      setTimeout(handleNext, 500);
                    }}
                    disabled={loading}
                    className="flex items-center px-6 py-2.5 rounded-xl font-semibold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                  >
                    Record Spares <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
                {activeStep === 4 && (
                  <button
                    onClick={() => {
                      submitTestingReport();
                      setTimeout(handleNext, 500);
                    }}
                    disabled={loading}
                    className="flex items-center px-6 py-2.5 rounded-xl font-semibold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                  >
                    Submit QC <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
                {(activeStep === 0 ||
                  activeStep === 1 ||
                  activeStep === 2 ||
                  activeStep === 3) &&
                  activeStep !== 5 && (
                    <button
                      onClick={handleNext}
                      className="flex items-center px-6 py-2.5 rounded-xl font-semibold bg-slate-300 text-slate-700 hover:bg-slate-400 transition-colors"
                    >
                      Skip <ChevronRight className="w-5 h-5 ml-1" />
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
