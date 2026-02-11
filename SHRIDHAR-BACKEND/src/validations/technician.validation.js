const Joi = require('joi');

const createProfile = {
    body: Joi.object().keys({
        bio: Joi.string().max(500),
        skills: Joi.array().items(Joi.string().trim()).min(1).single().required(),
        profilePhoto: Joi.string(),
        location: Joi.object().keys({
            type: Joi.string().valid('Point').default('Point'),
            coordinates: Joi.array().items(Joi.number()).length(2).required(),
            address: Joi.string()
        })
    }),
};

const updateProfile = {
    body: Joi.object().keys({
        bio: Joi.string().max(500),
        skills: Joi.array().items(Joi.string().trim()).single(),
        profilePhoto: Joi.string(),
        isOnline: Joi.boolean(),
        location: Joi.object().keys({
            type: Joi.string().valid('Point'),
            coordinates: Joi.array().items(Joi.number()).length(2),
            address: Joi.string()
        }),
        documents: Joi.object().keys({
            aadharCard: Joi.string(),
            panCard: Joi.string(),
            resume: Joi.string(),
            verificationStatus: Joi.string().valid('PENDING', 'VERIFIED', 'REJECTED')
        })
    }).min(1),
};

const getTechnicians = {
    query: Joi.object().keys({
        skills: Joi.string(), // Comma separated
        rating: Joi.number().min(0).max(5),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer()
    }),
};

module.exports = {
    createProfile,
    updateProfile,
    getTechnicians,
};
