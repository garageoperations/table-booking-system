import React, { useState } from 'react';
import BookingSidebar from './components/BookingSidebar';
import Floorplan from './components/Floorplan';
import AdminPanel from './components/AdminPanel'; 
import { useSidebarStore } from './lib/sidebarStore';
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const { loadingBookings } = useSidebarStore();

  // Logic for Admin Login
  const loginAsAdmin = () => {
    const password = prompt("Enter Admin Password:");
    if (password === "garageiscool") {
      setIsAdmin(true);
    } else {
      alert("Wrong password!");
    }
  };

  
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {!isAdmin ? (
        /* --- USER VIEW --- */
        <div style={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
          <button 
            onClick={loginAsAdmin} 
            style={{position: 'fixed', bottom: 10, left: 10, opacity: 0.5, zIndex: 1000}}
          >
            Admin Login
          </button>
          <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center' }}>
            {loadingBookings && (
              <div className="loading-overlay">
                <div className="spinner"></div>
              </div>
            )}
          <Floorplan />
          
          {isSidebarOpen && <BookingSidebar />}
        </div>
        </div>
      ) : (
        /* --- ADMIN VIEW --- */
        <div style={{ padding: '20px' }}>
          <button 
            onClick={() => setIsAdmin(false)}
            style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
          >
            ← Back to Site
          </button>
          <AdminPanel />
        </div>
      )}
    </div>
  );
}

export default App;
