# ffmpeg video capturing addon for firefox

Press 'F9' to start capturing the contnts of your current Firefox window

## Installation

1. Install [node.js](https://nodejs.org/download/) including npm
2. Install jmp (firefox addon tool) `npm install jpm -g`
3. Install/download ffmpeg and get it's [video capturing](https://trac.ffmpeg.org/wiki/Capture/Desktop) running
	- Windows (8):
		- `ffmpeg -f dshow -i video="screen-capture-recorder" output.mp4` should start recording (q = quit)
		- installing [this](http://heanet.dl.sourceforge.net/project/screencapturer/Setup%20Screen%20Capturer%20Recorder%20v0.12.8.exe) should make it work
	- Linux:
		- TODO
	- OS X:
		- TODO
4. Run `jpm run` to test
	- press 'Ctrl+Shift+A' to open the Addons-Manager and change the settings according to your system
		- on non windows: change `-f dshow -i video="screen-capture-recorder"` to whatever is suggested [here](https://trac.ffmpeg.org/wiki/Capture/Desktop)
5. Optionally pack via `jpm xpi` and drag into your Firefox to install
