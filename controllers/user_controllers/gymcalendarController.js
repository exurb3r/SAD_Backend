const UserRoutine    = require("../../models/user_models/UserRoutine");
const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserSocial     = require("../../models/user_models/UserSocial");
const AppUsers       = require("../../models/user_models/AppUsers");
const GymEvents      = require("../../models/admin_models/GymEvents");

const gymcalendarData = async (req, res) => {
  try {
    const userId = req.user.id;
    let events = [];
    let personalEvents = [];
    let theGymEvents = [];
    let membershipEvents = [];

    const routines = await UserRoutine.findOne({ userId });
    if (routines) {
      const dayMap = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
      routines.routines.forEach(r => {
        if (r.dayAssigned) {
          events.push({
            title: r.routineName,
            daysOfWeek: [dayMap[r.dayAssigned]],
            backgroundColor: "#16a34a",
            type: "routine"
          });
        }
      });
    }

    const gameDetails = await UserGameDetails.findOne({ userId });
    if (gameDetails) {
      gameDetails.acceptedInvites.forEach(invite => {
        events.push({
          title: "Workout Invite",
          date: invite.date,
          backgroundColor: "#2563eb",
          type: "invite"
        });
      });
    }

    const user = await AppUsers.findOne({ userId });
    if (user) {
      const allMemberships = user.membershipStatus || [];
      const hasReal = allMemberships.some(m => m.branch !== "Walk-in");
      const memberships = hasReal
        ? allMemberships.filter(m => m.branch !== "Walk-in")
        : allMemberships;

      memberships.forEach(m => {
        if (m.startDate) {
          const e = {
            title: `🟢 Start · ${m.branch}`,
            date: m.startDate,
            backgroundColor: "#7c3aed",
            type: "membership_start",
            branch: m.branch,
            category: m.category
          };
          events.push(e);
          membershipEvents.push(e);
        }
        if (m.expiryDate) {
          const e = {
            title: `🔴 Expiry · ${m.branch}`,
            date: m.expiryDate,
            backgroundColor: "#dc2626",
            type: "membership_expiry",
            branch: m.branch,
            category: m.category
          };
          events.push(e);
          membershipEvents.push(e);
        }
      });
    }

    const gymEventsDoc = await GymEvents.findOne();
    if (gymEventsDoc) {
      gymEventsDoc.event.forEach(ev => {
        events.push({
          title: ev.title,
          date: ev.date,
          backgroundColor: "#d97706",
          type: "gym"
        });
        theGymEvents.push({
          _id: ev._id, title: ev.title,
          date: ev.date, time: ev.time,
          description: ev.description || ""
        });
      });
    }

    const social = await UserSocial.findOne({ userId });
    if (social) {
      social.calendar.forEach(ev => {
        events.push({
          title: ev.title,
          date: ev.date,
          backgroundColor: "#0891b2",
          type: "personal"
        });
        personalEvents.push({
          _id: ev._id, title: ev.title,
          date: ev.date, time: ev.time || "",
          description: ev.description || ""
        });
      });
    }

    res.status(200).json({ events, personalEvents, gymEvents: theGymEvents, membershipEvents });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, date, time, description } = req.body;
    if (!title || !date) return res.status(400).json({ message: "Title and date required" });

    const social = await UserSocial.findOne({ userId });
    if (!social) return res.status(404).json({ message: "UserSocial not found" });

    social.calendar.push({ title, date, time, description });
    await social.save();

    const added = social.calendar[social.calendar.length - 1];
    res.status(201).json({
      _id: added._id, title: added.title,
      date: added.date, time: added.time || "",
      description: added.description || ""
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const editEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, date, time, description } = req.body;

    const social = await UserSocial.findOne({ userId });
    if (!social) return res.status(404).json({ message: "UserSocial not found" });

    const ev = social.calendar.id(id);
    if (!ev) return res.status(404).json({ message: "Event not found" });

    ev.title = title;
    ev.date = date;
    ev.time = time;
    ev.description = description;
    await social.save();

    res.json({ _id: ev._id, title: ev.title, date: ev.date, time: ev.time, description: ev.description });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const social = await UserSocial.findOne({ userId });
    if (!social) return res.status(404).json({ message: "UserSocial not found" });

    social.calendar.pull(id);
    await social.save();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { gymcalendarData, addEvent, editEvent, deleteEvent };