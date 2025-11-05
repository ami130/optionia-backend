// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
  cors: {
    origins: process.env.CORS_ORIGINS || 'http://localhost:3000',
  },
});
