import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css"; 
import { useSidebarStore } from "../lib/sidebarStore";

const today = new Date();

export default function Floorplan() {
  const [tables, setTables] = useState([]);
  const [layout, setLayout] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today); 
  const { setSelectedDate: setStoreDate } = useSidebarStore(); 
  const { openSidebar, setSelectedTable, setSelectedSeat, setBookingType } = useSidebarStore();
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Convert Date object to YYYY-MM-DD string for consistency
    const dateString = date ? date.toISOString().split('T')[0] : '';
    setStoreDate(dateString);
  };

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
   <div className="date-picker-container mb-4 relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">

    {/* Select date */}
    Select Date:
  </label>
  <div className="relative">
    <DatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      minDate={today}
      dateFormat="EEEE, MMMM d, yyyy" // 👈 More reliable format
      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      popperClassName="z-50"
      popperPlacement="bottom-start"
      placeholderText="Select a date"
    />
  </div>


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
