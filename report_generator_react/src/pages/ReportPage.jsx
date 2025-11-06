
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/group.png";
import { fetchColumn } from "../api/apiService";
import { getUserRole } from "../authUtils";

export default function ReportPage() {
  const role = getUserRole();
  const navigate = useNavigate();
  const [reportList, setReportList] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const [newReportId, setNewReportId] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown")
        setHighlightIndex((i) => Math.min(i + 1, reportList.length - 1));
      if (e.key === "ArrowUp")
        setHighlightIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Enter" && highlightIndex >= 0) {
        setSelectedReport(reportList[highlightIndex]);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, highlightIndex, reportList]);

  // Scroll highlight
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightIndex]);

  // Handle dropdown open + fetch API once
  const handleToggle = async () => {
    setOpen((s) => !s);
    setHighlightIndex(-1);

    if (!loaded) {
      try {
        const res = await fetchColumn();
        const list =
          Array.isArray(res.report_name)
            ? res.report_name
            : Array.isArray(res.data?.report_name)
            ? res.data.report_name
            : [];
        setReportList(list);
        setLoaded(true);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setReportList([]);
      }
    }
  };

  const handleChoose = (name) => {
    setSelectedReport(name);
    setOpen(false);
  };

  const handleEnter = () => {
    if (!selectedReport) {
      alert("Please select a report");
      return;
    }
    navigate("/params", { state: { report_id: selectedReport } });
  };

  const handleCreateEnter = () => {
    if (!newReportId.trim()) {
      alert("Please enter a new Report ID");
      return;
    }
    navigate("/query", { state: { report_id: newReportId } });
  };

  if (role === "user") {
    // Show only Select Report Card centered for user
    return (
      <div
        className="relative flex items-center justify-center min-h-screen p-6"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 pointer-events-none bg-blue-900/20 backdrop-blur-sm" />

        <div className="relative z-10 flex items-center justify-center w-full">
          {/* Select Report Card */}
          <div
            ref={dropdownRef}
            className={`w-[380px] h-[360px] bg-white/95 rounded-xl shadow-xl p-5 flex flex-col justify-between transition-all duration-300 cursor-default relative
            ${open ? "scale-105 z-20" : ""} hover:scale-102 hover:shadow-xl hover:bg-blue-50/95 hover:-translate-y-1`}
          >
            <h2 className="mb-1 text-lg font-bold text-center text-blue-700">
              Select a Report
            </h2>

            <div className="relative flex-1 mt-1">
              <label className="block mb-1 text-xs text-gray-500">Report ID</label>

              <button
                type="button"
                className={`w-full flex items-center justify-between p-2 rounded-lg border-2 bg-white text-sm shadow-sm transition-all duration-200
                  ${open ? "border-blue-500 shadow-md" : "border-gray-300"} hover:border-blue-400`}
                onClick={handleToggle}
              >
                <span
                  className={
                    selectedReport
                      ? "text-blue-900 font-semibold text-sm"
                      : "text-gray-500 text-sm"
                  }
                >
                  {selectedReport || "-- Select Report --"}
                </span>
                <span
                  className={`text-blue-500 transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              <div
                ref={listRef}
                className={`mt-1 rounded-lg border border-blue-100 bg-white shadow-lg transition-all duration-300 overflow-hidden
                  ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
              >
                <div className="overflow-y-auto max-h-40">
                  {reportList.length === 0 ? (
                    <div className="p-2 text-xs italic text-center text-gray-400">
                      {loaded ? "No reports available" : "Loading..."}
                    </div>
                  ) : (
                    reportList.map((name, idx) => {
                      const isSelected = name === selectedReport;
                      const isHighlighted = idx === highlightIndex;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleChoose(name)}
                          onMouseEnter={() => setHighlightIndex(idx)}
                          className={`p-2 border-b border-blue-50 text-xs cursor-pointer transition-colors duration-150
                            ${
                              isSelected
                                ? "bg-blue-100 text-blue-800 font-semibold"
                                : isHighlighted
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-blue-50"
                            }`}
                        >
                          {name}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 bg-blue-600 border border-blue-700 rounded-lg hover:bg-blue-700"
                onClick={handleEnter}
              >
                Enter
              </button>
              <button
                className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setSelectedReport("")}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // else show full page for admin
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

      <div className="relative z-10 flex flex-wrap items-stretch justify-center gap-6">
        {/* Select Report Card */}
        <div
          ref={dropdownRef}
          className={`w-[380px] h-[360px] bg-white/95 rounded-xl shadow-xl p-5 flex flex-col justify-between transition-all duration-300 cursor-default relative
          ${open ? "scale-105 z-20" : ""} hover:scale-102 hover:shadow-xl hover:bg-blue-50/95 hover:-translate-y-1`}
        >
          <h2 className="mb-1 text-lg font-bold text-center text-blue-700">
            Select a Report
          </h2>

          <div className="relative flex-1 mt-1">
            <label className="block mb-1 text-xs text-gray-500">Report ID</label>

            <button
              type="button"
              className={`w-full flex items-center justify-between p-2 rounded-lg border-2 bg-white text-sm shadow-sm transition-all duration-200
              ${open ? "border-blue-500 shadow-md" : "border-gray-300"} hover:border-blue-400`}
              onClick={handleToggle}
            >
              <span
                className={
                  selectedReport
                    ? "text-blue-900 font-semibold text-sm"
                    : "text-gray-500 text-sm"
                }
              >
                {selectedReport || "-- Select Report --"}
              </span>
              <span
                className={`text-blue-500 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            <div
              ref={listRef}
              className={`mt-1 rounded-lg border border-blue-100 bg-white shadow-lg transition-all duration-300 overflow-hidden
              ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
            >
              <div className="overflow-y-auto max-h-40">
                {reportList.length === 0 ? (
                  <div className="p-2 text-xs italic text-center text-gray-400">
                    {loaded ? "No reports available" : "Loading..."}
                  </div>
                ) : (
                  reportList.map((name, idx) => {
                    const isSelected = name === selectedReport;
                    const isHighlighted = idx === highlightIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleChoose(name)}
                        onMouseEnter={() => setHighlightIndex(idx)}
                        className={`p-2 border-b border-blue-50 text-xs cursor-pointer transition-colors duration-150
                        ${
                          isSelected
                            ? "bg-blue-100 text-blue-800 font-semibold"
                            : isHighlighted
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        {name}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              className="flex-1 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 bg-blue-600 border border-blue-700 rounded-lg hover:bg-blue-700"
              onClick={handleEnter}
            >
              Enter
            </button>
            <button
              className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => setSelectedReport("")}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Create Report Card */}
        <div className="w-[380px] h-[360px] bg-white/95 rounded-xl shadow-xl p-5 flex flex-col justify-between transition-all duration-300 cursor-default hover:scale-102 hover:shadow-xl hover:bg-blue-50/95 hover:-translate-y-1">
          <h2 className="mb-1 text-lg font-bold text-center text-blue-700">
            Create Report
          </h2>

          <div className="flex flex-col justify-start flex-1">
            <label className="block mb-1 text-xs text-gray-500">Report ID</label>
            <input
              type="text"
              placeholder="Enter new Report ID"
              value={newReportId}
              onChange={(e) => setNewReportId(e.target.value)}
              className="w-full p-2 text-sm transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm outline-none focus:border-blue-500 focus:shadow-md"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateEnter();
              }}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              className="flex-1 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 bg-blue-600 border border-blue-700 rounded-lg hover:bg-blue-700"
              onClick={handleCreateEnter}
            >
              Enter
            </button>
            <button
              className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => setNewReportId("")}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
