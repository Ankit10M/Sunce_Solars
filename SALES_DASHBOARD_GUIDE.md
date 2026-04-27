# Sales Dashboard - Complete Feature Guide

## Overview
The Sales Dashboard is a comprehensive ticket management system that allows BD/Sales teams to create, track, assign, and monitor repair tickets throughout their lifecycle with real-time updates from engineers.

---

## 📊 Dashboard Pages

### 1. **Overview Dashboard (Sales → Overview)**
The main landing page with real-time statistics and ticket management.

#### Features:
- **Live Statistics**
  - Total Tickets: Count of all tickets in system
  - Pending Pickups: Tickets waiting for pickup scheduling
  - Active Repairs: Tickets currently under service
  - Urgent Items: High or Critical priority tickets
  - Closed Tickets: Completed repairs

- **Advanced Filtering**
  - Search by: Ticket ID, Customer Name
  - Filter by Status: Created, Pickup Scheduled, In Transit, Under Repair, etc.
  - Filter by Priority: Normal, High, Critical
  - Filter by Urgency: Low, Medium, High

- **Ticket List**
  - Displays all tickets with columns: ID, Customer, Status, Priority, Assigned To, Warranty Status
  - Color-coded status badges for quick identification
  - Action buttons for quick access

- **Ticket Detail Modal**
  - Complete ticket information
  - Customer & Inverter details
  - Current Status & SLA tracking
  - **Assign Engineers**: Dropdown to select and assign available engineers
  - **Update Warranty**: Set warranty status (In Warranty, Out of Warranty, AMC)
  - **Service History**: Timeline of all actions performed on ticket
  - **Close Ticket**: Mark as complete with closure reason

#### How to Use:
1. Go to Sales Dashboard → Overview
2. Use filters to find specific tickets
3. Click "View Details" to open ticket modal
4. Assign engineer if needed (auto-notifies them)
5. Update warranty status based on customer information
6. View all historical actions in service timeline

---

### 2. **Ticket Creation (Sales → New Ticket)**
Create new service tickets for customers.

#### 2-Step Process:

**Step 1: Select Customer & Inverter**
- Choose customer from dropdown
- Select the specific inverter unit that needs service
- Inverters auto-populate based on selected customer

**Step 2: Describe the Issue**
- **Fault Description** (Required): Detailed description of the issue
- **Error Code** (Optional): Device error code if available
- **Urgency Level**: Low, Medium, High
- **Priority Level**: Normal, High, Critical

#### SLA Deadlines by Priority:
- **Critical**: 24 hours
- **High**: 48 hours
- **Normal**: 72 hours

#### How to Create:
1. Navigate to Sales → New Ticket
2. Select customer and their inverter
3. Click Next
4. Fill in fault description and details
5. Click "Create Ticket"
6. You'll get a unique Ticket ID to reference

**Note**: Ticket IDs follow format: `TK-YYYY-XXXX`

---

### 3. **Status Tracker (Sales → Status Tracker)**
Real-time tracking of ticket progress and engineer responses.

#### Features:
- **Ticket Search**: Search by Ticket ID to fetch real-time data
- **Status Timeline**: Visual timeline of all status changes
- **Update Status**: Change ticket status with accompanying remarks
- **Engineer Responses**: View responses and updates from assigned engineers
- **Audit Trail**: Complete history of who updated what and when

#### Status Workflow:
```
Ticket Created 
  ↓
Pickup Scheduled 
  ↓
On Transit 
  ↓
Received 
  ↓
Under Diagnosis 
  ↓
Under Repair 
  ↓
Ready to Dispatch 
  ↓
Dispatched 
  ↓
Closed
```

#### How to Update Status:
1. Search for specific ticket
2. Select next status from available options (based on workflow)
3. Add remarks explaining the status change
4. Click "Update Status"
5. All team members see the update in real-time

---

### 4. **Warranty & Financial Oversight (Sales → Financial Oversight)**
Comprehensive warranty tracking and AMC management.

#### Key Metrics Displayed:
- **In Warranty**: Inverters still under manufacturer warranty
- **AMC Active**: Active Annual Maintenance Contracts
- **Out of Warranty**: Inverters beyond warranty period
- **AMC Expiring Soon**: AMC contracts expiring within 30 days
- **Warranty Expiring Soon**: Warranty expiring within 30 days

#### Warranty Status Types:
1. **In Warranty**: Device covered under manufacturer warranty
2. **Out of Warranty**: Warranty period has expired
3. **AMC**: Active Annual Maintenance Contract
4. **Unknown**: Warranty status not yet verified

#### Features:
- **Warranty Table**: View all tickets with warranty details
- **Visual Alerts**: Red highlighting for expiring warranties (30-day warning)
- **Filter Options**: 
  - By warranty status
  - By contract type (AMC vs Warranty)
- **Expiry Tracking**: See warranty and AMC expiry dates

#### How to Track Warranties:
1. Navigate to Sales → Financial Oversight
2. View stat cards for high-level overview
3. Filter by warranty status or contract type
4. Look for red-highlighted rows (expiring soon)
5. Click corresponding ticket to update warranty information

**Pro Tip**: Set calendar reminders 30 days before expiry to prepare renewal documents

---

## 🔄 Engineer Assignment Workflow

