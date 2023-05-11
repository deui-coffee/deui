# Deui ☕️

## Connect to your DE1

1. Install [CafeHub](https://github.com/deui-coffee/deui/tree/main/.cafehub/bin) (the apk file) onto the Android device that's connected to your DE1 machine.
2. Close all apps on the tablet.
3. Disable bluetooth on the tablet.
4. Enable bluetooth on the tablet.
6. Open CafeHub app on the tablet.
7. The app displays a URL of the demo app build into CafeHub, e.g. `http://192.168.1.123:5000`. It contains tablet's IP address. In our case it's `192.168.1.123`. Yours will very likely be different.
8. Go to http://staging.deui.coffee, click Manage, and enter `ws://<YOUR CAFEHUB IP ADDRESS>:8765`. E.g. `ws://192.168.1.123:8765`.
9. Make sure the tablet is close to the machine.
10. Hit Connect and wait.

### Troubleshooting

- If it stuck at `Opening…` then something is wrong. Repeat steps 2-6 and retry.
  - Make sure the IP address you're connecting to is correct.
  - Make sure you're on http://staging.deui.coffee, or use your local instance (see "Develop" section below). HTTPS won't work.
- If it stuck at `Scanning…` and fails after a while then it's either
  - DE1 is too far (tablet can't reach it) or non-present (powered off), or
  - DE1 is already connected to something (CafeHub, or something else) and doesn't manifest its presence.
- `Connecting…` means the machine has been found. It usually takes a while. If it fails, then retry steps 2-6, and try again. You're close!
  
If it still doesn't work open the Inspector in your browser and watch the logs. It may contain more clues. Open an issue if you find any other weirdness.

## Develop

```
npm ci
npm start
```

## Build

```
npm ci
npm run build
```
