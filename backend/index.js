import 'dotenv/config';
import app from './src/app.js'
import connectDB from './src/config/db.js'
import { startInactivityCheck } from './src/utils/checkInactiveCustomers.js';

const port = process.env.PORT || 4500;

const startServer = async () => {
    try {
        await connectDB()
        const server = app.listen(port, () => {
            console.log('server running 4500');
        });
        
        // Start background tasks
        startInactivityCheck();

        const gracefulShutdown = (signal) => {
            console.log(`\n ${signal} received - shutting down`);
            server.close(() => {
                console.log('HTTP closed');
                process.exit(0);
            });
            setTimeout(() => {
                console.error('force exit after timeout');
                process.exit(1)
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
        process.on('SIGINT', () => gracefulShutdown('SIGINT'))

        process.on('unhandledRejection', (reason) => {
            console.error('unhandled promise Rejection:', reason);
            gracefulShutdown('ungandledRejection')
        })
    } catch (error) {
        console.error('Failed to start server', error.message);
        process.exit(1)
    }
}
startServer()