import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css"; 
import { useSidebarStore } from "../lib/sidebarStore";

const today = new Date();

export default function Floorplan() {
  const [tables, setTables] = useState([]);
  const [wideTables, setWideTables] = useState([]);
  const [chairs, setChairs] = useState([]);
  const [rooms, setRooms] = useState([]);
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
        setWideTables(data.wideTables);
        setChairs(data.chairs);
        setRooms(data.rooms);
        setLayout(data.layout);
      })
      .catch(err => console.error("Error loading positions.json:", err));
  }, []);

  useEffect(() => {
    fetch("https://script.google.com/macros/s/AKfycbwyn9Jtjbkg5JR3nMplzb4WxZ9ktwdGSO3K-qxxwgi8YNFDadloD-n9xdBzb7BuiK8v/exec?action=read")
    .then(res => res.json())
    .then(data => {
      // Calculate how many times each table was booked
      const counts = {};
      data.forEach(row => {
        counts[row.Table] = (counts[row.Table] || 0) + 1;
      });

      // Example: assume 10 = max bookings
      for (const tableId in counts) {
        const occupancy = counts[tableId] / 10; // 0 to 1
        const red = Math.round(255 * occupancy);
        const green = Math.round(255 * (1 - occupancy));
        const btn = document.getElementById(`table-${tableId}`);
        btn.style.background = `linear-gradient(135deg, rgb(${red},${green},0), #fff)`;
      }
    });
  }, [selectedDate])

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
    busyness: Math.round((Math.random() * 10) + 1) // Either 0-10
  }));
  const wideTablesWithBusyness = wideTables.map(table => ({
    ...table,
    busyness: Math.round((Math.random() * 10) + 1)
  }));
  const roomWithBusyness = rooms.map(room => ({
    ...room,
    busyness: Math.round((Math.random() * 10) + 1)
  }))

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
      <img src="/floorplan_plain3.png" alt="Floorplan" className="floorplan-img" />

      {/* Tables */}
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
              setBookingType("Table");
              openSidebar()}}
          >
            {table.id.replace("-", " ")}
          </button>
        </div>
      ))}
      {/* Wide Tables */}
      {wideTablesWithBusyness.map(table => (
        <div key={table.id} className="table-group" id={table.id}>
          <button
            className="wide-table-btn absolute"
            style={{
              top: table.top + layout.table.top,
              left: table.left + layout.table.left,
              background: getHeatmapColor(table.busyness),  // 🔥 heatmap
              transition: "background 0.3s ease"
            }}
            onClick={() => {
              setSelectedTable(table.id.replace("-", " "));
              setBookingType("Table");
              openSidebar()}}
          >
            {table.id.replace("-", " ")}
          </button>
        </div>
      ))}
      {/* Meeting Rooms */}
      {roomWithBusyness.map(room => (
        <div key={room.id} className="table-group" id={room.id}>
          <button
            className="room-btn absolute"
            style={{
              top: room.top + layout.table.top,
              left: room.left + layout.table.left,
              background: getHeatmapColor(room.busyness),  // 🔥 heatmap
              transition: "background 0.3s ease"
            }}
            onClick={() => {
              setSelectedTable(room.id.replace("-", " "));
              setBookingType("Room");
              openSidebar()}}
          >
            {room.id.replace("-", " ")}
          </button>
        </div>
      ))}
      <div className="chair-group">
      {/* Single Chair Buttons */}
      {layout.chairs.map((chair, i) => (
      <button
        key={i}
        className="chair-btn"
        style={{
          top: chair.top + chairs[0].top,
          left: chair.left + chairs[0].left,
          background: getHeatmapColor(Math.floor((Math.random() * 10) + 1)),
          transition: "background 0.3s ease"
        }}
        onClick={() => {
          setBookingType("Chair");
          setSelectedSeat("Chair " + (i+1));
          openSidebar();
        }}
      >
              </button>
    ))}
    </div>
    </div>
  );
};
