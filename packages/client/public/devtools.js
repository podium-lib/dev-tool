const agent = chrome || browser;
agent.devtools.panels.create("Podlet Context", "icon.png", "/podlet/podlet.html");
agent.devtools.panels.create("Headers", "icon.png", "/headers/headers.html");
