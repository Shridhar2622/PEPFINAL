const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Service = require('./models/Service');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI;

const categories = [
    {
        name: 'Plumbing',
        description: 'Professional leak detection, pipe repair, and faucet installation by certified plumbers. Available for emergency repairs.',
        image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=800',
        price: 499,
        originalPrice: 799,
        rating: 4.8,
        icon: 'Droplets',
        isActive: true,
        order: 1
    },
    {
        name: 'Electrical',
        description: 'Expert wiring, circuit breaker fixes, and appliance installment by licensed electricians. safe and reliable solutions.',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
        price: 399,
        originalPrice: 599,
        rating: 4.9,
        icon: 'Zap',
        isActive: true,
        order: 2
    },
    {
        name: 'Cleaning',
        description: 'Deep home cleaning, sofa sanitization, and kitchen degreasing for a spotless home. Eco-friendly cleaning products used.',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&q=80&w=800',
        price: 1299,
        originalPrice: 1999,
        rating: 4.7,
        icon: 'Sparkles',
        isActive: true,
        order: 3
    },
    {
        name: 'AC Repair',
        description: 'Comprehensive AC servicing, gas charging, and master cleaning for optimal cooling performance. All brands covered.',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800',
        price: 599,
        originalPrice: 999,
        rating: 4.9,
        icon: 'Refrigerator',
        isActive: true,
        order: 4
    },
    {
        name: 'Pest Control',
        description: 'Scent-free cockroach, termite, and rodent treatment with 6-month warranty. Safe for kids and pets.',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
        price: 899,
        originalPrice: 1499,
        rating: 4.6,
        icon: 'ShieldCheck',
        isActive: true,
        order: 5
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB for Category Seeding...');

        // 1. Delete all services (legacy technician data)
        await Service.deleteMany();
        console.log('Cleared all services...');

        // 2. Delete all categories
        await Category.deleteMany();
        console.log('Cleared all categories...');

        // 3. Insert new premium categories
        await Category.insertMany(categories);
        console.log('Seeded premium categories successfully!');

        console.log('Database refresh complete.');
        process.exit();
    } catch (err) {
        console.error('Error seeding categories:', err);
        process.exit(1);
    }
};

seedDB();
