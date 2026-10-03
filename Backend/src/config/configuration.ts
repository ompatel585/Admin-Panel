export interface AppConfig {
  port: number;
  frontendUrl: string;
  isProduction: boolean;
  database: { uri: string };
  jwt: { secret: string; expiresInSeconds: number };
  auth: { passwordResetTtlMinutes: number };
}

export const configuration = (): AppConfig => ({
  port: parseInt(process.env.PORT as string, 10),
  frontendUrl: process.env.FRONTEND_URL as string,
  isProduction: process.env.NODE_ENV === 'production',
  database: { uri: process.env.MONGODB_URI as string },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresInSeconds: parseInt(
      process.env.JWT_EXPIRES_IN_SECONDS as string,
      10,
    ),
  },
  auth: {
    passwordResetTtlMinutes: parseInt(
      process.env.PASSWORD_RESET_TTL_MINUTES as string,
      10,
    ),
  },
});
