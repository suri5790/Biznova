# 🔧 TROUBLESHOOTING - Everything Showing ₹0

## 🔍 Quick Diagnosis

If everything is showing ₹0, follow these steps:

### **Step 1: Check Browser Console** 

1. Open your browser (where frontend is running)
2. Press **F12** to open Developer Tools
3. Click on **Console** tab
4. Refresh the page
5. Look for messages:

**✅ Good Messages (Working):**
```
✅ Profit analytics loaded: {revenue: 1500, cogs: 1000, ...}
✅ Profit data loaded: ...
✅ Inventory status loaded: ...
```

**⚠️ Warning Messages (Fallback Active):**
```
⚠️ Profit analytics not available, using basic calculations
⚠️ Profit analytics API not available
ℹ️ Using mock data - Profit analytics API not configured
```

**❌ Error Messages (Need to Fix):**
```
❌ Dashboard fetch error: Network Error
❌ Error fetching profit analytics
Failed to fetch
```

---

## 🚨 Common Issues & Solutions

### **Issue 1: Backend Server Not Running**

**Symptoms:**
- All values show ₹0
- Console shows "Network Error" or "Failed to fetch"
- Red errors in console

**Solution:**
```bash
# Terminal 1: Start backend
cd backend
npm start

# Should see: "Server running on port 5000"
```

**Verify backend is running:**
```bash
curl http://localhost:5000/health
```

Should return: `{"success":true,"message":"BizNova Backend Server is running"}`

---

### **Issue 2: No Data in Database**

**Symptoms:**
- No errors in console
- Everything shows ₹0 or empty
- Console shows "✅ Profit data loaded: {revenue: 0, cogs: 0, ...}"

**Solution:** You need to add data first!

1. **Add Inventory:**
   - Go to Inventory page
   - Click "Add Item"
   - Add at least one item

2. **Create Sale:**
   - Go to Sales page
   - Click "New Sale"
   - Create a sale

3. **Add Expense:**
   - Go to Expenses page
   - Click "Add Expense"
   - Add an expense

4. **Refresh Dashboard**

---

### **Issue 3: Authentication Token Expired**

**Symptoms:**
- Page keeps redirecting to login
- Console shows 401 errors
- Data was showing before, now it's ₹0

**Solution:**
1. Logout (click profile → Sign out)
2. Login again
3. Data should load

---

### **Issue 4: Profit Analytics API Not Set Up**

**Symptoms:**
- Console shows "⚠️ Profit analytics API not available"
- Dashboard shows basic data (Total Sales instead of Net Profit)
- No errors, but limited metrics

**This is OK!** The app will work with basic calculations. To enable full profit analytics:

1. Make sure backend server is running
2. Check backend console for errors
3. Verify routes are registered in `server.js`

---

## 🧪 Step-by-Step Debug

### **Test 1: Check Backend**

```bash
# Check if backend is running
curl http://localhost:5000/health

# Expected: {"success":true,...}
```

If this fails:
- ❌ Backend is not running
- ✅ Start it: `cd backend && npm start`

---

### **Test 2: Check Frontend**

1. Open browser to `http://localhost:3000`
2. Press **F12** for DevTools
3. Go to **Network** tab
4. Refresh page
5. Look for failed requests (red)

Common failed requests:
- `GET /api/sales` - Check backend running
- `GET /api/profit-analytics` - Normal if route not set up yet
- 401 errors - Login again

---

### **Test 3: Check Data Exists**

Open browser console and run:

```javascript
// Check if sales data loaded
console.log('Sales:', window.localStorage.getItem('sales'));

// Check authentication
console.log('Token:', localStorage.getItem('token') ? 'Exists' : 'Missing');
```

If token is missing → Login again

---

### **Test 4: Manual API Test**

After logging in, get your token and test:

```bash
# Get token from browser console:
# console.log(localStorage.getItem('token'))

# Test sales API
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/sales

# Test profit analytics API
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/profit-analytics
```

---

## 💡 Quick Fixes

### **Fix 1: Fresh Start**

```bash
# Stop all servers (Ctrl+C in both terminals)

# Clear browser data
# In browser: Press F12 → Application → Clear storage → Clear site data

# Restart backend
cd backend
npm start

# Restart frontend (new terminal)
cd frontend
npm start

# Login again
# Add fresh data
```

---

### **Fix 2: Check Your Data Flow**

1. **Login** ✅
2. **Add Inventory** (at least 1 item) ✅
3. **Create Sale** (using inventory item) ✅
4. **Check Sales Page** - Should show COGS and Profit ✅
5. **Check Dashboard** - Should show values ✅

---

### **Fix 3: Verify API Responses**

In browser console, check what's being returned:

```javascript
// This will be logged by our updated code
// Look for these messages:

"✅ Profit analytics loaded: {revenue: X, cogs: Y, ...}"
// If you see this → Working!

"⚠️ Profit analytics not available, using basic calculations"
// If you see this → Fallback active (still works, but limited)

"❌ Dashboard fetch error: ..."
// If you see this → Need to fix error shown
```

---

## 📊 Expected Console Output (Working State)

When everything is working, you should see:

```
ℹ️ Dashboard loaded
✅ Profit analytics loaded: {
  revenue: 1500,
  cogs: 1000,
  grossProfit: 500,
  netProfit: 450,
  inventoryValue: 19000,
  ...
}
```

---

## 🎯 Most Likely Issue

**90% of the time it's one of these:**

1. ❌ Backend not running
2. ❌ No data added yet (fresh database)
3. ❌ Need to login again (token expired)

**Quick Test:**
```bash
# Is backend running?
curl http://localhost:5000/health

# If yes, try this:
# 1. Logout
# 2. Login
# 3. Add inventory
# 4. Create sale
# 5. Check dashboard
```

---

## 📞 Still Not Working?

Check these in order:

1. [ ] Backend running? (`npm start` in backend folder)
2. [ ] Frontend running? (`npm start` in frontend folder)
3. [ ] Logged in? (not redirecting to login page)
4. [ ] Data added? (at least 1 inventory + 1 sale)
5. [ ] Console errors? (F12 → Console tab)
6. [ ] Network errors? (F12 → Network tab → look for red)

**Share the console error message and we can help debug!**

---

## 🔧 Emergency Fallback

If profit analytics isn't working but you want to see SOMETHING:

The Dashboard now has **fallback logic**:
- If profit API fails → Shows "Total Sales" instead of "Net Profit"
- Calculates basic totals from raw data
- Still shows inventory value, customers, etc.

So you should see **some values** even if profit API isn't set up yet!

---

## ✅ Success Indicators

You'll know it's working when:

1. Dashboard shows values (not all ₹0)
2. Console shows "✅ Profit analytics loaded"
3. Sales table shows COGS and Profit columns
4. No red errors in console
5. Network tab shows all requests as 200 OK

---

**Open browser console (F12) and tell me what error messages you see!**
