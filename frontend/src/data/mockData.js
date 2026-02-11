

// Using Unsplash images for reliability and better aesthetics
// High reliability images selected for stability
// Local Assets (Gemini Generated)
import acLocal from '../assets/services/ac_repair.png';
import plumbingLocal from '../assets/services/plumbing.png';
import electricalLocal from '../assets/services/electrical.png';
import cleaningLocal from '../assets/services/cleaning.png';
import pestControlLocal from '../assets/services/pest_control.png';
import basicLocal from '../assets/services/basic.png';
import premiumLocal from '../assets/services/premium.png';
import consultationLocal from '../assets/services/consultation.png';
import tvLocal from '../assets/services/tv_install.png';
import mixerLocal from '../assets/services/mixer_repair.png';
import dthLocal from '../assets/services/dth.png';
import inverterLocal from '../assets/services/inverter.png';
import paintingFullLocal from '../assets/services/full_painting.png';
import textureLocal from '../assets/services/texture_painting.png';
import carpentryLocal from '../assets/services/carpentry.png';
import fridgeLocal from '../assets/services/fridge.png';
const carpentryImg = carpentryLocal;
const plumbingImg = plumbingLocal;
const electricalImg = electricalLocal;
const acImg = acLocal;
const fridgeImg = fridgeLocal; // Fridge in room/kitchen
const washingMachineImg = 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=400';
const transportImg = 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=400';
const cleaningImg = cleaningLocal; // Clean room image
const cleaningIconImg = cleaningLocal; // Specific cleaning tools for category
const pestControlImg = pestControlLocal;
const gardeningImg = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400';
const paintingImg = 'https://images.unsplash.com/photo-1589939705384-5185138a04b9?auto=format&fit=crop&q=80&w=400';
const smartHomeImg = 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400';
const securityImg = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400';
const carWashImg = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=400';
const tvImg = tvLocal;
const fanImg = 'https://images.unsplash.com/photo-1565151443833-29bf2ba5dd8d?auto=format&fit=crop&q=80&w=400';
const mixerImg = mixerLocal;
const dthImg = dthLocal;
const geyserImg = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400'; // Using high quality tool image for geyser context
const inverterImg = inverterLocal;

export const categories = [
    { id: 'carpentry', name: 'Carpentry', icon: 'Hammer', color: 'bg-orange-100 text-orange-600', description: 'Expert furniture crafting, repairs, and custom woodwork solutions.', image: carpentryImg, isActive: true },
    { id: 'electrical', name: 'Electrical', icon: 'Zap', color: 'bg-yellow-100 text-yellow-600', description: 'Safe and reliable electrical repairs, installations, and maintenance.', image: electricalImg, isActive: true },
    { id: 'homeappliance', name: 'Home Appliance', icon: 'Refrigerator', color: 'bg-blue-100 text-blue-600', description: 'Professional repair and servicing for all your home appliances.', image: washingMachineImg, isActive: true }, // Using washing machine as generic home appliance
    { id: 'plumber', name: 'Plumber', icon: 'Droplets', color: 'bg-cyan-100 text-cyan-600', description: 'Fast and efficient plumbing solutions for leaks and installations.', image: plumbingImg, isActive: true },
    { id: 'transport', name: 'Transport', icon: 'Truck', color: 'bg-green-100 text-green-700', description: 'Fast and reliable cargo, parcel, and goods delivery services.', image: transportImg, isActive: true },
    { id: 'houseshifting', name: 'House Shifting', icon: 'Home', color: 'bg-indigo-100 text-indigo-700', description: 'Professional end-to-end house and office relocation services.', image: 'https://images.unsplash.com/photo-1603803835816-35bb3a52b0df?auto=format&fit=crop&q=80&w=400', isActive: true },
    { id: 'cleaning', name: 'Cleaning', icon: 'Sparkles', color: 'bg-purple-100 text-purple-600', description: 'Professional deep cleaning services for your home and office.', image: cleaningIconImg, isActive: true },
    { id: 'pestcontrol', name: 'Pest Control', icon: 'ShieldCheck', color: 'bg-red-100 text-red-600', description: 'Effective pest management and control services for your home.', image: pestControlImg, isActive: true },
    { id: 'gardening', name: 'Gardening', icon: 'Droplets', color: 'bg-emerald-100 text-emerald-600', description: 'Professional gardening and landscaping maintenance.', image: gardeningImg, isActive: true },
    { id: 'painting', name: 'Painting', icon: 'Hammer', color: 'bg-indigo-100 text-indigo-600', description: 'High-quality wall painting and home renovation services.', image: paintingImg, isActive: true },
    { id: 'smarthome', name: 'Smart Home', icon: 'Zap', color: 'bg-blue-100 text-blue-600', description: 'Automation and technology setup for your modern home.', image: smartHomeImg, isActive: true },
    { id: 'security', name: 'Security', icon: 'ShieldCheck', color: 'bg-slate-100 text-slate-600', description: 'CCTV and security system installation and maintenance.', image: securityImg, isActive: true },
    { id: 'carwash', name: 'Car Wash', icon: 'Droplets', color: 'bg-sky-100 text-sky-600', description: 'Professional car cleaning and detailing at your doorstep.', image: carWashImg, isActive: true },
];

