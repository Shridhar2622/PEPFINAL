const axios = require('axios');
const AppError = require('../utils/AppError');

exports.verifyRecaptcha = async (req, res, next) => {
    try {
        const { recaptchaToken } = req.body;


        // 1. Mock Mode for Testing/Dev (If keys missing or explicit mock token)
        if (
            process.env.NODE_ENV === 'test' ||
            recaptchaToken === 'mock-token' ||
            recaptchaToken === 'bypass-token' || // Frontend sends this
            process.env.ENABLE_CAPTCHA === 'false' || // Feature Flag
            !process.env.RECAPTCHA_SECRET_KEY
        ) {
            // Bypass verification
            return next();
        }

        if (!recaptchaToken) {
            return next(new AppError('Please complete the reCAPTCHA.', 400));
        }

        // Debug Logs
        // console.log('Verifying Recaptcha with:');
        // console.log('Secret:', process.env.RECAPTCHA_SECRET_KEY ? 'Loaded (starts with ' + process.env.RECAPTCHA_SECRET_KEY.substring(0, 5) + ')' : 'MISSING');
        // console.log('Token:', recaptchaToken.substring(0, 10) + '...');

        // 2. Verify with Google
        // Using params object ensures proper encoding of the token
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken
                }
            }
        );

        const { success, score, 'error-codes': errorCodes } = response.data;

        // console.log('Google Response:', response.data);

        if (!success) {
            return next(new AppError(`reCAPTCHA verification failed. Codes: ${errorCodes || 'unknown'}. Input error.`, 400));
        }

        next();
    } catch (err) {
        console.error('Recaptcha Error:', err.message);
        next(new AppError('Error verifying reCAPTCHA', 500));
    }
};
