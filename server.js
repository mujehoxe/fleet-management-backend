const express = require("express");
const { Client } = require("pg");
const cors = require("cors");

const pgClient = new Client({
  connectionString: "postgresql://postgres:root@localhost/fleet_management",
});

pgClient.connect();

const corsOptions = {
  origin: "*", // replace with your application's origin or an array of allowed origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

const app = express();

app.use(cors(corsOptions));

app.get("/uav-data", async (req, res) => {
  const uavId = req.query.uavId;
  const startTimestamp = req.query.startTimestamp;
  const endTimestamp = req.query.endTimestamp;

  if (!uavId || !startTimestamp) {
    res
      .status(400)
      .send("Missing required query parameters: uavId, and/or startTimestamp");
    return;
  }

  if (!endTimestamp) {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      ws.uavId = uavId;
      ws.startTimestamp = startTimestamp;
    });
  } else {
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
  }
});

app.get("/uav-list", async (req, res) => {
  const result = await getUavList();

  res.json(result.rows);
});

async function getUavList() {
  const queryText = "SELECT * FROM uav";
  return await pgClient.query(queryText);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
