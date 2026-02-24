/**
 * This File used to handle JWT tokens
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
const fs = require("fs");
const jwt = require("jsonwebtoken");
const privateKEY = fs.readFileSync("./private.key", "utf8");
const publicKEY = fs.readFileSync("./public.key", "utf8");
const issuer = "Tech Aviom"; // Issuer
const subject = "info@kindajobs.com"; // Subject
const audience = "http://kindajobs.in"; // Audience
const signOptions = {
  issuer: issuer,
  subject: subject,
  audience: audience,
  expiresIn: "1y",
  algorithm: "RS256",
};
const verifyOptions = {
  issuer: issuer,
  subject: subject,
  audience: audience,
  expiresIn: "1y",
  algorithm: ["RS256"],
};

module.exports = {
  /**
   * This function used to Validate token
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  validateToken: async (token) => {
    try {
      return await jwt.verify(token, publicKEY, verifyOptions);
    } catch (err) {
      return null;
    }
  },

  /**
   * Create Token Create JWT Token
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  createToken: async (payload) => {
    try {
      return await jwt.sign(payload, privateKEY, signOptions);
    } catch (err) {
		console.log("err_____",err);
      return null;
    }
  },
};
