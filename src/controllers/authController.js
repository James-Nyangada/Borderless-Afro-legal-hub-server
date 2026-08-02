const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined; // Remove password from output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.status !== 'active') {
    return next(new AppError('This account has been deactivated.', 403));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// Logout is handled mostly on client by destroying token, but we can send a success response
exports.logout = (req, res) => {
  res.status(200).json({ status: 'success' });
};

exports.getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.user.id).select('+password');
  
  if (req.body.password) {
    user.password = req.body.password;
  }
  
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  
  await user.save();

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});
