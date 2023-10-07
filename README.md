# Fleet Management
This repo includes two nodejs scripts, 'dataPersister.js' which is responsible for storing history, and 'server.js' for providing it to clients.

# Architecture

![Screenshot from 2023-10-07 06-21-271](https://github.com/taha-saifi/fleet-management/assets/52047683/3211853a-620e-41a6-9933-f16208f6ce67)

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
