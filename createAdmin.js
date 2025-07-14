require('dotenv').config();
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const newAdmin = {
      userName: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      mobile: '1234567890',
      role: 'admin',
    };

    console.log('Admin object created:');
    console.log(newAdmin);
  } catch (error) {
    console.error('Error creating admin object:', error);
  }
};

createAdmin();
