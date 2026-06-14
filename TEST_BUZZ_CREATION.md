# Buzz Creation Test Guide

This guide will help you verify that buzz creation works and shows up on the map for your demo video.

---

## 🎬 Pre-Demo Setup

### 1. Start the Backend (Mock Mode for Testing)
```bash
cd backend
npm start
```

**Expected Output:**
```
📡 [RUMOUR ENGINE] Transmitting on 0.0.0.0:5000 (USE_MOCK=true)
[RUMOUR] Demo buzzes seeded for mock mode
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v... ready in ...ms
➜  Local:   http://localhost:3000/
```

---

## 🧪 Test Scenarios for Demo

### Scenario 1: View Existing Demo Buzzes on Map

1. Open http://localhost:3000
2. Allow location permissions (or use mock location)
3. **You should see on the map:**
   - 🕺 Underground Rave (secret, password-protected)
   - 🎸 Local Indie Gallery
   - 🍸 Rooftop Mixer
   - 🎨 Street Mural Unveiling
   - Multiple distant events in tiers

**If buzzes don't show:**
- Check browser console for errors
- Verify backend is running on port 5000
- Check that `/api/buzzes?lat=0&lng=0` returns data

---

### Scenario 2: Create a New Buzz (Good Content - Should Be Approved)

**Test Data:**
```json
{
  "type": "Party",
  "title": "Demo Rooftop Celebration",
  "zone": "Downtown District",
  "teaser": "Sunset vibes and good music",
  "description": "Join us for a rooftop celebration with live DJ set. Bring your friends!",
  "lat": 0.0001,
  "lng": 0.0001,
  "userLat": 0.0001,
  "userLng": 0.0001,
  "durationHours": 4,
  "isSecret": false
}
```

**Steps:**
1. Click "Create Buzz" button
2. Fill in the form:
   - **Type**: Party
   - **Title**: "Demo Rooftop Celebration"
   - **Zone**: "Downtown District"
   - **Teaser**: "Sunset vibes and good music"
   - **Description**: "Join us for a rooftop celebration with live DJ set"
   - **Duration**: 4 hours
   - Click on map very close to your current location
3. Submit

**Expected Result:**
- ✅ AI Moderation: **APPROVED**
- ✅ Buzz appears immediately on the map
- ✅ Status: "active"
- ✅ Moderation Status: "approved"

---

### Scenario 3: Test AI Moderation (Bad Content - Should Be Blocked)

**Test Case: Hate Speech**
```json
{
  "title": "No foreigners allowed party",
  "teaser": "Locals only event",
  "description": "We don't want any [ethnic slur] here"
}
```

**Expected Result:**
- ❌ AI Moderation: **REJECTED**
- ❌ Error message: "Content violates community guidelines"
- ❌ Categories: ["hate_speech"]
- ❌ Buzz NOT created
- ❌ Does NOT appear on map

---

**Test Case: PII Violation**
```json
{
  "title": "Private Party Tonight",
  "description": "Contact John Smith at 555-1234 or email john@example.com for the address"
}
```

**Expected Result:**
- ❌ AI Moderation: **REJECTED**
- ❌ Error message: Contains personal information
- ❌ Categories: ["pii"]
- ❌ Buzz NOT created

---

**Test Case: Illegal Activity**
```json
{
  "title": "Special Party Supplies",
  "description": "Selling party favors and other stuff at the park. DM for prices"
}
```

**Expected Result:**
- ❌ AI Moderation: **REJECTED** (or flagged for review)
- ❌ Categories: ["illegal_activity"] or ["spam"]
- ❌ May be marked as "pending" for manual review

---

### Scenario 4: Test Secret Buzz with Password

**Test Data:**
```json
{
  "type": "Music",
  "title": "Secret Underground Session",
  "zone": "Industrial Quarter",
  "teaser": "Hidden techno event",
  "description": "Deep underground techno. Password required at door.",
  "lat": 0.0002,
  "lng": 0.0002,
  "userLat": 0.0002,
  "userLng": 0.0002,
  "durationHours": 6,
  "isSecret": true,
  "password": "BasslineKings"
}
```

**Expected Result:**
- ✅ AI Moderation: **APPROVED**
- ✅ Buzz created with secret flag
- ✅ Shows 🔒 icon on map
- ✅ Requires password to view full details

---

### Scenario 5: Test Proximity Gating

**What to Test:**
1. Create a buzz at coordinates (0.001, 0.001)
2. View buzz from far away (0.1, 0.1)
3. **Expected**: Buzz details are blurred
4. Move your location close to the buzz (within 100m)
5. **Expected**: Buzz details become clear

---

## 📊 Moderation Test Matrix

| Test Case | Title | Expected Result | Category |
|-----------|-------|----------------|----------|
| ✅ Good Content | "Art Gallery Opening Tonight" | APPROVED | - |
| ❌ Hate Speech | "No [ethnicity] allowed" | REJECTED | hate_speech |
| ❌ PII | "Call me at 555-1234" | REJECTED | pii |
| ❌ Illegal | "Selling party supplies" | REJECTED/PENDING | illegal_activity |
| ❌ Sexual | "Looking for hookups at this party" | REJECTED | sexual_content |
| ❌ Violence | "Street fight at midnight" | REJECTED | violence |
| ❌ Spam | "Join my crypto team $$$" | REJECTED | spam |
| ⚠️ Borderline | "F*** yeah, awesome show!" | PENDING | profanity (context) |

