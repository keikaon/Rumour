#!/bin/bash

# Test Buzz Creation Script
# This script tests if the backend can create buzzes successfully

echo "🧪 Testing Rumour Backend..."
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
HEALTH=$(curl -s http://localhost:5000/api/health)
echo "Response: $HEALTH"
echo ""

# Test 2: Get Buzzes
echo "2️⃣ Testing Get Buzzes..."
BUZZES=$(curl -s "http://localhost:5000/api/buzzes?lat=0&lng=0")
echo "Response (first 200 chars): ${BUZZES:0:200}..."
echo ""

# Test 3: Count buzzes
BUZZ_COUNT=$(echo $BUZZES | grep -o '"id"' | wc -l)
echo "✅ Found $BUZZ_COUNT buzzes"
echo ""

echo "📝 Next Steps:"
echo "1. Make sure backend is running: cd backend && npm start"
echo "2. Make sure frontend is running: cd frontend && npm run dev"
echo "3. Check browser console for detailed errors"
echo "4. Check backend terminal for error logs"
echo ""
echo "If you see errors, check:"
echo "- Backend logs for 'Create buzz error'"
echo "- Frontend console for network errors"
echo "- Make sure you're signed in before creating a buzz"
