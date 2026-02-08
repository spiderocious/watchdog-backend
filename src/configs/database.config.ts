export const databaseConfig = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/watchdog',
  options: {
    maxPoolSize: 10,
    minPoolSize: 5,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
  },
};