export const services = [
    {
        id: 1,
        title: 'Expert Carpentry',
        category: 'carpentry',
        rating: 4.8,
        reviews: 124,
        price: 499,
        image: carpentryImg,
        description: 'Furniture repair, assembly, and custom woodwork. Professional carpenters.',
        isActive: true,
    },
    {
        id: 2,
        title: 'Washing Machine Repair',
        category: 'homeappliance',
        rating: 4.7,
        reviews: 89,
        price: 399,
        image: washingMachineImg,
        description: 'Diagnosis and repair of all washing machine brands (LG, Samsung, IFB, etc).',
        isActive: true,
    },
    {
        id: 3,
        title: 'General Plumbing',
        category: 'plumber',
        rating: 4.9,
        reviews: 215,
        price: 599,
        image: plumbingImg,
        description: 'Leak repair, pipe fitting, and bathroom general plumbing.',
        isActive: true,
    },
    {
        id: 4,
        title: 'Electrician - General',
        category: 'electrical',
        rating: 4.6,
        reviews: 56,
        price: 199,
        image: electricalImg,
        description: 'Fan repair, light installation, socket replacement, and more.',
        isActive: true,
    },
    {
        id: 5,
        title: 'Refrigerator Repair',
        category: 'homeappliance',
        rating: 4.8,
        reviews: 92,
        price: 449,
        image: fridgeImg,
        description: 'Expert repair for single and double door refrigerators.',
        isActive: true,
    },
    {
        id: 6,
        title: 'Cargo & Parcel',
        category: 'transport',
        rating: 4.8,
        reviews: 32,
        price: 999,
        image: transportImg,
        description: 'Reliable transport for commercial goods and parcel delivery.',
        isActive: true,
    },
    {
        id: 32,
        title: 'Full House Shifting',
        category: 'houseshifting',
        rating: 4.9,
        reviews: 45,
        price: 199,
        image: 'https://images.unsplash.com/photo-1603803835816-35bb3a52b0df?auto=format&fit=crop&q=80&w=800',
        description: 'Professional relocation. Final price fixed after distance verification during consultation.',
        isActive: true,
    },
    {
        id: 7,
        title: 'Deep Home Cleaning',
        category: 'cleaning',
        rating: 4.8,
        reviews: 67,
        price: 899,
        image: cleaningIconImg,
        description: 'Full home deep cleaning service. Kitchen, Bathroom, Living room.',
        isActive: true,
    },
    {
        id: 8,
        title: 'Expert AC Repair',
        category: 'homeappliance',
        rating: 4.8,
        reviews: 150,
        price: 599,
        image: acImg,
        description: 'Split and Window AC repair, gas charging, and installation.',
        isActive: true,
    },
    // Electrical Services
    {
        id: 9,
        title: 'Inverter Installation',
        category: 'electrical',
        rating: 4.7,
        reviews: 42,
        price: 499,
        image: inverterImg,
        description: 'Safe installation of inverter and battery setup.',
        isActive: true,
    },
    {
        id: 10,
        title: 'Geyser Installation',
        category: 'electrical',
        rating: 4.8,
        reviews: 88,
        price: 399,
        image: geyserImg,
        description: 'Instant and storage geyser installation and repair.',
        isActive: true,
    },
    {
        id: 11,
        title: 'Fan Installation',
        category: 'electrical',
        rating: 4.6,
        reviews: 120,
        price: 149,
        image: fanImg,
        description: 'Ceiling and exhaust fan installation.',
        isActive: true,
    },
    // Home Appliance Services
    {
        id: 12,
        title: 'DTH Installation',
        category: 'homeappliance',
        rating: 4.5,
        reviews: 30,
        price: 299,
        image: dthImg,
        description: 'DTH dish installation and signal setting.',
        isActive: true,
    },
    {
        id: 13,
        title: 'Split AC Installation',
        category: 'homeappliance',
        rating: 4.9,
        reviews: 210,
        price: 999,
        image: acImg,
        description: 'Professional Split AC installation with drill work.',
        isActive: true,
    },
    {
        id: 14,
        title: 'Window AC Service',
        category: 'homeappliance',
        rating: 4.7,
        reviews: 95,
        price: 499,
        image: acImg,
        description: 'Wet servicing for Window AC units.',
        isActive: true,
    },
    {
        id: 15,
        title: 'Gas Refill & Checkup',
        category: 'homeappliance',
        rating: 4.8,
        reviews: 60,
        price: 1499,
        image: acImg,
        description: 'AC gas top-up and leakage inspection.',
        isActive: true,
    },
    {
        id: 16,
        title: 'Mixer Grinder Repair',
        category: 'homeappliance',
        rating: 4.4,
        reviews: 25,
        price: 199,
        image: mixerImg,
        description: 'Motor repair and jar coupler replacement.',
        isActive: true,
    },
    {
        id: 17,
        title: 'TV Installation',
        category: 'homeappliance',
        rating: 4.8,
        reviews: 140,
        price: 399,
        image: tvImg,
        description: 'Wall mount installation for LED/LCD TVs.',
        isActive: true,
    },
    // Plumbing
    {
        id: 18,
        title: 'Plumbing Service',
        category: 'plumber',
        rating: 4.8,
        reviews: 90,
        price: 299,
        image: plumbingImg,
        description: 'General plumbing inspection and minor fixes.',
        isActive: true,
    },
    // Carpentry Extras
    {
        id: 19,
        title: 'Door Repair',
        category: 'carpentry',
        rating: 4.6,
        reviews: 55,
        price: 349,
        image: carpentryImg,
        description: 'Hinge fixing, lock replacement, and alignment.',
        isActive: true,
    },
    // Pest Control
    {
        id: 20,
        title: 'Complete Pest Control',
        category: 'pestcontrol',
        rating: 4.8,
        reviews: 142,
        price: 999,
        image: pestControlImg,
        description: 'Treatment for cockroaches, ants, and other common pests.',
        isActive: true,
    },
    {
        id: 21,
        title: 'Termite Treatment',
        category: 'pestcontrol',
        rating: 4.9,
        reviews: 86,
        price: 2499,
        image: pestControlImg,
        description: 'Anti-termite treatment with 5-year warranty.',
        isActive: true,
    },
    // Gardening
    {
        id: 22,
        title: 'Garden Maintenance',
        category: 'gardening',
        rating: 4.7,
        reviews: 65,
        price: 499,
        image: gardeningImg,
        description: 'Lawn mowing, pruning, and general garden cleanup.',
        isActive: true,
    },
    {
        id: 23,
        title: 'Plant Consultation',
        category: 'gardening',
        rating: 4.8,
        reviews: 34,
        price: 299,
        image: gardeningImg,
        description: 'Expert advice on plant care and garden layout.',
        isActive: true,
    },
    // Painting
    {
        id: 24,
        title: 'Full Home Painting',
        category: 'painting',
        rating: 4.9,
        reviews: 110,
        price: 4999,
        image: paintingFullLocal,
        description: 'Complete interior painting with premium finish.',
        isActive: true,
    },
    {
        id: 25,
        title: 'Single Wall Texture',
        category: 'painting',
        rating: 4.7,
        reviews: 45,
        price: 1499,
        image: textureLocal,
        description: 'Decorative texture painting for accent walls.',
        isActive: true,
    },
    // Smart Home
    {
        id: 26,
        title: 'Smart Lighting Setup',
        category: 'smarthome',
        rating: 4.8,
        reviews: 58,
        price: 799,
        image: smartHomeImg,
        description: 'Installation and configuration of smart bulbs and switches.',
        isActive: true,
    },
    {
        id: 27,
        title: 'Home Theater Setup',
        category: 'smarthome',
        rating: 4.9,
        reviews: 29,
        price: 1999,
        image: smartHomeImg,
        description: 'Professional audio-visual system installation.',
        isActive: true,
    },
    // Security
    {
        id: 28,
        title: 'CCTV Installation',
        category: 'security',
        rating: 4.9,
        reviews: 165,
        price: 2999,
        image: securityImg,
        description: 'High-definition security camera setup with mobile access.',
        isActive: true,
    },
    {
        id: 29,
        title: 'Smart Lock Fitting',
        category: 'security',
        rating: 4.8,
        reviews: 74,
        price: 1299,
        image: securityImg,
        description: 'Installation of high-security digital smart locks.',
        isActive: true,
    },
    // Car Wash
    {
        id: 30,
        title: 'Eco-Friendly Car Wash',
        category: 'carwash',
        rating: 4.7,
        reviews: 210,
        price: 399,
        image: carWashImg,
        description: 'Waterless detailing and interior cleaning at your home.',
        isActive: true,
    },
    {
        id: 31,
        title: 'Full Car Detailing',
        category: 'carwash',
        rating: 4.9,
        reviews: 120,
        price: 1499,
        image: carWashImg,
        description: 'Deep cleaning, waxing, and polishing for a showroom look.',
        isActive: true,
    },
];

