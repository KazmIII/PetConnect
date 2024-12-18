import mongoose from "mongoose";

const userShcema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true,
    },
    phone: {
        type: String,
        required: true,
    },
    password:{
        type:String,
        required:true,
    },
    city: {
        type: String,
    },
    lastLogin:{
        type:Date,
        default:Date.now
    },
    pets: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Pet',
    }],
    emailVerified:{
        type:Boolean,
        default:false
    },
    restricted: { 
        type: Boolean, 
        default: false, 
    },
    resetPasswordToken:String,
    resetPasswordTokenExpiresAt:Date,
    verificationToken:String,
    verificationTokenExpiresAt:Date,
    
},{timestamps:true})

export const UserModel = mongoose.model('User',userShcema)