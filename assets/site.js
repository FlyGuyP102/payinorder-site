// Fills the hidden traffic-source fields on every signup form and counts signups in GoatCounter.
// The forms post to Kit on their own; nothing here is needed for a signup to work.
(function () {
  var SOURCES = { "tiktok.com": "tiktok", "youtube.com": "youtube", "youtu.be": "youtube",
    "instagram.com": "instagram", "pinterest.com": "pinterest", "pin.it": "pinterest",
    "facebook.com": "facebook", "google.": "google" };

  function clean(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40); }

  function fromReferrer() {
    try {
      var host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host === location.hostname) return "";
      for (var key in SOURCES) if (host.indexOf(key) !== -1) return SOURCES[key];
      return clean(host.split(".")[0]);
    } catch (e) { return ""; }
  }

  var params = new URLSearchParams(location.search);
  var stored = {};
  try { stored = JSON.parse(sessionStorage.getItem("pio_src") || "{}"); } catch (e) {}
  var source = clean(params.get("utm_source")) || stored.source || fromReferrer() || "direct";
  var campaign = clean(params.get("utm_campaign")) || stored.campaign || "";
  try { sessionStorage.setItem("pio_src", JSON.stringify({ source: source, campaign: campaign })); } catch (e) {}

  document.querySelectorAll("form.signup").forEach(function (form) {
    var s = form.querySelector('[name="fields[utm_source]"]');
    var c = form.querySelector('[name="fields[utm_campaign]"]');
    if (s) s.value = source;
    if (c) c.value = campaign;
    form.addEventListener("submit", function () {
      try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "signup-" + source, title: "Signup", event: true }); } catch (e) {}
    });
  });
})();
