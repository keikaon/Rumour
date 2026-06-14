# 🎬 Rumour-App Demo Setup Guide

**Version**: 1.0.0-rc1  
**Date**: 2026-06-14  
**Status**: ✅ Production-Ready, Demo-Ready

This guide will help you set up and run a flawless demo of all Rumour features.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x installed
- npm or yarn package manager
- Two terminal windows
- Modern web browser (Chrome, Firefox, Edge, Safari)

### 1. Install Dependencies

```bash
# Terminal 1 - Backend
cd backend
npm install

# Terminal 2 - Frontend  
cd frontend
npm install
```

### 2. Environment Setup

#### Backend `.env` (Optional for Demo)
```bash
cd backend
cp .env.example .env
```

**Demo Mode Settings** (recommended for demonstration):
```env
# Demo Mode - No Firestore required!
USE_MOCK=true

# Optional: AI Moderation (shows moderation in action)
GOOGLE_AI_API_KEY=your_key_here

# Optional: Port configuration
PORT=5000
HOST=0.0.0.0
```

#### Frontend `.env`
```bash
cd frontend
cp .env.example .env
```

**Required** (for Firebase Auth):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 3. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

**Expected Output**:
```
📡 [RUMOUR ENGINE] Transmitting on 0.0.0.0:5000 (USE_MOCK=true)
[RUMOUR] Demo buzzes seeded for mock mode
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Expected Output**:
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 4. Open Browser
Navigate to: **http://localhost:3000**

---

## 🎯 Demo Features Checklist

### ✅ Authentication
- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Sign out

### ✅ Map Visualization
- [ ] Map loads with demo buzzes
- [ ] Buzzes displayed at different distances
- [ ] Click to zoom/pan map
- [ ] User location marker visible

### ✅ Buzz Creation
- [ ] Click "Start Signal" button
- [ ] Fill out form (all fields)
- [ ] Submit buzz
- [ ] **Buzz appears on map immediately** ✅

### ✅ AI Moderation (if GOOGLE_AI_API_KEY set)
- [ ] Create buzz with good content → Approved
- [ ] Try bad content → Blocked with error message
- [ ] Show moderation categories

### ✅ Buzz Interaction
- [ ] Click buzz to view details
- [ ] Upvote buzz → Counter increases
- [ ] Downvote buzz → Counter decreases
- [ ] Switch vote → Counter updates
- [ ] Remove vote → Counter returns

### ✅ Flagging System
- [ ] Flag/Report a buzz
- [ ] See flag count increase
- [ ] Flag same buzz 3 times → Auto-removed

### ✅ Delete Own Buzzes
- [ ] View your created buzzes
- [ ] Delete your own buzz → Success
- [ ] Try to delete others' buzz → Not allowed

### ✅ Secret Buzzes
- [ ] Click secret buzz (🔒 icon)
- [ ] Enter wrong password → Access denied
- [ ] Enter correct password → Content revealed
- [ ] Password: "Fidelio!" for demo buzz #6

### ✅ Proximity Gating
- [ ] Click distant buzz
- [ ] Content is blurred
- [ ] Message: "Get within 100m to unlock"

---

## 🎥 3-Minute Demo Script

### **Intro (0:00 - 0:15)**
"Welcome to Rumour, a hyper-local discovery platform for ephemeral events. Let me show you the key features."

**Actions**:
- Show map with buzzes
- Point out different event types (Party 🎉, Art 🎨, Music 🎸)

---

### **Feature 1: Create Buzz (0:15 - 0:45)**
"First, let's create a new event signal."

**Actions**:
1. Click "Start Signal" button
2. Fill form:
   - Type: **Art**
   - Title: **"Live Street Performance"**
   - Teaser: **"Amazing breakdance crew downtown"**
   - Description: **"Join us for an incredible street performance"**
   - Duration: **2 hours**
3. Click "Transmit"
4. **Point out**: Buzz appears on map instantly! ✅

**Script**: "Notice how the buzz appears immediately on the map after creation."

---

### **Feature 2: AI Moderation (0:45 - 1:10)**
"Rumour uses AI to keep the community safe."

**Actions**:
1. Click "Start Signal" again
2. Fill with inappropriate content:
   - Title: **"Contact Me"**
   - Description: **"Call me at 555-1234 for details"**
3. Click "Transmit"
4. **Show error**: "Content violates guidelines: Personal information"

**Script**: "The AI detected personal information and blocked the post automatically."

---

### **Feature 3: Voting System (1:10 - 1:35)**
"Community can upvote or downvote events."

**Actions**:
1. Click any buzz on map
2. Click upvote 👍 → Counter increases
3. Click downvote 👎 → Counter changes
4. Click again → Vote removed

**Script**: "Voting helps surface the best events. You can switch or remove your vote anytime."

---

### **Feature 4: Flagging & Auto-Removal (1:35 - 2:00)**
"Inappropriate content can be flagged for removal."

**Actions**:
1. Click a buzz
2. Click "Report" button
3. Success message appears
4. **Demonstrate**: "After 3 flags, content is auto-removed"

**Script**: "Community moderation with a 3-flag auto-removal protocol keeps things clean."

---

### **Feature 5: Secret Buzzes (2:00 - 2:25)**
"Some events are password-protected."

**Actions**:
1. Click buzz with 🔒 icon (Underground Rave)
2. Password prompt appears
3. Enter wrong password → Denied
4. Enter "Fidelio!" → Content unlocked

**Script**: "Secret events require a password, perfect for exclusive gatherings."

---

### **Feature 6: Delete Own Buzzes (2:25 - 2:45)**
"Users can manage their own posts."

**Actions**:
1. Click one of your created buzzes
2. Click "Delete" button
3. Confirm deletion
4. Buzz disappears from map

**Script**: "You have full control over your own content."

---

### **Closing (2:45 - 3:00)**
"Rumour combines real-time location data, AI moderation, and community features for hyper-local event discovery. All events auto-expire after 4 hours."

**Actions**:
- Zoom out to show full map
- Show timer countdown
- Fade to logo

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `FIREBASE_PROJECT_ID not set`  
**Fix**: Set `USE_MOCK=true` in backend/.env

**Error**: `Port 5000 already in use`  
**Fix**: Change PORT in .env or kill existing process
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**Error**: `Missing Firebase environment variables`  
**Fix**: Check frontend/.env has all VITE_FIREBASE_* variables

**Error**: `Network error` when creating buzz  
**Fix**: Verify backend is running on http://localhost:5000

**Error**: Buzzes don't appear  
**Fix**: Check browser console, verify /api/buzzes returns data
```bash
curl http://localhost:5000/api/buzzes?lat=0&lng=0
```

### Voting/Flagging Errors

**Error**: `404 NOT_FOUND` when voting  
**Fix**: This is now fixed! Restart backend if still occurring.

**Error**: `Rate limit exceeded`  
**Fix**: Wait 1 minute or restart backend to reset token bucket

### Authentication Issues

**Error**: Can't sign in  
**Fix**: Verify Firebase credentials are correct in frontend/.env

**Error**: `You must be signed in`  
**Fix**: Sign in before creating buzzes or voting

---

## 📊 Demo Data

### Pre-Loaded Buzzes

| ID | Type | Title | Distance | Special |
|----|------|-------|----------|---------|
| 1 | Party | Faraway Festival | ~7.5km | - |
| 2 | Party | Distant Rave | ~4km | - |
| 3 | Art | Street Mural Unveiling | ~1.7km | - |
| 4 | Party | Rooftop Mixer | ~600m | - |
| 5 | Music | Local Indie Gallery | ~100m | Verified ✓ |
| 6 | Party | Underground Rave | ~80m | Secret 🔒 (pw: "Fidelio!") |

### Mock User Buzzes
Any buzzes you create will be added to `mockUserBuzzes` array and displayed on the map.

---

## 🎮 Interactive Features

### Proximity Tiers
- **Tier 1** (0-100m): Full details visible
- **Tier 2** (100m-500m): Some details visible
- **Tier 3** (500m-2km): Teaser only
- **Tier 4** (2km-5km): Title only
- **Tier 5** (5km+): Location pin only

### Auto-Expiry
All buzzes expire after duration (default 4 hours). Timer shows remaining time.

### Vote Impact
- Upvotes boost event visibility
- Downvotes reduce prominence
- Net score affects ranking

### Flag Threshold
- 1 flag: Warning
- 2 flags: Review
- 3 flags: **Auto-removed**

---

## 🔧 Advanced Configuration

### Enable Firestore Mode

1. Set up Firebase project
2. Create service account JSON
3. Update backend/.env:
```env
USE_MOCK=false
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

