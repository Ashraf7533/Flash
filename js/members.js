// Functions for managing club members

// Function to get all members from localStorage
function getAllMembers() {
    const membersData = localStorage.getItem('memberDb');
    
    if (!membersData) {
        return [];
    }
    
    return JSON.parse(membersData);
}

// Function to get all members with their training data
function getAllMembersWithTrainings() {
    try {
        // Get all members
        const members = getAllMembers().filter(member => !member.isAdmin);
        
        // Get all trainings
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        
        // Combine member data with their training data
        const membersWithTrainings = members.map(member => {
            const username = member.username;
            const memberTrainings = trainings[username] || { current: [], past: [] };
            
            return {
                ...member,
                currentTrainings: memberTrainings.current || [],
                pastTrainings: memberTrainings.past || []
            };
        });
        
        return membersWithTrainings;
    } catch (error) {
        console.error('Error getting members with trainings:', error);
        return [];
    }
}

// Function to add a new member
function addMember(memberData) {
    // Get current members
    const members = getAllMembers();
    
    // Check if username already exists
    if (members.some(member => member.username === memberData.username)) {
        return false;
    }
    
    // Add join date if not provided
    if (!memberData.joinDate) {
        const today = new Date();
        memberData.joinDate = today.toISOString().split('T')[0];
    }
    
    // Add to members array
    members.push(memberData);
    
    // Save back to localStorage
    localStorage.setItem('memberDb', JSON.stringify(members));
    
    // Initialize training record for the new member
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    trainings[memberData.username] = { current: [], past: [] };
    localStorage.setItem('trainings', JSON.stringify(trainings));
    
    // Initialize payment record for the new member
    try {
        const allPayments = getAllMembersPayments();
        if (!allPayments.members[memberData.username]) {
            allPayments.members[memberData.username] = [];
            localStorage.setItem('membersPayments', JSON.stringify(allPayments));
        }
    } catch (e) {
        console.error("Error initializing payment records:", e);
    }
    
    return true;
}

// Function to update an existing member
function updateMember(username, memberData) {
    // Get current members
    const members = getAllMembers();
    
    // Find the member
    const memberIndex = members.findIndex(member => member.username === username);
    if (memberIndex === -1) {
        return false;
    }
    
    // If username is changing, need to update related records too
    if (memberData.username !== username) {
        // Check if the new username already exists
        if (members.some((member, index) => index !== memberIndex && member.username === memberData.username)) {
            return false;
        }
        
        // Update training records
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        trainings[memberData.username] = trainings[username];
        delete trainings[username];
        localStorage.setItem('trainings', JSON.stringify(trainings));
        
        // Update payment records
        const allPayments = getAllMembersPayments();
        if (allPayments.members[username]) {
            allPayments.members[memberData.username] = allPayments.members[username];
            delete allPayments.members[username];
            localStorage.setItem('membersPayments', JSON.stringify(allPayments));
        }
    }
    
    // Update member info
    members[memberIndex] = memberData;
    
    // Save back to localStorage
    localStorage.setItem('memberDb', JSON.stringify(members));
    
    // Using localStorage only - no Firebase needed
    
    return true;
}

// Function to delete a member
function deleteMember(username) {
    // Get current members
    const members = getAllMembers();
    
    // Find the member
    const memberIndex = members.findIndex(member => member.username === username);
    if (memberIndex === -1) {
        return false;
    }
    
    // Remove from members array
    members.splice(memberIndex, 1);
    
    // Save back to localStorage
    localStorage.setItem('memberDb', JSON.stringify(members));
    
    // Remove training records
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    delete trainings[username];
    localStorage.setItem('trainings', JSON.stringify(trainings));
    
    // Remove payment records
    const allPayments = getAllMembersPayments();
    if (allPayments.members[username]) {
        delete allPayments.members[username];
        localStorage.setItem('membersPayments', JSON.stringify(allPayments));
    }
    
    return true;
}