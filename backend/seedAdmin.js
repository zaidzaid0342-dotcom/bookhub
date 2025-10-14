const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User'); // Adjust path if needed

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAdmin = async () => {
  try {
    // Check if admin already exists using isAdmin field
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = new User({
      username: 'zaid123',
      email: 'zaid123@example.com',
      password: hashedPassword,
      isAdmin: true, // FIX: Use isAdmin instead of role
      // Required fields
      className: 'Admin', // Required field
      id: 'zaid01',
      city: 'Admin City',
      state: 'Admin State',
      phone: '1234567890',
      // Optional fields
      schoolName: 'Admin School',
      collegeName: 'Admin College'
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdmin();