/**
 * This function used to handle eatra layer authentication
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
function authenticationMiddleware() {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.status(401).json({
            status: false,
            message: "Not Authorized",
            api_version: "1.0",
        });
    };
}

module.exports = authenticationMiddleware
