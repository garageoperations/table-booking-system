import BookingSidebar from './components/BookingSidebar';
import Floorplan from './components/Floorplan';
import DateSelector from './components/DateSelector';
import { useSidebarStore } from './lib/sidebarStore';

function App() {

  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center' }}>
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