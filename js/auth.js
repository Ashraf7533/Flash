// Authentication and core functionality for Flash Running Club

// Store active sessions to support multiple devices
function initializeActiveSessions() {
    if (!localStorage.getItem('activeSessions')) {
        localStorage.setItem('activeSessions', JSON.stringify({}));
    }
}

// Generate session ID
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add session to active sessions
function addActiveSession(username, userType) {
    const sessions = JSON.parse(localStorage.getItem('activeSessions')) || {};
    if (!sessions[username]) {
        sessions[username] = [];
    }
    
    const sessionId = generateSessionId();
    sessions[username].push({
        sessionId: sessionId,
        loginTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        userType: userType
    });
    
    localStorage.setItem('activeSessions', JSON.stringify(sessions));
    localStorage.setItem('currentSessionId', sessionId);
    return sessionId;
}

// Remove current session
function removeCurrentSession() {
    const username = localStorage.getItem('username');
    const currentSessionId = localStorage.getItem('currentSessionId');
    
    if (username && currentSessionId) {
        const sessions = JSON.parse(localStorage.getItem('activeSessions')) || {};
        if (sessions[username]) {
            sessions[username] = sessions[username].filter(session => session.sessionId !== currentSessionId);
            if (sessions[username].length === 0) {
                delete sessions[username];
            }
            localStorage.setItem('activeSessions', JSON.stringify(sessions));
        }
    }
    
    // Clear current session data
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    localStorage.removeItem('currentSessionId');
}

// Remove all sessions for a user
function removeAllSessions(username) {
    const sessions = JSON.parse(localStorage.getItem('activeSessions')) || {};
    delete sessions[username];
    localStorage.setItem('activeSessions', JSON.stringify(sessions));
    
    // If it's the current user, also clear current session data
    if (localStorage.getItem('username') === username) {
        localStorage.removeItem('username');
        localStorage.removeItem('userType');
        localStorage.removeItem('currentSessionId');
    }
}

// Initialize the database with default admin and sample members
function initializeDatabase() {
    // Initialize active sessions
    initializeActiveSessions();
    
    // Check if memberDb exists, if not create it with default data
    if (!localStorage.getItem('memberDb')) {
        const defaultMembers = [
            {
                username: 'FlashRC25',
                password: 'Flash25',
                email: 'admin@flashrunningclub.com',
                phone: '555-000-0000',
                fullName: 'Flash Running Club Admin',
                joinDate: '2024-01-01',
                isAdmin: true
            },
            {
                username: 'john_doe',
                password: 'password123',
                email: 'john@example.com',
                phone: '555-123-4567',
                fullName: 'John Doe',
                joinDate: '2024-01-15'
            },
            {
                username: 'jane_smith',
                password: 'mypassword',
                email: 'jane@example.com',
                phone: '555-987-6543',
                fullName: 'Jane Smith',
                joinDate: '2024-02-01'
            }
        ];
        localStorage.setItem('memberDb', JSON.stringify(defaultMembers));
        console.log('Database initialized with default data');
    }
    
    // Initialize trainings if not exists
    if (!localStorage.getItem('trainings')) {
        localStorage.setItem('trainings', JSON.stringify({}));
    }
    
    // Initialize events if not exists
    if (!localStorage.getItem('events')) {
        const defaultEvents = [
            {
                id: 1,
                title: 'Morning 5K Run',
                date: '2024-12-25',
                time: '06:00',
                location: 'Central Park',
                description: 'Join us for a festive Christmas morning run!'
            },
            {
                id: 2,
                title: 'New Year Marathon Training',
                date: '2025-01-01',
                time: '07:00',
                location: 'Running Track',
                description: 'Start the new year with intensive marathon training session.'
            }
        ];
        localStorage.setItem('events', JSON.stringify(defaultEvents));
    }
    
    // Initialize photos if not exists
    if (!localStorage.getItem('photos')) {
        localStorage.setItem('photos', JSON.stringify([]));
    }
}

// Get all members from localStorage
function getAllMembers() {
    return JSON.parse(localStorage.getItem('memberDb')) || [];
}

// Get member by username
function getMemberByUsername(username) {
    const members = getAllMembers();
    return members.find(member => member.username === username);
}

// Add new member
function addMember(memberData) {
    const members = getAllMembers();
    
    // Check if username already exists
    if (members.find(member => member.username === memberData.username)) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Add join date if not provided
    if (!memberData.joinDate) {
        memberData.joinDate = new Date().toISOString().split('T')[0];
    }
    
    members.push(memberData);
    localStorage.setItem('memberDb', JSON.stringify(members));
    
    return { success: true, message: 'Member added successfully' };
}

// Update member data
function updateMember(username, updatedData) {
    const members = getAllMembers();
    const memberIndex = members.findIndex(member => member.username === username);
    
    if (memberIndex === -1) {
        return { success: false, message: 'Member not found' };
    }
    
    // Preserve username and joinDate
    updatedData.username = username;
    updatedData.joinDate = members[memberIndex].joinDate;
    
    members[memberIndex] = { ...members[memberIndex], ...updatedData };
    localStorage.setItem('memberDb', JSON.stringify(members));
    
    return { success: true, message: 'Member updated successfully' };
}

