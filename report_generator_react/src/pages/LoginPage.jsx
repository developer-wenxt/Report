import React  from "react";
import { useNavigate } from "react-router-dom";
import bgPage from "../assets/group.png"; 
import bgCard from "../assets/login-bg.jpg";

export default function ReportsCardPage() {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate("/report");
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgPage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden", // prevent scroll / zoom shifting
      }}
    >
      {/* Overlay blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Center Card */}
      <div
        onClick={handleCardClick}
        className="relative z-10 flex flex-col items-center justify-between overflow-hidden transition-transform transform bg-white shadow-2xl cursor-pointer rounded-2xl hover:scale-105 w-80 h-80"
        style={{
          transformOrigin: "center center",
        }}
      >
        {/* Card Image */}
        <div
          className="w-full bg-center bg-cover h-3/4"
          style={{
            backgroundImage: `url(${bgCard})`,
          }}
        ></div>

        {/* Text Below Image */}
        <div className="flex items-center justify-center w-full bg-white h-1/4">
          <h2 className="text-2xl font-bold text-gray-800"> REPORTS</h2>
        </div>
      </div>
    </div>
  );
}
