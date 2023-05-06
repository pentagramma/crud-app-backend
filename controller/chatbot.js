const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  getAnswer: async (req, res) => {
    try {
      const question = req.params.question;
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: question,
        max_tokens: 512
      })

      
      res.status(200).send({
        status:'success',
        message:completion.data.choices[0].text.trim()
      })
    } catch (e) {
        res.status(500).send({
            status:'error',
            message:'server issue'
        })
    }
  },
};
