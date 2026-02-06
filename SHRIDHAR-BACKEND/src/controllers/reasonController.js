const Reason = require('../models/Reason');
const AppError = require('../utils/AppError');

exports.getAllReasons = async (req, res, next) => {
    try {
        const { type } = req.query;
        const filter = { isActive: true };
        if (type) filter.type = type.toUpperCase();

        const reasons = await Reason.find(filter);

        res.status(200).json({
            status: 'success',
            results: reasons.length,
            data: { reasons }
        });
    } catch (error) {
        next(error);
    }
};

exports.createReason = async (req, res, next) => {
    try {
        const reason = await Reason.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { reason }
        });
    } catch (error) {
        next(error);
    }
};
