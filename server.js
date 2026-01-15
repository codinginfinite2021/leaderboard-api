import geoip from "geoip-lite";

app.post("/register", (req, res) => {

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const geo = geoip.lookup(ip);

  const country = geo?.country || "Unknown";
  const flag = country !== "Unknown"
    ? String.fromCodePoint(...[...country].map(c => 127397 + c.charCodeAt()))
    : "🌍";

  // save username, score, country, flag
});
