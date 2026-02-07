const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { createSendToken, signToken } = require('../utils/jwt');
const passport = require('passport');
const axios = require('axios');

exports.register = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            role: req.body.role || 'USER', // Validation layer ensures only USER/TECHNICIAN
            pincode: req.body.pincode,
            address: req.body.address
        });

        // Pincode Restriction Logic
        if (req.body.pincode !== '845438') {
            return next(new AppError('Service currently not available in your location. We only serve pincode 845438.', 400));
        }

        createSendToken(newUser, 201, res);
    } catch (err) {
        next(err);
    }
};


exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist (Validation middleware does this too, but double check)
        if (!email || !password) {
            return next(new AppError('Please provide email and password!', 400));
        }

        // 2) Check if user exists && password is correct
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // 3) Check if user is active
        if (user.isActive === false) {
            return next(new AppError('Your account has been deactivated. Please contact support.', 403));
        }

        // 3) If everything ok, send token to client
        if (user.role === 'TECHNICIAN') {
            await user.populate('technicianProfile');
        }

        createSendToken(user, 200, res);
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.status(200).json({ status: 'success' });
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.googleAuth = async (req, res, next) => {
    // 1. Verify ReCAPTCHA (Passed via Query Param)
    const recaptchaToken = req.query.recaptcha;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isCaptchaEnabled = process.env.ENABLE_CAPTCHA !== 'false';

    if (isCaptchaEnabled && !recaptchaToken && !isDevelopment) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=captcha_required`);
    }

    if (isCaptchaEnabled && recaptchaToken && recaptchaToken !== 'bypass-token') {
        try {
            const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
            const response = await axios.post(verificationUrl);
            const { success, score } = response.data;

            if (!success || (score !== undefined && score < 0.5)) {
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=captcha_failed`);
            }
        } catch (error) {
            console.error('Google Auth Captcha Error:', error);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=captcha_error`);
        }
    }

    // 2. Capture role from query, default to USER
    const role = req.query.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'USER';

    // 3. Set a short-lived cookie to remember the role during the OAuth dance
    res.cookie('g_role', role, {
        httpOnly: true,
        maxAge: 5 * 60 * 1000 // 5 minutes
    });

    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
};

exports.googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        if (err) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
        }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=user_not_found`);
        }

        // Generate token and set cookie
        const token = signToken(user._id);
        const cookieOptions = {
            expires: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        };
        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

        res.cookie('jwt', token, cookieOptions);

        // Redirect to frontend based on ROLE
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        if (user.role === 'TECHNICIAN') {
            // Fetch fresh user with profile to check status
            const techUser = await User.findById(user._id).populate('technicianProfile');

            if (techUser.isTechnicianOnboarded && techUser.technicianProfile?.documents?.verificationStatus === 'VERIFIED') {
                res.redirect(`${frontendUrl}/technician/dashboard`);
            } else {
                // If not onboarded OR pending verification -> Onboarding page
                res.redirect(`${frontendUrl}/technician/onboarding`);
            }
        } else if (user.role === 'ADMIN') {
            res.redirect(`${frontendUrl}/admin/dashboard`);
        } else {
            res.redirect(`${frontendUrl}/bookings`);
        }
    })(req, res, next);
};

exports.updatePassword = async (req, res, next) => {
    try {
        // 1. Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // 2. Check if POSTed current password is correct
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new AppError('Your current password is wrong', 401));
        }

        // 3. Update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm; // optional validation if schema has it
        await user.save();

        // 4. Log user in, send JWT
        createSendToken(user, 200, res);
    } catch (err) {
        next(err);
    }
};
