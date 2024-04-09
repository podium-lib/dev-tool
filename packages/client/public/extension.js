const agent = chrome || browser;
agent.devtools.panels.create("Podium", "icon.png", "/podlet/podlet.html");
