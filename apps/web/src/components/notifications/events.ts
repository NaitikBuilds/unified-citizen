/** Fired after notification mutations so the topbar bell refreshes its count. */
export const NOTIFICATIONS_CHANGED_EVENT = 'ucg:notifications-changed'

export function notifyNotificationsChanged(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT))
}
