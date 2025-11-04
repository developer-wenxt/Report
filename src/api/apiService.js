//"http://192.168.1.46:9000"
// src/services/apiService.js
import axios from "axios";

// Replace with your actual backend URL
const API_BASE = "http://192.168.1.46:9000"; 

// 🔹 Fetch parameters for a report
export const fetchParamsAPI = async (report_name) => {
  return axios.get(`${API_BASE}/report/${report_name}/params`);
};

// 🔹 Fetch columns for dropdown
export const fetchColumn = async () => {
  const res = await axios.get(`${API_BASE}/fetch_column`);
  return res.data;
};

// 🔹 Update Report Query
export const updateReportQueryAPI = (report_id, data) => {
  return axios.put(`${API_BASE}/update_report_query/${report_id}`, data);
};

// 🔹 Update Report Parameters
export const updateReportParamsAPI = (report_id, data) => {
  return axios.put(`${API_BASE}/report-params/${report_id}`, data);
};

// 🔹 Add Procedure
export const addProcedureAPI = (data) => {
  return axios.post(`${API_BASE}/add_procedure`, data);
};

// 🔹 Add Report Parameters
export const addReportParamsAPI = async (report_id, parameters) => {
  return axios.post(`${API_BASE}/add_report_params`, {
    report_id,
    parameters,
  });
};

// 🔹 Save Complete Procedure Configuration
export const saveProcedureConfigurationAPI = async (configurationData) => {
  return axios.post(`${API_BASE}/report/create/procedure`, configurationData);
};

// 🔹 Update Complete Procedure Configuration
export const updateProcedureConfigurationAPI = async (reportId, configurationData) => {
  return axios.put(`${API_BASE}/report/update/procedure/${reportId}`, configurationData);
};

// 🔹 Generate Report with Parameters
export const fetchReportDataAPI = async (report_name, param_values) => {
  return axios.post(`${API_BASE}/report/generate`, {
    report_name,
    param_values,
  });
};

// src/api/apiService.js


const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 🔹 Create Report with Parameters
export const createReportWithParamsAPI = async (reportData) => {
  try {
    console.log('📝 Creating report with data:', reportData);
    const response = await apiClient.post("/create_report_with_params", {
      report_id: reportData.report_id,
      report_name: reportData.report_name,
      report_query1: reportData.report_query1,
      report_query2: reportData.report_query2 || "",
      parameters: reportData.parameters || [],
    });
    console.log('✅ Create report success:', response.data);
    return response.data; // Return the actual response data
  } catch (error) {
    console.error('❌ Create report failed:', error);
    throw error;
  }
};

// 🔹 Update Report with Parameters
export const updateReportWithParamsAPI = async (reportData) => {
  try {
    console.log('📝 Updating report with data:', reportData);
    const response = await apiClient.put("/update_report_with_params", {
      report_id: reportData.report_id,
      report_name: reportData.report_name,
      report_query1: reportData.report_query1,
      report_query2: reportData.report_query2 || "",
      parameters: reportData.parameters || [],
    });
    console.log('✅ Update report success:', response.data);
    return response.data; // Return the actual response data
  } catch (error) {
    console.error('❌ Update report failed:', error);
    throw error;
  }
};