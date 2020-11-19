require("dotenv").config();

module.exports = {
  app: {
    dbPort: 3000,
    secret: process.env.APP_SECRET_KEY_PROD,
    mongodbUri: process.env.MONGODB_URI_PROD,
  },
  // todo: add aws credentials here and replace in code with config references rather than processes
  stripe: {
    secretKey: process.env.STRIPE_TEST_SECRET_KEY,
    publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY,
    clientId: process.env.STRIPE_TEST_CLIENT_ID,
    authorizeUri: "https://connect.stripe.com/express/oauth/authorize",
    tokenUri: "https://connect.stripe.com/oauth/token",
  },
  baseUrl: "http://localhost:3000",
}
