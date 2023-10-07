# Fleet Management
This repo includes two nodejs scripts, 'dataPersister.js' which is responsible for storing history, and 'server.js' for providing it to clients.

# Architecture

![Screenshot from 2023-10-07 06-21-271](https://github.com/taha-saifi/fleet-management/assets/52047683/49f7f3b5-b6e5-4f4a-b31f-af272039a223)

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