// Delete member
function deleteMember(username) {
    const members = getAllMembers();
    const updatedMembers = members.filter(member => member.username !== username);
    
    if (members.length === updatedMembers.length) {
        return { success: false, message: 'Member not found' };
    }
    
    localStorage.setItem('memberDb', JSON.stringify(updatedMembers));
    
    // Also remove member's training data
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    delete trainings[username];
    localStorage.setItem('trainings', JSON.stringify(trainings));
    
    // Remove all sessions for this user
    removeAllSessions(username);
    
    return { success: true, message: 'Member deleted successfully' };
}

// Validate login credentials
function validateLogin(username, password, userType) {
    const members = getAllMembers();
    
    if (userType === 'admin') {
        // For the admin account, use hardcoded GitHub credentials
        if (username === 'admin' && password === 'github') {
            localStorage.setItem('username', 'FlashRC12'); // Still use original admin account internally
            localStorage.setItem('userType', 'admin');
            addActiveSession('FlashRC12', 'admin');
            return { success: true, message: 'Admin login successful' };
        }
    } else {
        // Check member credentials
        const member = members.find(member => 
            member.username === username && 
            member.password === password && 
            !member.isAdmin
        );
        
        if (member) {
            localStorage.setItem('username', username);
            localStorage.setItem('userType', 'member');
            addActiveSession(username, 'member');
            return { success: true, message: 'Member login successful' };
        }
    }
    
    return { success: false, message: 'Invalid credentials' };
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('username') !== null;
}

// Check if current user is admin
function isAdmin() {
    return localStorage.getItem('userType') === 'admin';
}

// Get current user info
function getCurrentUser() {
    const username = localStorage.getItem('username');
    const userType = localStorage.getItem('userType');
    
    if (!username) return null;
    
    return {
        username: username,
        userType: userType,
        memberData: getMemberByUsername(username)
    };
}

// Logout current session
function logout() {
    removeCurrentSession();
    window.location.href = 'index.html';
}

// Logout from all devices
function logoutAll() {
    const username = localStorage.getItem('username');
    if (username) {
        removeAllSessions(username);
        window.location.href = 'index.html';
    }
}

