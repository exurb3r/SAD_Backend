const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserProgress = require("../../models/user_models/UserProgress");
const UserRoutine = require("../../models/user_models/UserRoutine");


const addRoutine = async (req, res) => {
  try {
    const userId = req.user.id;
    const { routineName, exercises, dayAssigned, timeAssigned } = req.body;

    if (!routineName || !exercises) {
      return res.status(400).json({ message: "Missing routine data" });
    }

    let userRoutine = await UserRoutine.findOne({ userId: userId });

    if (!userRoutine) {
      userRoutine = new UserRoutine({
        userId,
        routines: []
      });
    }

    userRoutine.routines.push({
      routineName,
      exercises,
      dayAssigned,
      timeAssigned
    });

    await userRoutine.save();

    res.status(201).json({
      message: "Routine added successfully",
      routines: userRoutine.routines
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRoutine = async (req, res) => {
  try {
    const userId = req.user.id;
    let userRoutine = await UserRoutine.findOne({ userId: userId });

    if (!userRoutine) {
      userRoutine = new UserRoutine({
        userId,
        routines: []
      });
    }

    const routines = userRoutine.routines;

    res.status(201).json({
      message: "Routine retrieved successfully",
      routines: routines
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRoutine = async (req, res) => {
  try {
    const userId = req.user.id;
    const { routineId } = req.body;
    let userRoutine = await UserRoutine.findOne({ userId: userId });
    if (!userRoutine) {
      return res.status(404).json({ message: "No routines found for user" });
    }

    userRoutine.routines = userRoutine.routines.filter(
        (routine) => routine._id.toString() !== routineId
    );

    await userRoutine.save();

    res.status(201).json({
      message: "Routine deleted successfully",
      routines: userRoutine.routines
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getIndividualRoutine = async (req, res) => {
  try {
    const userId = req.user.id;
    const { routineId } = req.params;

    const userRoutine = await UserRoutine.findOne({ userId });

    if (!userRoutine || !userRoutine.routines?.length) {
      return res.status(404).json({ message: "No routines found for user" });
    }

    const routine = userRoutine.routines.find(
      r => r._id.toString() === routineId
    );

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.status(200).json({
      message: "Routine retrieved successfully",
      routine
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const updateIndividualRoutine = async (req, res) => {
  try {
    const userId = req.user.id;
    const { routineId } = req.params;
    const { routineName, exercises, dayAssigned, timeAssigned } = req.body;

    if (!routineName || !exercises || exercises.length === 0) {
      return res.status(400).json({ message: "Missing routine data" });
    }

    const userRoutine = await UserRoutine.findOne({ userId });

    if (!userRoutine) {
      return res.status(404).json({ message: "No routines found" });
    }

    const routineIndex = userRoutine.routines.findIndex(
      r => r._id.toString() === routineId
    );

    if (routineIndex === -1) {
      return res.status(404).json({ message: "Routine not found" });
    }

    userRoutine.routines[routineIndex].routineName = routineName;
    userRoutine.routines[routineIndex].exercises = exercises;
    userRoutine.routines[routineIndex].dayAssigned = dayAssigned;
    userRoutine.routines[routineIndex].timeAssigned = timeAssigned;

    await userRoutine.save();

    res.status(200).json({
      message: "Routine updated successfully",
      routine: userRoutine.routines[routineIndex]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const finishedWorkoutSession = async (req, res) => {
  try {
    const userId = req.user.id;

    let {
      routineId,
      timeSpent,
      numberOfWorkout,
      numberOfFinished,
      workoutList
    } = req.body;

    const safeTimeSpent = Number(timeSpent) || 0;
    const safeNumberOfWorkout = Number(numberOfWorkout) || 0;
    const safeNumberOfFinished = Number(numberOfFinished) || 0;

    const userRoutine = await UserRoutine.findOne({ userId });
    if (!userRoutine) {
      return res.status(400).json({ message: "Routine not found" });
    }

    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      return res.status(400).json({ message: "User progress not found" });
    }

    const userGameDetails = await UserGameDetails.findOne({ userId });
    if (!userGameDetails) {
      return res.status(400).json({ message: "Game details not found" });
    }

    const routine = userRoutine.routines.id(routineId);
    if (!routine) {
      return res.status(400).json({ message: "Routine does not exist" });
    }

    const completionRate =
      safeNumberOfWorkout === 0
        ? 0
        : (safeNumberOfFinished / safeNumberOfWorkout) * 100;

    let multiplier = 1;

    if (completionRate === 100) {
      multiplier = 1.5;
    } else if (completionRate >= 80) {
      multiplier = 1.35;
    } else if (completionRate >= 70) {
      multiplier = 1.2;
    }

    const baseExp = safeNumberOfFinished * 10;
    const expGained = Math.round(baseExp * multiplier) || 0;

    userRoutine.routineHistory.push({
      routineName: routine.routineName,
      exercises: workoutList || routine.exercises,
      duration: safeTimeSpent,
      expGained
    });

    await userRoutine.save();

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    let todayProgress = userProgress.progress.find(p =>
      p.date >= startOfToday
    );

    if (todayProgress) {
      todayProgress.hoursSpent += safeTimeSpent / 3600;
      todayProgress.totalWorkouts += safeNumberOfFinished;
      todayProgress.totalExpGained += expGained;
    } else {
      userProgress.progress.push({
        date: new Date(),
        hoursSpent: safeTimeSpent / 3600,
        totalWorkouts: 1,
        totalExpGained: expGained,
        distribution: []
      });
    }

    await userProgress.save();

    userGameDetails.exp_points = Number(userGameDetails.exp_points) || 0;
    userGameDetails.level = Number(userGameDetails.level) || 1;

    userGameDetails.exp_points += expGained;

    function getExpRequired(level) {
      return Math.floor(100 * Math.pow(level, 1.5));
    }

    let leveledUp = false;

    while (
      userGameDetails.exp_points >=
      getExpRequired(userGameDetails.level)
    ) {
      userGameDetails.exp_points -= getExpRequired(userGameDetails.level);
      userGameDetails.level += 1;
      leveledUp = true;
    }

    await userGameDetails.save();

    res.status(200).json({
      message: "Workout session recorded successfully",
      expGained,
      multiplier,
      completionRate: Math.round(completionRate),
      newLevel: userGameDetails.level,
      remainingExp: userGameDetails.exp_points,
      nextLevelRequirement: getExpRequired(userGameDetails.level),
      leveledUp
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { addRoutine, getRoutine, deleteRoutine, getIndividualRoutine, updateIndividualRoutine, finishedWorkoutSession };