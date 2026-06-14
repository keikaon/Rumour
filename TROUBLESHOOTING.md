# 🔧 Troubleshooting Guide - "Failed to Create Buzz"

**Error**: "Failed to create buzz" or buzz creation not working

---

## 🎯 Quick Fixes (Try These First)

### Fix #1: Restart Backend
```bash
# Stop backend (Ctrl+C)
cd backend
npm start
```

### Fix #2: Check Backend Logs
Look for error messages like:
- `[RUMOUR] Create buzz error:`
- `[RUMOUR] Moderation failed:`
- `ValidationError:`

### Fix #3: Check If You're Signed In
- Make sure you're logged into Firebase
- Check browser console for auth errors
- Try signing out and back in

---

## 🔍 Detailed Diagnostics

### Step 1: Check Backend is Running

**Terminal should show**:
```
📡 [RUMOUR ENGINE] Transmitting on 0.0.0.0:5000 (USE_MOCK=true)
[RUMOUR] Demo buzzes seeded for mock mode
```

**If not**:
```bash
cd backend
npm start
```

### Step 2: Test Backend API

**Run this command**:
```bash
curl http://localhost:5000/api/health
```

**Expected response**:
```json
{
  "status": "Rumour Backend is alive.",
  "dataSource": "mock",
  "useMock": true
}
```

**If you get an error**: Backend is not running. Restart it.

### Step 3: Check Browser Console

**Open**: Browser DevTools (F12) → Console tab

**Look for errors like**:
- `❌ POST http://localhost:5000/api/buzzes 400` → Validation error
- `❌ POST http://localhost:5000/api/buzzes 500` → Server error
- `❌ Network Error` → Backend not running

### Step 4: Check Network Tab

**Open**: Browser DevTools (F12) → Network tab

**Click "Start Signal" and submit**:
1. Look for `POST /api/buzzes` request
2. Click on it
3. Check **Response** tab for error message
4. Check **Payload** tab to see what was sent

---

## 🐛 Common Errors & Solutions

### Error: "You must be within 50m of the signal location"

**Cause**: Location coordinates don't match

**Fix**: The frontend should use the same coordinates for both:
- `lat` and `userLat`
- `lng` and `userLng`

**Check** `frontend/src/features/createBuzz/useCreateBuzz.js` line 30-35:
```javascript
lat: location.lat,
lng: location.lng,
userLat: location.lat,  // Should match lat
userLng: location.lng,   // Should match lng
```

### Error: "Title is required"

**Cause**: Empty title field

**Fix**: Make sure you fill in the title before submitting

### Error: "Invalid vote type" or "Type must be one of..."

**Cause**: Invalid event type

**Fix**: Select a valid type: Party, Art, Music, Gaming, or Food

### Error: "Content violates community guidelines"

**Cause**: AI moderation blocked content

**Examples**:
- PII (phone numbers, emails)
- Inappropriate language
- Spam patterns

**Fix**: Remove inappropriate content and try again

### Error: "Moderation service unavailable"

**Cause**: Google AI API key not set or invalid

**Impact**: Buzz will be created but marked as "pending"

**Fix** (optional):
```bash
# Add to backend/.env
GOOGLE_AI_API_KEY=your_actual_key_here
```

**Note**: You can demo without AI moderation. Buzzes will be created anyway.

### Error: "Failed to create signal" (generic)

**Cause**: Unknown error

**Steps**:
1. Check backend terminal for detailed error
2. Look for `[RUMOUR] Create buzz error:` with full stack trace
3. Check if `mockUserBuzzes` array is defined
4. Restart backend

---

## 🧪 Manual Testing

### Test 1: Backend Direct API Call

**You need an auth token first**. Get it from browser:
1. Sign in on http://localhost:3000
2. Open DevTools → Application → Local Storage
3. Find Firebase auth token

