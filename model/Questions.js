const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Technology", "Philosophy", "Business","Other"],
    required: true,
  },
  gpt_answer:{type:String,required:true},
  ans_count: { type: Number, required: true,default:0 },
  likes: { type: Number, required: true,default:0 },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  answers: [
    {
      answer: {
        type: String,
        required: true,
      },
      postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      likes: {
        type: Number,
        default: 0,
      },
    },
  ],
},{timestamp:true});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
