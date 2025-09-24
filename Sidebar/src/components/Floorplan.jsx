import React, { useEffect, useState } from "react";
import { useSidebarStore } from "../lib/sidebarStore";

const Floorplan = () => {
  const [tables, setTables] = useState([]);
  const [layout, setLayout] = useState(null);
  const openSidebar = useSidebarStore((state) => state.openSidebar);

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
            onClick={openSidebar}
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
              onClick={openSidebar}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Floorplan;
