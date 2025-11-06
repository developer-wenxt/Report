import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import CreateReportPage from "./pages/CreateReportPage";
import LoginPage from "./pages/LoginPage";
import ReportPage from "./pages/ReportPage";
import ReportParamsPage from "./pages/ReportParamsPage";
import ProcedurePage from "./pages/ProcedurePage";
import QueryPage from "./pages/QueryPage";
import { getUserRole } from "./authUtils.jsx";

// ✅ Add this hook (React Router v6 no longer provides useQuery)
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AppWrapper() {
  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromQuery = query.get("token");
    if (tokenFromQuery) {
      localStorage.setItem("token", tokenFromQuery);
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
          <Route path="/report" element={<ReportPage />} />
          <Route path="/params" element={<ReportParamsPage />} />
          <Route path="/" element={<LoginPage />} />
        </>
      )}

      {!role && (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<LoginPage />} />
        </>
      )}
    </Routes>
  );
}

export default AppWrapper;
