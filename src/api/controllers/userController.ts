// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from req.user. No need for database query
import { NextFunction, Request, response, Response } from 'express';
import { validationResult } from 'express-validator';
import CustomError from '../../classes/CustomError';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import {User, UserOutput} from '../../interfaces/User';
import UserModel from '../models/userModel';
import bcrypt from 'bcryptjs';

const userListGet = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const students = await UserModel.find().select('-role');
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const userGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }     
    const user = await UserModel.findById(req.params.id).select('-password');
    console.log("GET METHOD:" + user)
    if(!user){
      next(new CustomError("no error found", 404));
      return;
    }
    const outputUser: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    console.log(outputUser)
    res.json(outputUser);
  } catch (error) {
    next(error);
  }
};
const userPost = async (req: Request<{}, {}, User>, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    } 

    req.body.password = await bcrypt.hash(req.body.password, 10)

    const user = await UserModel.create<User>(req.body);
    const outputUser: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    const output: DBMessageResponse = {
      message: 'User created',
      data: outputUser
    }

    // if(!category){
    //   next(new CustomError("no error found", 404));
    //   return;
    // }
    res.json(output);
  } catch (error) {
    console.log(error);
    next(new CustomError((error as Error).message, 500));
  }
}

const userPutCurrent = async (req: Request, res: Response, next: NextFunction) => {  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }
    const user = await UserModel.findByIdAndUpdate(req.user, req.body, {new: true}).select('-password');
    console.log(user)
    if(!user){
      next(new CustomError("no error found", 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'User created',
      data: user
    }
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const userDelete = async (req: Request, res: Response, next: NextFunction) => {}

const userDeleteCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }
    const user = await UserModel.findByIdAndDelete(req.user);
    if(!user){
      next(new CustomError("no error found", 404));
      return;
    }
    const outputUser: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    const output: DBMessageResponse = {
      message: 'Species created',
      data: outputUser
    }
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    console.log(req.user)
    const user = req.user as User;
    const outputUser: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    res.json(outputUser);
  }
};

export {  checkToken,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPutCurrent
}