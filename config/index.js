require("dotenv").config();

exports.dev = {
  db: {
    url: process.env.DB_URL || "",
  },
  app: {
    port: process.env.SERVER_PORT || 3005,
    secret_key: process.env.SECRET_STRING || "",
    authEmail: process.env.AUTH_EMAIL,
    authPassword: process.env.AUTH_PASSWORD,
  },
};
