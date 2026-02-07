const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Category = require('../src/models/Category');

const categoriesToSeed = [
    {
        name: 'Carpentry',
        icon: 'Hammer',
        color: 'bg-orange-100 text-orange-600',
        description: 'Expert furniture crafting, repairs, and custom woodwork solutions.',
        image: 'https://images.unsplash.com/photo-1622295023576-e41cd3e7163f?q=80&w=400',
        isActive: true,
        price: 499
    },
    {
        name: 'Electrical',
        icon: 'Zap',
        color: 'bg-yellow-100 text-yellow-600',
        description: 'Safe and reliable electrical repairs, installations, and maintenance.',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400',
        isActive: true,
        price: 199
    },
    {
        name: 'Home Appliance',
        icon: 'Refrigerator',
        color: 'bg-blue-100 text-blue-600',
        description: 'Professional repair and servicing for all your home appliances.',
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d58b7948?q=80&w=400',
        isActive: true,
        price: 399
    },
    {
        name: 'Plumbing',
        icon: 'Droplets',
        color: 'bg-cyan-100 text-cyan-600',
        description: 'Fast and efficient plumbing solutions for leaks and installations.',
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=400',
        isActive: true,
        price: 299
    },
    {
        name: 'Transport',
        icon: 'Truck',
        color: 'bg-green-100 text-green-700',
        description: 'Fast and reliable cargo, parcel, and goods delivery services.',
        image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=400',
        isActive: true,
        price: 999
    },
    {
        name: 'House Shifting',
        icon: 'Home',
        color: 'bg-indigo-100 text-indigo-700',
        description: 'Professional end-to-end house and office relocation services.',
        image: 'https://images.unsplash.com/photo-1603803835816-35bb3a52b0df?q=80&w=400',
        isActive: true,
        price: 1999
    },
    {
        name: 'Cleaning',
        icon: 'Sparkles',
        color: 'bg-purple-100 text-purple-600',
        description: 'Professional deep cleaning services for your home and office.',
        image: 'https://images.unsplash.com/photo-1581578731117-1045293d2f28?q=80&w=400',
        isActive: true,
        price: 899
    },
    {
        name: 'Pest Control',
        icon: 'ShieldCheck',
        color: 'bg-red-100 text-red-600',
        description: 'Effective pest management and control services for your home.',
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=400', // Reusing gardening/nature for now or different
        isActive: true,
        price: 999
    },
    {
        name: 'Gardening',
        icon: 'Droplets',
        color: 'bg-emerald-100 text-emerald-600',
        description: 'Professional gardening and landscaping maintenance.',
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=400',
        isActive: true,
        price: 499
    },
    {
        name: 'Painting',
        icon: 'Hammer',
        color: 'bg-indigo-100 text-indigo-600',
        description: 'High-quality wall painting and home renovation services.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185138a04b9?q=80&w=400',
        isActive: true,
        price: 4999
    },
    {
        name: 'Smart Home',
        icon: 'Zap',
        color: 'bg-blue-100 text-blue-600',
        description: 'Automation and technology setup for your modern home.',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=400',
        isActive: true,
        price: 799
    },
    {
        name: 'Security',
        icon: 'ShieldCheck',
        color: 'bg-slate-100 text-slate-600',
        description: 'CCTV and security system installation and maintenance.',
        image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=400',
        isActive: true,
        price: 2999
    },
    {
        name: 'Car Wash',
        icon: 'Droplets',
        color: 'bg-sky-100 text-sky-600',
        description: 'Professional car cleaning and detailing at your doorstep.',
        image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=400',
        isActive: true,
        price: 399
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected.');

        for (const cat of categoriesToSeed) {
            // Check by exact name or case-insensitive
            const exists = await Category.findOne({
                name: { $regex: new RegExp(`^${cat.name}$`, 'i') }
            });

            if (exists) {
                console.log(`Skipping ${cat.name} (Already exists as ${exists.name})`);
            } else {
                await Category.create(cat);
                console.log(`Created ${cat.name}`);
            }
        }

        console.log('Seeding Complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seed();
