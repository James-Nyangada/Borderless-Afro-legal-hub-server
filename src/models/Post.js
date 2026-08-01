const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post must have a title'],
      trim: true
    },
    slug: {
      type: String,
      unique: true
    },
    content: {
      type: String,
      required: [true, 'A post must have content']
    },
    excerpt: {
      type: String
    },
    featuredImages: [
      {
        type: String
      }
    ],
    categories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
      }
    ],
    tags: [String],
    author: {
      type: String,
      required: [true, 'A post must have an author name']
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft'
    },
    publishDate: {
      type: Date
    },
    viewCount: {
      type: Number,
      default: 0
    },
    seoTitle: String,
    seoDescription: String
  },
  {
    timestamps: true
  }
);

// Text Indexing for search
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

postSchema.pre('save', async function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
    
    // Ensure slug is unique
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const postsWithSlug = await this.constructor.find({ _id: { $ne: this._id }, slug: slugRegEx });
    
    if (postsWithSlug.length > 0) {
      this.slug = `${this.slug}-${postsWithSlug.length + 1}`;
    }
  }
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
