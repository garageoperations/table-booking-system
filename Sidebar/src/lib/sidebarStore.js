import { create } from "zustand";

const today = new Date().toISOString().split('T')[0];

export const useSidebarStore = create((set) => ({
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  selectedDate: new Date().toISOString().split('T')[0],
  setSelectedDate: (date) => set({ selectedDate: date }),

  selectedItem: null,
  setSelectedItem: (tableId) => set({ selectedItem: tableId }),
  clearSelectedItem: () => set({ selectedItem: null }),

  bookingType: "", // "table" or "seat"
  setBookingType: (type) => set({ bookingType: type }),
  clearBookingType: () => set({ bookingType: "table" }),

  selectedDate: today,
  setSelectedDate: (date) => set({ selectedDate: date }),
  clearSelectedDate: () => set({ selectedDate: null }),
}));
