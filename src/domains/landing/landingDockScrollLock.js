let locked = false

export function beginLandingDockScroll() {
  locked = true
}

export function endLandingDockScroll() {
  locked = false
  window.dispatchEvent(new CustomEvent('landing-dock-scroll-end'))
}

export function isLandingDockScrollLocked() {
  return locked
}
