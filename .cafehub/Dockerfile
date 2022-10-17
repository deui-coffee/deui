FROM python:3.10

RUN apt-get update

RUN apt-get install -y git bluez bluetooth libmtdev-dev vim xauth

WORKDIR /root

RUN git clone https://github.com/mondoreale/cafehub/

RUN service dbus start

RUN service bluetooth start

RUN apt-get install -y openjdk-17-jdk

ENV JDK_HOME=/usr/lib/jvm/java-17-openjdk-arm64

RUN python -m pip install --upgrade pip

RUN pip install virtualenv

WORKDIR /root/cafehub

RUN touch /root/.Xauthority

RUN python -m virtualenv kivy_venv

RUN ln -s kivy_venv/bin/activate

RUN pip3 install cython

RUN pip3 install kivy

RUN pip3 install oscpy

RUN pip3 install bleak

RUN pip3 install pydantic

RUN pip3 install websocket-server

RUN pip3 install jnius

RUN pip3 install pytest

WORKDIR /root

ENTRYPOINT bash
