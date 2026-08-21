# Review Form Morviss - Anime Review Website

A modern, feature-rich anime review website built with React, Vite, TailwindCSS, Firebase, and AniList API. This is a personal review platform where users can browse anime reviews, leave comments, and the admin can manage content through a secure admin panel.

## Features

- **🏠 Homepage**: Displays popular anime from AniList and latest reviews
- **📚 Reviews Page**: Browse all reviews sorted alphabetically (A-Z)
- **🔍 Detail Review Pages**: Comprehensive anime information with detailed personal reviews
- **💬 Comment System**: Logged-in users can leave comments on reviews
- **🔐 Google Authentication**: Secure login with Google OAuth
- **👤 User Profiles**: Personal profile pages for logged-in users
- **⚙️ Admin Panel**: Secure admin panel for adding and managing reviews
- **🎨 Modern UI**: Beautiful gradient design with dark mode support
- **📱 Responsive**: Fully responsive design for all screen sizes

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Authentication**: Firebase Authentication (Google OAuth)
- **Database**: Firebase Firestore
- **API**: AniList GraphQL API
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- GitHub account (for deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd webremia
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Google sign-in
4. Create Firestore Database:
   - Go to Firestore Database → Create Database
   - Choose production mode or test mode
   - Set up rules (see Firebase Rules section below)
5. Get your Firebase config:
   - Go to Project Settings → General → Your apps
   - Copy the config values

### 4. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_ADMIN_EMAIL=your-admin-email@gmail.com
```

**Important**: Replace `your-admin-email@gmail.com` with the email that should have admin access.

### 5. Firebase Security Rules

Set these rules in your Firebase Console → Firestore Database → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reviews collection - read for all, write for admin only
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'your-admin-email@gmail.com';
      
      // Comments subcollection - read for all, write for authenticated users
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && request.auth.token.email == request.resource.data.authorEmail;
      }
    }
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Important**: Replace `'your-admin-email@gmail.com'` with your actual admin email.

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
```

## Deployment to GitHub Pages

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Configure GitHub Pages

1. Go to your GitHub repository
2. Navigate to Settings → Pages
3. Under "Build and deployment", select "Source: GitHub Actions"
4. Create a new workflow file in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v5
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Update Base URL (if needed)

If your repository name is not `webremia`, update the `base` in `vite.config.js`:

```javascript
base: '/your-repo-name/',
```

## Security Features

- **Environment Variables**: Sensitive data stored in `.env` (not committed to Git)
- **Firebase Security Rules**: Database access controlled at the server level
- **Admin Protection**: Admin panel only accessible to specified email
- **Authentication Required**: Comments and profile features require login
- **No Source Maps**: Disabled in production build

## Usage

### For Visitors

- Browse homepage for popular anime and latest reviews
- Visit the Reviews page to see all reviews sorted alphabetically
- Click on any review to see detailed information
- Login with Google to leave comments

### For Admin

1. Login with the admin email configured in `.env`
2. Access the Admin Panel from the navigation
3. Search for anime using the AniList integration
4. Add reviews with ratings and detailed text
5. Manage existing reviews (delete functionality)

## Project Structure

```
webremia/
├── src/
│   ├── components/      # Reusable components (Navbar, ReviewCard)
│   ├── context/         # React context (AuthContext)
│   ├── lib/             # Utilities (Firebase, AniList API, utils)
│   ├── pages/           # Page components (Home, Reviews, Admin, etc.)
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind configuration
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## Customization

### Change Admin Email

Update the `VITE_ADMIN_EMAIL` in your `.env` file and update the Firebase security rules accordingly.

### Modify Styling

Edit `tailwind.config.js` to customize the Tailwind theme or modify component styles directly.

### Add New Features

The modular structure makes it easy to add new pages or components. Follow the existing patterns in the `pages/` and `components/` directories.

## Troubleshooting

### Firebase Authentication Issues

- Ensure your Firebase project has Google sign-in enabled
- Check that your domain is authorized in Firebase Console
- Verify environment variables are correctly set

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all environment variables are set
- Verify Vite base URL matches your repository name

### AniList API Issues

- The AniList API is public and doesn't require authentication
- If you encounter rate limiting, implement caching
- Check the AniList GraphQL documentation for query changes

## License

This project is for personal use. Feel free to modify and use it for your own anime review website.

## Credits

- [AniList](https://anilist.co/) - Anime data API
- [Firebase](https://firebase.google.com/) - Authentication and database
- [TailwindCSS](https://tailwindcss.com/) - Styling framework
- [Lucide](https://lucide.dev/) - Icon library
