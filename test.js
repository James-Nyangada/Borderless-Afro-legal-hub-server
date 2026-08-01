const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const cat = await Category.create({ name: 'Test Error' });
    console.log(cat);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
});
