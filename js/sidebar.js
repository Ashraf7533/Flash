// Simplified sidebar functionality for Flash Running Club

document.addEventListener('DOMContentLoaded', function() {
    console.log("Sidebar initialization started");
    
    // Get elements
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebar) {
        console.error("Sidebar element not found!");
        return;
    }
    
    if (!hamburger) {
        console.warn("Hamburger menu button not found!");
    }
    
    if (!sidebarToggle) {
        console.warn("Sidebar toggle button not found!");
    }
    
    // Mobile sidebar toggle function
    function toggleMobileSidebar() {
        console.log("Toggle sidebar called");
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        } else {
            sidebar.classList.add('active');
        }
    }
    
    // Hamburger menu click (open sidebar)
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Hamburger clicked");
            toggleMobileSidebar();
        });
    }
    
    // Close button click handler
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Close button clicked");
            sidebar.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            hamburger && !hamburger.contains(e.target)) {
            console.log("Clicked outside sidebar");
            sidebar.classList.remove('active');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // If we're on desktop, ensure proper styles
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
    
    console.log("Sidebar initialization complete");
});