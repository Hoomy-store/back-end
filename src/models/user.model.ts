import mongoose, { Schema, Document } from "mongoose";
import { IUserModel } from "../types/user.type";
import { comparePassword, hashPassword } from "../shared/hash";
import { generateAccessToken } from "../shared/tokens";

const userSchema = new Schema<IUserModel>(
  {
    avatar: { type: String, default: "https://res.cloudinary.com/dypwrrsyh/image/upload/v1749835815/3_i9epmg.png" },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    address: { type: String },
    roles: { type: [String], default: ["user"] },

    emailVerificationToken: { type: String, default: null },

    isVerified: { type: Boolean, default: false },
    isGoogleUser: { type: Boolean, default: false },

    cart: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

userSchema.pre<IUserModel>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await comparePassword(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const token = generateAccessToken({ id: this._id, name: this.name, email: this.email, isAdmin: this.isAdmin });
  return token;
};

const User = mongoose.model<IUserModel>("User", userSchema);
export default User;
