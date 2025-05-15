# Kindred App

A React Native application built with Expo and Firebase Web SDK.

## Setup Instructions

### Prerequisites
- Node.js (14.0 or newer)
- Expo CLI: `npm install -g expo-cli`
- A Firebase project with Authentication, Firestore, and Storage enabled

### Installation
1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

### Firebase Configuration
The app is configured to use Firebase Web SDK with the following configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDFm8UGat7xekUz_fJOdE0kxznvwl7rvBs",
  authDomain: "kindred-725aa.firebaseapp.com",
  projectId: "kindred-725aa",
  storageBucket: "kindred-725aa.firebasestorage.app",
  messagingSenderId: "449864304937",
  appId: "1:449864304937:web:716920a5ce217574e78f38",
  measurementId: "G-JE8DC1J100"
};
```

If you want to use your own Firebase project, you need to:
1. Create a new project in the Firebase console
2. Enable Authentication, Firestore, and Storage services
3. Update the Firebase configuration in `src/services/firebase.ts`

### Running the App
Run the app using the Expo development server:

```
npm start
```

Then choose the platform you want to run on:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web

## Troubleshooting

### Firebase Authentication Issues
Make sure you're importing Firebase modules from the Firebase Web SDK:
```javascript
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
```

## Features
- Authentication (Login/Signup)
- Light/Dark Theme Support
- Firestore Database Integration
- Firebase Storage Integration

# Kindred Job Matching App

Kindred is a job matching application that connects job seekers with employers. The app supports both formal and informal job searching, with tailored experiences for different user types.

## Features

### Authentication
- User registration and login
- User type selection (Job Seeker or Employer)

### Job Seeker Features
- Job type selection (Formal or Informal)
- Customized questionnaires based on job type
- Home screen with personalized job recommendations
- Search functionality for finding jobs
- In-app chat with employers

### Employer Features
- Post and manage job listings
- View and manage job applications
- Chat with job applicants

## Technologies Used

- React Native with Expo
- TypeScript
- Firebase Authentication (Web SDK)
- Firestore Database
- React Navigation

## Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/           # Theme, constants and configuration
├── context/             # Context providers (Auth, Theme)
├── navigation/          # Navigation configuration
├── screens/             # App screens organized by user type
│   ├── auth/            # Authentication screens
│   ├── employer/        # Employer-specific screens
│   └── jobseeker/       # Job seeker-specific screens
├── services/            # Firebase and API services
└── utils/               # Utility functions
```

## Color Scheme

- Primary: Dark Purple (#4B0082) - Used for app logo, headers, and accents
- Secondary: White (#FFFFFF) - Used for backgrounds, card surfaces, and secondary text
- Accent: Dark Purple (#4B0082) - Used for interactive elements like buttons, links, and highlights

## Planned Improvements

- Implementation of skilled-based matching algorithm and K-NN algorithm
- Enhanced user profiles
- Push notifications
- Advanced filtering options
- Rating system for employers and job seekers 