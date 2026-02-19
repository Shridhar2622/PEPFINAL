const rateLimit = require('express-rate-limit');

// General API Rate Limiter
exports.globalLimiter = rateLimit({
    max: 10000, // Effectively disabled for dev
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
    validate: { trustProxy: false }
});

// Strict Limiter for Auth Routes (Brute Force Protection)
exports.authLimiter = rateLimit({
    max: 10000, // Effectively disabled for dev
    windowMs: 60 * 60 * 1000,
    message: 'Too many login attempts from this IP, please try again in an hour!',
    validate: { trustProxy: false }
});
