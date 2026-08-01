require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const DB = process.env.MONGODB_URI;

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

const seedAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'info@borderlessafrolegalhub.com' });

    if (existingAdmin) {
      console.log('Admin user already exists.');
    } else {
      await User.create({
        name: 'Admin User',
        email: 'info@borderlessafrolegalhub.com',
        password: 'borderlessafrolegalhub@2026',
        role: 'admin',
        status: 'active'
      });
      console.log('Admin user successfully created!');
    }
  } catch (err) {
    console.error('Failed to seed admin user', err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedAdminUser();
