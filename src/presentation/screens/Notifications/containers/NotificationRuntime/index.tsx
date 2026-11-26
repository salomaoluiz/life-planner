import useNotificationRuntime from "@screens/Notifications/hooks/useNotificationRuntime";

// Spec 124: mounted once in the signed-in layout; it renders nothing (device report, push taps, bell refresh).
function NotificationRuntime() {
  useNotificationRuntime();

  return null;
}

export default NotificationRuntime;
