const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "RESET_PASSWORD_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const getMissingVars = () =>
  REQUIRED_ENV_VARS.filter((name) => !process.env[name] || !process.env[name].trim());

const hasAnyFrontendOrigin = () =>
  [process.env.CLIENT_URL, process.env.FRONTEND_URL].some(
    (value) => value && value.trim()
  );

const validateEnv = () => {
  const missing = getMissingVars();

  if (!hasAnyFrontendOrigin()) {
    missing.push("CLIENT_URL or FRONTEND_URL");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

export default validateEnv;

