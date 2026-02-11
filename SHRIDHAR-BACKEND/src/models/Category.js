const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A category must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A category name must have less or equal then 40 characters']
    },
    slug: String,
    image: {
        type: String,
        default: 'default-category.jpg'
    },
    icon: {
        type: String,
        default: 'Hammer'
    },
    color: {
        type: String,
        default: 'bg-indigo-100 text-indigo-600'
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    originalPrice: {
        type: Number
    },
    rating: {
        type: Number,
        default: 0
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

categorySchema.virtual('id').get(function () {
    return this.slug; // Use slug as ID for frontend compatibility if needed
});

categorySchema.pre('save', function (next) {
    console.log('[DEBUG] Category pre-save hook running for:', this.name);
    try {
        if (this.name) {
            this.slug = slugify(this.name, { lower: true });
        }
        if (typeof next === 'function') {
            next();
        } else {
            console.error('[DEBUG] pre-save hook: next is not a function!', next);
        }
    } catch (error) {
        console.error('[DEBUG] Category pre-save hook error:', error);
        next(error);
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
