import mongoose from 'mongoose';

interface UserAttrs {
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: string;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}


const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: false,
    },
    verificationToken: {
      type: String,
      required: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
      },
      versionKey: false,
    },
  }
);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };