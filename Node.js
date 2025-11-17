const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Car Photo Generator Server is running' });
});

// Image generation endpoint
app.post('/generate-image', async (req, res) => {
    try {
        const { prompt, apiKey } = req.body;

        // Validate input
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        if (!apiKey.startsWith('sk-')) {
            return res.status(400).json({ error: 'Invalid OpenAI API key format' });
        }

        console.log('Generating image with prompt:', prompt);

        // Call OpenAI DALL-E API
        const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard"
            })
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error('OpenAI API error:', errorData);
            return res.status(openaiResponse.status).json({ 
                error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` 
            });
        }

        const data = await openaiResponse.json();
        const imageUrl = data.data[0].url;

        console.log('Image generated successfully:', imageUrl);

        res.json({
            success: true,
            imageUrl: imageUrl,
            prompt: prompt
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: `Internal server error: ${error.message}` 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Car Photo Generator Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
