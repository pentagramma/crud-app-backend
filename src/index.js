const app = require('./app')
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("Database is connected");
}).catch((err)=>{
    console.log(err);
})


app.listen(process.env.PORT,()=>{
    console.log(`App listening on port ${process.env.PORT}!`)
})
