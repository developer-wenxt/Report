import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchParamsAPI, fetchReportDataAPI } from "../api/apiService";
import { saveAs } from "file-saver";
import bgGround from "../assets/group.png"; 

export default function ReportParamsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const report_id = location.state?.report_id;

  const [params, setParams] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!report_id) return;

    const fetchParams = async () => {
      try {
        const res = await fetchParamsAPI(report_id);
        const fetchedParams = res.data.parameters || [];
        setParams(fetchedParams);

        const defaults = {};
        fetchedParams.forEach((p) => {
          defaults[p.name] = p.default || "";
        });
        setValues(defaults);
      } catch (err) {
        console.error(err);
        setError("Failed to load report parameters. Please try again.");
      }
    };

    fetchParams();
  }, [report_id]);

  if (!report_id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center relative">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgGround})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-red-600 mb-4 animate-pulse">
              Invalid Access
          </h2>
          <p className="text-gray-200 mb-6">
            Please go back and select a report first.
          </p>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
            onClick={() => navigate("/report")}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const param_values = {};
      params.forEach((p) => {
        let val = values[p.name];
        if (p.type === "DATE" && val) {
          const [y, m, d] = val.split("-");
          val = `${d}/${m}/${y}`;
        }
        param_values[p.name] = val;
      });

      const res = await fetchReportDataAPI(report_id, param_values);
      const base64String = res.data.base64_excel;
      if (!base64String) {
        setError("No file received from backend.");
        return;
      }

      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `${report_id}_report.xlsx`);
    } catch (err) {
      console.error(err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 relative">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgGround})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white shadow-2xl rounded-2xl p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
            Report Parameters
          </h2>

          {error && (
            <p className="text-red-600 bg-red-100 p-3 rounded mb-4 border border-red-300">
              {error}
            </p>
          )}

          {params.length === 0 && !error && (
            <p className="text-gray-600 mb-4 text-center">No parameters found.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {params.map((p) => {
              const isDate =
                p.type === "DATE" || p.name.toLowerCase().includes("date");
              return (
                <div key={p.name} className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{p.label}</label>
                  <input
                    type={
                      isDate ? "date" : p.type === "VARCHAR2" ? "text" : "number"
                    }
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all"
                    value={
                      isDate && values[p.name]
                        ? values[p.name].split("/").reverse().join("-")
                        : values[p.name]
                    }
                    onChange={(e) => handleChange(p.name, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          {params.length > 0 && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 font-semibold"
            >
              {loading ? "Generating..." : "Generate & Download Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
