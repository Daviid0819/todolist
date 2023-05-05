const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randbytes = require("randombytes");
require("dotenv").config();

const User = require("../models/user.model");
const List = require("../models/list.model");
const Token = require("../models/token.model");

const sendEmail = require("../utils/sendEmail");

const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/user", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user) {
        return res.json({success: false, message: "User doesn't exist"});
    }

    res.json({success: true, user: user});
});

router.get("/user/fromid/:id", async(req, res) => {
    const user = await User.findOne({
        _id: req.params.id
    });

    if(!user) {
        return res.json({success: false, message: "User doesn't exist"});
    }

    res.json({success: true, user: user});
});

router.post("/user/add", async(req, res) => {
    const hashedPword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPword
    });

    try {
        await User.create(newUser);

        const newToken = new Token({
            userid: newUser._id,
            token: randbytes(32).toString("hex")
        });

        await Token.create(newToken);

        const url = `${process.env.BASE_URL}/user/${newUser._id}/verify/${newToken.token}`;
        await sendEmail(newUser.email, "TodoList - Email verify", `Dear `+newUser.username+`!<br><br>Please verify your account with this <a href=${url}>link</a>`);

        res.json({success: true});
    }
    catch(err) {
        res.json({success: false, message: "User already exists"});
    }
});

