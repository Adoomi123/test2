const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Mock Instagram user data
const mockInstagramData = (username) => ({
  username,
  full_name: "Adam Developer",
  profile_pic_url: "https://via.placeholder.com/150",
  biography: "This is a sample Instagram bio.",
  followers: 18500,
  following: 142,
  posts: 36,
  reels: 12,
  growth7: [17000, 17250, 17500, 17750, 18000, 18250, 18500],
  growth30: Array.from({ length: 30 }, (_, i) => 14000 + i * 150),
});

app.post("/api/instagram", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  const data = mockInstagramData(username);
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
