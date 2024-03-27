const jwt = require("jsonwebtoken");
let blacklist = [];
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const checkTokenBlacklist = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({error: "Unauthorized"});
  }
  const token = req.headers.authorization.split(" ")[1];
  console.log(blacklist);

  if (blacklist.includes(token)) {
    return res.status(401).json({error: "You are logged out. Please log in."});
  }

  jwt.verify(token, process.env.access_secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({error: "Invalid token"});
    }
    req.user = decoded;
    next();
  });
};

module.exports = { generateTokens, checkTokenBlacklist, blacklist };
