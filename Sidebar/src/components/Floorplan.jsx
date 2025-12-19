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
  const { openSidebar, setSelectedTable, setSelectedSeat, setBookingType, selectedDate, setSelectedDate, setBookings, clearSelectedTimes, refreshKey, setLoadingBookings } = useSidebarStore();
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

  const expandTimeRange = (range) => {
    const [start, end] = range.split(" - ");

    let [h, m] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const slots = [];

    while (h < endH || (h === endH && m < endM)) {
      slots.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );

      m += 30;
      if (m === 60) {
        m = 0;
        h++;
      }
    }

    return slots;
  };

const handleDateChange = (date) => {
    // Convert Date object to YYYY-MM-DD string for consistency
    const dateString = date ? date.toISOString().split('T')[0] : '';
    setSelectedDate(dateString);
    clearSelectedTimes();
  };
function toDDMMYYYY(dateStr) {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${mm}/${dd}/${yyyy}`;
}
const normalize = s =>
  s?.toLowerCase().replace(/[-\s]/g, "");

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
    setLoadingBookings(true);
    fetch("https://script.google.com/macros/s/AKfycby5ffgZAXyPyLzKTbjEsDoYZXUmP4rK5hTdh2CEDTc5Bnsr9kZGeGCz7ak90raKBCuP_A/exec?action=get&date="+toDDMMYYYY(selectedDate))
    .then(res => res.json())
    .then(data => {
      const fetchedBookings = data.bookings || [];
      setBookings(fetchedBookings)

            // Count booked timeslots per table
      const tableCounts = {};
      const seatCounts = {};

      fetchedBookings.forEach((row) => {
        const tableLabel = normalize(row.table);
        const seatLabel = row.seat && row.seat !== "null" ? normalize(row.seat) : null;

        const slots = expandTimeRange(row.time); // array of 30-min slots

        tableCounts[tableLabel] = (tableCounts[tableLabel] || 0) + slots.length;
        if (seatLabel) seatCounts[seatLabel] = (seatCounts[seatLabel] || 0) + slots.length;
      });

      // Merge STATIC tables + dynamic busyness
      const merged = bookables.map((item) => {
        const label = normalize(item.id.replace("-", " ")); // Table-7 → Table 7
        const bookedSlots = tableCounts[label] || seatCounts[label] || 0;

        return {
          ...item,
          busyness: bookedSlots, // directly number of slots booked
        };
      });

      const wideTableIds = ["Table-9", "Table-10", "Table-11"];

      setTableWithBusyness(
        merged.filter((i) => i.id.startsWith("Table-") && !wideTableIds.includes(i.id))
      );

      setWideTablesWithBusyness(
        merged.filter((i) => wideTableIds.includes(i.id))
      );

      setRoomsWithBusyness(merged.filter((i) => i.id.startsWith("Room-")));
      setChairsWithBusyness(merged.filter((i) => i.id.startsWith("Chair-")));
    })
    .catch(console.error)
    .finally(() => setLoadingBookings(false));

  }, [selectedDate, tables, wideTables, chairs, rooms, refreshKey])

  function getHeatmapColor(value) {
    if (value === 0) return "rgb(0 0 0 / 58%)"; // no color for empty
    const percent = value / 24; // scale 0-24 → 0–1
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
              clearSelectedTimes();
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
              clearSelectedTimes();
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
              clearSelectedTimes();
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
          clearSelectedTimes();
          openSidebar();
        }}
      >
              </button>
    ))}
    </div>
    </div>
  );
};