// Enhanced alert function with theme styling
function showAlert(message, type = 'info') {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert notification-theme`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add icon based on type
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    else if (type === 'error') icon = 'fas fa-exclamation-circle';
    else if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    
    alertDiv.innerHTML = `<i class="${icon}"></i> ${message}`;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 300);
        }
    }, 4000);
}

// Enhanced confirm function with theme styling
function showConfirm(message, callback) {
    // Remove any existing confirms
    const existingConfirms = document.querySelectorAll('.custom-confirm');
    existingConfirms.forEach(confirm => confirm.remove());
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    // Create confirm dialog
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'notification-theme';
    confirmDiv.style.cssText = `
        max-width: 400px;
        margin: 20px;
        animation: scaleIn 0.3s ease-out;
        text-align: center;
    `;
    
    confirmDiv.innerHTML = `
        <div style="margin-bottom: 20px;">
            <i class="fas fa-question-circle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
            ${message}
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-success" id="confirmYes">Yes</button>
            <button class="btn btn-secondary" id="confirmNo">No</button>
        </div>
    `;
    
    overlay.appendChild(confirmDiv);
    document.body.appendChild(overlay);
    
    // Handle button clicks
    document.getElementById('confirmYes').onclick = () => {
        overlay.remove();
        callback(true);
    };
    
    document.getElementById('confirmNo').onclick = () => {
        overlay.remove();
        callback(false);
    };
    
    // Handle overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
            callback(false);
        }
    };
}

// Add CSS animations
if (!document.getElementById('authAnimations')) {
    const style = document.createElement('style');
    style.id = 'authAnimations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.7);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize database when the script loads
initializeDatabase();

// Event Management Functions
function getAllEvents() {
    return JSON.parse(localStorage.getItem('events')) || [];
}

function addEvent(eventData) {
    const events = getAllEvents();
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    
    eventData.id = newId;
    events.push(eventData);
    localStorage.setItem('events', JSON.stringify(events));
    
    return { success: true, message: 'Event added successfully' };
}

function updateEvent(eventId, eventData) {
    const events = getAllEvents();
    const eventIndex = events.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
        return { success: false, message: 'Event not found' };
    }
    
    events[eventIndex] = { ...events[eventIndex], ...eventData };
    localStorage.setItem('events', JSON.stringify(events));
    
    return { success: true, message: 'Event updated successfully' };
}

function deleteEvent(eventId) {
    const events = getAllEvents();
    const updatedEvents = events.filter(event => event.id !== eventId);
    
    if (events.length === updatedEvents.length) {
        return false;
    }
    
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    return true;
}

// Training Management Functions
function getAllTrainings() {
    return JSON.parse(localStorage.getItem('trainings')) || {};
}

function getMemberTrainings(username) {
    const trainings = getAllTrainings();
    return trainings[username] || { current: [], past: [] };
}

function addMemberTraining(username, date, morningSession, eveningSession) {
    const trainings = getAllTrainings();
    
    if (!trainings[username]) {
        trainings[username] = { current: [], past: [] };
    }
    
    const newTraining = {
        id: Date.now(),
        date: date,
        morning: {
            session: morningSession || '',
            status: 'incomplete',
            completedAt: null
        },
        evening: {
            session: eveningSession || '',
            status: 'incomplete',
            completedAt: null
        },
        addedAt: new Date().toISOString()
    };
    
    trainings[username].current.push(newTraining);
    localStorage.setItem('trainings', JSON.stringify(trainings));
    
    return { success: true, message: 'Training added successfully' };
}

function completeTrainingSession(username, trainingId, sessionType) {
    const trainings = getAllTrainings();
    
    if (!trainings[username]) {
        return { success: false, message: 'No trainings found for user' };
    }
    
    const training = trainings[username].current.find(t => t.id === trainingId);
    if (!training) {
        return { success: false, message: 'Training not found' };
    }
    
    if (sessionType === 'morning' || sessionType === 'evening') {
        training[sessionType].status = 'completed';
        training[sessionType].completedAt = new Date().toISOString();
    }
    
    localStorage.setItem('trainings', JSON.stringify(trainings));
    return { success: true, message: 'Session completed successfully' };
}

function deleteMemberTraining(username, date) {
    const trainings = getAllTrainings();
    
    if (!trainings[username]) {
        return false;
    }
    
    // Remove from current trainings
    trainings[username].current = trainings[username].current.filter(t => t.date !== date);
    
    // Remove from past trainings
    trainings[username].past = trainings[username].past.filter(t => t.date !== date);
    
    localStorage.setItem('trainings', JSON.stringify(trainings));
    return true;
}

// Payment Management Functions
function getAllPayments() {
    return JSON.parse(localStorage.getItem('payments')) || {};
}

function getMemberPayments(username) {
    const payments = getAllPayments();
    return payments[username] || [];
}

function addPaymentRecord(username, amount, date, description) {
    const payments = getAllPayments();
    
    if (!payments[username]) {
        payments[username] = [];
    }
    
    const newPayment = {
        id: Date.now(),
        amount: parseFloat(amount),
        date: date,
        description: description || '',
        addedAt: new Date().toISOString()
    };
    
    payments[username].push(newPayment);
    localStorage.setItem('payments', JSON.stringify(payments));
    
    return { success: true, message: 'Payment record added successfully' };
}

function deletePaymentRecord(username, paymentId) {
    const payments = getAllPayments();
    
    if (!payments[username]) {
        return false;
    }
    
    payments[username] = payments[username].filter(p => p.id !== paymentId);
    localStorage.setItem('payments', JSON.stringify(payments));
    
    return true;
}

// Dashboard Statistics
function getDashboardStats() {
    const members = getAllMembers();
    const trainings = getAllTrainings();
    const events = getAllEvents();
    const payments = getAllPayments();
    
    // Count members (excluding admin)
    const memberCount = members.filter(m => !m.isAdmin).length;
    
    // Count active trainings
    let activeTrainings = 0;
    Object.values(trainings).forEach(userTrainings => {
        activeTrainings += userTrainings.current ? userTrainings.current.length : 0;
    });
    
    // Count upcoming events
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = events.filter(event => event.date >= today).length;
    
    // Calculate total payments
    let totalPayments = 0;
    Object.values(payments).forEach(userPayments => {
        userPayments.forEach(payment => {
            totalPayments += payment.amount;
        });
    });
    
    return {
        memberCount,
        activeTrainings,
        upcomingEvents,
        totalPayments
    };
}

// Admin specific statistics for admin dashboard
function getAdminStats() {
    const members = getAllMembers();
    const trainings = getAllTrainings();
    
    // Count members (excluding admin)
    const memberCount = members.filter(m => !m.isAdmin).length;
    
    // Count current trainings
    let currentTrainingsCount = 0;
    Object.values(trainings).forEach(userTrainings => {
        if (userTrainings.current) {
            currentTrainingsCount += userTrainings.current.length;
        }
    });
    
    // Count completed trainings (from past sessions)
    let completedTrainingsCount = 0;
    Object.values(trainings).forEach(userTrainings => {
        if (userTrainings.past) {
            completedTrainingsCount += userTrainings.past.length;
        }
        // Also count completed sessions from current trainings
        if (userTrainings.current) {
            userTrainings.current.forEach(training => {
                if (training.morning && training.morning.status === 'completed') {
                    completedTrainingsCount++;
                }
                if (training.evening && training.evening.status === 'completed') {
                    completedTrainingsCount++;
                }
            });
        }
    });
    
    // Total trainings
    const totalTrainingsCount = currentTrainingsCount + completedTrainingsCount;
    
    return {
        memberCount,
        currentTrainingsCount,
        completedTrainingsCount,
        totalTrainingsCount
    };
}