import BookingSidebar from './components/BookingSidebar';

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1>Main Content Area</h1>
        <p>Your existing content goes here...</p>
      </div>

      {/* Booking Sidebar on Right */}
      <BookingSidebar />
    </div>
  );
}

export default App;