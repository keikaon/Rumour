# 🗑️ How to Delete Your Own Buzz

## Where is the Delete Button?

The **Delete button** appears in the buzz detail modal, **only if you are the creator** of that buzz.

### Location
When you click on a buzz marker on the map that **you created**:
1. The buzz detail modal opens
2. At the bottom, you'll see two main buttons:
   - **Close** (left)
   - **Delete** (right, red background) ← **This is your delete button**

### What Happens When You're NOT the Owner
If you click on someone else's buzz, you'll see:
- **Close** (left)
- **I'm Here** (right, light background) ← Check-in button for other people's events

---

## How It Works

### Ownership Check
The delete button only shows when:
```javascript
auth.currentUser.uid === selectedBuzz.creatorId
```

This means:
- You must be **logged in**
- The buzz's `creatorId` must match **your Firebase user ID**

### Delete Process
1. Click the red **Delete** button
2. Confirm the deletion (browser confirmation dialog)
3. The buzz is:
   - Removed from the database (or mock data store)
   - Removed from the map instantly
   - Modal closes automatically

### Visual Styling
- **Color**: Red background (`bg-red-500`)
- **Hover**: Darker red (`hover:bg-red-600`)
- **Text**: White, uppercase, bold
- **Size**: Same as other action buttons

---

## Technical Details

### API Endpoint
```
DELETE /api/buzzes/:id
Authorization: Bearer <Firebase ID Token>
```

### Backend Logic
- Checks if the authenticated user's `uid` matches the buzz's `creatorId`
- Returns `403 Unauthorized` if you don't own the buzz
- Returns `404 Not Found` if buzz doesn't exist
- Returns `200 Success` if deletion succeeds

### Frontend Code Location
- **File**: `frontend/src/components/MapContainer.jsx`
- **Delete Function**: Lines ~635-648
- **Delete Button UI**: Lines ~1082-1116

---

## Demo Mode vs Production

### Mock Mode (`USE_MOCK=true`)
- Deletes from in-memory `mockDatabase`
- Buzz is removed from the map instantly
- Works for testing without Firestore

### Production Mode (`USE_MOCK=false`)
- Deletes from Firestore `buzzes` collection
- Permanent deletion
- Requires Firebase Admin SDK and proper authentication

---

## Troubleshooting

### "I don't see the Delete button"
**Possible reasons:**
1. **You're not logged in** - The button requires authentication
2. **You didn't create this buzz** - Only the creator can delete
3. **The buzz doesn't have a `creatorId`** - Old mock data might be missing this field
4. **You're viewing someone else's event** - You'll see "I'm Here" instead

### "Delete failed" error
**Possible reasons:**
1. **Authentication expired** - Try logging out and back in
2. **Backend is down** - Check that the backend server is running
3. **Firestore permissions** - In production mode, check Firebase rules
4. **Network error** - Check browser console for details

### Testing the Delete Button
1. **Create a buzz** using the "Start a Rumour" feature
2. **Wait for it to appear** on the map
3. **Click the marker** you just created
4. **You should see** the red Delete button (not "I'm Here")
5. **Click Delete** and confirm

---

## Mobile App

The mobile app (`mobile/src/components/BuzzDetailModal.jsx`) would need similar implementation. Currently, this delete feature is **web-only**.

To add it to mobile:
1. Add `deleteBuzz` API function to mobile fetch utilities
2. Update `BuzzDetailModal.jsx` to show delete button conditionally
3. Match the ownership check: `auth.currentUser.uid === buzz.creatorId`
