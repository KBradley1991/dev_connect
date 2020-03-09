const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
  //get token from header
  const token = req.header("x-auth-token");

  //check token
  if (!token) {
    return res.status(401).json({ error: "No Token autharization denied" });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get("jwt_secret"));
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token is not valid" });
  }
};
