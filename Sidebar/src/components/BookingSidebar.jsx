// src/components/BookingSidebar.jsx
import { useState } from 'react';
import { FaChair, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { useSidebarStore } from '../lib/sidebarStore';

export default function BookingSidebar()  {
  const { isSidebarOpen, closeSidebar } = useSidebarStore();
  const { selectedTable, selectedSeat, bookingType,selectedDate } = useSidebarStore();

  const [activeTab, setActiveTab] = useState('seat');
  const today = new Date().toISOString().split('T')[0];

  const [selectedTimes, setSelectedTimes] = useState([]); // Array for multiple selections
  const [formData, setFormData] = useState({
    name: '',
    telegram: '',
    email: '',
    reason: ''
  });

  // Generate 30-min time slots from 9AM to 9PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let min of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${min}`;
        slots.push(time);
      }
    }
    return slots;
  };
  const formatDate = (dateString) => {
  if (!dateString) return 'Any Date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })


};
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Convert array of consecutive time slots to "start - end" format
const formatTimeRange = (times) => {
  if (times.length === 0) return '';
  if (times.length === 1) return `${times[0]} - ${add30Minutes(times[0])}`;
  
  const sorted = [...times].sort();
  const startTime = sorted[0];
  const endTime = add30Minutes(sorted[sorted.length - 1]);
  return `${startTime} - ${endTime}`;
};

// Helper: Add 30 minutes to a time string "HH:MM"
const add30Minutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes + 30;
  
  // Handle overflow (e.g., 23:30 + 30min = 00:00 next day)
  if (totalMinutes >= 24 * 60) {
    totalMinutes = 24 * 60 - 30; // Cap at 23:30 end time
  }
  
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedDate = selectedDate 
    ? new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Any Date';

    const timeRange = selectedTimes.length > 0 
    ? formatTimeRange(selectedTimes) 
    : 'Not selected';

    alert(`Booking Confirmed!
    Seat: ${selectedSeat}
    Table: ${selectedTable}
    Date: ${formattedDate}
    Time: ${timeRange}
    Name: ${formData.name}
    Telegram: ${formData.telegram}
    Email: ${formData.email}`);
    };

  // Handle time selection (toggle off if already selected)
  const handleTimeSelect = (time) => {
    setSelectedTime(selectedTime === time ? '' : time);
  };

  const categories = bookingType === "table"
  ? ["DIP", "FYP", "Flagship"]
  : ["Individual"];

  // Format date for display: "Friday, October 3, 2025"


const areConsecutive = (times) => {
  if (times.length <= 1) return true;
  const sorted = [...times].sort();
  for (let i = 1; i < sorted.length; i++) {
    const [prevH, prevM] = sorted[i - 1].split(':').map(Number);
    const [currH, currM] = sorted[i].split(':').map(Number);
    if ((currH * 60 + currM) - (prevH * 60 + prevM) !== 30) {
      return false;
    }
  }
  return true;
};

  return (
    <div style={styles.container}>
      {/* Header with Close Button */}
    <div style={styles.header}>
      <span style={styles.headerTitle}>Booking</span>
      <button style={styles.closeButton} onClick={closeSidebar}>
        ✖
      </button>
    </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === 'seat' && (
          <div>
            {selectedSeat && selectedTable && (
              <h3 style={styles.heading}>🪑 Seat {selectedSeat} at {selectedTable}</h3>
            )}
          </div>
        )}

        {activeTab === 'datetime' && (
  <div>
    <h3 style={styles.heading}>📅 Choose Time</h3>
    
    {/* Display selected date from floorplan */}
    {selectedDate && (
      <div style={styles.selectedDateDisplay}>
        <strong>Date:</strong> {formatDate(selectedDate)}
      </div>
    )}
    
    <div style={styles.timeSlots}>
      <h4>Select up to 5 consecutive 30-min slots:</h4>
      <div style={styles.timeGrid}>
        {generateTimeSlots().map(time => {
          const isSelected = selectedTimes.includes(time);
          return (
            <button
              key={time}
              style={{
                ...styles.timeButton,
                ...(isSelected ? styles.selectedTime : {})
              }}
              onClick={() => {
                if (isSelected) {
                  setSelectedTimes(selectedTimes.filter(t => t !== time));
                } else {
                  const newSelection = [...selectedTimes, time].sort();
                  
                  if (newSelection.length > 5) {
                    alert("Maximum 5 time slots allowed.");
                    return;
                  }
                  
                  if (!areConsecutive(newSelection)) {
                    alert("Slots must be consecutive 30-minute blocks.");
                    return;
                  }
                  
                  setSelectedTimes(newSelection);
                }
              }}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  </div>
)}

        {activeTab === 'info' && (
          <div>
            <h3 style={styles.heading}>👤 Enter Your Info</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Telegram Handle:
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleFormChange}
                    placeholder="@username"
                    required
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Reason for Booking:
                  <select
                    name="category"
                    value={formData.categories}
                    onChange={handleFormChange}
                    required
                    style={styles.input}
                  >
                    <option value="" disabled>
                      -- choose an option --
                    </option>
                    {categories.map(cat => (
                      <option key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </option>
                    ))}
                    </select>
                </label>
              </div>

              <button type="submit" style={styles.submitButton}>
                ✅ Confirm Booking
              </button>
            </form>
          </div>
        )}
      </div>
      {/* Sidebar Header Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'seat' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('seat')}
          title="Choose Seat"
        >
          <FaChair />
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'datetime' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('datetime')}
          title="Choose Date & Time"
        >
          <FaCalendarAlt />
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'info' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('info')}
          title="Enter Info"
        >
          <FaUser />
        </button>
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
    borderRadius: '5px'
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
  },
  selectedTime: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: '1px solid #007bff'
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
    flex: 1 // 👈 takes up all space so button gets pushed to the right
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