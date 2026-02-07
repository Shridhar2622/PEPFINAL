const Category = require('../models/Category');
const Service = require('../models/Service');
const AppError = require('../utils/AppError');

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('order');

        // Find corresponding services for each category
        const categoryIds = categories.map(cat => cat.name);
        const services = await Service.find({
            category: { $in: categoryIds },
            isActive: true
        });

        // Merge service info into categories
        const categoriesWithServices = categories.map(category => {
            const service = services.find(s => s.category === category.name);
            return {
                ...category.toObject(),
                serviceId: service?._id || null,
                hasService: !!service
            };
        });

        res.status(200).json({
            status: 'success',
            results: categoriesWithServices.length,
            data: {
                categories: categoriesWithServices
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        console.log('[DEBUG] createCategory Request Body:', req.body);
        console.log('[DEBUG] createCategory Request File:', req.file);

        if (req.file) {
            req.body.image = req.file.path;
        } else if (!req.body.image) {
            delete req.body.image; // Allow default if empty
        }

        console.log('[DEBUG] Creating Category with data:', req.body);
        const newCategory = await Category.create(req.body);
        console.log('[DEBUG] Category Created:', newCategory);

        // Auto-create a corresponding service for this category - REMOVED for decoupled architecture
        // Categories are now just containers. Services must be created separately and linked to a category.

        console.log('[DEBUG] Category Created without automatic Service:', newCategory);

        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory
            }
        });
    } catch (err) {
        console.error('[DEBUG] createCategory Error:', err);
        next(err);
    }
};

exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return next(new AppError('No category found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }

        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return next(new AppError('No category found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return next(new AppError('No category found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
