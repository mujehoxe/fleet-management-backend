const express = require("express");
const { Client } = require("pg");

const app = express();
const port = 3000;

const pgClient = new Client({
  connectionString: "postgresql://postgres:root@localhost/fleet_management",
});

pgClient.connect();

app.get("/uav-data", async (req, res) => {
  const uavId = req.query.uavId;
  const startTimestamp = req.query.startTimestamp;
  const endTimestamp = req.query.endTimestamp;

  if (!uavId) {
    res.status(400).send("Missing required query parameters: uavId");
    return;
  }

  if (!startTimestamp || !endTimestamp) {
  }

  try {
    const queryText =
      "SELECT * FROM uav INNER JOIN uav_locations ON uav.uav_id = uav_locations.uav_id WHERE uav.uav_id = $1 AND uav_locations.timestamp BETWEEN $2 AND $3 ORDER BY uav_locations.timestamp ASC";
    const values = [uavId, startTimestamp, endTimestamp];
    const result = await pgClient.query(queryText, values);

    res.json(result.rows);
  } catch (e) {
    console.error(e.stack);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
