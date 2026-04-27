/**
 * Check system setup and fix missing sales users/tickets
 * Usage: node scripts/checkSetupAndFix.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Ticket from '../src/models/Ticket.js';

dotenv.config();

const checkAndFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        // 1. Check all users
        const allUsers = await User.find({}, 'name email role isActive');
        console.log('=== USERS IN SYSTEM ===');
        if (allUsers.length === 0) {
            console.log('❌ No users found!');
        } else {
            allUsers.forEach(u => {
                const status = u.isActive ? '✓' : '✗';
                console.log(`${status} ${u.name} (${u.email}) - Role: ${u.role}`);
            });
        }

        // 2. Check sales users specifically
        const salesUsers = await User.find({ role: 'sales' });
        console.log(`\n=== SALES USERS ===`);
        console.log(`Total: ${salesUsers.length}`);
        
        if (salesUsers.length === 0) {
            console.log('❌ NO SALES USERS - Cannot assign tickets!');
        } else {
            const activeSales = salesUsers.filter(u => u.isActive);
            const inactiveSales = salesUsers.filter(u => !u.isActive);
            console.log(`  Active: ${activeSales.length}`);
            console.log(`  Inactive: ${inactiveSales.length}`);
            
            if (inactiveSales.length > 0) {
                console.log('\n  Inactive sales users (can be activated):');
                inactiveSales.forEach(u => console.log(`    - ${u.name} (${u.email})`));
            }
        }

        // 3. Check tickets
        const ticketCount = await Ticket.countDocuments({});
        const ticketsWithAssignment = await Ticket.countDocuments({ assignedSalesBy: { $exists: true } });
        const ticketsWithoutAssignment = await Ticket.countDocuments({ assignedSalesBy: { $exists: false } });
        
        console.log(`\n=== TICKETS ===`);
        console.log(`Total: ${ticketCount}`);
        console.log(`  With assignedSalesBy: ${ticketsWithAssignment}`);
        console.log(`  Without assignedSalesBy: ${ticketsWithoutAssignment}`);

        // 4. Suggestions
        console.log('\n=== RECOMMENDATIONS ===');
        if (salesUsers.length === 0) {
            console.log('❌ STEP 1: Create at least one Sales user');
            console.log('   Options:');
            console.log('   a) Use the Signup form in frontend (then approve in Admin)');
            console.log('   b) Use MongoDB Compass to insert a sales user manually');
        } else if (salesUsers.filter(u => u.isActive).length === 0) {
            console.log('⚠️  STEP 1: Activate at least one sales user');
            console.log('   Run this command:');
            salesUsers.forEach(user => {
                console.log(`   db.users.updateOne({_id: ObjectId("${user._id}")}, {$set: {isActive: true}})`);
            });
            console.log('\n   OR use Admin panel to approve the sales users');
        } else {
            console.log('✓ STEP 1: Sales users are set up and active');
        }

        if (ticketCount > 0 && ticketsWithoutAssignment > 0) {
            console.log('\n❌ STEP 2: Run migration script');
            console.log('   node scripts/migrateTicketsRoundRobin.js');
        } else if (ticketCount === 0) {
            console.log('\n⚠️  STEP 2: No tickets in system (create some to test)');
        } else {
            console.log('\n✓ STEP 2: All tickets have assignedSalesBy field');
        }

        console.log('\n✓ STEP 3: Refresh Sales Dashboard to see tickets');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
};

checkAndFix();
