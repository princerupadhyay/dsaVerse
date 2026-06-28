# Firebase Setup Guide for DSAverse

This project uses Firebase for authentication and data persistence.

## Firestore Security Rules

Copy these rules to your Firebase Console > Firestore > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Authentication Setup

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable "Google" as a sign-in provider
3. Add your authorized domains

## Features

- Google Sign-In: Users can sign in with their Google account
- Cloud Sync: All progress (XP, levels, achievements, streak, solved problems, spaced repetition cards) syncs to Firestore
- Real-time Updates: Progress updates in real-time across tabs/devices
- Offline Support: Falls back to localStorage when not signed in

## Data Structure

User data is stored in Firestore under `/users/{userId}` with the following structure:
- xp, level, rank (gamification)
- streak, lastActiveDate (daily streaks)
- completedWorlds, completedPatterns, problemStatuses (progress tracking)
- earnedAchievements (unlocked badges)
- srCards, totalReviews (spaced repetition system)
- preferences (theme, sound, animations)
