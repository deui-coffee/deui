# Deui ☕️

The app is consisted of 2 main elements

-   a WebSocket server that connects hardwares (your bluetooth adapter and the DE1), and
-   the Deui frontend.

## Run locally

```bash
npm ci

# If you wanna develop the frontend app run
npm start

# If you just want to use it (most likely what you're here for), run
npm run start-prod
```

`start-prod` builds static Deui files and puts them into `dist` folder, and the HTTP/WebSocket server serves them.

Navigate to http://localhost:3001

## Troubleshooting

For issues related to bluetooth, refer to [`abandonware/noble`](https://github.com/abandonware/noble). Most of what can happen is already described in their README.
