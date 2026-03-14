import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css"; 
import { useSidebarStore } from "../lib/sidebarStore";

const today = new Date();
const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

export default function Floorplan() {
  const [tables, setTables] = useState([]);
  const [wideTables, setWideTables] = useState([]);
  const [chairs, setChairs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [layout, setLayout] = useState(null);
  const { openSidebar, setSelectedTable, setSelectedSeat, setBookingType, selectedDate, setSelectedDate, 
    setBookings, clearSelectedTimes, refreshKey, setLoadingBookings } = useSidebarStore();

  const [tableWithBusyness, setTableWithBusyness] = useState([]);
  const [tableLabels, setTableLabels] = useState([]);
  const [wideTablesWithBusyness, setWideTablesWithBusyness] = useState([]);
  const [wideTableLabels, setWideTableLabels] = useState([]);
  const [roomsWithBusyness, setRoomsWithBusyness] = useState([]);
  const [chairsWithBusyness, setChairsWithBusyness] = useState([]);

  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x:0, y:0 });
  const imgRef = useRef(null);
  const [scale, setScale] = useState({ x:1, y:1 });
  const bookables = [
  ...tables,
  ...wideTables,
  ...rooms,
  ...chairs
];

// 1. Calculate the available space and scale factor
const [fitScale, setFitScale] = useState(1);
const containerRef = useRef(null);

// Floorplan Image Dimensions 
const baseWidth = 1080;
const baseHeight = 629;

// Table button Dimensions
const tableLength = 60;
const tableWidth = 60;

const webAppUrl = "https://script.google.com/macros/s/AKfycbwNuv7HbV_IazA8YAQjx4xsvKIezsqy-_qQleGkOLhikqh_oGyVJP8wZCKqUkE_s8M8Og/exec"

const scrollRef = useRef(null);

useLayoutEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollLeft = 0;
    scrollRef.current.scrollTop = 0;
  }
}, []);

useEffect(() => {
  if (!imgRef.current) return;

  const updateScale = () => {
    const rect = imgRef.current.getBoundingClientRect();

    setScale({
      x: rect.width / baseWidth,
      y: rect.height / baseHeight
    });
  };

  updateScale(); // initial
  window.addEventListener("resize", updateScale);

  return () => window.removeEventListener("resize", updateScale);
}, []);

useEffect(() => {
  const handleResize = () => {
    if (containerRef.current) {
      // Get the available width and height of the container div
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      // Calculate ratios
      const scaleX = width / baseWidth;
      const scaleY = height / baseHeight;
      
      // Use the smaller scale factor to ensure it fits BOTH dimensions
      // Multiply by 0.95 to add a small 5% buffer/margin
      setFitScale(Math.min(scaleX, scaleY) * 0.95);
    }
  };

  window.addEventListener('resize', handleResize);
  handleResize(); // Initial call
  
  return () => window.removeEventListener('resize', handleResize);
}, []);


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

  const getPos = (x, y) => ({
  left: `${(x / baseWidth) * 100}%`,
  top: `${(y / baseHeight) * 100}%`
});

  // Load positions of table buttons
  useEffect(() => {
    fetch("./positions.json")
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

  // Reterive all bookings from Google Sheets
  useEffect(() => {
    setLoadingBookings(true);
    fetch(webAppUrl+"?action=get&date="+toDDMMYYYY(selectedDate))
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
      const roomNames = ["Kirchoff-Pod", "Maxwell-Pod"];

      setTableWithBusyness(
        merged.filter((i) => i.id.startsWith("Table-") && !wideTableIds.includes(i.id.slice(0,-1)))
      );

      setTableLabels(merged.filter((i) => i.id.startsWith("Table-") && !wideTableIds.includes(i.id.slice(0,-1)) && i.id.endsWith('A')))

      setWideTablesWithBusyness(
        merged.filter((i) => wideTableIds.includes(i.id.slice(0,-1)))
      );

      setWideTableLabels(merged.filter((i) => i.id.startsWith("Table-") && wideTableIds.includes(i.id.slice(0,-1)) && i.id.endsWith('A')))

      setRoomsWithBusyness(merged.filter((i) => roomNames.includes(i.id)));
      setChairsWithBusyness(merged.filter((i) => i.id.startsWith("Chair-")));
    })
    .catch(console.error)
    .finally(() => setLoadingBookings(false));

  }, [selectedDate, tables, wideTables, chairs, rooms, refreshKey])

  function getHeatmapColor(value) {
    if (value === 0) return "#28a745"; // no color for empty
    const percent = value / 24; // scale 0-24 → 0–1
    // light pink → deep red
    const lightness = 90 - percent * 50; 
    return `hsl(0, 100%, ${lightness}%)`;
  }


  function HoverBubbleContent({ hoverInfo }) {
    const { type, data } = hoverInfo;

    let imageSrc = "";
    let label = "";

    switch (type) {
      case "table":
        imageSrc = "./small_table.jpg";
        label = data.id.replace("-", " ");
        break;

      case "wideTable":
        imageSrc = "./long_table.jpg";
        label = data.id.replace("-", " ");
        break;

      case "room":
        imageSrc = "./room.jpg";
        label = data.id.replace("-", " ");
        break;
      
      case "chair":
        imageSrc = "./chairs.jpg";
        label = data.id.replace("-", " ");
        break;

      default:
        return null;
    }

    return (
      <div className="bubble">
        <img src={imageSrc} alt={label} />
        <div className="bubble-label">{label}</div>
      </div>
    );
  }


  if (!layout) return <div>Loading floorplan...</div>;

