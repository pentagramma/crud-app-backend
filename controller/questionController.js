const Question = require("../model/Questions");
//const User = require("../model/user");
const UserModel = require("../model/user");
const { commonWords } = require("../utils/commonWords");
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();


const createQuestion = async (req, res) => {
  try {
    const { question, category, image } = req.body;
    const { _id } = req.user;

    let imageUrl = null;

    if (image) {
      // Remove the data:image/jpeg;base64, part
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${uuidv4()}.jpg`,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };

      const uploadResult = await s3.upload(params).promise();
      imageUrl = uploadResult.Location;
    }


    const newQuestion = await Question.create({
      question: question || "",
      category: category || "",
      postedBy: _id,
      answers: [],
      imageUrl: imageUrl 
    });

    res.status(200).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const editQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, category, image, _id } = req.body;

    console.log('Received question data:', { questionId, question, category, _id });
    console.log('Image data received:', image ? 'Image data present' : 'No image data');

    let questionToUpdate = await Question.findById(questionId);

    if (!questionToUpdate) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    if (questionToUpdate.postedBy.toString() !== _id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to edit this question",
      });
    }

    if (question) questionToUpdate.question = question;
    if (category) questionToUpdate.category = category;

    if (image) {
      if (image.startsWith('data:image')) {
        // Remove the data:image/jpeg;base64, part
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${uuidv4()}.jpg`,
          Body: buffer,
          ContentType: 'image/jpeg',
          ACL: 'public-read'
        };

        try {
          const uploadResult = await s3.upload(params).promise();
          questionToUpdate.imageUrl = uploadResult.Location;
          console.log('New image URL:', questionToUpdate.imageUrl);
        } catch (uploadError) {
          console.error('S3 upload error:', uploadError);
          return res.status(500).json({
            message: "Error uploading image",
            error: uploadError.message,
          });
        }
      } else {
        // If it's not a base64 string, assume it's a URL and update directly
        questionToUpdate.imageUrl = image;
      }
    }

    // Save the updated question
    const updatedQuestion = await questionToUpdate.save();
    console.log('Updated question:', updatedQuestion);

    res.status(200).json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err.message,
    });
  }
};

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
    const { id } = req.params;
    const question = await Question.findOne({ _id: id })
    .populate("postedBy")
    .populate("answers.postedBy");
    console.log(question)
    console.log("question")
    res.status(200).send({
      question: question,

    });
  } catch (e) {
    console.log("here1")
    res.status(404).send({
      error: e.message,
    });
  }
};

// const fetchQuestionByID = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const question = await Question.findOne({ _id: id })
//       .populate("postedBy")
//       .populate("answers.postedBy");
//     res.status(200).send({
//       question: question,
//     });
//   } catch (e) {
//     res.status(404).send({
//       error: e.message,
//     });
//   }
// };


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

const fetchSearchedQuestions = async (req,res)=>{
  try{
    const searchedString = req.params.search
    const searchArray = searchedString.split(' ')
    const filteredArray = searchArray.filter(each=> !(commonWords.includes(each.toLowerCase())))
    console.log(filteredArray)
    let finalArray = []
    let idArray = []
    for(let each=0;each<filteredArray.length;each++) {
      const arr = await Question.find({$text:{$search:filteredArray[each],$caseSensitive:false}}).populate("postedBy");
      arr.forEach(x => {
        if(!(idArray.includes(x.question))){
          idArray.push(x.question)
          finalArray.push(x);
        }
      })
    }
    console.log(idArray)
    res.status(200).send({
      searchedQuestions: finalArray
    })
  }
  catch(e){
    console.log(e)
    res.status(500).json({ error: "Internal server error" });
  }
}

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { _id } = req.user; // Assuming you have user information in the request

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    if (question.postedBy.toString() !== _id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this question",
      });
    }

    // If the question has an image, delete it from S3
    if (question.imageUrl) {
      const key = question.imageUrl.split('/').pop();
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      };

      await s3.deleteObject(params).promise();
    }

    await Question.findByIdAndDelete(questionId);

    res.status(200).json({
      message: "Question deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while deleting the question",
      error: err.message,
    });
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
  fetchSearchedQuestions,
  editQuestion,
  deleteQuestion
};
