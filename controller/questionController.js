const Question = require('../model/Questions');

// Controller function to create a new question
const createQuestion = async (req, res) => {
  try {
    const { question, category, postedBy } = req.body;

    const newQuestion = await Question.create({
      question,
      category,
      postedBy,
    });

    res.status(201).json({
      message: 'Question created successfully',
      question: newQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Something went wrong',
      error: err,
    });
  }
};

// Controller function to update an answer in the answer array
const updateAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer, postedBy } = req.body;
    console.log(answer,postedBy)
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
      console.log(updatedQuestion)
    if (!updatedQuestion) {
      return res.status(404).json({
        message: 'Question not found',
      });
    }

    res.status(200).json({
      message: 'Answer added successfully',
      question: updatedQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Something went wrong',
      error: err,
    });
  }
};

module.exports = {
  createQuestion,
  updateAnswer,
};







