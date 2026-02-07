const Category = require('../models/Category');
const Service = require('../models/Service');
const AppError = require('../utils/AppError');

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({}).sort('order');
        console.log(`[DEBUG] CategoryController: Found ${categories.length} categories in DB`);

        // Find corresponding services for each category
        const categoryIds = categories.map(cat => cat._id);
        const services = await Service.find({
            category: { $in: categoryIds },
            isActive: true
        });

        // Merge service info into categories
        const categoriesWithServices = categories.map(category => {
            const service = services.find(s => s.category.toString() === category._id.toString());
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

        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory
            }
        });
    } catch (err) {
        console.error('[DEBUG] createCategory Error:', err);
        // Fallback if next is somehow undefined (should typically not happen in standard Express)
        if (typeof next === 'function') {
            return next(err);
        } else {
            return res.status(500).json({
                status: 'error',
                message: 'Internal Server Error (next undefined)',
                error: err.message
            });
        }
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
