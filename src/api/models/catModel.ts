// TODO: mongoose schema for cat
import mongoose from 'mongoose';
import Cat from '../../interfaces/Cat';
const Schema = mongoose.Schema;

const catSchema = new Schema<Cat>({
    cat_name: {
      type: String,
    },
    weight: {
      type: Number,
    },
    filename: {
      type: String,
    },
    birthdate: {
      type: Date,
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
        },
        coordinates: {
            type: [Number],
        }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  }
});

const CatModel = mongoose.model<Cat>('Cat', catSchema);

export default CatModel;
