import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderName: {
        type: String,
        minLength:[2, "Name Must be contain at least 2 Character!"],
    },
    subject:{
        type:String,
        minLength:[2,"subject must be contaion at least 2 character!"],
    },
    message:{
        type:String,
        minLength:[2,"message must be contain at least 2 character!"],
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
});

export const Message= mongoose.model("message",messageSchema);


