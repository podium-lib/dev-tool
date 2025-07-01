// This runs as a service worker* and communicates with the content script layout.js via message passing
// See https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools for an intro to the architecture.
// *: in Firefox this may run as a regular script in a background page: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support

const agent = typeof globalThis.browser !== "undefined" ? globalThis.browser : globalThis.chrome;

const connections = {};

agent.runtime.onConnect.addListener((connection) => {
	const listener = (message, sender, sendResponse) => {
		if (message.name == "podium/init") {
			connections[message.tabId] = connection;
			try {
				onInit(connection, message);
			} catch (e) {
				console.error(e);
			}
			return;
		}
		if (message.name == "podium/update-headers") {
			try {
				onUpdateHeaders(connection, message);
			} catch (e) {
				console.error(e);
			}
			return;
		}
	};

	connection.onMessage.addListener(listener);
	connection.onDisconnect.addListener(() => {
		connection.onMessage.removeListener(listener);

		var tabs = Object.keys(connections);
		for (var i = 0, len = tabs.length; i < len; i++) {
			if (connections[tabs[i]] == connection) {
				delete connections[tabs[i]];
				break;
			}
		}
	});
});

// Receive message from content script and relay to the devTools page for the current tab
agent.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// Messages from content scripts should have sender.tab set
	if (sender.tab) {
		var tabId = sender.tab.id;
		if (tabId in connections) {
			connections[tabId].postMessage(request);
		} else {
			console.warn("Tab not found in connection list.");
		}
	} else {
		console.warn("sender.tab not defined.");
	}
	return true;
});

async function onInit(connection, message) {
	const defaultRules = {
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/Rule
		addRules: [
			{
				id: 1,
				// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/RuleAction
				action: {
					type: "modifyHeaders",
					// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/ModifyHeaderInfo
					requestHeaders: [
						{ header: "x-podium-app-id", operation: "set", value: "lib.podium.app@1.2.3" },
						{ header: "x-podium-base-font-size", operation: "set", value: "1rem" },
						{ header: "x-podium-device-type", operation: "set", value: "desktop" },
					],
				},
				// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/RuleCondition
				condition: {
					resourceTypes: ["main_frame"],
				},
			},
		],
	};
	try {
		await agent.declarativeNetRequest.updateSessionRules(defaultRules);
	} catch (e) {
		// We don't want to fail in case the rules are already set
		console.error(e);
		console.debug(`Tried to set rules to `, defaultRules);
	}

	const activeRules = await agent.declarativeNetRequest.getSessionRules();

	connection.postMessage({
		name: "podium/request-headers",
		requestHeaders: activeRules[0]?.action.requestHeaders,
	});
}

async function onUpdateHeaders(connection, message) {
	const newHeaders = message.newHeaders;

	if (newHeaders.length === 0) {
		// Remove all rules
		await agent.declarativeNetRequest.updateSessionRules({
			removeRuleIds: [1],
		});
	} else {
		// Set new rules
		await agent.declarativeNetRequest.updateSessionRules({
			removeRuleIds: [1],
			addRules: [
				{
					id: 1,
					action: {
						type: "modifyHeaders",
						requestHeaders: newHeaders,
					},
					condition: {
						resourceTypes: ["main_frame"],
					},
				},
			],
		});
	}

	connection.postMessage({
		name: "podium/headers-updated",
	});

	agent.tabs.reload(message.tabId);
}
