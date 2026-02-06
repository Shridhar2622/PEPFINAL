const axios = require('axios');
const AppError = require('../utils/AppError');

/**
 * Handle AI Chat queries using OpenRouter
 * @route POST /api/v1/ai/chat
 */
exports.chatWithAI = async (req, res, next) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return next(new AppError('Please provide a message', 400));
        }

        const systemPrompt = `You are the Reservice AI Assistant, a professional and helpful expert on home services in India. 
        Reservice offers:
        - Home Repairs: Plumbing, Electrical, AC Repair, Carpentry.
        - Cleaning: Deep House Cleaning, Sofa/Carpet Cleaning, Kitchen Cleaning.
        - Transport: Packers & Movers, Local shifting, Vehicle transport , Cab booking.
        - Beauty: Salon at home, Massage for men/women.
        - Appliances: Washing Machine, Refrigerator, Microwave repair.

        Guidelines:
        - Be polite, concise, and helpful.
        - Use Indian Rupee (₹) for any price mentions.
        - If a user asks for pricing, give a range based on common industry standards in India (e.g., Deep cleaning starts at ₹1499, AC service at ₹499).
        - Always encourage users to book through the Reservice app for guaranteed quality.
        - If you don't know the answer, politely suggest they contact Reservice support.
        - Keep responses short and formatted for a mobile chat interface.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: 'user', content: message }
        ];

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openrouter/free', 
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://reservice.com', // Replace with your site URL
                'X-Title': 'Reservice AI'
            }
        });

        const reply = response.data.choices[0].message.content;

        res.status(200).json({
            status: 'success',
            data: {
                reply
            }
        });
    } catch (error) {
        console.error('AI Chat Error:', error.response?.data || error.message);
        next(new AppError('Failed to get a response from AI service', 500));
    }
};
