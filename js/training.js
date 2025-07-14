// Training.js - Centralized functions for training management

// Last update timestamp to track changes
let lastTrainingUpdateTimestamp = Date.now();

// Function to add or update member training
function addMemberTraining(username, date, morningSession, eveningSession) {
    try {
        // Get current trainings from storage
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        
        // Initialize if not exist
        if (!trainings[username]) {
            trainings[username] = { current: [], past: [] };
        }
        
        // Generate a unique ID for new trainings
        const newId = Date.now();
        
        // Check if training already exists for this date
        const existingTrainingIndex = trainings[username].current.findIndex(t => t.date === date);
        
        if (existingTrainingIndex !== -1) {
            // Update existing training
            trainings[username].current[existingTrainingIndex] = {
                id: trainings[username].current[existingTrainingIndex].id, // Keep existing ID
                date,
                morningSession,
                eveningSession,
                completed: false
            };
        } else {
            // Add new training
            trainings[username].current.push({
                id: newId,
                date,
                morningSession,
                eveningSession,
                completed: false
            });
        }
        
        // Update the last update timestamp
        updateTrainingTimestamp();
        
        // Save back to localStorage
        localStorage.setItem('trainings', JSON.stringify(trainings));
        return true;
        
    } catch (error) {
        console.error('Error adding/updating training:', error);
        return false;
    }
}

// Function to delete a member training
function deleteMemberTraining(username, date) {
    try {
        // Get trainings from storage
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        
        // Check if member exists
        if (!trainings[username] || !trainings[username].current) {
            return false;
        }
        
        // Find training by date
        const trainingIndex = trainings[username].current.findIndex(t => t.date === date);
        if (trainingIndex === -1) return false;
        
        // Remove the training
        trainings[username].current.splice(trainingIndex, 1);
        
        // Update the last update timestamp
        updateTrainingTimestamp();
        
        // Save updated data back to localStorage
        localStorage.setItem('trainings', JSON.stringify(trainings));
        return true;
        
    } catch (error) {
        console.error('Error deleting training:', error);
        return false;
    }
}

// Function to mark a training session as completed permanently
function completeTrainingSessionPermanently(username, trainingId, sessionType) {
    try {
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        
        if (!trainings[username]) return false;
        
        // Find the training in current trainings
        const trainingIndex = trainings[username].current.findIndex(t => t.id === trainingId);
        
        if (trainingIndex === -1) return false;
        
        const training = trainings[username].current[trainingIndex];
        
        // Update the session's completed status
        if (sessionType === 'morning' && training.morningSession) {
            training.morningSession.completed = true;
            training.morningSession.permanent = true;
            training.morningSession.completedAt = new Date().toISOString();
        } else if (sessionType === 'evening' && training.eveningSession) {
            training.eveningSession.completed = true;
            training.eveningSession.permanent = true;
            training.eveningSession.completedAt = new Date().toISOString();
        } else {
            return false;
        }
        
        // Check if both sessions are completed or if there's only one session and it's completed
        const morningCompleted = training.morningSession ? training.morningSession.completed : true;
        const eveningCompleted = training.eveningSession ? training.eveningSession.completed : true;
        
        // If all sessions are completed, set completion time for 1-hour visibility rule
        if (morningCompleted && eveningCompleted) {
            training.completionTime = new Date().toISOString();
        }
        
        // Update the last update timestamp
        updateTrainingTimestamp();
        
        // Save back to localStorage
        localStorage.setItem('trainings', JSON.stringify(trainings));
        return true;
        
    } catch (error) {
        console.error('Error completing training session:', error);
        return false;
    }
}

// Function to mark a training session as incomplete permanently
function markSessionIncompletePermanently(username, trainingId, sessionType) {
    try {
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        
        if (!trainings[username]) return false;
        
        // Find the training in current trainings
        const trainingIndex = trainings[username].current.findIndex(t => t.id === trainingId);
        
        if (trainingIndex === -1) return false;
        
        // Update the session's completed status
        if (sessionType === 'morning' && trainings[username].current[trainingIndex].morningSession) {
            trainings[username].current[trainingIndex].morningSession.completed = false;
            trainings[username].current[trainingIndex].morningSession.permanent = true;
        } else if (sessionType === 'evening' && trainings[username].current[trainingIndex].eveningSession) {
            trainings[username].current[trainingIndex].eveningSession.completed = false;
            trainings[username].current[trainingIndex].eveningSession.permanent = true;
        } else {
            return false;
        }
        
        // Update the last update timestamp
        updateTrainingTimestamp();
        
        // Save back to localStorage
        localStorage.setItem('trainings', JSON.stringify(trainings));
        return true;
        
    } catch (error) {
        console.error('Error marking training session as incomplete:', error);
        return false;
    }
}

// Update the timestamp when trainings are modified
function updateTrainingTimestamp() {
    lastTrainingUpdateTimestamp = Date.now();
    localStorage.setItem('trainingLastUpdated', lastTrainingUpdateTimestamp);
}

