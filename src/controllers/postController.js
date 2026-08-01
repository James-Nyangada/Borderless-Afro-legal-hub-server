const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { logActivity } = require('../services/activityLogger');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  // Auto-publish scheduled posts that have reached their publish date
  await Post.updateMany(
    { status: 'scheduled', publishDate: { $lte: new Date() } },
    { status: 'published' }
  );

  // Allow filtering by status, category, etc.
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.categories = req.query.category;
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const posts = await Post.find(filter)
    .populate('categories', 'name slug')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  // Auto-publish scheduled posts that have reached their publish date
  await Post.updateMany(
    { status: 'scheduled', publishDate: { $lte: new Date() } },
    { status: 'published' }
  );

  // Can get by ID or slug
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
    ? { _id: req.params.id } 
    : { slug: req.params.id };

  const post = await Post.findOne(query)
    .populate('categories', 'name slug');

  if (!post) {
    return next(new AppError('No post found with that ID or slug', 404));
  }

  // Increment view count if published
  if (post.status === 'published') {
    post.viewCount += 1;
    await post.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create(req.body);

  await logActivity('post', `Post created: "${newPost.title}"`);

  res.status(201).json({
    status: 'success',
    data: {
      post: newPost
    }
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  // Manually update fields
  Object.keys(req.body).forEach(key => {
    post[key] = req.body[key];
  });

  await post.save({ runValidators: true });

  await logActivity('post', `Post updated: "${post.title}"`);

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  await logActivity('post', `Post deleted: "${post.title || req.params.id}"`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
