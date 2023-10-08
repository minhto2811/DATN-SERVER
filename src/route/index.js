const users = require('./user.route')

function route(app) {

    
    app.get('/', (req, res) => {
        res.render('login', {default: false})
    });



    app.use('/api/user', users)

}

module.exports = route