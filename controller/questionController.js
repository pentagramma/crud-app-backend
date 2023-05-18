const Question = require("../model/Questions");
const { openai } = require("../utils/openaiConfiguration");

const createQuestion = async (req, res) => {
  try {
    const { question, category } = req.body;
    const { _id } = req.user;
    console.log(question,category,_id)
    const gpt_answer = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: question,
      max_tokens: 512,
    });
    console.log(gpt_answer)
    const newQuestion = await Question.create({
      question: question,
      category: category,
      postedBy: _id,
      gpt_answer: gpt_answer.data.choices[0].text.trim(),
      answers: [],
    });
    console.log(newQuestion)
    res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err,
    });
  }
};

// Controller function to update an answer in the answer array
const updateAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer, postedBy } = req.body;
    console.log(answer, postedBy);
    const updatedQuestion = await Question.findOneAndUpdate(
      { _id: questionId },
      {
        $push: {
          answers: {
            answer,
            postedBy,
          },
        },
      },
      { new: true }
    );
    console.log(updatedQuestion);
    if (!updatedQuestion) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Answer added successfully",
      question: updatedQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong",
      error: err,
    });
  }
};

const fetchQuestions = async (req, res) => {
  try {
    const { skip, limit } = req.query;
    const skipValue = (skip - 1) * limit;
    const questions = await Question.find()
      .skip(skipValue)
      .limit(limit)
      .populate("postedBy");
    const totalCount = await Question.find().count();
    res.status(200).send({
      totalCount: totalCount,
      questions: questions,
    });
  } catch (e) {
    res.status(404).send({
      message: e,
    });
  }
};

const retrieveQuestion = async (req, res) => {
  try {
    const { userId } = req.query;
    const questions = await Question.find({ postedBy: userId });

    if (!questions) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Questions retrieved successfully",
      questions: questions,
    });

    console.log(questions);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
      error: err,
    });
  }
};

module.exports = {
  createQuestion,
  updateAnswer,
  fetchQuestions,
  retrieveQuestion,
};
