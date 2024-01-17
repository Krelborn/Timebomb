/*
 * Listen for a custom event so can be invoked by the page
 *
 * Example:
 * ```
 * window.dispatchEvent(
 *     new CustomEvent("timebombCommand", {
 *       detail: { command: "start" },
 *     })
 *   );
 * ```
 *
 * Supported commands:
 * - start
 * - stop
 * - resume
 */
window.addEventListener("timebombCommand", handleTimebombCommand);

/**
 * Handle a timebomb command event
 *
 * @param {CustomEvent} event the event that was fired
 */
function handleTimebombCommand(event) {
  const port = chrome.runtime.connect();
  port.postMessage({ message: event.detail.command });
}
