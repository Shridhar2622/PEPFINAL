const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // PREVENT XSS
        secure: process.env.NODE_ENV === 'production', // ONLY HTTPS IN PROD
        path: '/'
    };

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.sameSite = 'lax';
        cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

module.exports = { signToken, createSendToken };
