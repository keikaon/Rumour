# 🚀 START HERE - Rumour-App Quick Launch

**⚡ Get your demo running in 2 minutes!**

---

## ✅ Prerequisites Check

Do you have these installed?
- [ ] Node.js (v18 or v20)
- [ ] npm or yarn
- [ ] A web browser

**If yes, continue! If no, install Node.js first.**

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies (1 minute)

```bash
# Open terminal and run:
cd backend
npm install

cd ../frontend  
npm install
```

### Step 2: Start Backend (15 seconds)

```bash
# In terminal window 1:
cd backend
npm start
```

**✅ You should see**: `📡 [RUMOUR ENGINE] Transmitting on 0.0.0.0:5000 (USE_MOCK=true)`

### Step 3: Start Frontend (15 seconds)

```bash
# In terminal window 2:
cd frontend
npm run dev
```

**✅ You should see**: `➜  Local:   http://localhost:3000/`

---

## 🎉 Open Browser

Go to: **http://localhost:3000**

You should see:
- Login screen
- Map with demo buzzes after logging in

---

## 🐛 Quick Troubleshooting

### Error: "Port 5000 already in use"
```bash
# Kill the process:
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Error: "Missing Firebase env variables"
**Fix**: Create `frontend/.env` with:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
```

### Buzzes don't show on map
**Fix**: Check backend is running. Restart both servers.

---

## 📚 What's Next?

### For Demo Video
→ Read `DEMO_SETUP.md` (3-minute script included)

### For Testing
→ Read `TEST_BUZZ_CREATION.md` (all test scenarios)

### For Details
→ Read `FINAL_SUMMARY.md` (complete overview)

---

## 🎮 Try These Features

1. **Sign up** with any email/password
2. **Click "Start Signal"** to create a buzz
3. **Click any buzz on map** to view details
4. **Upvote/downvote** a buzz
5. **Flag a buzz** (report button)
6. **Delete your own buzz** (if you created it)
7. **Try secret buzz #6** with password "Fidelio!"

---

## ✅ Success Checklist

Your demo is working if:
- [ ] Map loads with 6 demo buzzes
- [ ] You can create a buzz
- [ ] Created buzz appears on map
- [ ] Voting works (counter changes)
- [ ] No errors in browser console

---

## 🆘 Still Having Issues?

1. **Read `TROUBLESHOOTING.md`** → Comprehensive debug guide
2. Check `DEMO_SETUP.md` → Troubleshooting section
3. Make sure both terminals are running
4. Check browser console for errors
5. Restart both backend and frontend
6. Check backend logs for detailed error messages

---

**🎉 You're all set! Enjoy your demo!**

*Time to complete: 2 minutes*  
*Difficulty: Easy*  
*Demo-ready: Yes!*
