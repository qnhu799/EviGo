require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const dbURI = process.env.MONGODB_URI;

mongoose
  .connect(dbURI)
  .then(() =>
    console.log('Chúc mừng Như! Kết nối "Nhà kho" an toàn thành công!'),
  )
  .catch((err) => console.log("Lỗi kết nối rồi: ", err));

app.post("/api/events", async (req, res) => {
  try {
    const Event = require("./Event");
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const Event = require("./Event");
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server EviGo đang chạy tại: http://localhost:${PORT}`);
});
