import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const securityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PIN_SETUP', 'PIN_CHANGE', 'PIN_VERIFIED', 'PIN_BLOCKED', 'PIN_RESET', 'BIOMETRIC_SETUP', 'BIOMETRIC_VERIFIED', 'PHONE_VERIFIED'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: String,
  metadata: mongoose.Schema.Types.Mixed
});

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true 
  },
  village: { 
    type: String, 
    required: true 
  },
  district: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    required: true 
  },
  pincode: { 
    type: String, 
    required: true 
  },
  aadhaarNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  preferredLanguage: { 
    type: String, 
    default: 'english' 
  },

  security: {
    biometric: {
      enabled: { 
        type: Boolean, 
        default: false 
      },
      deviceId: { 
        type: String 
      },
      lastVerified: { 
        type: Date 
      }
    },

    pin: {
      enabled: { 
        type: Boolean, 
        default: false 
      },
      value: { 
        type: String 
      },
      lastChanged: { 
        type: Date 
      },
      attempts: { 
        type: Number, 
        default: 0 
      },
      blocked: { 
        type: Boolean, 
        default: false 
      },
      blockExpires: { 
        type: Date 
      },
      requiresChange: { 
        type: Boolean, 
        default: false 
      }
    },

    previousPins: {
      type: [String],
      default: [],
      validate: [
        function(val: string[]) {
          return val.length <= 3;
        },
        'Cannot store more than 3 previous PINs'
      ]
    },

    phoneVerified: { 
      type: Boolean, 
      default: false 
    },
    phoneVerificationCode: { 
      type: String 
    },
    phoneVerificationExpiry: { 
      type: Date 
    },

    events: {
      type: [securityEventSchema],
      default: []
    },

    lastSuccessfulLogin: { 
      type: Date 
    },
    lastFailedLogin: { 
      type: Date 
    }
  }
}, {
  timestamps: true
});

userSchema.index({ 'security.pin.enabled': 1 });
userSchema.index({ phone: 1 });
userSchema.index({ aadhaarNumber: 1 });

userSchema.methods.isPinBlocked = function() {
  if (!this.security.pin.blocked) return false;
  if (!this.security.pin.blockExpires) return false;
  return new Date() < this.security.pin.blockExpires;
};

userSchema.methods.verifyPin = async function(pin: string): Promise<boolean> {
  if (this.isPinBlocked()) {
    const timeLeft = Math.ceil((this.security.pin.blockExpires.getTime() - Date.now()) / (1000 * 60));
    throw new Error(`PIN is blocked. Try again in ${timeLeft} minutes.`);
  }

  const isValid = await bcrypt.compare(pin, this.security.pin.value);
  
  if (!isValid) {
    await this.recordFailedPinAttempt();
    const remainingAttempts = 5 - this.security.pin.attempts;
    throw new Error(`Invalid PIN. ${remainingAttempts} attempts remaining`);
  }

  await this.resetPinAttempts();
  
  this.security.events.push({
    type: 'PIN_VERIFIED',
    timestamp: new Date(),
    details: 'PIN verified successfully'
  });

  return true;
};

userSchema.methods.recordFailedPinAttempt = async function() {
  this.security.pin.attempts += 1;
  this.security.lastFailedLogin = new Date();
  
  if (this.security.pin.attempts >= 5) {
    this.security.pin.blocked = true;
    this.security.pin.blockExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes block
    
    this.security.events.push({
      type: 'PIN_BLOCKED',
      timestamp: new Date(),
      details: 'PIN blocked due to multiple failed attempts'
    });
  }
  
  await this.save();
};

userSchema.methods.resetPinAttempts = async function() {
  this.security.pin.attempts = 0;
  this.security.pin.blocked = false;
  this.security.pin.blockExpires = undefined;
  this.security.lastSuccessfulLogin = new Date();
  await this.save();
};

userSchema.methods.setPin = async function(pin: string): Promise<void> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }

  // Check if PIN was used before
  if (this.security.previousPins.length > 0) {
    for (const oldPin of this.security.previousPins) {
      if (await bcrypt.compare(pin, oldPin)) {
        throw new Error('Cannot reuse a previous PIN');
      }
    }
  }

  const hashedPin = await bcrypt.hash(pin, 10);
  
  // Store current PIN in previous PINs if it exists
  if (this.security.pin.value) {
    this.security.previousPins.push(this.security.pin.value);
    if (this.security.previousPins.length > 3) {
      this.security.previousPins.shift();
    }
  }

  this.security.pin.value = hashedPin;
  this.security.pin.enabled = true;
  this.security.pin.lastChanged = new Date();
  this.security.pin.attempts = 0;
  this.security.pin.blocked = false;
  this.security.pin.blockExpires = undefined;
  this.security.pin.requiresChange = false;
  
  this.security.events.push({
    type: 'PIN_SETUP',
    timestamp: new Date(),
    details: 'PIN successfully set'
  });

  await this.save();
};

userSchema.methods.resetPin = async function(): Promise<string> {
  const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
  await this.setPin(tempPin);
  
  this.security.pin.requiresChange = true;
  this.security.events.push({
    type: 'PIN_RESET',
    timestamp: new Date(),
    details: 'PIN reset to temporary value'
  });

  await this.save();
  return tempPin;
};

userSchema.methods.changePin = async function(currentPin: string, newPin: string): Promise<void> {
  const isValid = await this.verifyPin(currentPin);
  if (!isValid) {
    throw new Error('Current PIN is incorrect');
  }

  await this.setPin(newPin);
  
  this.security.events.push({
    type: 'PIN_CHANGE',
    timestamp: new Date(),
    details: 'PIN changed successfully'
  });

  await this.save();
};

export default mongoose.models.User || mongoose.model('User', userSchema);
