/**
 * Migration script to backfill assignedSalesBy field for existing tickets
 * Run this once after deploying the schema changes
 * 
 * Usage: node scripts/migrateTicketsRoundRobin.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Ticket from '../src/models/Ticket.js';

dotenv.config();

const migrateTickets = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-system');
        console.log('✓ Connected to MongoDB');

        // Get all active sales users sorted by creation date
        const salesUsers = await User.find({ role: 'sales', isActive: true })
            .select('_id name email')
            .sort({ createdAt: 1 });

        if (!salesUsers || salesUsers.length === 0) {
            console.log('⚠ No active sales users found. Please create sales accounts first.');
            process.exit(0);
        }

        console.log(`\n✓ Found ${salesUsers.length} active sales users`);
        salesUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name} (${user.email})`);
        });

        // Get all tickets that don't have assignedSalesBy
        const ticketsToMigrate = await Ticket.find({ assignedSalesBy: { $exists: false } });
        console.log(`\n✓ Found ${ticketsToMigrate.length} tickets to migrate`);

        if (ticketsToMigrate.length === 0) {
            console.log('✓ All tickets have been migrated already!');
            process.exit(0);
        }

        // Assign tickets in round-robin order
        let assignmentIndex = 0;
        const bulkOps = [];

        for (const ticket of ticketsToMigrate) {
            const assignedSalesPerson = salesUsers[assignmentIndex % salesUsers.length];
            bulkOps.push({
                updateOne: {
                    filter: { _id: ticket._id },
                    update: { $set: { assignedSalesBy: assignedSalesPerson._id } }
                }
            });
            assignmentIndex++;
        }

        // Execute bulk update
        if (bulkOps.length > 0) {
            const result = await Ticket.bulkWrite(bulkOps);
            console.log(`\n✓ Migration completed!`);
            console.log(`  - Updated: ${result.modifiedCount} tickets`);
            console.log(`  - Distribution pattern: Every ticket assigned in round-robin order`);
            console.log(`\nExample distribution:`);
            
            // Show example distribution
            const counts = {};
            salesUsers.forEach(u => counts[u.name] = 0);
            for (let i = 0; i < Math.min(15, ticketsToMigrate.length); i++) {
                const user = salesUsers[i % salesUsers.length];
                counts[user.name]++;
                if (i < 6) {
                    console.log(`  Ticket ${i + 1} → ${user.name}`);
                }
            }
            if (ticketsToMigrate.length > 6) {
                console.log(`  ... and ${ticketsToMigrate.length - 6} more tickets`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        process.exit(1);
    }
};

migrateTickets();
