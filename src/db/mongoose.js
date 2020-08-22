const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODBURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
