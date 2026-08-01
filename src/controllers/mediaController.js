const Media = require('../models/Media');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { cloudinary } = require('../services/uploadService');

exports.getAllMedia = catchAsync(async (req, res, next) => {
  const media = await Media.find().populate('uploader', 'name email').sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: media.length,
    data: {
      media
    }
  });
});

exports.uploadMedia = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  const newMedia = await Media.create({
    filename: req.file.filename,
    url: req.file.path,
    fileType: req.file.mimetype,
    size: req.file.size,
    uploader: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: {
      media: newMedia
    }
  });
});

exports.deleteMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findById(req.params.id);

  if (!media) {
    return next(new AppError('No media found with that ID', 404));
  }

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(media.filename);

  // Delete from DB
  await media.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
});
