const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../services/emailService');

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const adminUrl = process.env.ADMIN_URL || req.headers.origin || 'http://localhost:3001';
  const resetURL = `${adminUrl}/admin/reset-password?token=${resetToken}`;

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0b192c;">Password Reset Request</h2>
      <p>Forgot your password? Click the link below to reset it.</p>
      <div style="margin: 30px 0;">
        <a href="${resetURL}" style="background-color: #0b192c; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
      </div>
      <p>If you didn't forget your password, please ignore this email!</p>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:<br/> ${resetURL}</p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      html: message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select('+password');

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT
  createSendToken(user, 200, res);
});
