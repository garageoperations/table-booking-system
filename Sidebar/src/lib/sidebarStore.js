import { create } from "zustand";

const today = new Date().toISOString().split('T')[0];

export const useSidebarStore = create((set) => ({
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  selectedTable: null,
  setSelectedTable: (tableId) => set({ selectedTable: tableId }),
  clearSelectedTable: () => set({ selectedTable: null }),

  selectedSeat: null,
  setSelectedSeat: (seat) => set({ selectedSeat: seat }),
  clearSelectedSeat: () => set({ selectedSeat: null }),

  bookingType: "", // "table" or "seat"
  setBookingType: (type) => set({ bookingType: type }),
  clearBookingType: () => set({ bookingType: "table" }),

  selectedDate: today,
  setSelectedDate: (date) => set({ selectedDate: date }),
  clearSelectedDate: () => set({ selectedDate: null }),
}));
