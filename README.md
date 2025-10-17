# Storyboard Application

A beautiful full-screen storyboard application built with Express.js, SQLite, and vanilla JavaScript. Create, edit, and present story parts with support for images, movement descriptions, and rich content.

## Features

- **Full-Screen Presentation**: Each part takes up the full screen with smooth scroll snap navigation
- **View & Edit Modes**: Toggle between clean presentation view and functional edit mode
- **Authentication**: Secure login system with session management (2-month default session duration)
- **Rich Content**: Support for titles, optional images, movement descriptions, and content
- **Reordering**: Easy drag-style reordering with up/down buttons in edit mode
- **Image Upload**: Upload and manage images for each part with drag-and-drop support
- **Dark Theme**: Beautiful dark theme following the Ruqaqa design system
- **RTL Support**: Full support for Arabic text with RTL layout
- **Responsive**: Works beautifully on desktop, tablet, and mobile devices
- **Keyboard Navigation**: Arrow keys and Page Up/Down for quick navigation
- **Accessibility**: WCAG AAA contrast ratios, proper touch targets, keyboard navigation

## Tech Stack

- **Backend**: Express.js with SQLite database (better-sqlite3)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **File Upload**: Multer for image handling
- **Storage**: SQLite for data, file system for images

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd storyboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
# Server Configuration
PORT=3000

# Authentication (required for edit mode)
AUTH_USERNAME=admin
AUTH_PASSWORD=your-secure-password

# Session Configuration
SESSION_SECRET=your-random-secret-key-change-in-production
SESSION_MAX_AGE=5184000000  # 60 days in milliseconds

# Optional: Use bcrypt hash instead of plain password (recommended for production)
# AUTH_PASSWORD_HASH=$2b$10$YourBcryptHashHere
```

**Important:** For production, use a strong `SESSION_SECRET` and consider using `AUTH_PASSWORD_HASH` instead of `AUTH_PASSWORD`.

4. Start the development server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### View Mode (Default)

- **Navigation**: Scroll or use arrow keys/Page Up-Down to navigate between parts
- **Logo**: Fixed in top-right corner, always visible
- **Toggle Button**: Click the pencil icon (bottom-left) to enter edit mode
- **Public Access**: Anyone can view the storyboard without authentication

### Edit Mode (Authentication Required)

1. Click the pencil icon (bottom-left) - you'll be prompted to login
2. Enter your credentials (username and password from `.env` file)
3. Session lasts 60 days by default (configurable via `SESSION_MAX_AGE`)
4. Once authenticated:
   - **Add New Part**: Click the "إضافة جزء" (Add Part) button
   - **Edit Part**: Click "تعديل" (Edit) button on any part
   - **Delete Part**: Click "حذف" (Delete) button and confirm
   - **Reorder Parts**: Use up/down arrow buttons to reorder
   - **Upload Images**: Drag and drop or click to upload
5. **Logout**: Click the "تسجيل خروج" (Logout) button when done
6. **Exit Edit Mode**: Click the eye icon to return to view mode (stays logged in)

### Creating/Editing a Part

Each part consists of:
- **Part Title** (required): The main heading for this section
- **Image** (optional): Upload an image to display with the part
- **Movement Description** (optional): Describe any actions or movements (e.g., "بعد التقديم يصعد المتحدث إلى المسرح")
- **Content** (required): The main text content for this part

## Project Structure

```
/Users/bassel/storyboard/
├── src/
│   ├── db/
│   │   └── database.js      # SQLite database setup
│   └── server.js             # Express server & API
├── public/
│   ├── index.html            # Main HTML file
│   ├── styles.css            # Styling (dark theme)
│   ├── app.js                # Frontend JavaScript
│   ├── logo.png              # Logo image
│   └── uploads/              # Uploaded images
├── data/
│   └── storyboard.db         # SQLite database (created on first run)
├── package.json
├── .env                      # Environment variables
└── README.md
```

## API Endpoints

### Public Endpoints
- `GET /api/parts` - Fetch all parts
- `GET /api/parts/:id` - Get a specific part
- `GET /api/auth/status` - Check authentication status

### Authentication Endpoints
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/logout` - Logout and destroy session

### Protected Endpoints (Require Authentication)
- `POST /api/parts` - Create a new part
- `PUT /api/parts/:id` - Update a part
- `DELETE /api/parts/:id` - Delete a part
- `PUT /api/parts/reorder` - Reorder parts
- `POST /api/upload` - Upload an image

## Database Schema

```sql
CREATE TABLE parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  image_path TEXT,
  movement_description TEXT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Design System

The application follows the Ruqaqa design system with:
- Dark theme as primary
- Color palette: Primary (#1428a0), Secondary (#00a9e0), Accent (#20858f), Green (#208f5a)
- Smooth transitions and animations
- Responsive design with proper breakpoints
- High contrast for accessibility

See `design-system.md` for detailed design guidelines.

## Development

### Run in Development Mode
```bash
npm run dev
```
Uses nodemon for auto-reload on file changes.

### Run in Production Mode
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Generate Password Hash (Optional)
For enhanced security in production, you can use a bcrypt hash instead of plain password:

```javascript
// Run this in Node.js
const bcrypt = require('bcrypt');
bcrypt.hash('your-password', 10).then(hash => console.log(hash));
```

Then add the hash to your `.env` file as `AUTH_PASSWORD_HASH` instead of `AUTH_PASSWORD`.

## Keyboard Shortcuts

**View Mode:**
- `↓` or `Page Down` - Next part
- `↑` or `Page Up` - Previous part

**Modal Open:**
- `Esc` - Close modal

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

ISC

## Author

Built with ❤️ following the Ruqaqa design system

