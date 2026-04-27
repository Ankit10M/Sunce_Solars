import User from '../models/User.js';

export const startInactivityCheck = () => {
    // Run the check every 24 hours
    const intervalMs = 24 * 60 * 60 * 1000;
    
    const checkActivity = async () => {
        try {
            console.log('Checking for inactive customers (no login for 180 days)...');
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 180);
            
            const result = await User.updateMany(
                { 
                    role: 'customer',
                    isActive: true,
                    $or: [
                        { lastLogin: { $lt: cutoffDate } },
                        // If lastLogin is somehow missing but they were created 180+ days ago
                        { lastLogin: { $exists: false }, createdAt: { $lt: cutoffDate } }
                    ]
                },
                { $set: { isActive: false } }
            );

            if (result.modifiedCount > 0) {
                console.log(`Marked ${result.modifiedCount} customers as inactive due to 180+ days of inactivity.`);
            } else {
                console.log('No inactive customers found.');
            }
        } catch (error) {
            console.error('Error during inactivity check:', error);
        }
    };

    // Run once initially on startup, then every interval
    checkActivity();
    setInterval(checkActivity, intervalMs);
};
