import mongoose from 'mongoose';

function generateCustomWalletAddress(name: string): string {
  const namePrefix = (name.substring(0, 4) + 'xxxx').substring(0, 4).toUpperCase();
  const randomNumbers = Math.floor(1000 + Math.random() * 9000);
  return `${namePrefix}${randomNumbers}`;
}

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    unique: true
  },
  pin: {
    type: String,
    required: false // Initially false as it will be set up later
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

accountSchema.pre('save', function(next) {
  if (!this.walletAddress) {
    this.walletAddress = generateCustomWalletAddress(this.name);
  }
  next();
});

accountSchema.index({ userId: 1 });
accountSchema.index({ walletAddress: 1 }, { unique: true });

if (mongoose.models.Account) {
  delete mongoose.models.Account;
}

export const Account = mongoose.model('Account', accountSchema);