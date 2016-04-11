var started = null;
var timerLengthInSeconds = 30.0;
var lastElapsedLengthInSeconds;

var tickId;
var timerId;
var resumeMenuId;

/**
 *  @return The time since the timer was started
 */
function elapsedTime() {
	return (Date.now() - started) / 1000;
}

/**
 *  @return The current time remaining for the timer
 */
function remainingTime() {
	return timerLengthInSeconds - elapsedTime();
}

/**
 *  Start the timer from the given timestamp
 *
 *  @param  time Time to set the timer's end time relative to (optional, defaults to Date.now())
 */
function start(time) {
	var remainingTimeInSeconds = timerLengthInSeconds;

	// Record our start time
	if (time == undefined) {
		started = Date.now();
	} else {
		started = time;
		remainingTimeInSeconds = remainingTime();
	}

	// Start the callback that will fire when the timer expires
	timerId = setTimeout(function() {
		handleTimerExpired();
	}, remainingTimeInSeconds * 1000);

	// Start ticking to update the counter every second
	tickId = setInterval(function() {
		updateCounter();
	}, 1000);

	updateCounter();

	// Timer can't be resumed once started
	chrome.contextMenus.update(resumeMenuId, {
		enabled: false
	});
}

/**
 *  Stop the current timer from executing
 */
function stop() {
	// Save the elapsed time, so if we're "resumed" we can continue correctly
	lastElapsedLengthInSeconds = elapsedTime();

	// Clear the start time and callbacks
	started = null;
	clearInterval(tickId);
	clearTimeout(timerId);
}

/**
 *  Callback for when the timer period expires
 */
function handleTimerExpired() {
	var myAudio = new Audio();
	myAudio.src = "sounds/Chewbacca.mp3";
	myAudio.loop = false;
	myAudio.play();
	
	stop();
	chrome.browserAction.setBadgeText({text: "0s"});
}

/**
 *  Callback for when the user manually stops the timer, which allows them to resume it
 */
function handleUserStopped() {
	stop();
	chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 255, 255]});

	// Allow the timer to be resumed if necessary
	chrome.contextMenus.update(resumeMenuId, {
		enabled: true
	});
}

/**
 *  Called on a repeating interval to update the timer display on the browser action button
 */
function updateCounter() {
	var remainingTimeInSeconds = remainingTime();

	if (remainingTimeInSeconds > 10) {
		chrome.browserAction.setBadgeBackgroundColor({color: [0, 255, 0, 255]});
	} else {
		chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});		
	}

	chrome.browserAction.setBadgeText({text: remainingTimeInSeconds.toFixed(0) + "s"});	
}

/**
 *  Called to toggle the current timer when the user fires the browser action
 */
function toggleTimer(tab) {
	if (started == null) {
		start();
	} else {
		handleUserStopped();
	}
}

/**
 *  Called when the user clicks the "Resume" menu item in the context menu
 */
function onResumeClicked(event) {
	start(Date.now() - (lastElapsedLengthInSeconds * 1000));
}

// Set our action when our button is clicked
chrome.browserAction.onClicked.addListener(toggleTimer);

// Add a context menu item
resumeMenuId = chrome.contextMenus.create({
	"title": "Resume",
	"contexts": ["browser_action"],
	"onclick": onResumeClicked,
	"enabled": false
});
