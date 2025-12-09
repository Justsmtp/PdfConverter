const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'coddygadgets@gmail.com',
      password: '123456', // Change this!
      role: 'admin',
      plan: 'premium'
    });
    
    console.log('✅ Admin user created:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();