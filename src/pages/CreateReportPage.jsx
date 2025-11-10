import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createReportWithParamsAPI,
  updateReportWithParamsAPI
} from "../api/apiService";

export default function CreateReportPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialReportId = location.state?.report_id || "";
  const isEditMode = location.state?.isEdit || false;
  const existingData = location.state?.existingData || null;

  // Manage editable report ID state
  const [reportIdState, setReportIdState] = useState(initialReportId);
  const [isReportIdEditable, setIsReportIdEditable] = useState(false);

  const [isEditing, setIsEditing] = useState(!isEditMode);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(isEditMode);

  const [formData, setFormData] = useState({
    reportName: existingData?.report_name || "",
    query1: existingData?.report_query1 || "",
    query2: existingData?.report_query2 || "",
  });

  const [params, setParams] = useState(
    existingData?.parameters || [
      { param_name: "", param_type: "VARCHAR2", display_name: "" }
    ]
  );

  const [errors, setErrors] = useState({});

  // Modal state for popup messages
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    isError: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleParamChange = (index, field, value) => {
    const updatedParams = params.map((param, i) => i === index ? { ...param, [field]: value } : param);
    setParams(updatedParams);
  };

  const addParam = () => {
    setParams([...params, { param_name: "", param_type: "VARCHAR2", display_name: "" }]);
  };

  const removeParam = (index) => {
    if (params.length > 1) setParams(params.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reportName.trim()) newErrors.reportName = "Report Name is required";
    if (!formData.query1.trim()) newErrors.query1 = "Query 1 is required";
    if (!formData.query2.trim()) newErrors.query2 = "Query 2 is required";

    params.forEach((param, index) => {
      if (!param.param_name.trim() && (param.display_name.trim() || param.param_type.trim())) {
        newErrors[`param_name_${index}`] = "Parameter name is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const configurationData = {
        report_id: reportIdState,
        report_name: formData.reportName,
        report_query1: formData.query1,
        report_query2: formData.query2 || "",
        parameters: params
          .filter(param => param.param_name.trim() || param.display_name.trim() || param.param_type.trim())
          .map(param => ({
            param_name: param.param_name,
            param_type: param.param_type.toUpperCase(),
            display_name: param.display_name
          }))
      };

      console.log("Sending configuration to backend:", configurationData);

      let response;
      if (isSaved || isEditMode) {
        response = await updateReportWithParamsAPI(configurationData);
        setModal({
          show: true,
          title: "Success",
          message: response.message || "Report configuration updated successfully!",
          isError: false,
        });
      } else {
        response = await createReportWithParamsAPI(configurationData);
        setModal({
          show: true,
          title: "Success",
          message: response.message || "Report configuration saved successfully!",
          isError: false,
        });
        setIsSaved(true);

        if (response.report_id) {
          console.log(" New report ID:", response.report_id);
          setReportIdState(response.report_id);
          setIsReportIdEditable(false);
        }
      }

      console.log(" Backend response:", response);
      setIsEditing(false);
    } catch (error) {
      console.error(" API Error:", error);

      const errorDetail = error.response?.data?.detail || error.message || "Unknown error";

      if (errorDetail === "Report ID already exists") {
        setModal({
          show: true,
          title: "Duplicate Report ID",
          message: "A report with this ID already exists. Please change the Report ID.",
          isError: true,
        });
        setIsReportIdEditable(true); // Enable editing the Report ID so user can fix it
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
    setIsReportIdEditable(isEditMode); // Allow editing report ID in edit mode if needed
  };

  const handleCancel = () => {
    if (isSaved) {
      setIsEditing(false);
      setIsReportIdEditable(false);
    } else {
      if (isEditMode && existingData) {
        setFormData({
          reportName: existingData.report_name,
          query1: existingData.report_query1,
          query2: existingData.report_query2,
        });
        setParams(existingData.parameters || [{ param_name: "", param_type: "VARCHAR2", display_name: "" }]);
        setReportIdState(initialReportId);
        setIsReportIdEditable(false);
      } else {
        setFormData({ reportName: "", query1: "", query2: "" });
        setParams([{ param_name: "", param_type: "VARCHAR2", display_name: "" }]);
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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <button onClick={() => navigate(-1)} className="flex items-center text-white hover:text-blue-200 font-medium transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg">
              {isEditMode ? "Edit Report Configuration" : "Create Report"}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8 space-y-8">

          {/* Report Details */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Report Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
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
                <div className="space-y-2 xl:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700">Report Name *</label>
                  <input
                    name="reportName"
                    value={formData.reportName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter report name"
                    className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${errors.reportName ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {errors.reportName && <p className="mt-1 text-sm text-red-500">{errors.reportName}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Query Details */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Query Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Select Query *</label>
                <textarea
                  name="query1"
                  value={formData.query1}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your SELECT query here..."
                  rows={5}
                  className={`w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm transition-all duration-200 ${errors.query1 ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.query1 && <p className="mt-1 text-sm text-red-500">{errors.query1}</p>}
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Where Query *</label>
                <textarea
                  name="query2"
                  value={formData.query2}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your WHERE query here..."
                  rows={5}
                  className={`w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm transition-all duration-200 ${errors.query2 ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.query2 && <p className="mt-1 text-sm text-red-500">{errors.query2}</p>}
              </div>
            </div>
          </section>

          {/* Parameter Details */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Parameter Details</h2>
              {isEditing && <button onClick={addParam} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">Add Parameter</button>}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 md:grid-cols-11 gap-4 mb-4 px-4 py-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-3">Param Name</div>
                <div className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-3">Param Type</div>
                <div className="text-sm font-semibold text-gray-700 col-span-1 md:col-span-3">Display Name</div>
                <div className="text-sm font-semibold text-gray-700">Action</div>
              </div>
              <div className="space-y-3">
                {params.map((param, i) => (
                  <div key={i} className="grid grid-cols-3 md:grid-cols-11 gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                    <input
                      type="text"
                      placeholder="Parameter name"
                      value={param.param_name}
                      disabled={!isEditing}
                      onChange={(e) => handleParamChange(i, "param_name", e.target.value)}
                      className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-3 transition-all duration-200 ${errors[`param_name_${i}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    <select
                      value={param.param_type}
                      disabled={!isEditing}
                      onChange={(e) => handleParamChange(i, "param_type", e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-3 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <option>VARCHAR2</option>
                      <option>NUMBER</option>
                      <option>DATE</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Display name"
                      value={param.display_name}
                      disabled={!isEditing}
                      onChange={(e) => handleParamChange(i, "display_name", e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-3 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                    />
                    {isEditing && <button onClick={() => removeParam(i)} disabled={params.length === 1} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed" type="button" aria-label="Delete Parameter">Delete</button>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 pt-6 pb-4">
            {!isSaved || isEditing ? (
              <>
                <button onClick={handleSave} disabled={loading} className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  {loading ? <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : null}
                  {isSaved ? (loading ? "Updating..." : "Update Configuration") : (loading ? "Saving..." : "Save Configuration")}
                </button>
                <button onClick={handleCancel} disabled={loading} className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Cancel</button>
              </>
            ) : (
              <button onClick={handleEdit} className="flex items-center px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Edit Configuration</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
