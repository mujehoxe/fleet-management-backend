# Fleet Management
This repo includes two nodejs scripts, 'dataPersister.js' which is responsible for storing history, and 'server.js' to provide data and history about the UAVs to the clients.

# Architecture

![Screenshot from 2023-10-07 06-21-271](https://github.com/mujehoxe/fleet-management-backend/assets/52047683/83ee00a6-da28-455b-9372-d79f0a88fb83)

# Usage
Open a terminal
```
#
git clone https://github.com/taha-saifi/fleet-management
cd fleet-management
npm i
node dataPersister.js
```
Open another terminal, in the same dir
```
node server.js
```
