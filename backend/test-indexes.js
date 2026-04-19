const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/interview_platform').then(async () => {
  const User = require('./models/User');
  const indexes = await User.collection.indexes();
  console.log(indexes);
  process.exit(0);
});
