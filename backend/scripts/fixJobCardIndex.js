import mongoose from 'mongoose';
import '../src/config/db.js';
import JobCard from '../src/models/JobCard.js';

async function fixJobCardIndex() {
    try {
        console.log('Connecting to database...');
        
        // Get the collection
        const collection = mongoose.connection.collection('jobcards');
        
        // Get all existing indexes
        const indexes = await collection.getIndexes();
        console.log('\nCurrent indexes:');
        console.log(JSON.stringify(indexes, null, 2));
        
        // Drop indexes that reference old 'jobcard' field
        for (const [indexName, indexSpec] of Object.entries(indexes)) {
            if (indexName === '_id_') continue; // Don't drop the default _id index
            
            const key = indexSpec.key;
            if (key && key.jobcard) {
                console.log(`\nDropping old index: ${indexName}`);
                await collection.dropIndex(indexName);
                console.log(`✓ Dropped ${indexName}`);
            }
        }
        
        // Check for duplicate jobCardId indexes and keep only one
        const jobCardIdIndexes = [];
        for (const [indexName, indexSpec] of Object.entries(indexes)) {
            const key = indexSpec.key;
            if (key && key.jobCardId) {
                jobCardIdIndexes.push({ name: indexName, spec: indexSpec });
            }
        }
        
        // If there are duplicate indexes, drop all except the first
        if (jobCardIdIndexes.length > 1) {
            console.log(`\nFound ${jobCardIdIndexes.length} jobCardId indexes. Keeping only one...`);
            for (let i = 1; i < jobCardIdIndexes.length; i++) {
                const indexName = jobCardIdIndexes[i].name;
                console.log(`Dropping duplicate index: ${indexName}`);
                await collection.dropIndex(indexName);
                console.log(`✓ Dropped ${indexName}`);
            }
        }
        
        // Rebuild indexes from mongoose schema
        console.log('\nRebuilding indexes from schema...');
        await collection.deleteMany({ }); // Optional: Clear bad data if needed
        await JobCard.collection.syncIndexes();
        console.log('✓ Schema indexes synced');
        
        // Verify final state
        const finalIndexes = await collection.getIndexes();
        console.log('\nFinal indexes:');
        console.log(JSON.stringify(finalIndexes, null, 2));
        
        console.log('\n✓ JobCard indexes fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
}

fixJobCardIndex();
