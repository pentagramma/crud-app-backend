const {openai} = require('../utils/openaiConfiguration')

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
