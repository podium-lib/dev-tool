const agent = chrome || browser;
agent.devtools.panels.create("Podium Context", "icon.png", "/podlet/podlet.html");
agent.devtools.panels.create("Podium Headers", "icon.png", "/headers/headers.html");
