# Test Scripts Documentation

This directory contains standalone scripts to verify various features of the Shridhar Backend.

## Usage
Run any script using `node test-scripts/<script-name>.js`. Ensure the server is running on `localhost:5000` before executing.

## Scripts

### Core Verification
- **`test-server.js`**: Basic connectivity test.
- **`test-upload.js`**: Verifies image upload functionality (Worker Profile).
- **`test-booking-flow.js`**: Simulates User booking a Service, Worker accepting it, and status updates.

### Admin Panel
- **`test-admin-dashboard.js`**: Verifies Admin Dashboard stats endpoint.
- **`test-admin-users.js`**: Verifies Admin User Management (List, Ban/Unban).
- **`test-admin-workers.js`**: Verifies Admin Worker Management (List, Approve/Reject).
- **`test-admin-bookings.js`**: Verifies Admin Booking Management (List, Force Cancel).

### Payments & Notifications
- **`test-payment-sim.js`**: Simulates the full payment flow:
    1. Register Worker & Create Service.
    2. Register User & Create Booking.
    3. User makes a Payment (Simulated).
    4. Verifies `Transaction` success and Real-time `Notification` delivery.

### Infrastructure
- **`seed-admin.js`**: Seeder script to create an initial Admin user.

## Notes
- Most scripts automatically create temporary users/workers to run tests in isolation.
- Check server console logs for detailed backend output during tests.
