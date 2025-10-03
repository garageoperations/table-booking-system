// src/components/BookingSidebar.jsx
import { useState } from 'react';
import { FaChair, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { styles } from './BookingSidebar.styles'; // Adjust the path if necessary

const BookingSidebar = () => {
  const [activeTab, setActiveTab] = useState('seat');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTimes, setSelectedTimes] = useState([]); // Array for multiple selections
  const [formData, setFormData] = useState({
    name: '',
    telegram: '',
    email: ''
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

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Booking Confirmed!
    Seat: ${selectedSeat}
    Date: ${selectedDate || 'Any'}
    Times:
    ${selectedTimes.map(t => `  - ${t}`).join('\n')}
    Name: ${formData.name}
    Telegram: ${formData.telegram}
    Email: ${formData.email}`);
    };

  // Handle time selection (toggle off if already selected)
  const handleTimeSelect = (time) => {
    setSelectedTime(selectedTime === time ? '' : time);
  };

  return (
    <div style={styles.container}>
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

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === 'seat' && (
          <div>
            <h3 style={styles.heading}>🪑 Choose Your Seat</h3>
            <div style={styles.seatGrid}>
              {Array.from({ length: 20 }, (_, i) => (
                <button
                  key={i + 1}
                  style={{
                    ...styles.seatButton,
                    ...(selectedSeat === i + 1 ? styles.selectedSeat : {})
                  }}
                  onClick={() => setSelectedSeat(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {selectedSeat && (
              <p style={styles.selectedText}>Selected Seat: {selectedSeat}</p>
            )}
          </div>
        )}

        {activeTab === 'datetime' && (
  <div>
    <h3 style={styles.heading}>📅 Choose Date & Time</h3>
    <div style={styles.datetimeContainer}>
      <label style={styles.label}>
        Date (Optional):
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.input}
        />
      </label>

      <div style={styles.timeSlots}>
        <h4>Select Up to 5 Time Slots:</h4>
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
                    // Unselect
                    setSelectedTimes(selectedTimes.filter(t => t !== time));
                  } else {
                    // Select only if under limit
                    if (selectedTimes.length < 5) {
                      setSelectedTimes([...selectedTimes, time]);
                    } else {
                      alert("You can select up to 5 time slots only.");
                    }
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

    {/* Show selected times */}
    {selectedTimes.length > 0 && (
      <div style={styles.selectedText}>
        <strong>Selected Times:</strong>
        <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
          {selectedTimes.map((t, i) => (
            <li key={i}>{selectedDate || 'Any Date'} at {t}</li>
          ))}
        </ul>
      </div>
    )}
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
                  Reasons for Booking:
                  <input
                    type="text"
                    name="reasons"
                    value={formData.reasons}
                    onChange={handleFormChange}
                    placeholder="Maximum 100 characters"
                    required
                    style={styles.input}
                  />
                </label>
              </div>

              <button type="submit" style={styles.submitButton}>
                ✅ Confirm Booking
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};


export default BookingSidebar;