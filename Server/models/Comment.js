import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
