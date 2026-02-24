// src/config/database.js

const { Sequelize } = require("sequelize");

const options = {
  encrypt: true,
  trustServerCertificate: true,
  requestTimeout: 90000,
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mssql",
    dialectOptions: {
      options,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: console.log,
  }
);

const makeConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

makeConnection();

module.exports = {
  sequelize,
  Sequelize,
};


// const Sequelize = require("sequelize");

// const db = {};
// const options = {
//   encrypt: true, // Use encryption
//   trustServerCertificate: true, // For self-signed certificates
//   requestTimeout: 60000, // Timeout for long-running queries (60 seconds)
// };

// // Sequelize instance
// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mssql",
//     dialectOptions: options,
//     pool: {
//       max: 10, // Maximum number of connections in the pool
//       min: 0, // Minimum number of connections in the pool
//       acquire: 30000, // Maximum time (in ms) to wait for a connection before throwing error (30 seconds)
//       idle: 10000, // Maximum idle time before releasing the connection (10 seconds)
//     },
//     logging: (msg) => console.log(msg), // Enables query logging for debugging
//   }
// );
// // Function to establish the connection
// const makeConnection = async () => {
//   try {
//     db.MAIN_DATABASE = await sequelize?.authenticate();
//     console.log("Connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// };
// makeConnection();

// module.exports = db;
