const Joi = require('joi');

const updateMe = {
    body: Joi.object().keys({
        name: Joi.string(),
        email: Joi.string().email(),
        phone: Joi.string(),
        address: Joi.string(),
        profilePhoto: Joi.string(),
        location: Joi.object().keys({
            type: Joi.string().valid('Point'),
            coordinates: Joi.array().items(Joi.number()).length(2), // [lng, lat]
            address: Joi.string().optional(),
            description: Joi.string().optional()
        })
    }).min(1), // At least one field must be present
};

const updatePassword = {
    body: Joi.object().keys({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().required().min(8),
        confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({ 'any.only': 'Passwords must match' }),
    }),
};

module.exports = {
    updateMe,
    updatePassword,
};