### How to Assign Tickets:
1. Open ticket in Overview Dashboard
2. Click "View Details" button
3. In modal, scroll to "ASSIGN ENGINEER" section
4. Select engineer from dropdown (shows name and email)
5. Click "Assign" button
6. Engineer automatically notified and gains access to ticket

### How to Monitor Engineer Work:
1. Check Status Tracker for real-time updates
2. Engineers update status as they work
3. View their remarks and progress in timeline
4. When ready to dispatch, engineer updates to "Ready to Dispatch"

---

## 🔐 Role-Based Access Control

### Sales Role Sees:
- ✅ All tickets in the system
- ✅ All customers
- ✅ Can create new tickets
- ✅ Can assign tickets to engineers
- ✅ Can update warranty status
- ✅ Can update ticket status
- ✅ Full warranty & financial data

### Engineer Role Sees:
- ✅ Only tickets assigned to them
- ✅ Customer details
- ✅ Fault descriptions
- ✅ Can update ticket status (within allowed transitions)
- ✅ Can add remarks to status updates

### Customer Role Sees:
- ✅ Only their own tickets
- ✅ Status of their devices
- ✅ Can't create or modify tickets

---

## 📱 Key Metrics & KPIs

### To Monitor:
1. **Average Resolution Time**: Check closed tickets timestamp
2. **SLA Compliance**: Look for "BREACHED" indicators in status
3. **Open Tickets**: Reference Overview for active repairs count
4. **Warranty Coverage**: Financial Oversight for in-warranty percentage
5. **Engineer Workload**: Look at assigned tickets per engineer

---

## 🔍 Troubleshooting

### Can't Find a Ticket?
- Verify ticket ID format (TK-YYYY-XXXX)
- Try searching by customer name
- Use filters to narrow down

### Can't Assign to Engineer?
- Engineer must be registered in system (role: engineer)
- Engineer account must be active
- Use correct email from dropdown

### Warranty Update Not Saving?
- Ensure you fill in warranty status
- Click "Update Warranty Status" not just close modal
- Check success toast notification

### Status Won't Change?
- Check allowable status transitions (workflow rules)
- Cannot skip intermediate statuses
- Some statuses only available to certain roles

---

## 🚀 Best Practices

1. **Immediate Actions**:
   - Create ticket within same day as complaint
   - Assign to engineer immediately after pickup
   - Add priority based on customer impact

2. **Status Updates**:
   - Update status daily
   - Add detailed remarks for each change
   - Document any customer communication

3. **Warranty Management**:
   - Verify warranty status before closing ticket
   - Set 30-day AMC renewal alerts
   - Update warranty info from customer documents

4. **Communication**:
   - Use remarks to communicate with engineers
   - Mention customer expectations in remarks
   - Document all customer requests

5. **Closure**:
   - Always add closure reason
   - Verify SLA compliance before closing
   - Confirm customer satisfaction

---

## 📞 Support & Features Coming Soon

### Planned Features:
- [x] Real-time ticket management
- [x] Engineer assignment & tracking
- [x] Warranty tracking system
- [ ] SMS/Email notifications to customers
- [ ] Auto-generated warranty renewal reminders
- [ ] Bulk ticket assignment
- [ ] Export tickets to Excel/PDF
- [ ] Customer feedback ratings
- [ ] Parts inventory integration
- [ ] Travel time tracking for pickups

---

## 🔗 API Endpoints Used

### Backend Endpoints:
- `GET /api/v1/tickets` - Fetch all tickets
- `POST /api/v1/tickets` - Create new ticket
- `GET /api/v1/tickets/:id` - Get ticket details
- `PATCH /api/v1/tickets/:id/status` - Update ticket status
- `PATCH /api/v1/tickets/:id/assign` - Assign to engineer
- `PATCH /api/v1/tickets/:id/warranty` - Update warranty status
- `GET /api/v1/customers` - Get all customers
- `GET /api/v1/customers/:id/inverters` - Get customer's inverters
- `GET /api/v1/auth/engineers` - Get all engineers

---

## 📝 Common Scenarios

### Scenario 1: New Complaint Received
1. Create ticket with high urgency/priority
2. Immediately assign to available engineer
3. Add customer contact details in remarks
4. Monitor status updates in tracker

### Scenario 2: Device Needing Warranty Verification
1. Open ticket details
2. Update warranty status based on documents
3. Note verification date and method
4. Flag for AMC renewal if applicable

### Scenario 3: Urgent Issue Requiring Escalation
1. Update ticket priority to "CRITICAL"
2. Assign to senior engineer
3. Add escalation remarks
4. Reduce expected SLA from normal

### Scenario 4: Follow-up on Delayed Repair
1. Search ticket in Status Tracker
2. Review timeline for last engineer update
3. Contact engineer if no recent activity
4. Consider reassigning if delayed

---

## 💡 Tips & Tricks

- Use Ctrl+F to search page content quickly
- Filter by "Under Repair" to see active work items
- Check "Warranty Expiring" regularly for renewals
- Assign multiple similar issues to same engineer (efficiency)
- Add customer name in search for faster lookup
- Use Status Tracker for customer status inquiries
- Export critical tickets for daily standup

---

For errors or issues, contact IT Support.
Last Updated: 31-Mar-2026