4. Restart backend

### Enable AI Moderation

1. Get Google AI API key (Gemini 2.0 Flash)
2. Add to backend/.env:
```env
GOOGLE_AI_API_KEY=your_api_key_here
```

3. Restart backend
4. AI will now review all buzz submissions

### Adjust Rate Limits

In backend/.env:
```env
VOTE_MAX_TOKENS=120  # Default: 60 actions per minute
MODERATION_RETRIES=3  # Default: 2 retry attempts
MODERATION_TIMEOUT_MS=10000  # Default: 8000ms
```

---

## 📝 Testing Checklist

Before demo:
- [ ] Backend running without errors
- [ ] Frontend running on port 3000
- [ ] Can sign in/sign up
- [ ] Map loads with demo buzzes
- [ ] Create buzz appears on map
- [ ] Voting works (no 404 errors)
- [ ] Flagging works
- [ ] Delete own buzz works
- [ ] Secret buzz unlocks with password
- [ ] No console errors
- [ ] Network tab shows successful API calls

---

## 🎯 Success Criteria

✅ **Demo is ready when**:
1. Map displays 6+ demo buzzes
2. Created buzz appears instantly
3. Voting changes counters
4. Flagging submits successfully
5. Delete removes own buzzes only
6. Secret buzz requires password
7. No errors in browser console
8. All API calls return 200/201

---

## 📚 Quick Reference

### API Endpoints
```bash
# Health check
GET http://localhost:5000/api/health

# Get all buzzes
GET http://localhost:5000/api/buzzes?lat=0&lng=0

# Create buzz (requires auth)
POST http://localhost:5000/api/buzzes

# Vote (requires auth)
POST http://localhost:5000/api/buzzes/:id/vote

# Flag (requires auth)
POST http://localhost:5000/api/buzzes/:id/flag

# Delete (requires auth, owner only)
DELETE http://localhost:5000/api/buzzes/:id
```

### Test Credentials
Create your own during demo or use test account:
- Email: demo@rumour.app
- Password: Demo123!

### Keyboard Shortcuts
- **Tab**: Navigate form fields
- **Enter**: Submit forms
- **Esc**: Close modals
- **Ctrl/Cmd + R**: Reload buzzes

---

## 🎉 You're Ready!

Everything is set up for a perfect demo. Follow the 3-minute script above for a comprehensive walkthrough of all features.

**Good luck with your demo! 🚀**

---

*For technical details, see `BUG_FIXES_SUMMARY.md`*  
*For testing scenarios, see `TEST_BUZZ_CREATION.md`*  
*For issues, check the Troubleshooting section above*
