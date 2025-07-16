// Centralized availability management functions
// This ensures both member and admin pages use exactly the same logic

// Standardized week number calculation
function getStandardWeekNumber(date) {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    
    // Find Thursday in current week
    target.setDate(target.getDate() + 3 - (target.getDay() + 6) % 7);
    
    // Take January 4th as it is always in week 1
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    
    // Calculate ISO week number
    const week = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
    
    return { week, year: target.getFullYear() };
}

// Generate availability key for a specific date
function generateAvailabilityKey(date) {
    const dateObj = new Date(date);
    const weekNumberYear = getStandardWeekNumber(dateObj);
    const dayOfWeek = dateObj.getDay();
    
    return `${weekNumberYear.year}-${weekNumberYear.week}-${dayOfWeek}`;
}

// Get member availability for a specific date
function getMemberAvailabilityForDate(username, date) {
    const availabilityData = JSON.parse(localStorage.getItem('memberAvailability')) || {};
    
    if (!availabilityData[username]) {
        return { morning: false, evening: false };
    }
    
    const dayKey = generateAvailabilityKey(date);
    return availabilityData[username][dayKey] || { morning: false, evening: false };
}

// Set member availability for a specific date
function setMemberAvailabilityForDate(username, date, availability) {
    const availabilityData = JSON.parse(localStorage.getItem('memberAvailability')) || {};
    
    if (!availabilityData[username]) {
        availabilityData[username] = {};
    }
    
    const dayKey = generateAvailabilityKey(date);
    availabilityData[username][dayKey] = availability;
    
    localStorage.setItem('memberAvailability', JSON.stringify(availabilityData));
    
    // Set update timestamp for admin auto-refresh
    localStorage.setItem('memberAvailabilityLastUpdate', Date.now().toString());
    
    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent('memberAvailabilityUpdated', {
        detail: { username, date, availability }
    }));
}

// Get member availability for an entire week
function getMemberAvailabilityForWeek(username, weekStartDate) {
    const weekData = [];
    const weekStart = new Date(weekStartDate);
    weekStart.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        
        const availability = getMemberAvailabilityForDate(username, day);
        weekData.push({
            date: new Date(day),
            dayOfWeek: day.getDay(),
            dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.getDay()],
            morning: availability.morning,
            evening: availability.evening
        });
    }
    
    return weekData;
}

// Check if member has any availability data
function memberHasAvailabilityData(username) {
    const availabilityData = JSON.parse(localStorage.getItem('memberAvailability')) || {};
    return availabilityData[username] && Object.keys(availabilityData[username]).length > 0;
}

// Get last availability update timestamp
function getAvailabilityUpdateTimestamp() {
    return localStorage.getItem('memberAvailabilityLastUpdate') || '0';
}

// Setup auto-refresh for admin pages
function setupAvailabilityAutoRefresh(refreshCallback) {
    let lastUpdateTimestamp = getAvailabilityUpdateTimestamp();
    
    // Check for updates every 3 seconds
    setInterval(() => {
        const currentTimestamp = getAvailabilityUpdateTimestamp();
        if (currentTimestamp !== lastUpdateTimestamp) {
            lastUpdateTimestamp = currentTimestamp;
            if (typeof refreshCallback === 'function') {
                refreshCallback();
            }
        }
    }, 3000);
    
    // Also listen for real-time events
    window.addEventListener('memberAvailabilityUpdated', function(event) {
        if (typeof refreshCallback === 'function') {
            refreshCallback();
        }
    });
}