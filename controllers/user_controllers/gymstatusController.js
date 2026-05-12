const AppUsers       = require("../../models/user_models/AppUsers");
const UserSideGymLog = require("../../models/user_models/UserGymLog");

const getGymHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await AppUsers.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const allMemberships = user.membershipStatus || [];

    const hasRealMembership = allMemberships.some(m => m.branch !== "Walk-in");
    const memberships = hasRealMembership
      ? allMemberships.filter(m => m.branch !== "Walk-in")
      : allMemberships;

    const logDoc = await UserSideGymLog.findOne({ userId });
    const allLogs = logDoc
      ? [...logDoc.userlog].sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

    const logs = hasRealMembership
      ? allLogs.filter(log => log.branch !== "Walk-in")
      : allLogs;

    const loginEvents = logs.map(log => ({
      title: `🏋️ ${log.branch}`,
      date:  log.date,
      color: '#1d4ed8',
      extendedProps: { type: "login", branch: log.branch, timeIn: log.timeIn, timeOut: log.timeOut }
    }));

    const membershipEvents = memberships.flatMap(m => {
      const events = [];
      if (m.startDate) events.push({
        title: `🟢 ${m.branch}`,
        date:  m.startDate,
        color: '#15803d',
        extendedProps: { type: "membership_start", category: m.category, branch: m.branch }
      });
      if (m.expiryDate) events.push({
        title: `🔴 ${m.branch}`,
        date:  m.expiryDate,
        color: '#dc2626',
        extendedProps: { type: "membership_expiry", category: m.category, branch: m.branch }
      });
      return events;
    });

    res.status(200).json({
      memberships,
      logs,
      calendarEvents: [...loginEvents, ...membershipEvents]
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getGymHistory };