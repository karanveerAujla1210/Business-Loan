/**
 * This function used to handle eatra layer authentication
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
function authenticationMiddleware() {
    return function (req, res, next) {
        console.log("req.isAuthenticated()",req.isAuthenticated())
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/')
    }
}

module.exports = authenticationMiddleware
