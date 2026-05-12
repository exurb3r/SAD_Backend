const UserPreferenceAndMisc = require("../../models/user_models/UserPreferenceAndMisc");
const UserSocial = require("../../models/user_models/UserSocial");


const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const preferences = await UserPreferenceAndMisc.findOne({ userId });
        const social = await UserSocial.findOne({ userId });

        let notifications = [];

        if (preferences?.notifications?.length > 0) {
            preferences.notifications.forEach((n, index) => {
                notifications.push({
                    id: `ann-${index}`,
                    type: "announcement",
                    title: n.title,
                    message: n.description,
                    timestamp: formatTime(n.date),
                    date: n.date,
                    read: false
                });
            });
        }

        if (social?.friendRequests?.length > 0) {
            social.friendRequests.forEach((f, index) => {
                notifications.push({
                    id: `fr-${index}`,
                    type: "friend_request",
                    fromUser: f.username,
                    avatar: f.username?.charAt(0).toUpperCase(),
                    message: `${f.username} sent you a friend request.`,
                    timestamp: formatTime(new Date()),
                    date: new Date(),
                    read: false,
                    userId: f.userId
                });
            });
        }

        if (social?.invitationsReceived?.length > 0) {
            social.invitationsReceived.forEach((inv, index) => {
                notifications.push({
                    id:        `inv-${index}`,
                    type:      "workout_invite",
                    fromUser:  inv.username,
                    avatar:    inv.username?.charAt(0).toUpperCase(),
                    message:   `${inv.username} invited you to an event.`,
                    detail:    `${inv.friendMessage || "Workout"} · ${formatDate(inv.date)} ${inv.time || ""}`,
                    timestamp: formatTime(inv.date),
                    date:      inv.date,
                    read:      false,
                    userId:    inv.userId  
                });
            });
        }

        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(notifications);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const { userId: friendId } = req.body;
        const userId = req.user.id;

        const userSocial   = await UserSocial.findOne({ userId });
        const friendSocial = await UserSocial.findOne({ userId: friendId });
        const AppUser      = require("../../models/user_models/AppUsers");

        const request = userSocial.friendRequests.find(
            f => f.userId.toString() === friendId
        );
        if (!request) return res.status(404).json({ message: "Request not found" });

        userSocial.friends.push(request);

        userSocial.friendRequests = userSocial.friendRequests.filter(
            f => f.userId.toString() !== friendId
        );

        const receiver = await AppUser.findById(userId);
        friendSocial.friends.push({
            userId:   userId,
            username: receiver.username,
            email:    receiver.email,
        });

        friendSocial.invitationsSent = friendSocial.invitationsSent.filter(
            inv => inv.userId.toString() !== userId
        );

        await userSocial.save();
        await friendSocial.save();

        res.json({ message: "Friend request accepted" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const declineFriendRequest = async (req, res) => {
    try {
        const { userId: friendId } = req.body;
        const userId = req.user.id;

        const userSocial   = await UserSocial.findOne({ userId });
        const friendSocial = await UserSocial.findOne({ userId: friendId });

        userSocial.friendRequests = userSocial.friendRequests.filter(
            f => f.userId.toString() !== friendId
        );

        friendSocial.invitationsSent = friendSocial.invitationsSent.filter(
            inv => inv.userId.toString() !== userId
        );

        await userSocial.save();
        await friendSocial.save();

        res.json({ message: "Friend request declined" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const acceptInvitation = async (req, res) => {
    try {
        const { userId: senderId } = req.body; 
        const receiverId = req.user.id;           

        const receiverSocial = await UserSocial.findOne({ userId: receiverId });
        const senderSocial   = await UserSocial.findOne({ userId: senderId });

        if (!receiverSocial || !senderSocial) {
            return res.status(404).json({ message: "User social data not found" });
        }

        const invite = receiverSocial.invitationsReceived.find(
            inv => inv.userId.toString() === senderId
        );
        if (!invite) return res.status(404).json({ message: "Invite not found" });

        const eventData = {
            title: invite.friendMessage || "Workout Event",
            date:  invite.date,
            time:  invite.time
        };

        receiverSocial.calendar.push(eventData);
        senderSocial.calendar.push(eventData);

        receiverSocial.invitationsReceived = receiverSocial.invitationsReceived.filter(
            inv => inv.userId.toString() !== senderId
        );

        senderSocial.invitationsSent = senderSocial.invitationsSent.filter(
            inv => inv.userId.toString() !== receiverId
        );

        await receiverSocial.save();
        await senderSocial.save();

        res.json({ message: "Invitation accepted and added to both calendars" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const declineInvitation = async (req, res) => {
    try {
        const { userId: senderId } = req.body;
        const receiverId = req.user.id;

        const receiverSocial = await UserSocial.findOne({ userId: receiverId });
        const senderSocial   = await UserSocial.findOne({ userId: senderId });

        if (!receiverSocial || !senderSocial) {
            return res.status(404).json({ message: "User social data not found" });
        }

        receiverSocial.invitationsReceived = receiverSocial.invitationsReceived.filter(
            inv => inv.userId.toString() !== senderId
        );

        senderSocial.invitationsSent = senderSocial.invitationsSent.filter(
            inv => inv.userId.toString() !== receiverId
        );

        await receiverSocial.save();
        await senderSocial.save();

        res.json({ message: "Invitation declined" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


function formatTime(date) {
    const now = new Date();
    const diff = (now - new Date(date)) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;

    return new Date(date).toLocaleDateString();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

module.exports = {
    getNotifications,
    acceptFriendRequest,
    declineFriendRequest,
    acceptInvitation,
    declineInvitation
};