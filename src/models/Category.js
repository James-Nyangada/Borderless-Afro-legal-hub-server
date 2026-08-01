const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category must have a name'],
      unique: true
    },
    slug: {
      type: String,
      unique: true
    },
    description: String,
    icon: String, // Can be a CSS class or emoji/identifier
    color: String
  },
  {
    timestamps: true
  }
);

categorySchema.pre('save', async function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
