//change test
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
  const { openSidebar, setSelectedTable, setSelectedSeat, setBookingType, selectedDate, setSelectedDate } = useSidebarStore();
  const [tableWithBusyness, setTableWithBusyness] = useState([]);
  const [wideTablesWithBusyness, setWideTablesWithBusyness] = useState([]);
  const [roomsWithBusyness, setRoomsWithBusyness] = useState([]);
  const [chairsWithBusyness, setChairsWithBusyness] = useState([]);
  const bookables = [
  ...tables,
  ...wideTables,
  ...rooms,
  ...chairs
];

  const handleDateChange = (date) => {
    // Convert Date object to YYYY-MM-DD string for consistency
    const dateString = date ? date.toISOString().split('T')[0] : '';
    setSelectedDate(dateString);
  };
  function toDDMMYYYY(dateStr) {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${mm}/${dd}/${yyyy}`;
}

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
    fetch("https://script.google.com/macros/s/AKfycby5ffgZAXyPyLzKTbjEsDoYZXUmP4rK5hTdh2CEDTc5Bnsr9kZGeGCz7ak90raKBCuP_A/exec?action=get&date="+toDDMMYYYY(selectedDate))
    .then(res => res.json())
    .then(data => {
      const bookings = data.bookings || [];

      // Count bookings per table
      const tableCounts = {};
      bookings.forEach((row) => {
        const tableLabel = row.table;
        tableCounts[tableLabel] = (tableCounts[tableLabel] || 0) + 1;
      });
      const maxTableBookings = Math.max(1, ...Object.values(tableCounts));

      // Count bookings per seat
      const seatCounts = {};
      bookings.forEach((row) => {
        const seatLabel = row.seat;
        if (seatLabel) seatCounts[seatLabel] = (seatCounts[seatLabel] || 0) + 1;
      });
      const maxSeatBookings = Math.max(1, ...Object.values(seatCounts));

      // Merge STATIC tables + dynamic busyness
      const merged = bookables.map(item => {
        const label = item.id.replace("-", " "); // Table-7 → Table 7

        return {
          ...item,
          busyness: Math.round(
            (tableCounts[label] || seatCounts[label] || 0) /
              Math.max(maxTableBookings, maxSeatBookings) *
              10
          ),
        };
      });

      const wideTableIds = ["Table-9", "Table-10", "Table-11"];

      setTableWithBusyness(
        merged.filter((i) => i.id.startsWith("Table-") && !wideTableIds.includes(i.id))
      );

      setWideTablesWithBusyness(
        merged.filter((i) => wideTableIds.includes(i.id))
      );

      setRoomsWithBusyness(
        merged.filter(i => i.id.startsWith("Room-"))
      );

      setChairsWithBusyness(
        merged.filter(i => i.id.startsWith("Chair-"))
      );
    })
    .catch(console.error);
  }, [selectedDate, tables])

  function getHeatmapColor(value) {
    if (value === 0) return "transparent"; // no color for empty
    const percent = value / 10; // scale 0–10 → 0–1
    // light pink → deep red
    const lightness = 90 - percent * 50; 
    return `hsl(0, 100%, ${lightness}%)`;
  }

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
      <img src="/floorplan_plain3.png" alt="Floorplan" className="floorplan-img" />

      {/* Tables */}
      {tableWithBusyness.map(table => (
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
              setSelectedSeat(null); //TODO: Random seat allocation?
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
              setSelectedSeat(null);
              setBookingType("Table");
              openSidebar()}}
          >
            {table.id.replace("-", " ")}
          </button>
        </div>
      ))}
      {/* Meeting Rooms */}
      {roomsWithBusyness.map(room => (
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
              setSelectedSeat(null);
              setBookingType("Room");
              openSidebar()}}
          >
            {room.id.replace("-", " ")}
          </button>
        </div>
      ))}
      <div className="chair-group">
      {/* Single Chair Buttons */}
      {chairsWithBusyness.map((chair, i) => (
      <button
        key={i}
        className="chair-btn"
        style={{
          top: chair.top + layout.chair.top,
          left: chair.left + layout.chair.left,
          background: getHeatmapColor(chair.busyness),
          transition: "background 0.3s ease"
        }}
        onClick={() => {
          setBookingType("Chair");
          setSelectedSeat("Chair " + (i+1));
          setSelectedTable(null);
          openSidebar();
        }}
      >
              </button>
    ))}
    </div>
    </div>
  );
};
