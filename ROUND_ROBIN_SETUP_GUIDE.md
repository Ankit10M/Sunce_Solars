# Round-Robin Ticket Assignment System

## Overview

The Round-Robin Ticket Assignment system automatically distributes incoming tickets equally among all active sales accounts. This ensures fair distribution of workload and prevents one sales person from handling all tickets.

## How It Works

### Distribution Pattern

When a new ticket is created, it's assigned to the next sales person in a round-robin sequence:

```
Ticket 1 → Sales A  
Ticket 2 → Sales B  
Ticket 3 → Sales C  
Ticket 4 → Sales A (cycle continues)
Ticket 5 → Sales B  
Ticket 6 → Sales C
...
```

**Example with 10 sales accounts and 11 tickets:**
- Each sales account gets 1 ticket initially (11 ÷ 10 = 1 with 1 remainder)
- The first sales account gets the extra remaining ticket
- Sales A: 2 tickets, Sales B-J: 1 ticket each ✓

### Key Features

1. **Automatic Assignment**: Tickets are automatically assigned when created
2. **Equal Distribution**: Each sales person gets approximately the same number of tickets
3. **Consistent Ordering**: Sales users are ordered by creation date for consistency
4. **No Manual Intervention**: Unlike engineer assignment, ticket-to-sales assignment is automatic

## Database Changes

### New Field: `assignedSalesBy`

Added to the Ticket model:
```javascript
assignedSalesBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // Every new ticket must have a sales owner
}
```

### New Index

```javascript
ticketSchema.index({ assignedSalesBy: 1, status: 1 })
```

## Implementation Details

### File Changes

1. **Backend Models**
   - `backend/src/models/Ticket.js` - Added `assignedSalesBy` field and index

2. **Backend Utilities**
   - `backend/src/utils/roundRobinAssignment.js` - New utility for round-robin logic

3. **Backend Controllers**
   - `backend/src/controllers/ticketController.js`:
     - `createTicket()` - Now assigns tickets using round-robin
     - `getAllTickets()` - Sales users see only their assigned tickets
     - Updated `.populate()` queries to include `assignedSalesBy`

4. **Migration Script**
   - `backend/scripts/migrateTicketsRoundRobin.js` - Backfills existing tickets

## Setup & Migration

### For New Installation

No action needed! The schema will apply automatically to new tickets.

### For Existing Database

Run the migration script to assign existing tickets:

```bash
cd backend
node scripts/migrateTicketsRoundRobin.js
```

This script will:
- Find all tickets without `assignedSalesBy`
- Distribute them in round-robin order among active sales users
- Display confirmation and distribution summary

### Requirements

- At least one active sales account must exist
- Sales accounts must have `active: true` in the User model

## Role-Based Access

| Role | Can See |
|------|---------|
| **Customer** | Only their own tickets |
| **Engineer** | Only tickets assigned to them (via `assignedTo`) |
| **Sales** | Only tickets assigned to them (via `assignedSalesBy`) |
| **Service Manager** | All tickets |
| **Admin** | All tickets |

## Sales Dashboard Updates

The Sales Overview dashboard has been updated to:
- Display only tickets assigned to that sales person via round-robin
- No changes to the UI - just filters backend data

## Future Enhancements

Potential improvements:
1. **Manual Reassignment**: Allow admins to manually reassign tickets between sales people
2. **Weighted Distribution**: Assign based on current workload (not just round-robin)
3. **Skill-Based Routing**: Route tickets based on specialization
4. **Auto-Balancing**: Periodically rebalance tickets if one user falls behind
5. **Ticket Handoff**: Track when sales person hands off ticket to engineer

## Troubleshooting

### "No active sales users found"
- Ensure at least one user with `role: 'sales'` and `active: true` exists
- Use the admin panel or API to create/activate sales accounts

### Migration script fails
- Check MongoDB connection string in `.env`
- Verify User and Ticket models are properly imported
- Check that sales accounts are active

### Sales user still sees other's tickets
- Run migration script if you added this feature after tickets existed
- Check that `assignedSalesBy` field is populated correctly
- Clear browser cache and refresh

## API Endpoints (No Changes)

The API endpoints remain the same:
- `GET /tickets` - Returns filtered based on user role
- `POST /tickets` - Creates ticket with automatic round-robin assignment
- `GET /tickets/:id` - Returns ticket with populated `assignedSalesBy`

## Testing Round-Robin

To verify round-robin is working:

1. Create 5 sales accounts: Sales-A, Sales-B, Sales-C, Sales-D, Sales-E
2. Create 12 new tickets (via API or dashboard)
3. Check ticket assignments:
   - Expected: Each sales account gets 2-3 tickets
   - Verify order cycles through: A→B→C→D→E→A→B→C...
