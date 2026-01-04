// src/components/BookingSidebar.jsx
import { useState, useMemo, useEffect } from 'react';
import { FaChair, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { useSidebarStore } from '../lib/sidebarStore';

export default function BookingSidebar()  {
  const { isSidebarOpen, closeSidebar } = useSidebarStore();
  const { selectedSeat, selectedTable, bookingType, selectedDate, bookings, selectedTimes, setSelectedTimes, refreshKey, setRefreshKey } = useSidebarStore();

  const [activeTab, setActiveTab] = useState('datetime');
  const [formData, setFormData] = useState({
    name: '',
    telegram: '',
    email: '',
    reason: ''
  });

  useEffect(() => {
    setActiveTab('datetime');
  }, [selectedTimes])

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let min of ['00', '30']) {
        const time = `${hour.toString().padStart(2,'0')}:${min}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Any Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  };

  const toDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = d.getFullYear();
    return `${day}${month}${year}`;
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const add30Minutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours*60 + minutes + 30;
    if (totalMinutes >= 24*60) totalMinutes = 24*60 - 30;
    const newHours = Math.floor(totalMinutes/60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2,'0')}:${newMinutes.toString().padStart(2,'0')}`;
  };

  const formatTimeRange = (times) => {
    if (times.length === 0) return '';
    if (times.length === 1) return `${times[0]} - ${add30Minutes(times[0])}`;
    const sorted = [...times].sort();
    return `${sorted[0]} - ${add30Minutes(sorted[sorted.length - 1])}`;
  };

  const areConsecutive = (times) => {
    if (times.length <= 1) return true;
    const sorted = [...times].sort();
    for (let i = 1; i < sorted.length; i++) {
      const [prevH, prevM] = sorted[i-1].split(':').map(Number);
      const [currH, currM] = sorted[i].split(':').map(Number);
      if ((currH*60 + currM) - (prevH*60 + prevM) !== 30) return false;
    }
    return true;
  };

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

  const bookedSlots = useMemo(() => {
    if (!selectedDate || (!selectedSeat && !selectedTable)) return new Set();

    const selectedItemId = selectedSeat || selectedTable;

    const targetLabel = selectedItemId.replace("-", " "); 
    // Table-7 → Table 7, Chair-1 → Chair 1

    const set = new Set();

    bookings.forEach(b => {
      const sameDate =
        toDDMMYYYY(b.date) === toDDMMYYYY(selectedDate);

      const sameResource =
        b.table === targetLabel ||
        (b.seat && b.seat !== "null" && b.seat === targetLabel);

      if (sameDate && sameResource) {
        expandTimeRange(b.time).forEach(t => set.add(t));
      }
    });

    return set;
  }, [bookings, selectedDate, selectedTable, selectedSeat]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSeat && !selectedTable) {
      alert("❌ Please select a table and seat before submitting.");
      return;
    }
    if (selectedTimes.length === 0) {
      alert("❌ Please select at least one 30-minute time slot.");
      return;
    }

    const formattedDate = selectedDate
      ? new Date(selectedDate).toLocaleDateString('en-US',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })
      : 'Any Date';

    const timeRange = formatTimeRange(selectedTimes);

    const dateObject = new Date(selectedDate);
    const day = dateObject.toLocaleDateString('en-SG', {
      weekday: 'long'
    })

    const data = {
      table: selectedTable === null ? "null" : selectedTable,
      seat: selectedSeat === null ? "null" : selectedSeat,
      day: day,
      date: formattedDate,
      time: timeRange,
      name: formData.name,
      telegram: formData.telegram,
      email: formData.email,
      reason: formData.reason
    };

    try {
      const scriptURL = "https://script.google.com/macros/s/AKfycbxSl7Syi_St0MgE9s4uD7AEuiPCcx9mu-rmRxVreg96zkQdxqHcWeZFd15SLkSITWDq/exec";
      const response = await fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (result.result !== 'success') {
        alert("❌ Failed to submit booking: " + (result.error || "Unknown error"));
        return;
      }

      alert(`✅ Booking Submitted!
        Booking Type: ${bookingType}
        Table: ${selectedTable}
        Date: ${formattedDate}
        Time: ${timeRange}
        Name: ${formData.name}
        Telegram: ${formData.telegram}
        Email: ${formData.email}`);

      setFormData({ name:'', telegram:'', email:'', reason:'' });
      setSelectedTimes([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("❌ Failed to submit booking: " + error.message);
    }
  };

  const categories = bookingType === 'table' ? ["DIP","FYP","Flagship"] : ["Individual"];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Booking</span>
        <button style={styles.closeButton} onClick={closeSidebar}>✖</button>
      </div>

      <div style={styles.content}>
        {activeTab==='datetime' && (
          <div>
            <h3 style={styles.heading}>📅 Choose Time</h3>
            {selectedDate && <div style={styles.selectedDateDisplay}><strong>Date:</strong> {formatDate(selectedDate)}</div>}
            <div style={styles.timeSlots}>
              <h4>Select up to 5 consecutive 30-min slots:</h4>
              <div style={styles.timeGrid}>
                {generateTimeSlots().map(time => {
                  const isSelected = selectedTimes.includes(time);
                  const isBooked = bookedSlots.has(time);
                  return (
                    <button 
                    key={time} 
                    disabled={isBooked}
                    style={{
                      ...styles.timeButton,
                      ...(isSelected?styles.selectedTime:{}),
                      ...(isBooked?styles.disabledTime:{})
                    }}
                      onClick={() => {
                        if (isBooked) return;
                        if (isSelected) setSelectedTimes(selectedTimes.filter(t=>t!==time));
                        else {
                          const newSel = [...selectedTimes,time].sort();
                          if (newSel.length>5) { alert("Maximum 5 slots."); return; }
                          if (!areConsecutive(newSel)) { alert("Slots must be consecutive."); return; }
                          setSelectedTimes(newSel);
                        }
                      }}>{time}</button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab==='info' && (
          <div>
            <h3 style={styles.heading}>👤 Enter Your Info</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name:
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} required style={styles.input}/>
                </label>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Telegram Handle:
                  <input type="text" name="telegram" value={formData.telegram} onChange={handleFormChange} placeholder="@username" required style={styles.input}/>
                </label>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email:
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} required style={styles.input}/>
                </label>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reason for Booking:
                  <select name="reason" value={formData.reason} onChange={handleFormChange} required style={styles.input}>
                    <option value="" disabled>-- choose an option --</option>
                    {categories.map(cat=><option key={cat} value={cat.toLowerCase()}>{cat}</option>)}
                  </select>
                </label>
              </div>
              <button type="submit" style={styles.submitButton}>✅ Confirm Booking</button>
            </form>
          </div>
        )}
      </div>

      <div style={styles.tabs}>
        <button style={{...styles.tabButton, ...(activeTab==='datetime'?styles.activeTab:{})}} onClick={()=>setActiveTab('datetime')} title="Choose Date & Time"><FaCalendarAlt/></button>
        <button style={{...styles.tabButton, ...(activeTab==='info'?styles.activeTab:{})}} onClick={()=>setActiveTab('info')} title="Enter Info"><FaUser/></button>
      </div>
    </div>
  );
};

// Updated Styles - Sidebar on Right
const styles = {
  container: {
    width: '380px',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    borderLeft: '1px solid #dee2e6',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    position: 'fixed',
    right: 0,
    top: 0
  },
  tabs: {
    display: 'flex',
    padding: '1rem',
    backgroundColor: '#343a40',
    justifyContent: 'space-around',
    marginTop: 'auto', 
    alignItems: 'center'
  },
  tabButton: {
    flex: 1,
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#adb5bd',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '5px',
    backgroundColor: '#343a40',
  },
  activeTab: {
    color: '#fff',
    backgroundColor: '#495057'
  },
  content: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  heading: {
    marginBottom: '1.5rem',
    color: '#333'
  },
  seatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  seatButton: {
    padding: '0.75rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  selectedSeat: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: '1px solid #28a745'
  },
  datetimeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '1rem',
    marginTop: '0.25rem'
  },
  timeSlots: {
    marginTop: '1rem',
    color: '#333'
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  timeButton: {
    padding: '0.5rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    background: '#1a1a1a',
    cursor: 'pointer',
    fontSize: '0.875rem',
    textAlign: 'center',
    color: '#fff'
  },
  selectedTime: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: '1px solid #007bff'
  },
  disabledTime: {
  backgroundColor: "#eee",
  color: "#999",
  cursor: "not-allowed",
  textDecoration: "line-through"
  },
  selectedText: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    fontWeight: 'bold',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  submitButton: {
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem'
  },
   header: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#343a40'
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: '1rem',
    flex: 1, // 👈 takes up all space so button gets pushed to the right
    color: '#fff'
  },
  closeButton: {
    position: 'absolute',
    right: '1rem',  // 👈 stick to right
    top: '50%',
    transform: 'translateY(-50%)', // vertically center in header
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  selectedDateDisplay: {
  marginBottom: '1rem',
  padding: '0.75rem',
  borderRadius: '4px',
  fontWeight: 'bold',
  color: '#333',
  fontSize: '0.95rem'
}
};