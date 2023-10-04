# Deui ☕️

The app is consisted of 2 main elements

-   a WebSocket server that connects hardwares (your bluetooth adapter and the DE1), and
-   the Deui frontend.

## Develop

```bash
npm ci

npm start
```

Navigate to http://localhost:3001/

## Run the latest build

```bash
npx deui-coffee@latest
```

And navigate to one of the addresses it gives you, e.g. http://localhost:3001/

## Troubleshooting

For issues related to bluetooth, refer to [`abandonware/noble`](https://github.com/abandonware/noble). Most of what can happen is already described in their README.

### Ubuntu

#### Disconnection Reason 62 (or 0x3E)

The error means "failed to establish connection" and happens after a successful scan. One thing that can help

```bash
systemctl status dbus
systemctl enable bluetooth.service
```
