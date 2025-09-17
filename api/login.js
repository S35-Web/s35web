// api/login.js - Endpoint específico de login
const jwt = require('jsonwebtoken');

// Datos de usuarios
const users = [
    {
        _id: '1',
        username: 'admin',
        password: 'admin123',
        userType: 'pdc',
        email: 'admin@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '2',
        username: 'ventas1',
        password: 'ventas123',
        userType: 'pos',
        email: 'ventas1@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '3',
        username: 'cliente1',
        password: 'cliente123',
        userType: 'client',
        email: 'cliente1@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Debug logging
    console.log('Login API - Method:', req.method);
    console.log('Login API - URL:', req.url);
    console.log('Login API - Headers:', req.headers);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            const { username, password } = JSON.parse(req.body);
            const user = users.find(u => u.username === username && u.password === password);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            const token = jwt.sign(
                { userId: user._id, username: user.username, userType: user.userType },
                process.env.JWT_SECRET || 's35-admin-secret-key-2024',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    userType: user.userType,
                    email: user.email
                }
            });
        }

        // Si no es POST, devolver información de debug
        return res.status(405).json({
            success: false,
            message: 'Método no permitido',
            debug: {
                method: req.method,
                url: req.url,
                expected: 'POST'
            }
        });

    } catch (error) {
        console.error('Error en login API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
