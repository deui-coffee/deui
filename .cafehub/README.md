# CafeHub in docker

This document describes necessary steps to get CafeHub up and running inside a docker container. It's tested in the following environemnt:

-   Raspberry pi 4 w/ Ubuntu server and docker
-   Ubuntu desktop (for its X server) – this can be a virtual machine.

## Steps to fire it up:

1. `ssh` into the Pi from your desktop.

```sh
ssh -X <pi>
```

2. After connecting to the Pi, confirm that you properly forwarded X11.

```sh
echo $DISPLAY # -> localhost:X.Y
```

3. Clone this repo into the Pi and `cd` into `deui/.cafehub` (this folder).

4. Build the images

We've got 2 images:

-   `bt` is mostly about everything expect `cafehub` code, and
-   `cafehub` is about `cafehub` code and starting up `dsub` and `bluetooth` services.

Note: `cafehub` image depends on `bt` image.

```sh
docker build -t bt -f Dockerfile.bt --force-rm .
docker build -t cafehub -f Dockerfile.cafehub --force-rm .
```

5. Get xauth creds. Copy the entire line.

```sh
xauth list # -> ubuntu/unix:10  MIT-MAGIC-COOKIE-1  <hash>
```

6. Run a `cafehub` container.

```sh
docker run -it --rm --name ch -e DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix -v /var/run/dbus/:/var/run/dbus/:z --privileged --net=host cafehub
```

7. While inside the container, add the `xauth` credentials.

```sh
xauth add ubuntu/unix:10  MIT-MAGIC-COOKIE-1  <hash>
```

8. Inside the container, run CafeHub instance.

```sh
cd cafehub/src
python3 main.py
```

Done.