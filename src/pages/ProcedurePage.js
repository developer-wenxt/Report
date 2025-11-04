import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  saveProcedureConfigurationAPI,
  updateProcedureConfigurationAPI,
} from "../api/apiService";

export default function ProcedurePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialReportId = location.state?.report_id || "";
  const isEditMode = location.state?.isEdit || false;
  const existingData = location.state?.existingData || null;

  // State for editable report ID (make editable if duplicate detected)
  const [reportIdState, setReportIdState] = useState(initialReportId);
  const [isReportIdEditable, setIsReportIdEditable] = useState(false);

  const [isEditing, setIsEditing] = useState(!isEditMode);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(isEditMode);

  // Procedure Details
  const [procedureData, setProcedureData] = useState({
    procedureName: existingData?.procedure_name || "",
    packageName: existingData?.package_name || "",
  });

  // Report Info
  const [reportData, setReportData] = useState({
    reportName: existingData?.report_name || "",
  });

  // Procedure Parameters
  const [procedureParams, setProcedureParams] = useState(
    existingData?.parameters || [
      { param_name: "", param_type: "IN", datatype: "NUMBER", display_name: "" },
    ]
  );

  // Query Details
  const [queryDetails, setQueryDetails] = useState({
    query1: existingData?.report_query1 || "",
    query2: existingData?.report_query2 || "",
  });

  // Modal popup state
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    isError: false,
  });

  const handleProcedureChange = (e) => {
    const { name, value } = e.target;
    setProcedureData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProcedureParamChange = (index, field, value) => {
    const newParams = [...procedureParams];
    newParams[index][field] = value;
    setProcedureParams(newParams);
  };

  const addProcedureParam = () => {
    setProcedureParams([
      ...procedureParams,
      { param_name: "", param_type: "IN", datatype: "NUMBER", display_name: "" },
    ]);
  };

  const removeProcedureParam = (index) => {
    if (procedureParams.length > 1) {
      setProcedureParams(procedureParams.filter((_, i) => i !== index));
    }
  };

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQueryDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!procedureData.procedureName || !procedureData.packageName || !reportData.reportName) {
      setModal({
        show: true,
        title: "Validation Error",
        message: "Please fill in all required fields.",
        isError: true,
      });
      return;
    }

    setLoading(true);
    try {
      const configurationData = {
        report_id: reportIdState,
        report_name: reportData.reportName,
        package_name: procedureData.packageName,
        procedure_name: procedureData.procedureName,
        report_query1: queryDetails.query1,
        report_query2: queryDetails.query2,
        parameters: procedureParams.map((p) => ({
          param_name: p.param_name,
          param_type: p.param_type.toUpperCase(),
          display_name: p.display_name,
          data_type: p.datatype,
        })),
      };

      if (isSaved || isEditMode) {
        await updateProcedureConfigurationAPI(reportIdState, configurationData);
        setModal({
          show: true,
          title: "Success",
          message: "Configuration updated successfully!",
          isError: false,
        });
      } else {
        await saveProcedureConfigurationAPI(configurationData);
        setModal({
          show: true,
          title: "Success",
          message: "Data saved successfully!",
          isError: false,
        });
        setIsSaved(true);
        setIsReportIdEditable(false);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      const errorDetail = error.response?.data?.detail || error.message || "Error saving data. Please try again.";

      if (errorDetail === "Report ID already exists") {
        setModal({
          show: true,
          title: "Duplicate Report ID",
          message: "A report with this ID already exists. Please change the Report ID.",
          isError: true,
        });
        setIsReportIdEditable(true);  // Enable editing Report ID on duplicate error
      } else {
        setModal({
          show: true,
          title: "Error",
          message: errorDetail,
          isError: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsReportIdEditable(isEditMode); // Allow editing Report ID if in edit mode
  };

  const handleCancel = () => {
    if (isSaved) {
      setIsEditing(false);
      setIsReportIdEditable(false);
    } else {
      if (isEditMode && existingData) {
        setProcedureData({
          procedureName: existingData.procedure_name,
          packageName: existingData.package_name,
        });
        setReportData({
          reportName: existingData.report_name,
        });
        setProcedureParams(
          existingData.parameters || [
            { param_name: "", param_type: "IN", datatype: "NUMBER", display_name: "" },
          ]
        );
        setQueryDetails({
          query1: existingData.report_query1,
          query2: existingData.report_query2,
        });
        setReportIdState(initialReportId);
        setIsReportIdEditable(false);
      } else {
        setProcedureData({ procedureName: "", packageName: "" });
        setReportData({ reportName: "" });
        setProcedureParams([{ param_name: "", param_type: "IN", datatype: "NUMBER", display_name: "" }]);
        setQueryDetails({ query1: "", query2: "" });
        setReportIdState("");
        setIsReportIdEditable(false);
      }
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Modal Popup */}
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg border border-gray-300 text-center">
            <h3 className={`text-lg font-semibold mb-4 ${modal.isError ? "text-red-600" : "text-green-600"}`}>
              {modal.title}
            </h3>
            <p className="mb-6">{modal.message}</p>
            <button
              type="button"
              onClick={() => setModal({ show: false, title: "", message: "", isError: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-blue-200 font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg">
              {isEditMode ? "Edit Procedure Configuration" : "Create With Procedure"}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Procedure Details Card */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Procedure Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Procedure Name *</label>
                  <input
                    name="procedureName"
                    value={procedureData.procedureName}
                    onChange={handleProcedureChange}
                    disabled={!isEditing}
                    placeholder="Enter procedure name"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Package Name *</label>
                  <input
                    name="packageName"
                    value={procedureData.packageName}
                    onChange={handleProcedureChange}
                    disabled={!isEditing}
                    placeholder="Enter package name"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Report ID</label>
                  <input
                    name="reportId"
                    value={reportIdState}
                    disabled={!isReportIdEditable}
                    onChange={(e) => setReportIdState(e.target.value)}
                    placeholder="Enter or change report ID"
                    className={`w-full border rounded-lg p-3 ${isReportIdEditable ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'} transition-all duration-200`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Report Name *</label>
                  <input
                    name="reportName"
                    value={reportData.reportName}
                    onChange={handleReportChange}
                    disabled={!isEditing}
                    placeholder="Enter report name"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Procedure Parameter Details Card */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Procedure Parameter Details
              </h2>
              {isEditing && (
                <button
                  onClick={addProcedureParam}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Add Parameter
                </button>
              )}
            </div>
            <div className="p-6">
              {/* Header Row */}
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-4 px-4 py-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-2">Param Name</div>
                <div className="text-sm font-semibold text-gray-700">Param Type</div>
                <div className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-2">Data Type</div>
                <div className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-1">Display Name</div>
                <div className="text-sm font-semibold text-gray-700">Action</div>
              </div>

              {/* Parameter Rows */}
              <div className="space-y-3">
                {procedureParams.map((param, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                    <input
                      type="text"
                      placeholder="Parameter name"
                      value={param.param_name}
                      disabled={!isEditing}
                      onChange={(e) => handleProcedureParamChange(i, "param_name", e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <select
                      value={param.param_type}
                      disabled={!isEditing}
                      onChange={(e) => handleProcedureParamChange(i, "param_type", e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option>IN</option>
                      <option>OUT</option>
                    </select>
                    <select
                      value={param.datatype}
                      disabled={!isEditing}
                      onChange={(e) => handleProcedureParamChange(i, "datatype", e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option>NUMBER</option>
                      <option>DATE</option>
                      <option>VARCHAR2</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Display name"
                      value={param.display_name}
                      disabled={!isEditing}
                      onChange={(e) => handleProcedureParamChange(i, "display_name", e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeProcedureParam(i)}
                        disabled={procedureParams.length === 1}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        type="button"
                        aria-label="Delete Parameter"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Query Details Card */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Query Details
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Select Query</label>
                <textarea
                  name="query1"
                  value={queryDetails.query1}
                  onChange={handleQueryChange}
                  disabled={!isEditing}
                  placeholder="Enter your SELECT query here..."
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Where Query</label>
                <textarea
                  name="query2"
                  value={queryDetails.query2}
                  onChange={handleQueryChange}
                  disabled={!isEditing}
                  placeholder="Enter your WHERE query here..."
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 pt-6 pb-4">
            {!isSaved || isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      {isSaved ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {isSaved ? "Update Configuration" : "Save Configuration"}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Edit Configuration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
