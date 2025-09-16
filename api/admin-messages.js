const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Verificar token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token requerido' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 's35-admin-secret-key-2024');

    // Por ahora retornamos mensajes mockeados
    // En el futuro esto se conectaría a una base de datos real
    const messages = [];

    return res.status(200).json(messages);

  } catch (error) {
    console.error('Error en admin-messages:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};
