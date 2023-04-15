const mongoose = require('mongoose');
mongoose.set('strictQuery', true);



mongoose.connect('mongodb+srv://jbpinfosolution:welcome123@cluster0.2sqo6xo.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{
    console.log("connection successful")
}).catch((err)=>{
    console.log(" no connection")
})


