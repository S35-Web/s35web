const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password, userType } = req.body;

    // Verificar credenciales
    if (userType === 'colaboradores') {
      if (username === 'admin' && password === 'password') {
        // Generar token JWT
        const token = jwt.sign(
          { 
            username: 'admin', 
            userType: 'colaboradores',
            role: 'admin'
          },
          process.env.JWT_SECRET || 's35-admin-secret-key-2024',
          { expiresIn: '24h' }
        );

        return res.status(200).json({
          success: true,
          message: 'Login exitoso',
          token: token,
          user: {
            username: 'admin',
            userType: 'colaboradores',
            role: 'admin'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }
    } else if (userType === 'clientes') {
      // Para clientes, podrías implementar un sistema diferente
      return res.status(200).json({
        success: true,
        message: 'Acceso de clientes - En desarrollo',
        token: 'client-token',
        user: {
          username: username,
          userType: 'clientes',
          role: 'client'
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuario no válido'
      });
    }

  } catch (error) {
    console.error('Error en admin-login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
