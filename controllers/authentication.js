'use strict';

const jwt = require('jwt-simple');

// const User = require('../models/user');

require('dotenv').config();
const secret = process.env.SECRET_STR;

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    // the subject (sub) of this token is the user id, iat = issued at time
    return jwt.encode({ sub: user.id, iat: timestamp }, secret);
}

module.exports = function (db) {
    
    const module = {};

    module.signup = function(req, res, next) {
        const EMAIL = req.body.email;
        const PASSWORD = req.body.password;
        // check if any data missing
        if (!EMAIL || !PASSWORD) {
            return res.status(422).send({ error: 'You must provide email and password'});
        }
        // See if a user with the given email exists
        db.collection('users').findOne({ email: EMAIL }, function(err, existingUser) {
            if (err) {
                return next(err);
            }
            // If a user with the email does exist, return an error
            if (existingUser) {
                return res.status(422).send({ error: 'Email is in use'});
            }
            // If a user with email does not exist, create and save user record
            const USER = {
                email: EMAIL,
                password: PASSWORD
            };
            // save the user we just created
            db.collection('users').insertOne(USER, function(err, result) {
                if (err) {
                    return next(err);
                }
                // Respond to request indicating the user was created
                res.json({ token: tokenForUser(USER) });
            });
            
        });
    };
    
    module.signin = function(req, res, next) {
        // User has already had their email and password auth'd we just need to give them a token
        res.send({ token: tokenForUser(req.user) });
    };
    
    return module;


};