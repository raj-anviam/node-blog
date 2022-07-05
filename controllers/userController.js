const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helpers = require('../helpers/helpers');

module.exports.login = async (req, res) => {
    var user = await User.find({email: req.body.email}).countDocuments();

    if(!user) {
        // res.status(401).send({message: 'invalid email'})
        helpers.errorResponse(res, 'invalid email', 401);
        return;
    }
    
    User.findOne({where: {email: req.body.email}})
        .then(async response => {
            var userVerified = await bcrypt.compare(req.body.password, response.password);
            if(!userVerified) {
                // res.status(401).send({message: 'invalid password'})
                helpers.errorResponse(res, 'invalid password', 401);
                return;
            }

            var token = jwt.sign({email: response.email}, 'secret');

            let user = {
                    name: response.name,
                    email: response.email,
                    token: token
                }

            helpers.successResponse(res, user);
        })
        .catch(err => {
            console.log(err)
        });
}

module.exports.register = async (req, res) => {
    console.log(req.body);

    try {
        const data = req.body;
        // const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(data.password, 10)
        data.password = hashedPassword

        await User.create(data)
        // res.status(201).send({'message': 'request recieved successfully'})
        helpers.successResponse(res, {}, 'request recieved successfully');
    }
    catch(err) {
        console.log(err)
        // res.status(500).send(err)
        helpers.errorResponse(res, err, 500);
    }
    
}