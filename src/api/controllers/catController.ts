// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import CustomError from '../../classes/CustomError';
import Cat from '../../interfaces/Cat';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import { User } from '../../interfaces/User';
import rectangleBounds from '../../utils/rectangleBounds';
import CatModel from '../models/catModel';


// - catPost - create new cat
const catGet = async (req: Request<{id: string}, {}, Cat>, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }     
    const cat = await CatModel.findById(req.params.id).populate('owner');
    if(!cat){
      next(new CustomError("no error found", 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catGetByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }     
    const user = req.user as User;
    const cat = await CatModel.find({owner: user._id}).populate('owner');
    console.log(cat)
    if(!cat){
      next(new CustomError("no error found", 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catGetByBoundingBox = async (req: Request<{}, {}, {}, {topRight: string; bottomLeft: string}>, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }

    const {topRight, bottomLeft} = req.query;
    const [trLat, trLng] = topRight.split(',');
    const [blLat, blLng] = bottomLeft.split(',');
    const bounds = rectangleBounds(
      {lat: parseFloat(trLat), lng: parseFloat(trLng)},
      {lat: parseFloat(blLat), lng: parseFloat(blLng)}
    );
    
    const cats = await CatModel.find({
      location: {
        $geoWithin: {
          $geometry: bounds,
        },
      },
    });
    console.log("cat is: " + cats)
    if (!cats) {
      next(new CustomError('No species found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await CatModel.find().populate('owner')
    if(!cat){
      next(new CustomError("no error found", 404));
      return;
    }
    res.json(cat);
  } catch (error) {
      next(new CustomError((error as Error).message, 500));
  }
};

const catPost = async (req: Request<{id: string}, {}, Cat>, res: Response, next: NextFunction) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    } 
    const user = req.user as User;
    if (!req.body.filename && req.file) {
      req.body.filename = req.file.filename;
    }
    if(!req.body.owner && user._id) {
      req.body.owner = new Types.ObjectId(user._id);
    }
    //console.log("res: " + res.locals.coords[0] as Number )
    if (!req.body.location) {
      req.body.location = res.locals.coords
    }

    const cat = await (await CatModel.create(req.body)).populate('owner');
    const output: DBMessageResponse = {
      message: 'Species created',
      data: cat
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

const catPut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }
    const cat = await CatModel.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!cat){
      next(new CustomError("no error found", 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat created',
      data: cat
    }
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catPutAdmin = async (req: Request<{id: string}, {}, Cat>, res: Response, next: NextFunction) => {  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }
    let cat;
    const u = req.user as User
    console.log("ajdfnlsjdnglsjdg: " + u._id)
    if(u.role === 'admin')
    {
      
      cat = await CatModel.findByIdAndUpdate(req.params.id, req.body, {new: true}).select('-password');
    } else {
      next(new CustomError("No privaliges", 404));
      return;
    }
    if(!cat){
      next(new CustomError("no error found", 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat created',
      data: cat
    }
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catPutCurrent = async (req: Request, res: Response, next: NextFunction) => {  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }
    const cat = await CatModel.findByIdAndUpdate(req.user, req.body, {new: true}).select('-password');
    if(!cat){
      next(new CustomError("no error found", 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat created',
      data: cat
    }
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }
    const cat = await CatModel.findByIdAndDelete(req.params.id);
    if(!cat){
      next(new CustomError("no error found", 404));
      return;
    }

    const output: DBMessageResponse = {
      message: 'Species created',
      data: cat
    }
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catDeleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
        throw new CustomError(messages, 400);
    }
    let cat;
    const u = req.user as User
    console.log("ajdfnlsjdnglsjdg: " + u._id)
    if(u.role === 'admin')
    {
      cat = await CatModel.findByIdAndDelete(req.params.id);
    }else {
      next(new CustomError("No privaliges", 404));
      return;
    }
    if(!cat){
      next(new CustomError("no error found", 404));
      return;
    }
  
    const output: DBMessageResponse = {
      message: 'Species created',
      data: cat
    }
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catDeleteCurrent = async (req: Request, res: Response, next: NextFunction) => {try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const messages = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
      throw new CustomError(messages, 400);
  }
  const cat = await CatModel.findByIdAndDelete(req.user);
  if(!cat){
    next(new CustomError("no error found", 404));
    return;
  }

  const output: DBMessageResponse = {
    message: 'Species created',
    data: cat
  }
  res.json(output);
} catch (error) {
  next(new CustomError((error as Error).message, 500));
}}

export { 
  catGetByBoundingBox,
  catGetByUser,
  catPutAdmin,
  catDeleteAdmin,
  catDeleteCurrent,
  catGet,
  catListGet,
  catPost,
  catPutCurrent,
  catPut,
  catDelete}