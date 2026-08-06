/**
 * Role-based authorization middleware.
 * Usage: roleAuth('librarian', 'admin')
 * Admin always has access to librarian routes.
 */
exports.roleAuth = (...roles) => (req, res, next) => {
  // Admin is a superset of librarian — admin can access any role-guarded route
  if (req.user.role === 'admin') return next();

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Insufficient permissions.',
    });
  }
  next();
};
