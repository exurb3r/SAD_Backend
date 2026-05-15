const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://192.168.1.17:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://sad-user-frontend.vercel.app'  
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
    credentials: true
};

module.exports = corsOptions;