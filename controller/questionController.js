const Question = require("../model/Questions");
const { openai } = require("../utils/openaiConfiguration");
//const User = require("../model/user");
const UserModel = require("../model/user");

const createQuestion = async (req, res) => {
  try {
    const { question, category } = req.body;
    const { _id } = req.user;
   
    const gpt_answer = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: question,
      max_tokens: 512,
    });
 
    const newQuestion = await Question.create({
      question: question,
      category: category,
      postedBy: _id,
      gpt_answer: gpt_answer.data.choices[0].text.trim(),
      answers: [],
    });
  
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
      .populate("answers.postedBy", "firstName lastName")
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
    

    const userExists = question.likes.includes(userId);
    if (!userExists) {
      question.likes.push(userId);
      await question.save();
    }
    else{
      const updatedQuestion =  question.likes.filter(each=> each != userId)
      question.likes = updatedQuestion
      await question.save()
    }
    const user = await UserModel.findById(userId);
    if (!user.likedQuestions.includes(questionId)) {
      user.likedQuestions.push(questionId);
      await user.save();
    }
    else{
      const updatedUser =  user.likedQuestions.filter(each=>each != questionId)
      user.likedQuestions = updatedUser
      await user.save()
    }

    res.status(200).json({question,user});
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error liking question", error });
  }
};

const likeAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { userId } = req.body; 
    const question = await Question.findOne(
      { _id: questionId}
    );
    const answer = question.answers.filter(each => each._id == answerId)[0]
    const userExist = answer.likes.includes(userId)
    if(!userExist){
      answer.likes.push(userId);
      question.answers.map(each => {
        if(each._id == answerId){
          return answer
        }
        return each
      })
      await question.save();
    }
    else{
      const updatedAnswer =  answer.likes.filter(each=> each != userId)
      answer.likes = updatedAnswer
      question.answers.map(each => {
        if(each._id == answerId){
          return answer
        }
        return each
      })
      await question.save()
    }
    const user = await UserModel.findById(userId);
    if (!user.likedAnswers.includes(answerId)) {
      user.likedAnswers.push(answerId);
      await user.save();
    }
    else{
      const updatedUser =  user.likedAnswers.filter(each=>each != answerId)
      user.likedAnswers = updatedUser
      await user.save()
    }
    res.status(200).json({question,user});
  } catch (error) {
    res.status(500).json({ message: "Error liking answer", error });
  }
};

const getUsersWhoLiked = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    let question = await Question.findById(questionId);
    question = question.likes;
    const likedUsers = await UserModel.find(
      { _id: { $in: question } },
      "firstName lastName email imageUrl"
    );
    res.status(200).json(likedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
  getUsersWhoLiked,
};
