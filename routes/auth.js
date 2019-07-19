const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Route for signup
router.post('/signup', (req, res) => {
    // see if the email is already in the db
    User.findOne({email: req.body.email}, (err, user) => {
        if (user){
            // if yes, return an error
            res.json({type: 'error', message: 'Email already exists'});
        } else {
            // if no, create the user in the db
            let user = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });
            user.save((err, user) => {
                if (err){
                    res.json({type: 'error', message: 'Database Error Creating User', err})
                } else {
            // sign a token (this is the login step)
                    var token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
                        expiresIn: "1d"
                    });
                    // res.json the token (the browser need to store this token)
                    res.status(200).json({type: 'success', user: user.toObject(), token})
                }
            })
        }
    })
})

// Route for login
router.post('/login', (req, res) => {
    // Find user in db by email
    User.findOne({email: req.body.email}, (err, user) => {
        if (!user) {
            // If there is no user, return error
            res.json({type: 'err', message: 'Account not found'})
        } else {
            // If user, check authentication
            if (user.authenticated(req.body.password)){
                // If authenticated, sign a token (login)
                var token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
                    expiresIn: "1d"
                });
                // return the token to be saved by the browser
                res.json({type: 'Success', user: user.toObject(), token})
            } else{
                res.json({type: 'error', message: 'Authentication Failure'})
            }
        }
    })
})

// Route for validating tokens
router.post('/me/from/token', (req, res) => {
    // Make sure they sent us a token to check
    var token = req.body.token;
    if (!token) {
        // If no token, return an error
        res.json({type: 'error', message: 'You must submit a valid token'})
    } else {
        // If token, verify it
        jwt.verify(token, process.env.JWT_SECRET, (err, user) =>{
            // If token invalid, return an error
            if(err){
                res.json({type: 'error', message: 'Invalid token, please login again.'})
            } else{
                // If token is valid, look up user in the db
                User.findById(user._id, (err, user) => {
                    if(err){
                        // IF user doesn't exist, return an error
                        res.json({type: 'error', message: "Database Error during validation !!!"})
                    } else {
                        // If user exist, send back user and token
                        // Right here, we could sign a new token or we could just 
                        // return the existing one
                        // var token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
                        //     expiresIn: "1d"
                        // });
                        res.json({type: 'Success', user: user.toObject(), token})
                    }
                })
            }
        })
    }
})


module.exports = router;