const GymEvents = require("../../models/admin_models/GymEvents");

const getEvents = async (req, res) => {
  try {
    const data = await GymEvents.findOne();

    if (!data) return res.json([]);

    res.json(data.event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const createEvent = async (req, res) => {
  try {
    const { title, date, time, description } = req.body;

    if (!title || !date || !time || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    let doc = await GymEvents.findOne();

    if (!doc) {
      doc = new GymEvents({ event: [] });
    }

    const newEvent = {
      title,
      date,
      time,
      description
    };

    doc.event.push(newEvent);

    await doc.save();

    res.status(201).json(doc.event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await GymEvents.findOne();
    if (!doc) return res.status(404).json({ message: "No events found" });

    const event = doc.event.id(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.title = req.body.title ?? event.title;
    event.date = req.body.date ?? event.date;
    event.time = req.body.time ?? event.time;
    event.description = req.body.description ?? event.description;

    await doc.save();

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await GymEvents.findOne();
    if (!doc) return res.status(404).json({ message: "No events found" });

    const event = doc.event.id(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.remove();

    await doc.save();

    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
};