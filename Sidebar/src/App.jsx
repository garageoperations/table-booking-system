import BookingSidebar from './components/BookingSidebar';
import Floorplan from './components/Floorplan';
import { useSidebarStore } from './lib/sidebarStore';
import "react-datepicker/dist/react-datepicker.css";

function App() {

  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const { loadingBookings } = useSidebarStore();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center' }}>
      {loadingBookings && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      {/* Main Content */}
      <Floorplan/>
      {/* Booking Sidebar on Right */}
      {isSidebarOpen &&
      <BookingSidebar />
}
    </div>
  );
}

export default App;