import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ArrowRight, Star, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// import { useAdmin } from '../../context/AdminContext';
import MobileHeader from '../../components/mobile/MobileHeader';
import MobileBottomNav from '../../components/mobile/MobileBottomNav';
import MobileServiceDetail from '../../pages/Services/MobileServiceDetail';
import { useNavigate } from 'react-router-dom';

const HERO_SLIDES = [
  {
    id: 1,
    serviceId: 8, // Expert AC Repair
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600", // AC Repair
    title: "Expert AC Repair",
    subtitle: "Cooling solutions in minutes"
  },
  {
    id: 2,
    serviceId: 1, // Custom Carpentry
    image: "https://images.unsplash.com/photo-1603533867307-b354255e3c32?auto=format&fit=crop&q=80&w=600", // Custom/Expert Carpentry
    title: "Custom Carpentry",
    subtitle: "Furniture repair & assembly"
  },
  {
    id: 3,
    serviceId: 4, // Electrical
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600", // Electrical
    title: "Electrical Safety",
    subtitle: "Certified electricians"
  },
  {
    id: 4,
    serviceId: 3, // Plumbing
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=600", // Plumbing
    title: "Plumbing Pros",
    subtitle: "Leak repairs & installation"
  },
  {
    id: 5,
    serviceId: 5, // Fridge
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600", // Appliances
    title: "Appliance Fixes",
    subtitle: "Fridge, Washer & more"
  },
  {
    id: 6,
    serviceId: 6, // Transport
    image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=600", // Transport
    title: "Safe Transport",
    subtitle: "Cargo & Goods delivery"
  },
  {
    id: 8,
    serviceId: 32, // House Shifting
    image: "https://images.unsplash.com/photo-1603803835816-35bb3a52b0df?auto=format&fit=crop&q=80&w=600",
    title: "House Shifting",
    subtitle: "Hassle-free relocation"
  },
  {
    id: 7,
    serviceId: 7, // Deep Cleaning
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600", // Deep Cleaning
    title: "Deep Cleaning",
    subtitle: "Spotless home guaranteed"
  }
];

