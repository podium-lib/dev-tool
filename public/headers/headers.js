import { createInputGroup } from "./header-input.js";

const agent = typeof globalThis.browser !== "undefined" ? globalThis.browser : globalThis.chrome;

const backgroundPageConnection = agent.runtime.connect({
	name: "podium-devtools",
});

backgroundPageConnection.postMessage({
	name: "podium/init",
	tabId: agent.devtools.inspectedWindow.tabId,
});

// Listen to messages coming from scripts injected into the page
window.addEventListener("message", function (event) {
	// Only accept messages from the same frame
	if (event.source !== window) {
		return;
	}

	// And only accept messages that we know are ours
	const message = event.data;
	if (typeof message !== "object" || message === null || message.source !== "podium-devtools") {
		return;
	}

	agent.runtime.sendMessage(message);
});

// Listen to messages coming from the service worker
backgroundPageConnection.onMessage.addListener((message) => {
	switch (message.name) {
		case "podium/request-headers": {
			buildHeadersForm(message.requestHeaders);
			break;
		}
	}
});

function addHeaderInput(header = "", value = "", enabled = true) {
	const inputs = document.getElementById("inputs");
	const headerInputGroup = createInputGroup({ header, value, enabled });
	inputs.appendChild(headerInputGroup);
}

function buildHeadersForm(requestHeaders) {
	for (const { header, value } of Object.values(requestHeaders)) {
		addHeaderInput(header, value, true);
	}

	const headers = document.getElementById("headers");
	headers.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Read the inputs from the headers form
		const newHeaders = [];

		const inputsContainer = document.getElementById("inputs");

		const inputGroups = Array.from(inputsContainer.children);
		const keyValuePairs = [];
		for (let inputGroup of inputGroups) {
			const inputs = inputGroup.getElementsByTagName("input");
			const headerInput = inputs[0].value;
			const valueInput = inputs[1].value;
			const checkboxInput = inputs[2].checked;

			if (checkboxInput && headerInput && valueInput) {
				keyValuePairs.push([headerInput, valueInput]);
			}
		}

		for (const [header, value] of keyValuePairs) {
			newHeaders.push({
				header,
				operation: "set",
				value,
			});
		}

		backgroundPageConnection.postMessage({
			name: "podium/update-headers",
			tabId: agent.devtools.inspectedWindow.tabId,
			newHeaders,
		});
	});

	document.getElementById("add-header").addEventListener("click", () => {
		addHeaderInput();
	});
}

document.getElementById("preset-select").addEventListener("change", (e) => {
	const presets = {
		mobile: {
			"x-podium-app-id": "lib.podium.app@1.2.3",
			"x-podium-base-font-size": "1rem",
			"x-podium-device-type": "mobile",
		},
		desktop: {
			"x-podium-app-id": "lib.podium.app@1.2.3",
			"x-podium-base-font-size": "1rem",
			"x-podium-device-type": "desktop",
		},
		"hybrid-ios": {
			"x-podium-app-id": "lib.podium.app@1.2.3",
			"x-podium-base-font-size": "1rem",
			"x-podium-device-type": "hybrid-ios",
		},
		"hybrid-android": {
			"x-podium-app-id": "lib.podium.app@1.2.3",
			"x-podium-base-font-size": "1rem",
			"x-podium-device-type": "hybrid-android",
		},
	};

	const preset = presets[/** @type {HTMLSelectElement} */ (e.target).value];

	const inputsContainer = document.getElementById("inputs");
	const inputGroups = Array.from(inputsContainer.children);
	let missingHeaders = preset;
	for (let inputGroup of inputGroups) {
		const inputs = inputGroup.getElementsByTagName("input");
		const headerInput = inputs[0];
		const valueInput = inputs[1];

		if (preset[headerInput.value]) {
			valueInput.value = preset[headerInput.value];
			delete missingHeaders[headerInput.value];
		}
	}

	for (const [header, value] of Object.entries(missingHeaders)) {
		addHeaderInput(header, value, true);
	}
});
