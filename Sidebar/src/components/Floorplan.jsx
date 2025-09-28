import React, { useEffect, useState } from "react";
import { useSidebarStore } from "../lib/sidebarStore";

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

  if (!layout) return <div>Loading floorplan...</div>;

  return (
    <div className="floorplan-container relative inline-block">
      {/* Floorplan image */}
      <img src="/floorplan_plain3.png" alt="Floorplan" className="block" />

      {/* Tables and chairs */}
      {tables.map(table => (
        <div key={table.id} className="table-group" id={table.id}>
          {/* Table Button */}
          <button
            className="table-btn absolute"
            style={{
              top: table.top + layout.table.top,
              left: table.left + layout.table.left,
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
          {layout.chairs.map((chair, i) => (
            <button
              key={i}
              className="chair-btn absolute"
              style={{
                top: table.top + layout.table.top + chair.top,
                left: table.left + layout.table.left + chair.left,
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
          ))}
        </div>
      ))}
    </div>
  );
};