// Runs in the browser before the app starts. Registers the service worker (public/sw.js) in
// production only, so `npm run dev` never serves stale cached pages. Test it with
// `npm run build && npm start`.
if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
  const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
