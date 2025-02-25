const roleMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.accountType)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
  
  module.exports = roleMiddleware;