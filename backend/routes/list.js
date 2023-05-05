const router = require("express").Router();

const List = require("../models/list.model");
const User = require("../models/user.model");

const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/list", authenticateToken, async(req, res) => {
    try {
        const data = await List.find({
            $or: [
                {users: {$elemMatch: {userid: req.userid}}},
                {admins: {$elemMatch: {userid: req.userid}}},
            ]
        });
        res.json({success: true, lists: data});
    }
    catch(err) {
        res.json({success: false, message: err.message});
    }
    
});

router.post("/list/add", authenticateToken, async(req, res) => {
    const newList = new List({
        listname: req.body.listname,
        admins: [
            {userid: req.userid}
        ]
    });

    try {
        await List.create(newList);
        res.json({success: true});
    }
    catch(err) {
        res.json({success: false, message: "The name of the list has to be at least 3 characters"});
    }
});

router.post("/list/edit/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id,
        admins: {$elemMatch: {userid: req.userid}}
    });

    if(!list){
        return res.json({success: false, message: "Can't update this list"})
    }

    try {
        if(list.edit) {
            list.edit = !list.edit;
            list.listname = req.body.newlistname;
            await list.save();

            res.json({success: true, edited: true});
        }
        else {
            list.edit = !list.edit;
            await list.save();
            
            res.json({success: true, edited: false});
        }
    }
    catch(err) {
        res.json({success: false, message: "The title has to be at least 3 characters"});
    }
});

router.delete("/list/delete/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id,
        admins: {$elemMatch: {userid: req.userid}}
    });


    if(!list) {
        return res.json({success: false, message: "Can't remove this list"});
    }

    try {
        await List.deleteOne({
            _id: req.params.id
        });
        res.json({success: true})
    }
    catch(err) {
        res.json({success: false, message: err.message});
    }
});

router.post("/list/todo/add/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id,
        admins: {$elemMatch: {userid: req.userid}}
    });

    if(!list){
        return res.json({success: false, message: "Can't add to the list"});
    }

    try {
        list.todos.push({todoname: req.body.todoname});
        await list.save();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.delete("/list/todo/delete/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id,
        admins: {$elemMatch: {userid: req.userid}}
    });

    if(!list){
        return res.json({success: false, message: "Can't delete this todo"});
    }

    try {
        await list.updateOne({
            $pull: {
                todos: {_id: req.body.todoid}
            }
        });

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/list/todo/finished/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id,
        $or: [
            {users: {$elemMatch: {userid: req.userid}}},
            {admins: {$elemMatch: {userid: req.userid}}},
        ]
    });

    if(!list){
        return res.json({success: false, message: "Can't update this todo"});
    }

    try {
        await List.findOneAndUpdate({
            todos: {$elemMatch: {_id: req.body.todoid}}
        }, {
            "todos.$.finished": req.body.finished
        });
        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.post("/list/todo/edit/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id,
        admins: {$elemMatch: {userid: req.userid}}
    });

    if(!list){
        return res.json({success: false, message: "Can't update this todo"});
    }

    try {
        if(req.body.edit){
            await List.findOneAndUpdate({
                todos: {$elemMatch: {_id: req.body.todoid}}
            }, {
                "todos.$.edit": req.body.edit
            });
            res.json({success: true, edited: false});
        }
        else {
            if(req.body.newtodoname.length<3){
                return res.json({success: false, message: "The title has to be at least 3 characters"});
            }

            await List.findOneAndUpdate({
                todos: {$elemMatch: {_id: req.body.todoid}}
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

router.post("/list/admin", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        $and: [
            {_id: req.body.id},
            {admins: {$elemMatch: {userid: req.userid}}},
        ]
    });
    
    if(!list){
        return res.json({success: false});
    }
    res.json({success: true});
});

router.get("/list/admins/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id
    });

    if(!list){
        return res.json({success: false, message: "List doesn't exist"});
    }
    res.json({success: true, admins: list.admins});
});

router.get("/list/users/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id
    });

    if(!list){
        return res.json({success: false, message: "List doesn't exist"});
    }
    res.json({success: true, users: list.users});
});

router.delete("/list/leave/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id,
        $or: [
            {users: {$elemMatch: {userid: req.userid}}},
            {admins: {$elemMatch: {userid: req.userid}}}
        ]
    });

    if(!list){
        return res.json({success: false, message: "Can't leave this list"});
    }

    try {
        if(req.body.admin){
            await list.updateOne({
                $pull: {
                    admins: {userid: req.userid}
                }
            });
        }
        else {
            await list.updateOne({
                $pull: {
                    users: {userid: req.userid}
                }
            });
        }

        await list.save();
        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

router.delete("/list/kick/:id", authenticateToken, async(req, res) => {
    const list = await List.findOne({
        _id: req.params.id,
        admins: {$elemMatch: {userid: req.userid}}
    });

    if(!list){
        return res.json({success: false, message: "Can't kick from this list"});
    }

    const user = await User.findOne({
        username: req.body.name
    });

    if(!user){
        return res.json({success: false, message: "User doesn't exist"});
    }

    const kick = await List.findOne({
        _id: req.params.id,
        users: {$elemMatch: {userid: user._id}}
    });

    if(!kick){
        const isadmin = await List.findOne({
            _id: req.params.id,
            admins: {$elemMatch: {userid: user._id}}
        });

        if(isadmin){
            return res.json({success: false, message: "This user is an admin, you can't kick him"});
        }

        return res.json({success: false, message: "This user don't have access to this list"});
    }

    try {
        await kick.updateOne({
            $pull: {
                users: {userid: user._id}
            }
        });
        await kick.save();

        res.json({success: true});
    }
    catch(err){
        res.json({success: false, message: err.message});
    }
});

module.exports = router;