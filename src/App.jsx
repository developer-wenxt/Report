import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import CreateReportPage from "./pages/CreateReportPage";
import LoginPage from "./pages/LoginPage";
import ReportPage from "./pages/ReportPage";
import ReportParamsPage from "./pages/ReportParamsPage";
import ProcedurePage from "./pages/ProcedurePage";
import QueryPage from "./pages/QueryPage";
import { getUserRole } from "./authUtils.jsx";

// React Router helper
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AppWrapper() {
  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyToken() {
      const tokenFromQuery = query.get("token");

      if (tokenFromQuery) {
        //  Save token
        localStorage.setItem("token", tokenFromQuery);

        try {
          // Send token to backend to decode & validate
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/auth/validate`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenFromQuery}`,
            },
          });

          const data = await response.json();

          // Get role correctly based on backend response
          let role =
            data.user_type || // main field we want
            data.role_from_token ||
            data.role_from_db ||
            (data.decoded_payload && data.decoded_payload.Role);

          if (!role) throw new Error("Role not found in response");

          // Normalize role format
          role = role.toLowerCase(); // ADM→admin, USR→user

          // Store role
          localStorage.setItem("role", role);

          // Redirect to main page
          navigate("/report", { replace: true });

        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.clear();
          navigate("/", { replace: true });
        }
      }
    }

    verifyToken();
  }, [query, navigate]);

  // Read role after we store it
  const role = getUserRole(); // returns "admin" or "user"

  return (
    <Routes>
      {/* ADMIN ROUTES */}
      {role === "admin" && (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/params" element={<ReportParamsPage />} />
          <Route path="/Procedure" element={<ProcedurePage />} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/create" element={<CreateReportPage />} />
        </>
      )}

      {/* USER ROUTES */}
      {role === "user" && (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/params" element={<ReportParamsPage />} />
        </>
      )}

      {/* NOT LOGGED IN / FIRST TIME */}
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