export const bookings = [
    {
        id: 101,
        serviceId: 1,
        serviceName: 'Expert Carpentry',
        status: 'Pending',
        date: 'Oct 24, 2023',
        time: '10:00 AM',
        price: 499,
        technician: null,
        image: carpentryImg
    },
    {
        id: 102,
        serviceId: 3,
        serviceName: 'General Plumbing',
        status: 'Assigned',
        date: 'Oct 22, 2023',
        time: '2:30 PM',
        price: 599,
        technician: {
            name: 'Rajesh Kumar',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
            phone: '+91 98765 43210',
            email: 'rajesh.k@reservice.com',
            experience: '8 Years'
        },
        image: plumbingImg
    },
    {
        id: 103,
        serviceId: 2,
        serviceName: 'Washing Machine Repair',
        status: 'Completed',
        date: 'Oct 15, 2023',
        time: '11:00 AM',
        price: 399,
        technician: {
            name: 'Priya Sharma',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
            phone: '+91 87654 32109',
            email: 'priya.s@reservice.com',
            experience: '5 Years'
        },
        image: washingMachineImg
    },
    {
        id: 104,
        serviceId: 4,
        serviceName: 'Electrician - General',
        status: 'Completed',
        date: 'Sep 28, 2023',
        time: '4:00 PM',
        price: 199,
        technician: {
            name: 'Amit Singh',
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
            phone: '+91 76543 21098',
            email: 'amit.s@reservice.com',
            experience: '12 Years'
        },
        image: electricalImg
    },
    {
        id: 105,
        serviceId: 5,
        serviceName: 'Refrigerator Repair',
        status: 'Canceled',
        date: 'Aug 10, 2023',
        time: '12:00 PM',
        price: 449,
        technician: null,
        image: fridgeImg
    }
];
