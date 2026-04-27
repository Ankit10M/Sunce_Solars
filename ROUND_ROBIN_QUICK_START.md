# Round-Robin Ticket Assignment - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Verify Deployment
All code changes are in place and ready. No additional setup needed.

### Step 2: Create Sales Accounts (if not exists)
Ensure you have 2+ active sales accounts:
```
Admin Panel → User Management → Create User
Role: Sales
isActive: true
```

### Step 3: Migrate Existing Tickets (if upgrading)
If you had tickets BEFORE implementing this feature:

```bash
cd backend
npm install  # if new dependencies needed
node scripts/migrateTicketsRoundRobin.js
```

Expected output:
```
✓ Connected to MongoDB
✓ Found 3 active sales users
  1. Sales A (salesA@company.com)
  2. Sales B (salesB@company.com)
  3. Sales C (salesC@company.com)

✓ Found 15 tickets to migrate

✓ Migration completed!
  - Updated: 15 tickets
  - Distribution pattern: Every ticket assigned in round-robin order

Example distribution:
  Ticket 1 → Sales A
  Ticket 2 → Sales B
  Ticket 3 → Sales C
  ...
```

## 📋 Verify It's Working

### Test 1: Check New Tickets Are Assigned
1. Login as any user who can create tickets
2. Create a new ticket
3. Check the ticket response - it should have `assignedSalesBy` populated
4. Database check: `db.tickets.find().limit(1)` should show `assignedSalesBy`

### Test 2: Check Sales Dashboard Filtering  
1. Login as Sales A
2. Go to Sales Dashboard
3. You should see ONLY tickets assigned to Sales A
4. Count should match: total tickets / number of sales accounts (approximately)

### Test 3: Verify Round-Robin Distribution
1. Create 6 sales accounts: Sales-1, Sales-2, ..., Sales-6
2. Create 12 new tickets (through API or UI)
3. Check distribution:
   ```bash
   # Each sales account should have ~2 tickets
   db.tickets.aggregate([
     { $group: { _id: "$assignedSalesBy", count: { $sum: 1 } } },
     { $sort: { count: -1 } }
   ])
   ```
   **Expected:** Each sales person with 2 tickets (12 ÷ 6 = 2)

---

## 🔧 Common Operations

### Check Current Assignment Distribution
```bash
# Connect to MongoDB
mongo

# Switch to your database
use erp-system

# Show distribution
db.tickets.aggregate([
  { 
    $group: { 
      _id: { sales: "$assignedSalesBy", name: "$assignedSalesBy" }, 
      count: { $sum: 1 } 
    } 
  },
  { $sort: { count: -1 } },
  {
    $lookup: {
      from: "users",
      localField: "_id.sales",
      foreignField: "_id",
      as: "salesInfo"
    }
  },
  {
    $project: {
      salesName: { $arrayElemAt: ["$salesInfo.name", 0] },
      ticketCount: "$count",
      _id: 0
    }
  }
])
```

### Reassign Specific Ticket (Admin Only)
**Note:** This breaks round-robin, use only if necessary

```bash
# Via API - PATCH /tickets/{ticketId}
# Contact system admin for manual reassignment

# Manual MongoDB (not recommended)
db.tickets.updateOne(
  { _id: ObjectId("...") },
  { $set: { assignedSalesBy: ObjectId("sales-user-id") } }
)
```

### Add New Sales Account
1. Create new user with `role: 'sales'` and `isActive: true`
2. Next ticket created will include this user in round-robin
3. Existing tickets assigned to old users (distribution remains stable)

---

## ✅ Checklist Before Going Live

- [ ] All code deployed to production
- [ ] Migration script run (if upgrading)
- [ ] At least 2 active sales accounts created
- [ ] Test 1 passed (new tickets assigned)
- [ ] Test 2 passed (sales dashboard filters)
- [ ] Test 3 passed (round-robin distribution)
- [ ] Admins informed about new workflow
- [ ] Documentation shared with team

---

## 📞 Troubleshooting

### Problem: Sales user sees all tickets
**Solution:**
1. Verify migration was run: `node scripts/migrateTicketsRoundRobin.js`
2. Check backend logs for errors
3. Restart backend server: `npm start`
4. Clear browser cache
5. Try fresh login

### Problem: Getting "No active sales users found"
**Solutions:**
1. Create at least one sales user account
2. Verify `isActive: true` in database
3. Check user's `role: 'sales'`
   ```bash
   db.users.find({ role: 'sales', isActive: true })
   ```

### Problem: Same person getting all new tickets
**Solution:**
- Only happens if you have 1 sales user
- Create more sales accounts to distribute load
- Tickets automatically include new users in next cycle

---

## 📊 Monitoring Dashboard Queries

### Tickets per Sales Person
```bash
db.tickets.aggregate([
  { $group: { _id: "$assignedSalesBy", count: { $sum: 1 } } }
])
```

### Workload Balance Score
```bash
db.tickets.aggregate([
  { $group: { _id: "$assignedSalesBy", count: { $sum: 1 } } },
  { $group: { _id: null, avg: { $avg: "$count" }, max: { $max: "$count" }, min: { $min: "$count" } } }
])
# Good balance: max - min ≤ 1
```

### Recent Assignment Pattern
```bash
db.tickets.find()
  .sort({ createdAt: -1 })
  .limit(30)
  .project({ ticketId: 1, assignedSalesBy: 1, createdAt: 1 })
```

---

## 🎓 How It Works in Simple Terms

### Before
```
Customer creates ticket → Broadcast to ALL sales users
Result: Confusion, duplicate work, all sales people do same tasks
```

### After  
```
Customer creates ticket → Assigned to Sales Person A
Ticket #2 → Sales Person B
Ticket #3 → Sales Person C
Ticket #4 → Sales Person A (cycle repeats)
Result: Each sales person knows their tickets, balanced workload
```

---

## 💡 Tips

1. **For Small Teams:** Works with 1+ sales users
2. **For Large Teams:** Excellent with 5+ sales users
3. **Peak Hours:** System handles rapid ticket creation well
4. **Integration:** Existing APIs fully compatible
5. **Audit Trail:** All assignments logged in ServiceLog

---

**Need Help?** See `ROUND_ROBIN_SETUP_GUIDE.md` for detailed documentation
