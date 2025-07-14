// Flash Running Club - Payments Management

// Function to get all members' payment data
function getAllMembersPayments() {
    try {
        // Get data from localStorage or initialize if not exists
        let paymentsData = localStorage.getItem('membersPayments');
        
        if (!paymentsData) {
            // Initialize empty payments data
            const emptyPayments = {
                members: {}
            };
            
            localStorage.setItem('membersPayments', JSON.stringify(emptyPayments));
            return emptyPayments;
        }
        
        return JSON.parse(paymentsData);
    } catch (e) {
        console.error("Error getting payments data:", e);
        // Return a default empty structure
        return { members: {} };
    }
}

// Function to get payment data for a specific member
function getMemberPayments(username) {
    const allPayments = getAllMembersPayments();
    
    if (!allPayments.members[username]) {
        // Initialize empty payments array for this member
        allPayments.members[username] = [];
        localStorage.setItem('membersPayments', JSON.stringify(allPayments));
    }
    
    return allPayments.members[username];
}

// Function to add a new payment for a member
function addPayment(username, year, month, amount, paymentDate, notes = '') {
    // Input validation
    if (!username || !year || !month || !amount) {
        return {success: false, message: 'Missing required payment information'};
    }
    
    // Get current payments
    const allPayments = getAllMembersPayments();
    
    // Initialize if this member doesn't have payments yet
    if (!allPayments.members[username]) {
        allPayments.members[username] = [];
    }
    
    // Check if payment for this month already exists
    const existingPayment = allPayments.members[username].find(payment => 
        payment.year === parseInt(year) && payment.month === parseInt(month)
    );
    
    if (existingPayment) {
        return {success: false, message: 'Payment for this month already exists'};
    }
    
    // Create new payment object
    const newPayment = {
        id: Date.now(), // unique ID
        year: parseInt(year),
        month: parseInt(month),
        amount: parseFloat(amount),
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
        notes: notes || '',
        createdAt: new Date().toISOString()
    };
    
    // Add to member's payments
    allPayments.members[username].push(newPayment);
    
    // Sort payments by year (descending) and month (ascending)
    allPayments.members[username].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return a.month - b.month;
    });
    
    // Save to localStorage
    localStorage.setItem('membersPayments', JSON.stringify(allPayments));
    
    return {success: true, payment: newPayment};
}

// Function to edit an existing payment
function editPayment(username, paymentId, updatedData) {
    // Input validation
    if (!username || !paymentId) {
        return {success: false, message: 'Missing required information'};
    }
    
    // Get current payments
    const allPayments = getAllMembersPayments();
    
    // Check if member exists
    if (!allPayments.members[username]) {
        return {success: false, message: 'Member not found'};
    }
    
    // Find payment index
    const paymentIndex = allPayments.members[username].findIndex(payment => payment.id === parseInt(paymentId));
    
    if (paymentIndex === -1) {
        return {success: false, message: 'Payment not found'};
    }
    
    // Update payment data
    const payment = allPayments.members[username][paymentIndex];
    
    if (updatedData.year) payment.year = parseInt(updatedData.year);
    if (updatedData.month) payment.month = parseInt(updatedData.month);
    if (updatedData.amount) payment.amount = parseFloat(updatedData.amount);
    if (updatedData.paymentDate) payment.paymentDate = updatedData.paymentDate;
    if (updatedData.notes !== undefined) payment.notes = updatedData.notes;
    
    payment.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('membersPayments', JSON.stringify(allPayments));
    
    return {success: true, payment: payment};
}

// Function to delete a payment
function deletePayment(username, paymentId) {
    // Input validation
    if (!username || !paymentId) {
        return {success: false, message: 'Missing required information'};
    }
    
    // Get current payments
    const allPayments = getAllMembersPayments();
    
    // Check if member exists
    if (!allPayments.members[username]) {
        return {success: false, message: 'Member not found'};
    }
    
    // Find payment index
    const paymentIndex = allPayments.members[username].findIndex(payment => payment.id === parseInt(paymentId));
    
    if (paymentIndex === -1) {
        return {success: false, message: 'Payment not found'};
    }
    
    // Remove payment
    allPayments.members[username].splice(paymentIndex, 1);
    
    // Save to localStorage
    localStorage.setItem('membersPayments', JSON.stringify(allPayments));
    
    return {success: true};
}

// Helper function to get month name
function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
}

// Function to get all unique years that have payments
function getPaymentYears() {
    const allPayments = getAllMembersPayments();
    const years = new Set();
    
    // Collect all years from all members' payments
    Object.values(allPayments.members).forEach(memberPayments => {
        memberPayments.forEach(payment => {
            years.add(payment.year);
        });
    });
    
    // Convert to array and sort descending
    return Array.from(years).sort((a, b) => b - a);
}