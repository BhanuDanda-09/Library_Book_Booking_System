const jwt  = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log(req.headers.authorization);

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log("TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    console.log(err);

    res.status(401).json({
      success: false,
      message: 'Token invalid or expired.'
    });
  }
};
