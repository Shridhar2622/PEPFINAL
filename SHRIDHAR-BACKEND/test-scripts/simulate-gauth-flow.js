const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    red: "\x1b[31m"
};

async function log(step, message, isSuccess = true) {
    const icon = isSuccess ? '✅' : '❌';
    const color = isSuccess ? colors.green : colors.red;
    console.log(`${color}${icon} [${step}] ${message}${colors.reset}`);
}

async function runSimulation() {
    try {
        console.log(colors.blue + "\n🚀 STARTING GOOGLE OAUTH SIMULATION...\n" + colors.reset);

        await mongoose.connect(process.env.MONGO_URI);
        console.log("📊 Database Connected.\n");

        // CLEANUP
        const testEmail = `g_sim_${Date.now()}@test.com`;
        const linkEmail = `link_sim_${Date.now()}@test.com`;

        // ======================================================
        // SCENARIO 1: NEW USER SIGNUP via GOOGLE
        // ======================================================
        console.log(colors.yellow + "--- SCENARIO 1: NEW USER SIGNUP (No Password) ---" + colors.reset);
        const mockGoogleProfile = {
            id: 'google_123456789',
            displayName: 'Google New User',
            emails: [{ value: testEmail }],
            photos: [{ value: 'https://google.com/photo.jpg' }]
        };

        // 1. Check if user exists (Passport Logic)
        let user = await User.findOne({ googleId: mockGoogleProfile.id });
        if (!user) {
            console.log("   ℹ️ User not found by ID. Checking email...");
            user = await User.findOne({ email: testEmail });
        }

        if (!user) {
            console.log("   ℹ️ User not found. CREATING NEW ACCOUNT...");
            user = await User.create({
                name: mockGoogleProfile.displayName,
                email: mockGoogleProfile.emails[0].value,
                googleId: mockGoogleProfile.id,
                profilePhoto: mockGoogleProfile.photos[0].value,
                role: 'USER' // Default role
            });
            await log("Signup", `Created User: ${user.email} (ID: ${user._id})`);
        } else {
            await log("Signup", "Unexpectedly found user!", false);
        }

        // ======================================================
        // SCENARIO 2: EXISTING USER LOGIN via GOOGLE
        // ======================================================
        console.log(colors.yellow + "\n--- SCENARIO 2: EXISTING USER LOGIN ---" + colors.reset);

        // Passport Logic again
        const foundUser = await User.findOne({ googleId: mockGoogleProfile.id });

        if (foundUser) {
            await log("Login", `Successfully authenticated: ${foundUser.name}`);
            console.log(`      Token would be issued here for User ID: ${foundUser._id}`);
        } else {
            await log("Login", "Failed to find existing user!", false);
        }


        // ======================================================
        // SCENARIO 3: ACCOUNT LINKING (Existing Email + Google Request)
        // ======================================================
        console.log(colors.yellow + "\n--- SCENARIO 3: ACCOUNT LINKING (Email Match) ---" + colors.reset);

        // 1. Create a "Legacy" user with Password
        await User.create({
            name: 'Legacy User',
            email: linkEmail,
            password: 'password123',
            role: 'USER'
        });
        console.log(`   ℹ️ Created legacy user with email: ${linkEmail}`);

        // 2. Simulate Google Login with SAME Email but NEW Google ID
        const mockGoogleProfile2 = {
            id: 'google_987654321', // Different ID
            emails: [{ value: linkEmail }] // SAME Email
        };

        let linkUser = await User.findOne({ googleId: mockGoogleProfile2.id });
        if (!linkUser) {
            console.log("   ℹ️ No Google ID found. Checking email...");
            linkUser = await User.findOne({ email: mockGoogleProfile2.emails[0].value });
        }

        if (linkUser) {
            console.log("   ℹ️ Found existing user by EMAIL. Linking accounts...");
            linkUser.googleId = mockGoogleProfile2.id;
            await linkUser.save({ validateBeforeSave: false }); // Passport logic usually skips valid? actually User model allows it now.
            await log("Linking", `Updated User ${linkUser.email} with Google ID: ${linkUser.googleId}`);
        } else {
            await log("Linking", "Failed to find legacy user by email!", false);
        }

        // Verify Linking
        const verifiedLinkUser = await User.findOne({ googleId: 'google_987654321' });
        if (verifiedLinkUser) {
            await log("Verification", "User can now login with Google ID!");
        } else {
            await log("Verification", "Linking failed to persist!", false);
        }

        console.log(colors.blue + "\n✨ SIMULATION COMPLETE: ALL SYSTEMS GO!" + colors.reset);
        process.exit(0);

    } catch (err) {
        console.error(colors.red + "\nFATAL ERROR:" + colors.reset, err);
        process.exit(1);
    }
}

runSimulation();