return (
  <div style={{ 
    height: '100vh', 
    width: '100vw',
    display: 'flex', 
    flexDirection: 'column',
    overflow: 'hidden' // Prevent the whole page from scrolling, we only want the map to scroll
  }}>
    
    {/* --- 1. Fixed Header Section --- */}
    <div className="p-4 bg-white shadow-sm z-10 relative" style={{marginLeft: '60px'}}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Date:
      </label>
      <div className="relative max-w-xs"> 
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          minDate={today}
          dateFormat="EEEE, MMMM d, yyyy"
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm w-full"
          open={isMobile ? undefined : true}
          onFocus={(e) => {
            if (isMobile) {
              e.target.blur();
            }
          }}
        />
      </div>
    </div>

    {/* --- 2. Scrollable Map Container --- */}
    <div
    ref={scrollRef} 
    style={{ 
      flex: 1,            // Take remaining height
      overflow: 'auto',   // 🪄 Enable X and Y scrolling
      position: 'relative',
      background: 'transparent', 
      cursor: 'grab',      // visual cue
      display: "block",
      justifyContent: "flex-start",
      alignItems: 'flex-start',
      textAlign: 'left'
    }}>
      
      {/* --- 3. Responsive Wrapper (The "Canvas") --- */}
      <div className="responsive-canvas">
        
        {/* Background Image */}
        <img 
          src="./floorplan.png" 
          alt="Floorplan" 
          style={{ 
            width: '100%',          // Scale image to fill the wrapper width
            height: '100%',         // Scale image to fill the wrapper height
            display: 'block',
            pointerEvents: 'none',
            objectFit: 'contain'
          }} 
        />

      {/* Tables */}
      {tableWithBusyness.map(table => {
        const {left, top} = getPos(table.left+14, table.top+17); // Lets not talk about this
  
        return (
          <div key={table.id} className="table-group" id={table.id}>
            <button
              className="table-btn absolute"
              style={{
                left: left, 
                top: top,   
                width: `${(30 / baseWidth) * 100}%`,
                height: `${(30 / baseHeight) * 100}%`,             
                background: getHeatmapColor(table.busyness),
                transform: 'translate(-50%, -50%)', // Optional: Centers the button on the coordinate
                position:'absolute'
              }}
            onMouseEnter={(e) => {
              if (window.matchMedia("(hover: hover)").matches) {
              setHoverInfo({ type: "table", data: table });
              setMousePos({ x: e.clientX, y: e.clientY });
              }
            }}
            onMouseMove={(e) => {
              setMousePos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setHoverInfo(null)}
            onClick={() => {
              setSelectedTable(table.id.replace("-", " "));
              setSelectedSeat(null); //TODO: Random seat allocation?
              setBookingType("Table");
              clearSelectedTimes();
              openSidebar()}}
          >
          </button>
        </div>
        );
      })}
      {tableLabels.map(table => {
        const {left,top} = getPos(table.left, table.top);
        return (
        <div key={table.id.slice(0,-1)} className="table-group" id={table.id.slice(0,-1)}>
          {/* Table Button Label */}
          <button
            className="table-button absolute"
            style={{
              position:'absolute',
              top: top,
              left: left,
              width: `${(60 / baseWidth) * 100}%`,
              height: `${(60 / baseHeight) * 100}%`,
              pointerEvents: 'none',
              backgroundColor: '#ffffffff',
              color: 'black',
              zIndex: 0,
              opacity: 0.3,

              padding: 0,             // Removes default browser button padding
              overflow: 'hidden',     // Hides text if it gets too cramped
              display: 'flex',        // Uses flexbox to perfectly center the text
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5cqw'      // Optional: Container Query Units (scales font with container)
            }}
            >
            {table.id.slice(0,-1).replace("-", " ")}
            </button>
        </div>
        );
})}
      {/* Wide Tables */}
      {wideTablesWithBusyness.map(table => {
        const {left,top} = getPos(table.left, table.top);
        return(
        <div key={table.id} className="table-group" id={table.id}>
          <button
            className="wide-table-btn absolute"
            style={{
              top: top,
              left: left,
              width: `${(57 / baseWidth) * 100}%`,
              height: `${(30 / baseHeight) * 100}%`,
              background: getHeatmapColor(table.busyness),  // 🔥 heatmap
              transition: "background 0.3s ease",
              position: "absolute"
            }}
            onMouseEnter={(e) => {
              if (window.matchMedia("(hover: hover)").matches) {
                setHoverInfo({ type: "wideTable", data: table });
                setMousePos({ x: e.clientX, y: e.clientY });
              }
            }}
            onMouseMove={(e) => {
              setMousePos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setHoverInfo(null)}
            onClick={() => {
              setSelectedTable(table.id.replace("-", " "));
              setSelectedSeat(null);
              setBookingType("Table");
              clearSelectedTimes();
              openSidebar()}}
          >
          </button>
        </div>
        );
        })}
      {wideTableLabels.map(table => {
        const {left,top} = getPos(table.left, table.top);
        return (
        <div key={table.id.slice(0,-1)} className="table-group" id={table.id.slice(0,-1)}>
          {/* Table Button Label */}
          <button
            className="table-button absolute"
            style={{
              position: 'absolute',
              top: top,
              left: left,
              width: `${(115 / baseWidth) * 100}%`,
              height: `${(60 / baseHeight) * 100}%`,
              pointerEvents: 'none',
              backgroundColor: '#ffffffff',
              color: 'black',
              zIndex: 0,
              opacity: 0.3,

              padding: 0,             // Removes default browser button padding
              overflow: 'hidden',     // Hides text if it gets too cramped
              display: 'flex',        // Uses flexbox to perfectly center the text
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5cqw'      // Optional: Container Query Units (scales font with container)
            }}
            >
            {table.id.slice(0,-1).replace("-", " ")}
            </button>
        </div>
        );
      })}
      {/* Meeting Rooms */}
      {roomsWithBusyness.map(room => {
        const {left, top} = getPos(room.left, room.top);
        return (
        <div key={room.id} className="table-group" id={room.id}>
          <button
            className="room-btn absolute"
            style={{
              top: top,
              left: left,
              width: `${(87 / baseWidth) * 100}%`,
              height: `${(87 / baseHeight) * 100}%`,
              background: getHeatmapColor(room.busyness),  // 🔥 heatmap
              transition: "background 0.3s ease",

              padding: 0,             // Removes default browser button padding
              overflow: 'hidden',     // Hides text if it gets too cramped
              display: 'flex',        // Uses flexbox to perfectly center the text
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5cqw'      // Optional: Container Query Units (scales font with container)
            }}
            onMouseEnter={(e) => {
              if (window.matchMedia("(hover: hover)").matches) {
                setHoverInfo({ type: "room", data: room });
                setMousePos({ x: e.clientX, y: e.clientY });
              }
            }}
            onMouseMove={(e) => {
              setMousePos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setHoverInfo(null)}
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
        );
      })}
      <div className="chair-group">
      {/* Single Chair Buttons */}
      {chairsWithBusyness.map((chair, i) => {
        // 1. Calculate absolute pixel position first
        const absLeft = chair.left + layout.chair.left;
        const absTop = chair.top + layout.chair.top;

        // 2. Convert total to percentage
        const {left, top} = getPos(absLeft, absTop);
        return (
          <button
            key={i}
            className="chair-btn"
            style={{
              position: 'absolute',
              left: left,
              top: top,
              width: `${(26 / baseWidth) * 100}%`,
              height: `${(26 / baseHeight) * 100}%`,
              background: getHeatmapColor(chair.busyness),
              transition: "background 0.3s ease"
            }}
            onMouseEnter={(e) => {
              if (window.matchMedia("(hover: hover)").matches) {
                  setHoverInfo({ type: "chair", data: chair });
                  setMousePos({ x: e.clientX, y: e.clientY });
              }
                }}
                onMouseMove={(e) => {
                  setMousePos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoverInfo(null)}
            onClick={() => {
              setBookingType("Chair");
              setSelectedSeat("Chair " + (i+1));
              setSelectedTable(null);
              clearSelectedTimes();
              openSidebar();
            }}
          >
          </button>
        );
      })}
    {hoverInfo && (
      <div
        style={{
          position: "fixed",
          top: mousePos.y + 16,
          left: mousePos.x + 16,
          transform: "scale(1)",
          opacity: 1,
          transition:
            "transform 180ms cubic-bezier(.34,1.56,.64,1), opacity 120ms ease",
          pointerEvents: "none",
          zIndex: 9999
        }}
      >
        <HoverBubbleContent hoverInfo={hoverInfo} />
      </div>
    )}
    </div>
    </div>
    {isMobile && 
      <div
        style={{
          padding: '2%',
          position: 'absolute',
          top: `${(426/baseHeight) * 100}%`,
          left: `${(200/baseWidth) * 100}%`,
          color: 'black',
          fontSize: '5cqw', 
          fontWeight: 'bold',
          pointerEvents: 'none',
          zIndex: '10'
        }}>
        Scroll to the right to view more →
        </div>
    }
    </div>
    </div>
  );
};