const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const Grid = require('gridfs-stream');


mongoose.connect('mongodb+srv://jitendra:Welcome%401@atlascluster.qicyewo.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{
    console.log("connection successful")
}).catch((err)=>{
    console.log(" no connection")
})


