const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const payload = {
  userId: 'test-user-123',
  email: 'test@example.com',
  role: 'USER'
};

const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '1h',
  issuer: 'ai-agent-marketplace',
  subject: 'test-user-123'
});

console.log('Generated Test Token:');
console.log(token);