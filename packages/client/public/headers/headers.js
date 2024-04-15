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
		case "podium/headers-updated": {
			agent.tabs.reload(agent.devtools.inspectedWindow.tabId);
			break;
		}
	}
});

// TODO: dropdown with presets that calls addHeaderInput with stuff?

function addHeaderInput(header = "", value = "") {
	const inputs = document.getElementById("inputs");
	let inputCount = Array.from(inputs.querySelectorAll("input")).length;

	const baseId = `header-${inputCount++}`;
	// TODO: add active checkbox

	const inputPair = document.createElement("div");
	inputPair.className = "header-form-input-pair";

	const keyInputGroup = document.createElement("div");
	keyInputGroup.className = "input-group";

	const keyInputId = `${baseId}-key-label`;
	const keyLabel = document.createElement("label");
	keyLabel.className = "input-label";
	keyLabel.htmlFor = keyInputId;
	keyLabel.textContent = "Header";
	keyInputGroup.appendChild(keyLabel);

	const keyInput = document.createElement("input");
	keyInput.className = "input";
	keyInput.id = keyInputId;
	keyInput.name = `${keyInputId}-key`;
	keyInput.value = header;
	keyInputGroup.appendChild(keyInput);
	inputPair.appendChild(keyInputGroup);

	const valueInputGroup = document.createElement("div");
	valueInputGroup.className = "input-group";

	const valueInputId = `header-${inputCount++}`;
	const valueLabel = document.createElement("label");
	valueLabel.className = "input-label";
	valueLabel.htmlFor = valueInputId;
	valueLabel.textContent = "Value";
	valueInputGroup.appendChild(valueLabel);

	const valueInput = document.createElement("input");
	valueInput.className = "input";
	valueInput.id = valueInputId;
	valueInput.name = `${valueInputId}-value`;
	valueInput.value = value;
	valueInputGroup.appendChild(valueInput);
	inputPair.appendChild(valueInputGroup);

	// TODO: add delete button that removes this inputPair

	inputs.appendChild(inputPair);
}

function buildHeadersForm(requestHeaders) {
	for (const { header, value } of Object.values(requestHeaders)) {
		addHeaderInput(header, value);
	}

	const headers = document.getElementById("headers");
	headers.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Read the inputs from the headers form
		const newHeaders = [];

		// TODO: filter to only inlcude active checked
		const keyValueInputs = Array.from(headers.querySelectorAll("input"));
		const keyValuePairs = [];
		for (let i = 0; i < keyValueInputs.length; i += 2) {
			const key = keyValueInputs[i];
			const value = keyValueInputs[i + 1];

			if (key && value) {
				keyValuePairs.push([key.value, value.value]);
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

	document.getElementById("clear").addEventListener("click", () => {
		backgroundPageConnection.postMessage({
			name: "podium/update-headers",
			tabId: agent.devtools.inspectedWindow.tabId,
			newHeaders: [],
		});
		const inputs = document.getElementById("inputs");
		for (const child of Array.from(inputs.children)) {
			inputs.removeChild(child);
		}
	});
}
