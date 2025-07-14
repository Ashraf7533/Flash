// Photo Management Functions for Flash Running Club

// Check if user is admin
function isAdmin() {
    return localStorage.getItem('userType') === 'admin';
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('username') !== null;
}

// Upload photo (admin only)
async function uploadPhoto(file) {
    if (!isAdmin()) {
        showMessage('Only admins can upload photos', 'error');
        return null;
    }

    try {
        // Mock Firebase upload (since we're using localStorage for persistence)
        const timestamp = new Date().getTime();
        const filename = `photo_${timestamp}_${file.name}`;
        
        // Create a FileReader to convert file to base64 for storage
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const url = e.target.result; // base64 encoded data URL
                    
                    // Save photo metadata to local storage
                    savePhotoMetadata(filename, url);
                    
                    showMessage('Photo uploaded successfully', 'success');
                    resolve(url);
                } catch (error) {
                    console.error('Error processing photo:', error);
                    showMessage('Error processing photo', 'error');
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                showMessage('Error reading file', 'error');
                reject(new Error('Error reading file'));
            };
            
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        showMessage('Error uploading photo', 'error');
        return null;
    }
}

// Save photo metadata to localStorage
function savePhotoMetadata(filename, url) {
    // Get existing photos or initialize empty array
    const photos = JSON.parse(localStorage.getItem('photos')) || [];
    
    // Create photo object
    const photoData = {
        id: Date.now().toString(),
        filename: filename,
        url: url,
        uploadedBy: localStorage.getItem('username'),
        uploadDate: new Date().toISOString(),
    };
    
    // Add to array and save
    photos.push(photoData);
    localStorage.setItem('photos', JSON.stringify(photos));
}

// Get all photos from localStorage
async function getAllPhotos() {
    try {
        // Get photos from localStorage
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        
        // Sort by upload date (newest first)
        return photos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    } catch (error) {
        console.error('Error fetching photos:', error);
        return [];
    }
}

// Load photos into gallery
async function loadPhotoGallery() {
    const galleryContainer = document.getElementById('photoGallery');
    galleryContainer.innerHTML = '<div class="loading-message">Loading photos...</div>';
    
    const photos = await getAllPhotos();
    
    if (photos.length === 0) {
        galleryContainer.innerHTML = '<div class="text-center">No photos available</div>';
        return;
    }
    
    galleryContainer.innerHTML = '';
    
    // Create gallery grid
    const galleryGrid = document.createElement('div');
    galleryGrid.className = 'photo-gallery-grid';
    
    // Add photos to gallery
    photos.forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        photoItem.innerHTML = `
            <div class="photo-container">
                <img src="${photo.url}" alt="Club Photo" class="gallery-image">
                <div class="photo-overlay">
                    <div class="photo-actions">
                        <a href="${photo.url}" class="btn btn-primary btn-sm" download="flash_running_club_photo.jpg">
                            <i class="fas fa-download"></i> Download
                        </a>
                        ${isAdmin() ? `
                            <button class="btn btn-secondary btn-sm delete-photo" data-id="${photo.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="photo-info">
                <div class="photo-date">Uploaded: ${formatDate(photo.uploadDate)}</div>
                <div class="photo-uploader">By: ${photo.uploadedBy}</div>
            </div>
        `;
        
        galleryGrid.appendChild(photoItem);
    });
    
    galleryContainer.appendChild(galleryGrid);
    
    // Add event listeners to delete buttons
    if (isAdmin()) {
        document.querySelectorAll('.delete-photo').forEach(button => {
            button.addEventListener('click', function() {
                const photoId = this.getAttribute('data-id');
                deletePhoto(photoId);
            });
        });
    }
}

// Delete photo (admin only)
async function deletePhoto(photoId) {
    if (!isAdmin()) {
        showMessage('Only admins can delete photos', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this photo?')) {
        try {
            // Get all photos
            const photos = JSON.parse(localStorage.getItem('photos')) || [];
            
            // Find photo index
            const photoIndex = photos.findIndex(photo => photo.id === photoId);
            
            if (photoIndex !== -1) {
                // Remove photo
                photos.splice(photoIndex, 1);
                
                // Save updated array
                localStorage.setItem('photos', JSON.stringify(photos));
                
                showMessage('Photo deleted successfully', 'success');
                loadPhotoGallery(); // Reload gallery
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
            showMessage('Error deleting photo', 'error');
        }
    }
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show message to user
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `alert alert-${type}`;
    messageElement.textContent = message;
    
    // Clear previous messages
    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageElement);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            if (messageContainer.contains(messageElement)) {
                messageContainer.removeChild(messageElement);
            }
        }, 500);
    }, 3000);
}