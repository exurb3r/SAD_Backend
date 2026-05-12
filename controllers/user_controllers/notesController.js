const UserNotes = require('../../models/user_models/UserNotes');
const AppUser = require('../../models/user_models/AppUsers');

const taskFetcher = async (req, res) => {
    try{
        const userId = req.user.id;
        const userFound = await AppUser.findOne({ userId });
        if (!userFound) return res.status(404).json({message: "User not found"});

        let notes = await UserNotes.findOne({ userId });
        res.json(notes);

    } catch (err) {
        res.status(500).json({ message: err.message});
    }
}

const taskAdder = async (req, res) => {
    try{
        const userId = req.user.id;
        const {title, description} = req.body;
        if(!userId || !title || !description) return res.status(400).json({message: "All credentials are required"})
        const notes = await UserNotes.findOneAndUpdate(
            {userId},
            {
                $push:{
                    notes:{
                        title: title,
                        date: new Date(),
                        description: description
                    }
                }
            },
            { new: true} 
        );
        if (!notes) return res.status(404).json({'message': 'user does not exist'});
        res.status(200).json(notes);

    } catch (err){
        res.status(500).json({ message: err.message});
    }
}

const taskDeleter = async (req, res) => {
    try{
        const userId = req.user.id;
        const {noteId} = req.body;
        if(!userId || !noteId) return res.status(400).json({message: "All credentials are required"})
        const notes = await UserNotes.findOneAndUpdate(
            { userId },
            { $pull: {notes: {_id: noteId} } },
            { new: true} 
        );
        if (!notes) return res.status(404).json({'message': 'user does not exists'});

        res.status(200).json(notes);

    } catch (err){
        res.status(500).json({ message: err.message});
    }
}

const taskEditor = async (req, res) => {
    try{
        const userId = req.user.id;
        const { noteId, title, description } = req.body;
        if(!userId || !noteId || !title || !description) return res.status(400).json({message: "All credentials are required"})
        const notes = await UserNotes.findOneAndUpdate(
            { userId, "notes._id": noteId },
            {
                $set: {
                    "notes.$.title": title,
                    "notes.$.description": description,
                    "notes.$.date": new Date()
                }
            },
            { new: true }
        );
        if (!notes) return res.status(404).json({'message': 'user does not exists'});

        res.status(200).json(notes);

    } catch (err){
        res.status(500).json({ message: err.message});
    }
}
module.exports = { taskFetcher, taskAdder, taskDeleter, taskEditor };