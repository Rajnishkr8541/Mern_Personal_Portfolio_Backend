import mongoose from "mongoose"; // Importing Mongoose library

const messageSchema = new mongoose.Schema({
    senderName: {
        type: String,
        minLength: [2, "Name Must be contain at least 2 Character!"],
    },
    subject: {
        type: String,
        minLength: [2, "Subject must be contain at least 2 character!"],
    },
    message: {
        type: String,
        minLength: [2, "Message must be contain at least 2 character!"],
    },
    createdAt: {
        type: Date,
        default: Date.now(), // Sets default value to the current date and time
    },
});

// Exporting the Message model, which allows creating and manipulating messages in the database
export const Message = mongoose.model("Message", messageSchema);
