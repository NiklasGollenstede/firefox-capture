'use strict';

const { Hotkey, } = require("sdk/hotkeys");

const { spawn: Spawn, } = require("sdk/system/child_process");
const { emit: Emit, } = require('sdk/event/core');
const { prefs: Prefs, } = require('sdk/simple-prefs');
const { exists: Exists, } = require('sdk/io/file');
const { viewFor: ViewFor, } = require("sdk/view/core");
const { browserWindows: Windows, } = require("sdk/windows");
const { ToggleButton } = require("sdk/ui");
const { now: Now, } = require("chrome").Cu;
const { setTimeout, } = require("sdk/timers");

const Timer = function(start = Now()) {
	return (end = Now()) => (end - start);
};

const log = (...args) => (console.log(...args), args.pop());

const contentPosition = gBrowser => {
	const browser = gBrowser.ownerDocument.querySelector('#browser');
	log(gBrowser, gBrowser.ownerDocument, browser);
	return log('rect', {
		x: Math.round(gBrowser.contentWindow.mozInnerScreenX),
		y: Math.round(gBrowser.contentWindow.mozInnerScreenY),
		w: Math.round(browser.clientWidth) - 2,
		h: Math.round(browser.clientHeight),
	});
};

const corpArg = ({ x, y, w, h, }) => `"crop=${w}:${h}:${x}:${y}"`;

const splitArgs = args => args.split(/\s+(?=([^"]*"[^"]*")*[^"]*$)/) // can't handle escaped quotes
	.reduce((result, value, index) => ((index % 2 === 0 && result.push(value)), result), [ ]);

const { startTimer, stopTimer, } = (() => {
	const button = ToggleButton({
		id: 'button',
		label: "Button",
		icon: { 64: './../icon.png', 32: './../icon.png', 16: './../icon.png', },
		/*onChange: function(state) {
			// TODO ...
		},*/
	});

	let timer;
	function increment() {
		if (!timer) { return; }
		button.badge++;
		setTimeout(increment, (button.badge + 1) * 1000 - timer());
	}

	return {
		startTimer() {
			timer = new Timer();
			button.badge = 0;
			button.badgeColor = 'red';
			setTimeout(increment, 1000);
		},
		stopTimer() {
			timer = null;
			button.badgeColor = 'green';
		},
	};
})();

function startRecording(recorder) {
	recorder = Spawn(
		Prefs.ffmpegExe,
		splitArgs(Prefs.ffmpegArgs).concat([
			'-filter:v', corpArg(contentPosition(ViewFor(Windows.activeWindow).gBrowser)),
			Date.now() +'.'+ Prefs.format,
		]), {
			cwd: Prefs.outputFolder,
		}
	);

	recorder.stdout.on('data', data => console.log('recorder data:', data));
	recorder.stderr.on('data', error => console.error('recorder error:', error)); // TODO: filter for: '? [y/N]'
	recorder.on('close', code => {
		console[code ? 'error' : 'log']('recorder ended with:', code);
		recorder = null;
		stopTimer();
	});
	recorder.stdin.write = recorder.send = data => Emit(recorder.stdin, 'data', data);
	startTimer();

	console.log('recorder', recorder);
	return recorder;
}

function stopRecording(recorder) {
	recorder.stdin.write('q');
	return null;
}




{ // main

	if (!Exists(Prefs.ffmpegExe)) {
		throw Error(Prefs.ffmpegExe +'doesn\'t exist');
	}

	let recorder;

	Hotkey({
		combo: Prefs.hotkey,
		onPress: () => recorder = (recorder ? stopRecording : startRecording)(recorder),
	});
}






`ffmpeg -i "concat:input1.mpg|input2.mpg|input3.mpg" -c copy output.mpg`;
