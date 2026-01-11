import React, { useEffect, useState } from 'react';
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminPanel() {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(null);
  const [filterTable, setFilterTable] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const webAppUrl = "https://script.google.com/macros/s/AKfycbwNuv7HbV_IazA8YAQjx4xsvKIezsqy-_qQleGkOLhikqh_oGyVJP8wZCKqUkE_s8M8Og/exec"; // <--- Make sure this is your URL

  // --- HELPER: Format the "Date Created" timestamp ---
  const formatTimestamp = (ts) => {
    if (!ts) return "-"; // Handle empty cells (like the first row in your image)
    const date = new Date(ts);
    // Returns format like: "11/01, 11:50"
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', month: '2-digit' 
    }) + ", " + date.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const sanitize = (val) => {
    if (!val) return "-";
    const str = String(val);
    if (str.includes('T') && str.includes('Z')) {
      const parts = str.split('T');
      return parts[1].startsWith('00:00') ? parts[0] : parts[1].substring(0, 5);
    }
    return str;
  };

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${webAppUrl}?action=get&date=ALL`);
      const data = await response.json();
      if (data.result === 'success') setBookings(data.bookings);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (booking) => {
    setEditingRow(booking.rowId);
    setEditFormData({
      date: sanitize(booking.date),
      time: sanitize(booking.time),
      table: booking.table,
      name: booking.name,
      seat: booking.seat
    });
  };

  const handleSave = async (rowId) => {
    try {
      const params = new URLSearchParams({
        action: 'edit',
        rowId: rowId,
        ...editFormData
      });
      const response = await fetch(`${webAppUrl}?${params.toString()}`);
      const data = await response.json();
      if (data.result === 'success') {
        alert("Updated successfully!");
        setEditingRow(null);
        fetchAllBookings(); 
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (rowId, name) => {
    if (!window.confirm(`Delete booking for ${name}?`)) return;
    try {
      const response = await fetch(`${webAppUrl}?action=delete&rowId=${rowId}`);
      const data = await response.json();
      if (data.result === 'success') {
        fetchAllBookings();
      }
    } catch (error) { console.error("Delete error:", error); }
  };

  useEffect(() => { fetchAllBookings(); }, []);

  // --- SORTING LOGIC: Sort by Timestamp (Newest First) ---
  const filteredBookings = bookings
    .filter((booking) => {
      const matchesDate = !filterDate || new Date(booking.date).toDateString() === filterDate.toDateString();
      const matchesTable = !filterTable || booking.table.toString().includes(filterTable);
      return matchesDate && matchesTable;
    })
    .sort((a, b) => {
      // If timestamp exists, sort by that. Otherwise, fall back to 0.
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA; // Descending order
    });

  return (
    <div style={styles.adminContainer}>
      <div style={styles.adminHeader}>
        <h2>Master Booking List (Admin)</h2>
        <button onClick={fetchAllBookings} style={styles.refreshBtn}>🔄 Refresh</button>
      </div>

      <div style={styles.filterBar}>
        <ReactDatePicker selected={filterDate} onChange={(date) => setFilterDate(date)} placeholderText="Filter Date" isClearable />
        <input type="text" placeholder="Filter Table" value={filterTable} onChange={(e) => setFilterTable(e.target.value)} style={styles.input} />
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={styles.tableWrapper}>
        <table style={styles.adminTable}>
          <thead>
            <tr>
              {/* --- NEW LEFTMOST HEADER --- */}
              <th style={styles.th}>Submitted At</th> 
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Table</th>
              <th style={styles.th}>Seat</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => {
              const isEditing = editingRow === booking.rowId;
              return (
                <tr key={booking.rowId} style={styles.tableRow}>
                  {/* --- NEW LEFTMOST COLUMN (Non-editable) --- */}
                  <td style={{...styles.td, fontSize: '0.85rem', color: '#666'}}>
                    {formatTimestamp(booking.timestamp)}
                  </td>

                  <td style={styles.td}>{isEditing ? <input style={styles.editInput} value={editFormData.date} onChange={(e) => setEditFormData({...editFormData, date: e.target.value})} /> : sanitize(booking.date)}</td>
                  <td style={styles.td}>{isEditing ? <input style={styles.editInput} value={editFormData.time} onChange={(e) => setEditFormData({...editFormData, time: e.target.value})} /> : sanitize(booking.time)}</td>
                  <td style={styles.td}>{isEditing ? <input style={styles.editInput} value={editFormData.table} onChange={(e) => setEditFormData({...editFormData, table: e.target.value})} /> : booking.table}</td>
                  <td style={styles.td}>{isEditing ? <input style={styles.editInput} value={editFormData.seat} onChange={(e) => setEditFormData({...editFormData, seat: e.target.value})} /> : booking.seat}</td>
                  <td style={styles.td}>{isEditing ? <input style={styles.editInput} value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} /> : booking.name}</td>
                  
                  <td style={styles.td}>
                    {isEditing ? (
                      <><button onClick={() => handleSave(booking.rowId)} style={styles.saveBtn}>Save</button><button onClick={() => setEditingRow(null)} style={styles.cancelBtn}>Cancel</button></>
                    ) : (
                      <><button onClick={() => startEdit(booking)} style={styles.editBtn}>Edit</button><button onClick={() => handleDelete(booking.rowId, booking.name)} style={styles.deleteBtn}>Delete</button></>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  adminContainer: { padding: '20px', height: '100vh', boxSizing: 'border-box', overflow: 'hidden' },
  tableWrapper: { maxHeight: '70vh', overflowY: 'auto', border: '1px solid #ddd', overflowX: 'hidden'},
  adminHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  refreshBtn: { padding: '8px 12px', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '10px', marginBottom: '20px' },
  adminTable: { width: '100%', borderCollapse: 'collapse' },
  th: { borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left'},
  td: { borderBottom: '1px solid #eee', padding: '10px', whiteSpace: 'nowrap' , overflow: 'hidden', textOverflow: 'ellipsis' },
  editBtn: { backgroundColor: '#ffc107', marginRight: '5px', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { backgroundColor: '#dc3545', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { backgroundColor: '#28a745', color: 'white', marginRight: '5px', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { backgroundColor: '#6c757d', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  editInput: { width: '90%', padding: '5px' }
};