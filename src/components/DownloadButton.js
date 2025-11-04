import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DownloadButton({ data }) {
  const handleDownload = () => {
    if (!data || !data.length) return;

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    // Generate Excel file and save
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "report.xlsx");
  };

  return (
    <button
      className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      onClick={handleDownload}
    >
      Download Excel
    </button>
  );
}
