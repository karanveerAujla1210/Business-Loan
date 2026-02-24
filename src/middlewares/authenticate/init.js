/**
 * This function used to handle authentication with Passport Strategy
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
const passport = require("passport");
const BearerStrategy = require("passport-http-bearer").Strategy;
const AnonymousStrategy = require("passport-anonymous").Strategy;

const authenticationMiddleware = require("./middleware");
const AuthorizationForm = require("../../forms/AuthorizationForm");

//storing user info in session
passport.serializeUser(function (user, done) {
  // console.log("ID 1", user);
  done(null, user.EmployeeID || user.customerID);
});

passport.deserializeUser(async (idUser, done) => {
  // console.log("ID 2");
  const user = await AuthorizationForm.getUserById(idUser);
  done(null, user);
});

/**
 * Initializing Passport Bearer stratgy
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */

function initPassport() {
  passport.use(new AnonymousStrategy());
  passport.use(
    new BearerStrategy(async (token, done) => {
      const user = await AuthorizationForm.getUserByToken(token);
      // console.log(user);
      if (user) {
        return done(null, user, { scope: "all" });
      } else {
        return done(null, false);
      }
    })
  );
  console.log("ID 4");
  passport.authenticationMiddleware = authenticationMiddleware;
}

module.exports = initPassport;
