// Adds a live GitHub star count next to the ElatoAI and OpenToys navbar links.
// Mintlify's built-in GitHub button only supports one repo, so we do it here.
(function () {
  var REPOS = ["akdeb/ElatoAI", "akdeb/OpenToys"];
  var TTL = 60 * 60 * 1000;

  function fmt(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }

  function getStars(repo) {
    var key = "stars:" + repo;
    try {
      var c = JSON.parse(localStorage.getItem(key));
      if (c && Date.now() - c.t < TTL) return Promise.resolve(c.n);
    } catch (e) {}
    return fetch("https://api.github.com/repos/" + repo)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var n = j.stargazers_count;
        if (typeof n !== "number") return null;
        try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), n: n })); } catch (e) {}
        return n;
      })
      .catch(function () { return null; });
  }

  function decorate() {
    var nav = document.querySelector("#navbar") || document.querySelector("header");
    if (!nav) return;
    REPOS.forEach(function (repo) {
      var a = nav.querySelector('a[href="https://github.com/' + repo + '"]');
      if (!a || a.querySelector("[data-stars]")) return;
      var badge = document.createElement("span");
      badge.setAttribute("data-stars", repo);
      badge.style.cssText =
        "margin-left:8px;padding:1px 8px;border:1px solid currentColor;border-radius:9999px;font-size:12px;opacity:.75;white-space:nowrap";
      badge.textContent = "★ …";
      a.appendChild(badge);
      getStars(repo).then(function (n) {
        if (n === null) badge.remove();
        else badge.textContent = "★ " + fmt(n);
      });
    });
  }

  new MutationObserver(decorate).observe(document.documentElement, { childList: true, subtree: true });
  decorate();
})();
