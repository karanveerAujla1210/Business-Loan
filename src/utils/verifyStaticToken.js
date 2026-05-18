const STATIC_TOKEN = process.env.STATIC_API_TOKEN;

const verifyStaticToken = (req, res, next) => {
  if (!STATIC_TOKEN) {
    return res.status(500).json({ error: "Static token not configured" });
  }
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token || token !== STATIC_TOKEN) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  next();
};

module.exports = verifyStaticToken;
