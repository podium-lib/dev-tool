const useBrowser = chrome || browser;
useBrowser.devtools.panels.create("Podium", "icon.png", "/podlet/podlet.html");
