require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "SchoolManagementDB_owner",
    password: process.env.DB_PASSWORD || "npg_PCVSBxeaOh57",
    database: process.env.DB_NAME || "SchoolManagementDB",
    host: process.env.DB_HOST || "ep-delicate-morning-a5xhh7w1-pooler.us-east-2.aws.neon.tech",
    dialect: process.env.DB_DIALECT || "postgres",  // ✅ Important: Explicitly add this line
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres",  // ✅ Important
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres",  // ✅ Important
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};