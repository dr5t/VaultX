const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '🔐',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
