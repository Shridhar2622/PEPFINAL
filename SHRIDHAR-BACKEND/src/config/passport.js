const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');



const clientID = process.env.GOOGLE_CLIENT_ID || process.env.GAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GAUTH_CLIENT_SECRET;

if (clientID && clientSecret) {
    passport.use(
        new GoogleStrategy(
            {
                clientID,
                clientSecret,
                callbackURL: '/api/v1/auth/google/callback',
                passReqToCallback: true
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    // 1. Check if user exists by googleId
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        return done(null, user);
                    }

                    // 2. Check if user exists by email (link accounts)
                    const email = profile.emails[0].value;
                    user = await User.findOne({ email });

                    if (user) {
                        user.googleId = profile.id;
                        await user.save({ validateBeforeSave: false });
                        return done(null, user);
                    }

                    // 3. Create new user
                    // Get role from cookie set in authController.googleAuth
                    // Default to USER if missing or invalid
                    let role = 'USER';
                    if (req.cookies && (req.cookies.g_role === 'TECHNICIAN' || req.cookies.g_role === 'USER')) {
                        role = req.cookies.g_role;
                    }

                    const newUser = await User.create({
                        name: profile.displayName,
                        email: email,
                        googleId: profile.id,
                        profilePhoto: profile.photos ? profile.photos[0].value : 'default.jpg',
                        role: role
                    });

                    done(null, newUser);

                } catch (err) {
                    done(err, false);
                }
            }
        )
    );
    console.log('✅ Google OAuth Strategy Initialized');
} else {
    console.warn('⚠️ Google OAuth Skipped: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
}

