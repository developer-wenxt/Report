import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ReportPage from "./pages/ReportPage";
import ReportParamsPage from "./pages/ReportParamsPage";
import CreateReportPage from "./pages/CreateReportPage";
import ProcedurePage from "./pages/ProcedurePage";
import QueryPage from "./pages/QueryPage";
import { getUserRole } from './authUtils'; // Import the token utility

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AppWrapper() {
  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromQuery = query.get('token');
    if (tokenFromQuery) {
      localStorage.setItem('token', tokenFromQuery);
      // Clean the URL by removing token param
      navigate(window.location.pathname, { replace: true });
    }
  }, [query, navigate]);

  const role = getUserRole();

  return (
    <Routes>
      {role === "admin" && (
        <>
          <Route path="/create" element={<CreateReportPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/params" element={<ReportParamsPage />} />
          <Route path="/Procedure" element={<ProcedurePage />} />
          <Route path="/query" element={<QueryPage />} />
        </>
      )}
      {role === "user" && (
        <>
          {/* Show only limited routes for user */}
         <Route path="/report" element={<ReportPage />} />
         <Route path="/params" element={<ReportParamsPage />} />
         <Route path="/" element={<LoginPage />} />
          {/* Add other user-allowed routes here */}
        </>
      )}
      {!role && (
        <Route path="*" element={<LoginPage />} />
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
