const { AppError } = require('./errorHandler');

const resolveUserId = (user = {}) =>
  user.id || user.idUser || user.customerID || user.EmployeeID || null;

const requireAuthenticatedUser = (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const userId = resolveUserId(req.user);
  if (!userId) {
    return next(new AppError('Unable to resolve user identity', 401));
  }

  req.authUserId = userId;
  return next();
};

const requireInternalUser = (req, _res, next) => {
  const user = req.user || {};
  const isInternal =
    Boolean(user.EmployeeID) ||
    String(user.roleAssigned || '').toLowerCase() === 'admin' ||
    String(user.userType || '').toLowerCase() === 'staff';

  if (!isInternal) {
    return next(new AppError('Admin or staff access required', 403));
  }

  return next();
};

module.exports = {
  requireAuthenticatedUser,
  requireInternalUser,
  resolveUserId,
};