// Get the last update timestamp
function getTrainingUpdateTimestamp() {
    const storedTimestamp = localStorage.getItem('trainingLastUpdated');
    return storedTimestamp ? parseInt(storedTimestamp) : lastTrainingUpdateTimestamp;
}

// Check if trainings have been updated since last check
function checkForTrainingUpdates(lastCheckedTimestamp) {
    const currentTimestamp = getTrainingUpdateTimestamp();
    return currentTimestamp > lastCheckedTimestamp;
}

// Function to automatically check and update training status based on date and completion rules
function checkAndUpdateTrainingStatus() {
    try {
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        let updated = false;
        
        // Get current date and time
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        // Loop through all members
        Object.keys(trainings).forEach(username => {
            if (!trainings[username].current) return;
            
            const currentTrainings = trainings[username].current;
            
            // Check each training
            for (let i = currentTrainings.length - 1; i >= 0; i--) {
                const training = currentTrainings[i];
                
                // Check if both sessions are completed and it's been completed for more than 1 hour
                const bothCompleted = checkIfBothSessionsCompleted(training);
                if (bothCompleted && training.completionTime) {
                    const completionTime = new Date(training.completionTime);
                    const oneHourLater = new Date(completionTime.getTime() + (60 * 60 * 1000)); // 1 hour after completion
                    
                    if (now >= oneHourLater) {
                        // Move to past trainings (admin can still see it)
                        const completedTraining = currentTrainings.splice(i, 1)[0];
                        
                        if (!trainings[username].past) {
                            trainings[username].past = [];
                        }
                        
                        trainings[username].past.unshift(completedTraining);
                        updated = true;
                        continue;
                    }
                }
                
                // Check if training is more than 3 days old and incomplete
                if (training.date < threeDaysAgo) {
                    // Mark any incomplete sessions as permanently incomplete
                    if (training.morningSession && !training.morningSession.completed && !training.morningSession.permanent) {
                        training.morningSession.completed = false;
                        training.morningSession.permanent = true;
                        training.morningSession.autoMarkedIncomplete = true;
                    }
                    
                    if (training.eveningSession && !training.eveningSession.completed && !training.eveningSession.permanent) {
                        training.eveningSession.completed = false;
                        training.eveningSession.permanent = true;
                        training.eveningSession.autoMarkedIncomplete = true;
                    }
                    
                    // Remove from current and add to past
                    const expiredTraining = currentTrainings.splice(i, 1)[0];
                    
                    if (!trainings[username].past) {
                        trainings[username].past = [];
                    }
                    
                    trainings[username].past.unshift(expiredTraining);
                    updated = true;
                }
            }
        });
        
        // Save changes if any training was updated
        if (updated) {
            localStorage.setItem('trainings', JSON.stringify(trainings));
            updateTrainingTimestamp();
        }
        
        return updated;
    } catch (error) {
        console.error('Error checking training status:', error);
        return false;
    }
}

// Helper function to check if both sessions are completed
function checkIfBothSessionsCompleted(training) {
    const morningCompleted = training.morningSession ? training.morningSession.completed : true;
    const eveningCompleted = training.eveningSession ? training.eveningSession.completed : true;
    return morningCompleted && eveningCompleted;
}

// Get member training data
function getMemberTrainings(username) {
    try {
        // First, run the check to update status based on rules
        checkAndUpdateTrainingStatus();
        
        // Get training data from local storage
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        
        // Check if this member has training data
        if (!trainings[username]) {
            // Initialize empty training structure for this member
            trainings[username] = { current: [], past: [] };
            localStorage.setItem('trainings', JSON.stringify(trainings));
            return { current: trainings[username].current, past: [] };
        }
        
        // For member view, only return current trainings, not past trainings
        if (localStorage.getItem('userType') === 'member') {
            return { current: trainings[username].current, past: [] };
        }
        
        return trainings[username];
    } catch (error) {
        console.error('Error getting member trainings:', error);
        // Return empty training structure
        return { current: [], past: [] };
    }
}

// Assign new training to a member and all related members
function assignTraining(username, trainingData) {
    try {
        // Get all members to assign the same training to related members
        const members = JSON.parse(localStorage.getItem('memberDb')) || [];
        
        // Create the training object with consistent data
        const newTraining = {
            id: Date.now(),
            type: trainingData.type,
            date: trainingData.date,
            morningSession: trainingData.morningSession,
            eveningSession: trainingData.eveningSession,
            assigned: trainingData.assigned || new Date().toISOString()
        };
        
        // Get current trainings
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        
        // Initialize if member doesn't exist
        if (!trainings[username]) {
            trainings[username] = { current: [], past: [] };
        }
        
        // Add new training to current trainings for the specified member
        trainings[username].current.push(newTraining);
        
        // Run a check to update status
        checkAndUpdateTrainingStatus();
        
        // Save back to localStorage
        localStorage.setItem('trainings', JSON.stringify(trainings));
        
        // Update timestamp
        updateTrainingTimestamp();
        
        return true;
    } catch (error) {
        console.error('Error assigning training:', error);
        return false;
    }
}