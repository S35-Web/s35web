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

    // Por ahora retornamos estadísticas mockeadas
    // En el futuro esto se conectaría a una base de datos real
    const stats = {
      totalMessages: 0,
      newMessages: 0,
      todayMessages: 0
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Error en admin-stats:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};
