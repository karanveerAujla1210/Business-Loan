/**
 * This File used to handle JWT tokens
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const privateKEY = fs.readFileSync(path.join(__dirname, "../../private.key"), "utf8");
const publicKEY = fs.readFileSync(path.join(__dirname, "../../public.key"), "utf8");
const issuer = process.env.JWT_ISSUER || "MiniBusiness Loan";
const subject = process.env.JWT_SUBJECT || "info@minibusinessloan.com";
const audience = process.env.JWT_AUDIENCE || "https://minibusinessloan.com";
const signOptions = {
  issuer,
  subject,
  audience,
  expiresIn: "1y",
  algorithm: "RS256",
};
const verifyOptions = {
  issuer,
  subject,
  audience,
  algorithms: ["RS256"],
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
