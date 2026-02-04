const Joi = require('joi');

const createService = {
    body: Joi.object().keys({
        title: Joi.string().required().max(100),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        originalPrice: Joi.number().min(0),
        headerImage: Joi.string(),
        category: Joi.string().required(),
        isActive: Joi.boolean()
    }),
};

const updateService = {
    params: Joi.object().keys({
        id: Joi.string().required() // Validate MongoID if possible, usually handled by mongoose cast error or string pattern
    }),
    body: Joi.object().keys({
        title: Joi.string().max(100),
        description: Joi.string(),
        price: Joi.number().min(0),
        category: Joi.string(),
        isActive: Joi.boolean()
    }).min(1),
};

const getServices = {
    query: Joi.object().keys({
        category: Joi.string(),
        worker: Joi.string(),
        search: Joi.string(), // Text search on title
        minPrice: Joi.number(),
        maxPrice: Joi.number(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer()
    }),
};

module.exports = {
    createService,
    updateService,
    getServices,
};
