const express = require('express');
const app  = express();
const mongoose = require('mongoose');
const Event = require('./models/event.model');
const eventRoutes = require('./routes/event.route');

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//routes
app.use('/event', eventRoutes);

//setup database connection
mongoose.connect('mongodb+srv://admin:bigidea123@bigideadb.xeleu.mongodb.net/BigideaDB?retryWrites=true&w=majority&appName=BigideaDB')
.then(() => {
    console.log('Connected to database');
    app.listen(3000, () => {
        console.log('Server is running on port 3000')
    });
})
.catch(() => {
    console.log('Connection failed');
});

//initial route
app.get('/', (req, res) => {
    res.send('Hello World');
});