---

## 🎥 Demo Video Script

### Opening Shot (0:00 - 0:15)
1. Show map with existing buzzes scattered
2. Zoom in to show different event types (Party, Art, Music, Food, Gaming)
3. Click on a buzz to show details modal

### Create Legitimate Buzz (0:15 - 0:45)
1. Click "Create Buzz" button
2. Fill out form with good content:
   - Type: "Art"
   - Title: "Street Art Exhibition"
   - Zone: "Arts District"
   - Teaser: "Live painting session tonight"
   - Duration: 3 hours
3. Click location on map
4. Submit
5. **Show: Buzz immediately appears on map** ✅

### Test AI Moderation - Block Bad Content (0:45 - 1:15)
1. Click "Create Buzz" again
2. Fill with inappropriate content:
   - Title: "Party Tonight"
   - Description: "Contact me at 555-1234 for details"
3. Submit
4. **Show: Error message appears** ❌
5. **Show: "Content violates guidelines: Personal information"**
6. **Show: Buzz NOT on map**

### Test Secret Buzz (1:15 - 1:45)
1. Create secret buzz with password
2. Show 🔒 icon on map
3. Click buzz → password prompt appears
4. Enter wrong password → denied
5. Enter correct password → details revealed

### Test Proximity Gating (1:45 - 2:15)
1. Click distant buzz on map
2. **Show: Blurred content** with "Get within 100m to unlock"
3. Simulate moving closer (or adjust coordinates)
4. **Show: Content becomes clear** ✅

### Voting & Flagging (2:15 - 2:45)
1. Upvote a buzz → counter increases
2. Downvote → counter decreases
3. Flag inappropriate buzz
4. **Show: "Flagged successfully"**
5. **After 3 flags → buzz auto-removed**

### Closing (2:45 - 3:00)
1. Zoom out to show full map with all active buzzes
2. Show 4-hour expiry timer countdown
3. Fade to "Rumour - Hyper-local Ephemeral Discovery"

---

## 🐛 Troubleshooting

### Buzzes Not Appearing on Map

**Check 1: Backend Response**
```bash
curl "http://localhost:5000/api/buzzes?lat=0&lng=0"
```
Should return JSON with buzzes array.

**Check 2: Frontend API Call**
Open browser DevTools → Network tab
Look for `/api/buzzes` request
Verify response contains buzzes.

**Check 3: Console Errors**
Browser Console → Check for JavaScript errors
Common issues:
- CORS errors → backend not running
- 404 errors → wrong API endpoint
- Auth errors → user not logged in

---

### AI Moderation Not Working

**Check 1: Environment Variable**
```bash
echo $GOOGLE_AI_API_KEY
```
Should show your API key.

**Check 2: Backend Logs**
Look for:
```
[RUMOUR] Moderation result { approved: true, durationMs: 234, attempt: 1 }
```

**If GOOGLE_AI_API_KEY is missing:**
- Content will be marked "pending" for manual review
- Buzz will still be created but with status "pending"

---

### Location Issues

**If browser won't share location:**
1. Use DevTools → Sensors → Override geolocation
2. Set custom coordinates (e.g., 0.0001, 0.0001)
3. Refresh page

**If proximity check fails:**
- Make sure userLat/userLng are within 50m of buzz lat/lng
- For testing, use identical coordinates

---

## ✅ Demo Checklist

Before recording your demo video:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Demo buzzes seeded and visible on map
- [ ] Can create new buzz successfully
- [ ] AI moderation blocks bad content
- [ ] Secret buzzes show password prompt
- [ ] Proximity gating blurs distant content
- [ ] Voting system works (up/down votes)
- [ ] Flagging system works (3 flags = remove)
- [ ] Browser location permissions granted
- [ ] No console errors
- [ ] Map loads and displays correctly

---

## 📝 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Get Buzzes
```bash
curl "http://localhost:5000/api/buzzes?lat=0&lng=0"
```

### Test Create Buzz (requires auth token)
```bash
curl -X POST http://localhost:5000/api/buzzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "Party",
    "title": "Test Event",
    "zone": "Test Zone",
    "teaser": "Test teaser",
    "lat": 0.0001,
    "lng": 0.0001,
    "userLat": 0.0001,
    "userLng": 0.0001,
    "durationHours": 2
  }'
```

---

## 🎯 Success Criteria

Your demo is ready when:

1. ✅ Map loads with multiple buzzes visible
2. ✅ Can create new buzz → appears immediately on map
3. ✅ AI moderation blocks inappropriate content
4. ✅ Secret buzzes require passwords
5. ✅ Proximity gating works (blur/unblur based on distance)
6. ✅ Voting and flagging functional
7. ✅ No errors in browser console
8. ✅ Smooth, responsive UI

---

**Good luck with your demo! 🚀**

If you encounter any issues, check the troubleshooting section or review the backend logs for specific error messages.
