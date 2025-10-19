// tiny event bus for Vue app (emit/on/off)
const listeners = Object.create(null)

export function on(event, cb) {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(cb)
  return () => off(event, cb)
}

export function off(event, cb) {
  if (!listeners[event]) return
  if (!cb) {
    delete listeners[event]
    return
  }
  listeners[event] = listeners[event].filter((c) => c !== cb)
}

export function emit(event, payload) {
  const list = listeners[event]
  if (!list || list.length === 0) return
  // call in a copy in case listener mutates
  list.slice().forEach((cb) => {
    try { cb(payload) } catch (e) { console.error('eventBus handler error', e) }
  })
}

export default { on, off, emit }