const MobileHomePage = ({ services = [], categories = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const navigate = useNavigate();
  // const { services, categories } = useAdmin(); // REMOVED: Props are passed now

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-cycle categories scale effect (only if no filter selected)
  useEffect(() => {
    if (activeCategoryFilter !== 'All') return;
    const interval = setInterval(() => {
      setActiveCategoryIndex((prev) => (prev + 1) % 8);
    }, 1500);
    return () => clearInterval(interval);
  }, [activeCategoryFilter]);

  // Handle Categories Rotation (Interchange)
  useEffect(() => {
    const activeCategories = categories.filter(c => c.isActive !== false);
    if (activeCategories.length <= 8) return;

    const rotationInterval = setInterval(() => {
      setRotationIndex((prev) => (prev + 4) % activeCategories.length);
    }, 30000); // Rotate every 30 seconds

    return () => clearInterval(rotationInterval);
  }, []);

  const getVisibleCategories = () => {
    const activeCategories = categories.filter(c => c.isActive !== false);
    if (activeCategories.length <= 8) return activeCategories;

    const visible = [];
    for (let i = 0; i < 8; i++) {
      const index = (rotationIndex + i) % activeCategories.length;
      visible.push(activeCategories[index]);
    }
    return visible;
  };

  const [activeCardId, setActiveCardId] = useState(null);

  // Intersection Observer for Zoom & Rotating Border Effect
  const observerRef = useRef(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      // Only apply scroll-driven active class on mobile
      if (window.innerWidth >= 768) return;

      // Home-Specific: Elegant center capture for tall cards
      const bestEntry = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (bestEntry && bestEntry.intersectionRatio > 0.15) {
        const newId = bestEntry.target.dataset.id; // Keep as string
        setActiveCardId(prev => (prev === newId ? prev : newId));
      }
    }, {
      threshold: [0, 0.5, 1], // Reduced threshold density for performance
      rootMargin: "-15% 0px -15% 0px"
    });

    const cards = document.querySelectorAll('.zoom-card');
    cards.forEach(card => observerRef.current.observe(card));

    return () => observerRef.current.disconnect();
  }, [services]);

  const handleHeroClick = (slide) => {
    if (slide.serviceId) {
      // Find the service object if possible
      const service = services.find(s => String(s.id || s._id) === String(slide.serviceId));
      if (service) {
        setSelectedService(service);
        setIsMobileDetailOpen(true);
      }
    }
  };

  const handleCategoryClick = (cat) => {
    // Redirect to Services page with strict filtering
    navigate('/services', { state: { category: cat.name || cat.id } });
  };

  // Show only 7 services on Home Page as requested
  const displayedServices = React.useMemo(() => services.filter(s => s.isActive !== false).slice(0, 7), [services]);

  return (
    <div className="min-h-screen bg-[#FFFBF5] dark:bg-slate-950 pb-24 font-sans">
      <AnimatePresence>
        {selectedServiceId && (
          <MobileServiceDetail
            service={services.find(s => s.id === selectedServiceId)}
            onClose={() => setSelectedServiceId(null)}
          />
        )}
      </AnimatePresence>

      <MobileHeader />

      <main className="relative px-2 pt-2">
        {/* Immersive Hero Section */}
        <section
          className="relative h-[65vh] w-full overflow-hidden rounded-[2.5rem] shadow-2xl z-0 cursor-pointer active:scale-[0.98] transition-all duration-300"
          onClick={() => handleHeroClick(HERO_SLIDES[currentSlide])}
        >
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentSlide}
              src={HERO_SLIDES[currentSlide].image}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            />
          </AnimatePresence>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 w-full p-6 pb-12 flex flex-col gap-2 z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="inline-block px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 shadow-lg shadow-rose-500/30">
                Premium Services
              </span>
              <h1 className="text-4xl font-black text-white leading-none mb-2 tracking-tight">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="text-slate-200 text-lg font-medium opacity-90">
                {HERO_SLIDES[currentSlide].subtitle}
              </p>
            </motion.div>

            {/* Glassmorphic Search Bar */}
            <motion.div
              className="mt-6 relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent hero click
                navigate('/search');
              }}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                readOnly
                className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium text-sm shadow-xl cursor-text"
                placeholder="What can we help you with?"
              />
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="px-5 -mt-8 relative z-10">
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Categories
              </h3>
              <span className="text-xs font-semibold text-rose-500 flex items-center cursor-pointer" onClick={() => navigate('/services')}>View All <ArrowRight className="w-3 h-3 ml-1" /></span>
            </div>
            <div className="grid grid-cols-4 gap-y-6 gap-x-2 relative min-h-40">
              <AnimatePresence mode="popLayout" initial={false}>
                {getVisibleCategories().map((cat, idx) => {
                  const isAutoActive = idx === activeCategoryIndex;

                  return (
                    <motion.div
                      key={cat.id}
                      layout
                      className="flex flex-col items-center gap-2 cursor-pointer"
                      initial={{ opacity: 0, x: 20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 30,
                        mass: 1,
                        delay: idx * 0.03
                      }}
                      onClick={() => handleCategoryClick(cat.id)}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-700
                        ${isAutoActive ? 'scale-110 border-rose-600 ring-2 ring-rose-200 dark:ring-rose-900 shadow-lg' : ''}`}>
                        <img src={cat.image} className="w-full h-full object-cover opacity-90" alt={cat.name} />
                      </div>
                      <span className={`text-[10px] font-bold text-center leading-3 transition-colors duration-500 ${isAutoActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>{cat.name}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        {/* Popular Services - Now Category Based */}
        <section className="px-5 mt-8 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 fill-current" />
            Top Booked Categories
          </h2>

          <div className="flex flex-col gap-6">
            {categories.filter(c => c.isActive !== false).map((cat, idx) => {
              const uniqueKey = cat.id || cat._id || idx;

              // Find first service in this category for data fallback
              const relatedService = services.find(s => s.category?.toLowerCase() === cat.name?.toLowerCase());
              const price = cat.price || relatedService?.price || 0;
              const rating = cat.rating || relatedService?.rating || 'New';

              return (
                <div
                  key={uniqueKey}
                  data-id={uniqueKey}
                  onClick={() => setSelectedServiceId(relatedService?._id || relatedService?.id)}
                  className={`zoom-card relative rounded-4xl ring-1 ring-transparent dark:ring-white/5 transition-all duration-300 transform rotating-border-home ${String(activeCardId) === String(uniqueKey) ? 'active scale-[1.02] shadow-2xl' : 'scale-100 shadow-md'} cursor-pointer active:scale-[0.98] mb-4`}
                >
                  {/* Inner Content Wrapper */}
                  <div className="rounded-4xl overflow-hidden w-full h-full relative z-10 bg-white dark:bg-slate-900 isolation-isolate">
                    {/* Image Section */}
                    <div className="h-48 relative overflow-hidden rounded-t-4xl">
                      <img
                        src={cat.image || relatedService?.image}
                        alt={cat.name}
                        className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${String(activeCardId) === String(uniqueKey) ? 'scale-110' : 'scale-100'}`}
                      />
                      <div className="absolute top-0 inset-x-0 h-16 bg-linear-to-b from-black/50 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-black dark:text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
                          Best Seller
                        </span>
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{cat.name}</h3>
                        <div className="bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-sm">
                          {rating} <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5 text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                        <span>Home Services</span>
                        <span className="mx-1">•</span>
                        <span>45 Mins</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-dashed border-gray-100 dark:border-slate-800 pt-3 gap-3">
                        <div className="flex flex-col">
                          {cat.originalPrice && (
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase line-through">₹{cat.originalPrice}</span>
                          )}
                          <span className="text-lg font-black text-gray-900 dark:text-white">₹{price}</span>
                        </div>
                        <div className="flex gap-2 flex-1 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(cat);
                            }}
                            className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border border-slate-100 dark:border-slate-700 active:scale-95 transition-all"
                          >
                            Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Logic for booking: if a service exists, use it, else create a dummy payload for the modal
                              const serviceData = relatedService || { title: cat.name, price: price, category: cat.name, id: uniqueKey };
                              // We use another state for the booking modal if needed, but here let's trigger the detail view for booking
                              setSelectedServiceId(serviceData._id || serviceData.id);
                            }}
                            className="bg-rose-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide active:scale-95 transition-colors shadow-lg shadow-rose-600/20"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <MobileBottomNav />
    </div >
  );
};

export default MobileHomePage;