router.get("/user/:id/verify/:token", async(req, res) => {
    const user = await User.findOne({
        _id: req.params.id
    });

    if(!user) {
        return res.json({succes: false, message: "User doesn't exist"});
    }

    if(user.verified){
        return res.json({success: false, message: "Already verified"});
    }

    const token = await Token.findOne({
        userid: req.params.id,
        token: req.params.token
    });

    if(!token){
        return res.json({success: false, message: "Invalid link"});
    }

    try {
        user.verified = true;
        await user.save();

        await token.remove();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/user/resend", async(req, res) => {
    const user = await User.findOne({
        username: req.body.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    if(user.verified){
        return res.json({success: false, message: "This account is verified"});
    }

    const token = await Token.findOne({
        userid: user._id
    });

    if(token){
        try{
            await token.remove();
        }
        catch(err){
            return res.json({success: false, message: err.message});
        }
    }

    const newToken = new Token({
        userid: user._id,
        token: randbytes(32).toString("hex")
    });

    try{
        await Token.create(newToken);

        const url = `${process.env.BASE_URL}/user/${user._id}/verify/${newToken.token}`;
        await sendEmail(user.email, "TodoList - Email verify", `Dear `+user.username+`!<br><br>Please verify your account with this <a href=${url}>link</a>`);

        res.json({success: true, message: "Verification email sent"});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/user/login", async(req, res) => {
    const user = await User.findOne({
        username: req.body.username
    });

    if(!user) {
        return res.json({succes: false, message: "User doesn't exist"});
    }

    if(!user.verified) {
        return res.json({succes: false, message: "Verify your e-mail address"});
    }

    bcrypt.compare(req.body.password, user.password, (err, response) => {
        if(!response) {
            return res.json({success: false, message: "Incorrect password"});
        }
        
        const token = jwt.sign({
            userid: user._id,
            username: user.username
        }, process.env.JWT_SECRET);
        res.json({success: true, token: token});
    });
});

router.post("/user/forgot", async(req, res) => {
    const user = await User.findOne({
        username: req.body.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    if(!user.verified){
        return req.json({success: false, message: "First verify your account"})
    }

    const token = await Token.findOne({
        userid: user._id
    });

    if(token){
        try{
            await token.remove();
        }
        catch(err){
            return res.json({success: false, message: err.message});
        }
    }

    const newToken = new Token({
        userid: user._id,
        token: randbytes(32).toString("hex")
    });

    try{
        await Token.create(newToken);

        const url = `${process.env.BASE_URL}/user/${user._id}/pass/${newToken.token}`;
        await sendEmail(user.email, "TodoList - Forgot password", `Dear `+user.username+`!<br><br>You can enter a new password with this <a href=${url}>link</a>`);

        res.json({success: true, message: "Forgot password email sent"});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.get("/user/:id/pass/:token", async(req, res) => {
    const user = await User.findOne({
        _id: req.params.id
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist or invalid link"});
    }

    const token = await Token.findOne({
        userid: req.params.id,
        token: req.params.token
    });

    if(!token){
        return res.json({success: false, message: "Invalid link"});
    }

    try{
        await token.remove();
        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/user/forgot/update", async(req, res) => {
    const user = await User.findOne({
        _id: req.body.userid
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    try {
        user.password = await bcrypt.hash(req.body.pass, 10);
        await user.save();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/user/update/username", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    try {
        user.username = req.body.newname;
        await user.save();

        const token = jwt.sign({userid: user._id, username: req.body.newname}, process.env.JWT_SECRET);
        res.json({success: true, token: token});
    }
    catch(err){
        res.json({succcess: false, message: "This username already exists"});
    }
});

router.post("/user/update/email", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    try {
        user.email = req.body.newemail;
        await user.save();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: "This email already exists"});
    }
});

router.post("/user/update/password", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    const comp = await bcrypt.compare(req.body.oldpword, user.password);
    if(!comp){
        return res.json({success: false, message: "Your old password is incorrect"});
    }

    try {
        user.password = await bcrypt.hash(req.body.newpword, 10);
        await user.save();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/user/todo/add", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    try{
        user.todos.push({
            todoname: req.body.todoname
        });

        await user.save();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.get("/user/todo", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    res.json({success: true, todos: user.todos});
});

router.post("/user/todo/finished/:id", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }
    
    try {
        await User.findOneAndUpdate({
            todos: {$elemMatch: {_id: req.params.id}}
        }, {
            "todos.$.finished": req.body.finished
        });
        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/user/todo/edit/:id", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }
    
    try {
        if(req.body.edit){
            await User.findOneAndUpdate({
                todos: {$elemMatch: {_id: req.params.id}}
            }, {
                "todos.$.edit": req.body.edit
            });
            res.json({success: true, edited: false});
        }
        else {
            if(req.body.newtodoname.length<3){
                return res.json({success: false, message: "The title has to be at least 3 characters"});
            }

            await User.findOneAndUpdate({
                todos: {$elemMatch: {_id: req.params.id}}
            }, {
                "todos.$.edit": req.body.edit,
                "todos.$.todoname": req.body.newtodoname
            });
            res.json({success: true, edited: true});
        }
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.delete("/user/todo/delete/:id", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    try {
        await user.updateOne({
            $pull: {
                todos: {_id: req.params.id}
            }
        });

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.get("/user/invite", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username
    });

    if(!user){
        return req.json({success: false, message: "User doesn't exist"});
    }

    res.json({success: true, invites: user.invites});
});

router.post("/user/invite/:id", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.body.name
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    if(user.invites.filter(inv => inv.listid == req.params.id).length > 0){
        return res.json({success: false, message: "User already invited"});
    }

    const list = await List.findOne({
        _id: req.params.id,
        $or: [
            {admins: {$elemMatch: {userid: user._id}}},
            {users: {$elemMatch: {userid: user._id}}}
        ]
    });

    if(list){
        return res.json({success: false, message: "User already has access to this list"});
    }

    try {
        user.invites.push({
            listid: req.params.id,
            listname: req.body.listname,
            admin: req.body.admin,
            from: req.username
        });
        await user.save();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/user/invite/terminate/:id", authenticateToken, async(req, res) => {
    const user = await User.findOne({
        username: req.username,
        invites: {$elemMatch: {listid: req.params.id}}
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    try {
        const invite = user.invites.filter(inv => inv.listid == req.params.id)[0];
        if(req.body.accept){
            if(invite.admin){
                const list = await List.findOneAndUpdate({
                    _id: req.params.id
                }, {
                    $push: {
                        admins: {userid: req.userid}
                    }
                });
                await list.save();
            }
            else {
                const list = await List.findOneAndUpdate({
                    _id: req.params.id
                }, {
                    $push: {
                        users: {userid: req.userid}
                    }
                });
                await list.save();
            }
        }

        await user.updateOne({
            $pull: {
                invites: {listid: req.params.id}
            }
        });
        await user.save();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

module.exports = router;