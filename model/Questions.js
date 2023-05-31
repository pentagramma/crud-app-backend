const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Technology", "Philosophy", "Business", "Other"],
      required: true,
    },
    gpt_answer: { type: String, required: true },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
      },
    ],
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
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
  },
  { timestamps: true }
);
questionSchema.index({question:"text"})
const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
