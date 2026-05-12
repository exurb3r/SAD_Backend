const express = require('express');
const router = express.Router();
const GymLog = require('../../models/admin_models/GymLog');
const Users = require('../../models/admin_models/Users');
const AppUsers = require('../../models/user_models/AppUsers');

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

router.get('/stats', async (req, res) => {
  try {
    const todayKey = getTodayKey();

    const activeMembers = await Users.countDocuments({ 'membershipStatus.isActive': true });

    const memberBreakdown = await Users.aggregate([
      { $unwind: '$membershipStatus' },
      { $match: { 'membershipStatus.isActive': true } },
      { $group: { _id: '$membershipStatus.category', count: { $sum: 1 } } }
    ]);

    const totalLoginsToday = await GymLog.countDocuments({ dateKey: todayKey });

    const logsToday = await GymLog.find({ dateKey: todayKey }, 'timeIn');
    const loginBreakdown = { morning: 0, midday: 0, afternoon: 0 };
    logsToday.forEach(log => {
      const hour = parseHour(log.timeIn);
      if (hour >= 6 && hour < 10) loginBreakdown.morning++;
      else if (hour >= 10 && hour < 14) loginBreakdown.midday++;
      else loginBreakdown.afternoon++;
    });

    const appUserEmails = await AppUsers.distinct('email');
    const walkIns = await GymLog.countDocuments({
      dateKey: todayKey,
      email: { $nin: appUserEmails }
    });

    const totalAppUsers = await AppUsers.countDocuments();
    const activeAppUsers = await AppUsers.countDocuments({ status: 'Active' });
    const inactiveAppUsers = await AppUsers.countDocuments({ status: 'Inactive' });
    const neverLoggedIn = totalAppUsers - activeAppUsers - inactiveAppUsers;

    res.json({
      activeMembers: {
        value: activeMembers,
        breakdown: memberBreakdown.map(b => ({
          label: b._id,
          value: b.count,
          percent: activeMembers > 0 ? Math.round((b.count / activeMembers) * 100) : 0
        }))
      },
      totalLoginsToday: {
        value: totalLoginsToday,
        breakdown: [
          { label: 'Morning (6-10 AM)', value: loginBreakdown.morning, percent: totalLoginsToday > 0 ? Math.round((loginBreakdown.morning / totalLoginsToday) * 100) : 0 },
          { label: 'Midday (10-2 PM)',  value: loginBreakdown.midday,  percent: totalLoginsToday > 0 ? Math.round((loginBreakdown.midday  / totalLoginsToday) * 100) : 0 },
          { label: 'Afternoon (2-8 PM)',value: loginBreakdown.afternoon,percent: totalLoginsToday > 0 ? Math.round((loginBreakdown.afternoon/ totalLoginsToday) * 100) : 0 }
        ]
      },
      walkInsToday: {
        value: walkIns,
        breakdown: []
      },
      appUsers: {
        value: totalAppUsers,
        breakdown: [
          { label: 'Active',          value: activeAppUsers,   percent: totalAppUsers > 0 ? Math.round((activeAppUsers   / totalAppUsers) * 100) : 0 },
          { label: 'Inactive',        value: inactiveAppUsers, percent: totalAppUsers > 0 ? Math.round((inactiveAppUsers / totalAppUsers) * 100) : 0 },
          { label: 'Never logged in', value: neverLoggedIn,    percent: totalAppUsers > 0 ? Math.round((neverLoggedIn    / totalAppUsers) * 100) : 0 }
        ]
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/recent-activity', async (req, res) => {
  try {
    const logs = await GymLog.find().sort({ date: -1 }).limit(10);

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiring = await Users.find({
      membershipStatus: {
        $elemMatch: { isActive: true, expiryDate: { $gte: now, $lte: in7Days } }
      }
    }).limit(5);

    const logActivity = logs.map(log => ({
      id: log._id,
      type: 'join',
      message: `${log.firstname} ${log.lastname} logged in at the gym`,
      time: log.date,
      branch: log.branch
    }));

    const expiryActivity = expiring.map(user => {
      const status = user.membershipStatus.find(s => s.isActive && s.expiryDate >= now && s.expiryDate <= in7Days);
      const days = status ? Math.ceil((status.expiryDate - now) / (1000 * 60 * 60 * 24)) : 0;
      return {
        id: user._id,
        type: 'expire',
        message: `${user.firstname} ${user.lastname}'s membership expires in ${days} day${days !== 1 ? 's' : ''}`,
        time: status?.expiryDate || now
      };
    });

    const activity = [...logActivity, ...expiryActivity]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10)
      .map(item => ({ ...item, time: formatRelativeTime(item.time) }));

    res.json(activity);
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

router.get('/recent-members', async (req, res) => {
  try {
    const members = await Users.find()
      .sort({ 'membershipStatus.registrationDate': -1 })
      .limit(5);

    const now = new Date();
    const result = members.map(m => {
      const activePlan = m.membershipStatus?.find(s => s.isActive) || m.membershipStatus?.[0];
      let status = 'inactive';
      if (activePlan?.isActive) {
        const daysLeft = activePlan.expiryDate
          ? Math.ceil((activePlan.expiryDate - now) / (1000 * 60 * 60 * 24))
          : null;
        status = daysLeft !== null && daysLeft <= 7 ? 'expiring' : 'active';
      }
      return {
        id: m._id,
        name: `${m.firstname} ${m.lastname}`,
        plan: activePlan?.category || 'N/A',
        status,
        expiry: activePlan?.expiryDate
          ? new Date(activePlan.expiryDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'N/A'
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Recent members error:', err);
    res.status(500).json({ error: 'Failed to fetch recent members' });
  }
});

function parseHour(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+):\d+\s*(AM|PM)/i);
  if (!match) return 0;
  let hour = parseInt(match[1]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour;
}

function formatRelativeTime(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

module.exports = router;