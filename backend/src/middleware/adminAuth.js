module.exports = function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.adminToken;
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return res.status(500).json({ error: 'Admin auth not configured' });
  if (!token || token !== expected) return res.status(403).json({ error: 'Forbidden' });
  return next();
};
