import { Point } from "geojson"
import {User} from "./User"
import mongoose, { Document, Types } from "mongoose"
// TODO: cat interface
export default interface Cat{
    _id: number,
    cat_name: string,
    weight: number,
    filename: string,
    birthdate: Date,
    location: Point,
    owner: Types.ObjectId
}