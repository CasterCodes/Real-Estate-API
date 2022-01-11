import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface UserInput {
  name: string;
  email: string;
  password: string;
  photo?: string;
  phoneNumber?: string;
  county?: string;
  town?: string;
  description: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
}

export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  isEmailConfirmed: boolean;
  identityMethod: string;
  isPhoneNumberConfirmed: boolean;
  confirmEmailToken: string | undefined;
  passwordResetToken: string | undefined;
  passwordResetTokenExpiresIn: number | undefined;
  confirmPhoneNumberToken: string | undefined;
  role?: string;
  photo: string;
  isAccountActive: boolean;
  comparePassword(candidatePassword: string): Promise<Boolean>;
  createConfirmEmailToken(): string;
  createPasswordResetToken(): string;
  createConfirmPhoneToken(): string;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name is required"],
  },

  email: {
    type: String,
    required: [true, "User email is required"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "User password is required"],
  },

  role: {
    type: String,
    enum: {
      values: ["agent", "admin", "user"],
      message: "Only agent, admin, and user are required",
    },
    default: "user",
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  isAcountActive: {
    type: Boolean,
    default: false,
  },

  isPhoneNumberConfirmed: {
    type: Boolean,
    default: false,
  },

  confirmEmailToken: {
    type: String,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpiresIn: {
    type: Date,
  },

  identityMethod: {
    type: String,
    required: [true, " You must provide a way to confirm your identity"],
    enum: {
      values: ["sms", "email"],
      message: "Identify confirmation can be either a sms or email",
    },
  },

  confirmPhoneNumberToken: {
    type: String,
  },

  photo: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  let user = this as UserDocument;

  // hash the password only if the password is altered
  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);

  const hashedPassword = await bcrypt.hash(user.password, salt);

  user.password = hashedPassword;

  return next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  const user = this as UserDocument;
  return await bcrypt
    .compare(candidatePassword, user.password)
    .catch((error) => false);
};

userSchema.methods.createConfirmEmailToken = function () {
  const user = this as UserDocument;
  const confirmToken = crypto.randomBytes(32).toString("hex");
  const confirmTokenExtend = crypto.randomBytes(32).toString("hex");

  user.confirmEmailToken = crypto
    .createHash("sha256")
    .update(confirmToken)
    .digest("hex");

  return `${confirmToken}.${confirmTokenExtend}`;
};

userSchema.methods.createConfirmPhoneToken = function () {
  const user = this as UserDocument;

  const confirmToken = crypto.randomBytes(32).toString("hex");

  const confirmTokenExtend = crypto.randomBytes(32).toString("hex");

  user.confirmPhoneNumberToken = crypto
    .createHash("sha256")
    .update(confirmToken)
    .digest("hex");

  return `${confirmToken}.${confirmTokenExtend}`;
};

userSchema.methods.createPasswordResetToken = function () {
  let user = this as UserDocument;
  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenExtended = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

  return `${resetToken}.${resetTokenExtended}`;
};

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
