const bcrypt = require('bcrypt');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

// Validate login credentials
async function validateCredentials(username, password) {
  const validUsername = process.env.AUTH_USERNAME || 'admin';
  const validPasswordHash = process.env.AUTH_PASSWORD_HASH;
  
  if (username !== validUsername) {
    return false;
  }
  
  // If no hash is set, compare plain text (for initial setup)
  if (!validPasswordHash) {
    const defaultPassword = process.env.AUTH_PASSWORD || 'admin';
    return password === defaultPassword;
  }
  
  // Compare with bcrypt hash
  return await bcrypt.compare(password, validPasswordHash);
}

module.exports = {
  requireAuth,
  validateCredentials
};

