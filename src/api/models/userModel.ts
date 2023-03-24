// TODO: mongoose schema for cat
import mongoose, { Types } from 'mongoose';
import {User} from '../../interfaces/User';

const Schema = mongoose.Schema;

const userSchema = new Schema<User>({
  user_name: String,
  email: String,
  role: String,
  password: String
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
