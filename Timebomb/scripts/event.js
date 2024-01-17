const timerLengthInSeconds = 30.0;
let started = null;
let lastElapsedLengthInSeconds;

let tickId;
let timerId;

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
  let remainingTimeInSeconds = timerLengthInSeconds;

  // Record our start time
  if (time == undefined) {
    started = Date.now();
  } else {
    started = time;
    remainingTimeInSeconds = remainingTime();
  }

  // Start the callback that will fire when the timer expires
  timerId = setTimeout(function () {
    handleTimerExpired();
  }, remainingTimeInSeconds * 1000);

  // Start ticking to update the counter every second
  tickId = setInterval(function () {
    if (started !== null) {
      updateCounter();
    }
  }, 1000);

  updateCounter();
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
  stop();
  chrome.action.setBadgeText({ text: "0s" });
}

/**
 *  Callback for when the user manually stops the timer, which allows them to resume it
 */
function handleUserStopped() {
  stop();
  chrome.action.setBadgeBackgroundColor({ color: [0, 0, 255, 255] });
  chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255] });
}

/**
 *  Called on a repeating interval to update the timer display on the browser action button
 */
function updateCounter() {
  const remainingTimeInSeconds = remainingTime();

  if (remainingTimeInSeconds > 10) {
    chrome.action.setBadgeBackgroundColor({ color: [0, 255, 0, 255] });
    chrome.action.setBadgeTextColor({ color: [0, 0, 0, 255] });
  } else {
    chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255] });
  }

  chrome.action.setBadgeText({
    text: remainingTimeInSeconds.toFixed(0) + "s",
  });
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

// Set our action when our button is clicked
chrome.action.onClicked.addListener(toggleTimer);

// Listen for commands from the page
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.message == "start") {
      start();
    } else if (msg.message == "stop") {
      stop();
    } else if (msg.message == "resume") {
      start(Date.now() - lastElapsedLengthInSeconds * 1000);
    }
  });
});
