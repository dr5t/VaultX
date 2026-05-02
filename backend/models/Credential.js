const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    siteName: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['social', 'education', 'banking', 'work', 'custom', 'other'],
      default: 'other',
    },
    notes: {
      type: String,
      default: '',
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Text index for search
credentialSchema.index({ siteName: 'text', username: 'text' });

module.exports = mongoose.model('Credential', credentialSchema);
