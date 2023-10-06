const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://13.38.173.241");
const { Client } = require("pg");

const pgClient = new Client({
  connectionString: "postgresql://postgres:root@localhost/fleet_management",
});

pgClient.connect();

client.on("connect", function () {
  client.subscribe(
    ["+/gps/+", "+/bat/+", "+/in_air", "+/armed", "+/state"],
    function (err) {
      if (!err) {
        console.log("Subscribed to topic");
      }
    }
  );
});

const uavs = {};

function handleMessage(topic, message) {
  const parts = topic.split("/");
  let currentLevel = uavs;

  for (let i = 0; i < parts.length; i++) {
    if (!currentLevel[parts[i]]) {
      currentLevel[parts[i]] = i === parts.length - 1 ? message.toString() : {};
    } else if (i === parts.length - 1) {
      currentLevel[parts[i]] = message.toString();
    }

    currentLevel = currentLevel[parts[i]];
  }
  console.log(uavs);
}

client.on("message", async function (topic, message) {
  handleMessage(topic, message);

  const parts = topic.split("/");
  const uavId = parts[0];

  if (parts[1] === "gps") {
    const lat = uavs[uavId].gps.lat;
    const lon = uavs[uavId].gps.lon;
    const abs = uavs[uavId].gps.abs;

    const queryText =
      "INSERT INTO uav_locations(uav_id, lat, lon, abs, timestamp) VALUES($1, $2, $3, $4, NOW())";
    const values = [uavId, lat, lon, abs];
    try {
      await pgClient.query(queryText, values);
    } catch (e) {
      console.error(e.stack);
    }
  } else {
    const { gps, ...info } = uavs[uavId];
    const stateJson = JSON.stringify(info);
    const text = `
      INSERT INTO uav(uav_id, state)
      VALUES($1, $2)
      ON CONFLICT (uav_id)
      DO UPDATE SET state = EXCLUDED.state;
    `;
    const values = [uavId, stateJson];
    try {
      await pgClient.query(text, values);
    } catch (e) {
      console.error(e.stack);
    }
  }
});
