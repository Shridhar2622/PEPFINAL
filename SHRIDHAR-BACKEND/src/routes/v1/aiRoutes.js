const express = require('express');
const router = express.Router();
const aiController = require('../../controllers/aiController');

// All AI routes are under /api/v1/ai
router.post('/chat', aiController.chatWithAI);

module.exports = router;
