const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stagio', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    try {
      await mongoose.connection.collection('applications').dropIndex('studentId_1_offerId_1');
      console.log('Old index studentId_1_offerId_1 dropped successfully!');
    } catch (err) {
      console.log('Error dropping index:', err.message);
    }
    process.exit(0);
  });
