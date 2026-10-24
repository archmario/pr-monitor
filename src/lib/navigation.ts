// Counts page changes made inside the app since the page was first loaded.
// Lives in memory, so a full reload or a link opened in a new tab starts at 0.
// BackLink uses it to decide whether "back" can safely mean browser history.
let inAppNavigations = 0;

export function recordInAppNavigation() {
  inAppNavigations += 1;
}

export function cameFromInsideApp() {
  return inAppNavigations > 0;
}
