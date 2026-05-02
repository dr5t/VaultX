const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    masterPasswordHash: {
      type: String,
      required: true,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash master password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('masterPasswordHash')) return next();
  this.masterPasswordHash = await bcrypt.hash(this.masterPasswordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.masterPasswordHash);
};

module.exports = mongoose.model('User', userSchema);
