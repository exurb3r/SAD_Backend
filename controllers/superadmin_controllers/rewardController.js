const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserPreferenceAndMisc = require("../../models/user_models/UserPreferenceAndMisc");
const Users = require("../../models/user_models/AppUsers");

function getExpRequired(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

const getUsersWithGameDetails = async (req, res) => {
  try {
    const users = await Users.find().select("username email");

    const result = await Promise.all(
      users.map(async (user) => {
        let game = await UserGameDetails.findOne({ userId: user._id });
        if (!game) {
          return {
            id: user._id,
            username: user.username,
            email: user.email,
            level: 1,
            exp_points: 0
          };
        }

        return {
          id: user._id,
          username: user.username,
          email: user.email,
          level: game.level,
          exp_points: game.exp_points
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
const rewardUser = async (req, res) => {
  try {
    const { userId, title, description, exp } = req.body;

    if (!userId || !title || !exp) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (exp <= 0) {
      return res.status(400).json({ message: "EXP must be greater than 0" });
    }

    let userGame = await UserGameDetails.findOne({ userId });

    if (!userGame) {
      userGame = new UserGameDetails({
        userId,
        achievements: [],
        level: 1,
        exp_points: 0
      });
    }

    userGame.exp_points = Number(userGame.exp_points) || 0;
    userGame.level = Number(userGame.level) || 1;

    const achievement = {
      title,
      description,
      exp_gained: exp
    };

    userGame.achievements.push(achievement);

    userGame.exp_points += exp;

    let leveledUp = false;

    while (userGame.exp_points >= getExpRequired(userGame.level)) {
      userGame.exp_points -= getExpRequired(userGame.level);
      userGame.level += 1;
      leveledUp = true;
    }

    await userGame.save();

    let userPref = await UserPreferenceAndMisc.findOne({ userId });

    if (!userPref) {
      userPref = new UserPreferenceAndMisc({
        userId,
        notifications: []
      });
    }

    userPref.notifications.push({
      title: "🎉 Reward Received!",
      description: `${title} (+${exp} EXP)`
    });

    await userPref.save();

    res.status(200).json({
      message: "Reward granted successfully",
      newLevel: userGame.level,
      remainingExp: userGame.exp_points,
      leveledUp
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { rewardUser, getUsersWithGameDetails };