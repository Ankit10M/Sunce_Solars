import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

/**
 * Get the next sales person in round-robin order
 * Distributes tickets equally among all active sales users
 * 
 * Algorithm: Assigns ticket to the sales person with least tickets
 * This ensures perfect round-robin distribution
 */
export const getNextSalesPerson = async () => {
    try {
        // Get all active sales users sorted by creation date (to maintain consistent order)
        const salesUsers = await User.find({ role: 'sales', isActive: true })
            .select('_id name email')
            .sort({ createdAt: 1 });

        if (!salesUsers || salesUsers.length === 0) {
            throw new Error('No active sales users found');
        }

        // If only one sales user, return that user
        if (salesUsers.length === 1) {
            return salesUsers[0];
        }

        // Count tickets assigned to each sales person
        const ticketCounts = await Promise.all(
            salesUsers.map(async (user) => {
                const count = await Ticket.countDocuments({ assignedSalesBy: user._id });
                return { user, count };
            })
        );

        // Sort by ticket count (ascending) and then by creation date (ascending)
        // This ensures we pick the person with least tickets, and if tied, pick the earliest created user
        ticketCounts.sort((a, b) => {
            if (a.count !== b.count) {
                return a.count - b.count;  // Fewer tickets = higher priority
            }
            // If counts are equal, maintain original order (by creation date)
            return 0;
        });

        return ticketCounts[0].user;
    } catch (error) {
        console.error('Error in getNextSalesPerson:', error);
        throw error;
    }
};

/**
 * Get all sales users for dropdown lists, etc.
 */
export const getAllSalesUsers = async () => {
    try {
        return await User.find({ role: 'sales', isActive: true })
            .select('_id name email')
            .sort({ createdAt: 1 });
    } catch (error) {
        console.error('Error in getAllSalesUsers:', error);
        throw error;
    }
};
