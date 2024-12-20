import bcrypt from "bcryptjs";
import mongoose, { Schema, type CallbackError, type Document } from "mongoose";
import { DEPARTMENTS } from "src/constants/departments";
import { ROLES } from "src/constants/user";
import { generateToken, verifyToken } from "src/emails/helper";



export type UserWithId = {
  _id: string;
  firstName: string;
  lastName: string;
  rollNo: string;
  email: string;
  profilePicture: string;
  department: (typeof DEPARTMENTS)[number];
  roles: string[];
  createdAt: Date;
  updatedAt?: Date;
};

export interface IUser {
  firstName: string;
  lastName: string;
  rollNo: string;
  email: string;
  profilePicture: string;
  gender?: "male" | "female" | null;
  phone?: string | null;
  department: (typeof DEPARTMENTS)[number];
  roles: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUserSchema extends IUser, Document {
  password: string;
  comparePassword: (password: string) => Promise<boolean>;
  verificationToken: string | null;
}
const userSchema = new Schema<IUserSchema>(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    rollNo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, default: null },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Your password must be at least 6 characters long"],
      select: false, // Don't send back password after request
    },
    profilePicture: { type: String, default: null },
    phone: { type: Number, default: null },
    department: { type: String, required: true, enum: DEPARTMENTS },
    roles: {
      type: [String],
      default: ["student"],
      enum: ROLES,
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    verificationToken: { type: String, default: null },
  },
  { timestamps: true }
);
// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    // If it's a new document, set both createdAt and updatedAt
    this.createdAt = new Date();
    this.updatedAt = new Date();
  } else {
    // If it's an existing document, only update the updatedAt field
    this.updatedAt = new Date();
  }
  if (!this.isModified("password")) {
    return next();
  }

  const saltRounds = 10;
  try {
    const hash = await bcrypt.hash(this.password, saltRounds);
    this.password = hash;
    next();
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (err: any) {
    return next(err as CallbackError);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (err: any) {
    throw new Error(err);
  }
};

//  Method to generate verification token
userSchema.methods.generateVerificationToken = async function (): Promise<string> {
  try {
    this.verificationToken = generateToken(this.email);
    await this.save();
    return this.verificationToken;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (err: any) {
    throw new Error(err);
  }
};

// Method to verify the user
userSchema.methods.verifyUser = async function (token: string): Promise<boolean> {
  try {
    if (this.verificationToken === token) {
      const payload = verifyToken(token);
      if (payload && payload === this.email) {
        this.verificationToken = null;
        await this.save();
        return true;
      }
      return false;
    }
    return false;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (err: any) {
    throw new Error(err);
  }
};

const User =
  mongoose.models.User || mongoose.model<IUserSchema>("User", userSchema);

export default User;
