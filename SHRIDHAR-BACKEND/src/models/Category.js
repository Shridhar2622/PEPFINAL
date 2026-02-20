const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A category must have a name'],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [40, 'A category name must have less or equal then 40 characters']
    },
    slug: String,
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

categorySchema.virtual('id').get(function () {
    return this.slug || this._id;
});

categorySchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name.toLowerCase();
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
