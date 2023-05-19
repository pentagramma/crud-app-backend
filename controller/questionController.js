const Question = require("../model/Questions");
const { openai } = require("../utils/openaiConfiguration");
const User = require("../model/user");

const createQuestion = async (req, res) => {
  try {
    const { question, category } = req.body;
    const { _id } = req.user;
    console.log(question, category, _id);
    const gpt_answer = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: question,
      max_tokens: 512,
    });
    console.log(gpt_answer);
    const newQuestion = await Question.create({
      question: question,
      category: category,
      postedBy: _id,
      gpt_answer: gpt_answer.data.choices[0].text.trim(),
      answers: [],
    });
    console.log(newQuestion);
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
    let query = {};
    const { skip, limit } = req.query;
    if (req.query.category) {
      if (req.query.category !== "All") {
        query.category = req.query.category;
      }
    }
    const skipValue = (skip - 1) * limit;
    const questions = await Question.find(query)
      .sort({ createdAt: "desc" })
      .skip(skipValue)
      .limit(limit)
      .populate("postedBy");
    const totalCount = await Question.find(query).count();
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
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
      error: err,
    });
  }
};

const fetchQuestionByID = async (req, res) => {
  try {
    const id = req.params.id;
    const question = await Question.findOne({ _id: id })
      .populate("postedBy")
      .populate("answers.postedBy");
    res.status(200).send({
      question: question,
    });
  } catch (e) {
    res.status(404).send({
      error: e.message,
    });
  }
};

const retrieveAnswerByUserId = async (req, res) => {
  const { userId } = req.query;
  try {
    const questions = await Question.find({ "answers.postedBy": userId })
      .populate("answers.postedBy", "firstName lastName") // Populate answer details with firstName and lastName
      .exec();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving answers", error });
  }
};

const likeQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userId } = req.body;
    const question = await Question.findById(questionId);
     console.log(userId);
    if (typeof question.likes !== "undefined") {
      console.log("yes")
      const userExists = question.likes.includes(userId);
      if (!userExists) {
        console.log("user has not liked this post")
        question.likes.push(userId);
        await question.save();
        
      }
      console.log(question)
      const user = await User.findById(userId);

      if (!user.likedQuestions.includes(questionId)) {
        user.likedQuestions.push(questionId);
        await user.save();
      }

      res.status(200).json(question);
    } else {
      console.log("no")
      
  //     question.likes = [];
  //     question.likes.push(userId);
  // console.log(question)
  //     await question.save();
  //     const user = await User.findById(userId);
 
  //     if (!user.likedQuestions.includes(questionId)) {
  //       user.likedQuestions.push(questionId);
  //       await user.save();
  //     }
  //     res.status(200).json(question);
    }
  } catch (error) {
    res.status(500).json({ message: "Error liking question", error });
  }
};

const likeAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { userId } = req.body; // Assuming you have the authenticated user's ID

    // Update the likes array of the answer and push the user's ID
    const question = await Question.findOneAndUpdate(
      { _id: questionId, "answers._id": answerId },
      { $addToSet: { "answers.$.likes": userId } },
      { new: true }
    );

    // Update the user's likedAnswers array
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { likedAnswers: answerId } },
      { new: true }
    );

    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: "Error liking answer", error });
  }
};

module.exports = {
  createQuestion,
  updateAnswer,
  fetchQuestions,
  retrieveQuestion,
  fetchQuestionByID,
  retrieveAnswerByUserId,
  likeQuestion,
  likeAnswer,
};
