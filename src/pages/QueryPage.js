import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bgImage from "../assets/group.png";

export default function QueryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = location.state?.report_id || ""; 

  const handleWithoutProcedure = () => {
    navigate("/create", { state: { report_id: reportId } });
  };

  const handleWithProcedure = () => {
    navigate("/procedure", { state: { report_id: reportId } });
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen p-6"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-blue-900/20 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md gap-8">
        {/* 🟢 Query Without Procedure Card */}
        <div className="flex flex-col justify-between w-full p-6 transition-all duration-300 shadow-xl cursor-default bg-white/95 rounded-xl hover:scale-105 hover:shadow-2xl hover:bg-blue-50/95">
          <h2 className="mb-3 text-xl font-bold text-center text-blue-700">
            Query Without Procedure
          </h2>

          <p className="mb-4 text-sm text-center text-gray-600">
            Create a Report Without Procedure
          </p>

          <button
            onClick={handleWithoutProcedure}
            className="py-2 text-sm font-semibold text-white transition-colors duration-200 bg-blue-600 border border-blue-700 rounded-lg hover:bg-blue-700"
          >
            Enter
          </button>
        </div>

        {/* Query With Procedure Card */}
        <div className="flex flex-col justify-between w-full p-6 transition-all duration-300 shadow-xl cursor-default bg-white/95 rounded-xl hover:scale-105 hover:shadow-2xl hover:bg-blue-50/95">
          <h2 className="mb-3 text-xl font-bold text-center text-blue-700">
            Query With Procedure
          </h2>

          <p className="mb-4 text-sm text-center text-gray-600">
            Create a Report With Procedure
          </p>

          <button
            onClick={handleWithProcedure}
            className="py-2 text-sm font-semibold text-white transition-colors duration-200 bg-green-600 border border-green-700 rounded-lg hover:bg-green-700"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
