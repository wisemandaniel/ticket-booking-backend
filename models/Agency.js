const mongoose = require('mongoose');



const agencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  destinations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  autoIndex: true // Ensure automatic index creation
});

// Add this temporary cleanup script to your agency.model.js
async function cleanupStaleIndexes() {
  try {
    const collection = mongoose.connection.db.collection('agencies');
    const indexes = await collection.indexes();
    
    // Remove all indexes except the essential ones
    for (const index of indexes) {
      const indexName = index.name;
      if (indexName !== '_id_' && indexName !== 'name_1' && indexName !== 'destinations_1') {
        await collection.dropIndex(indexName);
        console.log(`Removed stale index: ${indexName}`);
      }
    }
  } catch (error) {
    console.error('Index cleanup error:', error.message);
  }
}

// Run when MongoDB connects
mongoose.connection.on('connected', cleanupStaleIndexes);

// Clean way to handle indexes
agencySchema.index({ name: 1 });
agencySchema.index({ destinations: 1 });

const Agency = mongoose.model('Agency', agencySchema);

// Check for and remove stale indexes on startup
async function cleanupIndexes() {
  const indexes = await Agency.collection.indexes();
  const hasEmailIndex = indexes.some(idx => idx.name === 'contactEmail_1');
  
  if (hasEmailIndex) {
    await Agency.collection.dropIndex('contactEmail_1');
    console.log('Removed stale contactEmail index');
  }
}

// Run cleanup when DB connects
mongoose.connection.on('connected', () => {
  cleanupIndexes().catch(console.error);
});

module.exports = Agency;