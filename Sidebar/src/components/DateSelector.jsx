import React, { useState } from 'react';
import { useSidebarStore } from '../lib/sidebarStore';

const DateSelector = () => {
    const today = new Date().toISOString().split('T')[0];
    const {selectedDate, setSelectedDate} = useSidebarStore();

    const handleChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div>
            <label htmlFor="date-picker">Select a date:</label>
            <input
                id="date-picker"
                type="date"
                min={today}
                value={selectedDate}
                onChange={handleChange}
            />
        </div>
    );
};

export default DateSelector;