**Then test**:
```bash
curl -X POST http://localhost:5000/api/buzzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "Party",
    "title": "Test Event",
    "teaser": "Test teaser",
    "description": "Test description",
    "lat": 0.0001,
    "lng": 0.0001,
    "userLat": 0.0001,
    "userLng": 0.0001,
    "durationHours": 2
  }'
```

**Expected**: 201 Created with buzz object

### Test 2: Check If Buzz Appears

```bash
curl "http://localhost:5000/api/buzzes?lat=0&lng=0"
```

**Look for**: Your test buzz in the response

---

## 📋 Debug Checklist

Go through this list:

- [ ] Backend is running (`npm start` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] You are signed in (check top right of page)
- [ ] Browser console shows no auth errors
- [ ] Network tab shows POST request to `/api/buzzes`
- [ ] Response status is 201 or shows specific error
- [ ] Backend terminal shows create buzz logs
- [ ] Location permissions granted in browser

---

## 🔬 Advanced Debugging

### Enable Detailed Logging

**Backend** - Already enabled in latest version:
- Logs request body
- Logs error stack
- Logs each step of buzz creation

**Frontend** - Add console logs:

Edit `frontend/src/features/createBuzz/useCreateBuzz.js`:
```javascript
const submit = useCallback(async () => {
  console.log('🔵 Submitting buzz:', form);
  console.log('🔵 Location:', location);
  
  if (!location) {
    setError('Location required. Enable GPS to start a signal.');
    return false;
  }

  setSubmitting(true);
  setError('');

  try {
    const payload = {
      ...form,
      lat: location.lat,
      lng: location.lng,
      userLat: location.lat,
      userLng: location.lng,
      password: form.isSecret ? form.password : null,
    };
    
    console.log('🔵 Payload:', payload);
    const result = await postCreateBuzz(payload);
    console.log('✅ Success:', result);
    
    resetForm();
    onSuccess?.();
    return true;
  } catch (err) {
    console.error('❌ Error:', err);
    setError(err.moderationReason || err.message || 'Failed to publish signal.');
    return false;
  } finally {
    setSubmitting(false);
  }
}, [form, location, onSuccess, resetForm]);
```

### Check Mock Mode

**Verify** backend/.env has:
```env
USE_MOCK=true
```

**Or check backend logs** for:
```
[RUMOUR ENGINE] Transmitting on 0.0.0.0:5000 (USE_MOCK=true)
```

### Verify mockUserBuzzes Array

The backend should maintain an in-memory array of user-created buzzes.

**Check** if it's defined in `backend/src/services/buzzService.js`:
```javascript
let mockUserBuzzes = [];
let mockIdCounter = 1000;
```

---

## 🆘 Still Not Working?

### Try Fresh Install

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm start

# Frontend
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run dev
```

### Check File Syntax

```bash
cd backend
node -c src/services/buzzService.js
node -c src/routes/buzzes.js
node -c src/index.js
```

**All should return**: No output (means success)

### Nuclear Option: Reset Everything

```bash
# Kill all Node processes
# Windows:
taskkill /F /IM node.exe

# Mac/Linux:
killall node

# Clear npm cache
npm cache clean --force

# Reinstall everything
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install

# Restart
cd backend && npm start
cd frontend && npm run dev
```

---

## 📞 Getting Help

If still stuck, provide this information:

1. **Backend logs** (the error stack trace)
2. **Browser console errors** (screenshot)
3. **Network tab** (the POST request/response)
4. **What you tried** from this guide
5. **Operating system**
6. **Node version** (`node --version`)

---

## ✅ Success Indicators

**You know it's working when**:
1. Backend shows: `[RUMOUR] Creating buzz: { type: '...', title: '...', userId: '...' }`
2. Backend shows: `[RUMOUR] Buzz created successfully: mock-XXXX`
3. Frontend shows no errors in console
4. Buzz appears on map immediately
5. Network tab shows 201 Created

---

**Most common fix**: Restart the backend! 🔄

*This guide covers 95% of "failed to create buzz" issues*
