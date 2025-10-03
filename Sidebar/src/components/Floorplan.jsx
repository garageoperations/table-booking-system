import React, { useEffect, useState } from "react";
import { useSidebarStore } from "../lib/sidebarStore";
import DateSelector from "./DateSelector";

export default function Floorplan() {
  const [tables, setTables] = useState([]);
  const [layout, setLayout] = useState(null);
  const { openSidebar, setSelectedTable, setSelectedSeat, setBookingType } = useSidebarStore();

  useEffect(() => {
    fetch("/positions.json")
      .then(res => res.json())
      .then(data => {
        setTables(data.tables);
        setLayout(data.layout);
      })
      .catch(err => console.error("Error loading positions.json:", err));
  }, []);

  function getHeatmapColor(value) {
    if (value === 0) return "transparent"; // no color for empty
    const percent = value / 10; // scale 0–10 → 0–1
    // light pink → deep red
    const lightness = 90 - percent * 50; 
    return `hsl(0, 100%, ${lightness}%)`;
  }

  if (!layout) return <div>Loading floorplan...</div>;

  const tablesWithBusyness = tables.map(table => ({
    ...table,
    busyness: Math.round(Math.random()) // Either 0 or 1, (Busy or not busy)
  }));

  return (
    <div className="floorplan-container relative inline-block">
      {/* Date Selector */}
      <DateSelector />
      {/* Floorplan image */}
      <img src="/floorplan_plain3.png" alt="Floorplan" className="block" />

      {/* Tables and chairs */}
      {tablesWithBusyness.map(table => (
        <div key={table.id} className="table-group" id={table.id}>
          {/* Table Button */}
          <button
            className="table-btn absolute"
            style={{
              top: table.top + layout.table.top,
              left: table.left + layout.table.left,
              background: getHeatmapColor(table.busyness),  // 🔥 heatmap
              transition: "background 0.3s ease"
            }}
            onClick={() => {
              setSelectedTable(table.id.replace("-", " "));
              setSelectedSeat("1-6");
              setBookingType("table");
              openSidebar()}}
          >
            {table.id.replace("-", " ")}
          </button>

          {/* Chairs */}
          {layout.chairs.map((chair, i) => {
            const chairBusyness = Math.floor(Math.random() * 11); // random for now
            return (
            <button
              key={i}
              className="chair-btn absolute"
              style={{
                top: table.top + layout.table.top + chair.top,
                left: table.left + layout.table.left + chair.left,
                background: getHeatmapColor(chairBusyness), // 🔥 heatmap
                transition: "background 0.3s ease"
              }}
              onClick={() => {
                setSelectedSeat(i+1);
                setSelectedTable(table.id.replace("-", " "));
                setBookingType("seat");
                openSidebar();
              }}
              
            >
              {i + 1}
            </button>
          )})}
        </div>
      ))}
    </div>
  );
};