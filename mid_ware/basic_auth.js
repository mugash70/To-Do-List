require("dotenv").config();
// Middleware for basic authentication
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {return res.status(401).json({ error: "Authorization header missing or invalid" });}
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = credentials.split(":");
  if ( username === process.env.AUTH_USERNAME &&password === process.env.AUTH_PASSWORD) {return next(); }
  return res.status(401).json({ error: "Invalid username or password" });
};

module.exports = basicAuth;
