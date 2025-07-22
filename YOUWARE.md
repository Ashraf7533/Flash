# Flash Running Club - Technical Documentation

## Project Overview
Flash Running Club is a complete web application for managing a running club with separate member and admin interfaces. The application uses client-side JavaScript with localStorage for data persistence, making it a fully static website suitable for GitHub Pages deployment.

## Architecture

### Authentication System
- **Admin-Controlled Authentication**: Only admins can create member accounts
- **Admin Login**: Username: `FlashRC12`, Password: `Flash12`
- **Member Login**: No default accounts - admin must create all member accounts via "Add Member" page
- Authentication state stored in localStorage (`userType`, `username`)
- Session persistence across page loads

### Data Storage Structure
All data is stored in browser localStorage with the following keys:
- `memberDb`: Array of member objects with username, password, email, phone, joinDate
- `trainings`: Object with member training data (current and past sessions)
- `events`: Array of club events with date, time, title, location, description
- `userType`: Current user type ('admin' or 'member')
- `username`: Current logged-in username

### File Structure
```
src/
├── index.html              # Homepage with login options
├── member-login.html       # Member authentication
├── admin-login.html        # Admin authentication
├── member-dashboard.html   # Member main dashboard
├── admin-dashboard.html    # Admin main dashboard
├── login-test.html         # Authentication testing page
├── css/
│   └── styles.css         # Main stylesheet with mobile-first design
└── js/
    ├── auth.js            # Authentication and data management
    ├── members.js         # Member management functions
    ├── training.js        # Training session management
    ├── payments.js        # Payment tracking
    ├── photos.js          # Photo gallery management
    └── sidebar.js         # Navigation sidebar
```

## Key Features

### Member Dashboard
- Profile management with photo upload capability
- Personal best running times tracking for 9 distances:
  - Road Events: 1.5mile, 2miles, 5km, 10km, 21km, 42km
  - Track Events: 1500m, 5000m, 10000m
- Clickable time boxes generate 1080x1080px shareable achievement images
- Current and past training sessions with availability management
- Event viewing and registration

### Admin Dashboard  
- Complete member management (add, edit, delete)
- Training session assignment and tracking
- Event creation and management
- Payment tracking and member status
- Statistics overview

### Running Times Image Generation
Clicking any running time box on the member dashboard generates a 1080x1080px shareable image featuring:
- Club logo in yellow circular border at top
- Club name below logo
- Member profile photo (circular with yellow border)
- Achievement text with distance and time
- Professional layout with proper spacing for social media sharing

## Common Development Tasks

### Testing Authentication
Use `login-test.html` to verify:
- Database initialization and status
- Member credential validation and testing
- Admin access verification
- Database reset functionality
- Quick member creation for testing
- Member management tools (view, test, delete)

### Adding New Members
Members are stored in the `memberDb` localStorage array. Use the admin interface or directly call:
```javascript
addMember({
    username: 'newuser',
    password: 'newpass',
    email: 'user@email.com',
    phone: '555-000-0000',
    fullName: 'Full Name'
});
```

### Managing Training Sessions
Training data is organized by member username with current and past arrays:
```javascript
addMemberTraining(username, date, morningSession, eveningSession);
completeTrainingSession(username, trainingId, 'morning');
```

## GitHub Pages Deployment

### Setup Steps
1. Create GitHub repository and upload all files from src/ directory
2. Enable GitHub Pages in repository Settings > Pages
3. Select 'Deploy from a branch' and choose 'main' branch with '/ (root)'
4. Add custom domain: flashrunningclub.site in repository settings
5. CNAME file is included for custom domain configuration

### DNS Configuration
Point your domain's DNS to GitHub Pages:
- Add A records to: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- Or add CNAME record to: yourusername.github.io

### Static Hosting Requirements
- No server-side requirements - pure client-side application
- All file paths are relative for compatibility
- No build process required

### CSS and JavaScript Loading
- All CSS loaded via `<link rel="stylesheet" href="css/styles.css">`
- JavaScript modules loaded via `<script src="js/filename.js">`
- Font Awesome icons via CDN
- No build process required

## Browser Compatibility
- Modern browsers with localStorage support
- HTML5 Canvas API for image generation
- ES6 JavaScript features
- CSS Flexbox and Grid for responsive design

## Known Issues and Solutions

### Authentication Problems
If login fails:
1. Check `login-test.html` for database status
2. Use "Reset Database" to restore default members
3. Verify localStorage is enabled in browser
4. Check browser console for JavaScript errors

### Styling Issues
If CSS doesn't load:
1. Verify file path: `css/styles.css`
2. Check browser network tab for 404 errors
3. Ensure proper MIME types on hosting platform

### Image Generation
Canvas-based image generation requires:
- Modern browser support for HTML5 Canvas
- Proper CORS handling for profile images
- Base64 data URL support for downloads

## Security Considerations
- Client-side only authentication (demo purposes)
- No server-side validation
- Data stored in browser localStorage
- Suitable for demonstration and learning projects
- Not recommended for production without proper backend security

## Performance Notes
- Lightweight static files
- No external dependencies except Font Awesome
- localStorage provides instant data access
- Image generation happens client-side
- Responsive design for mobile devices