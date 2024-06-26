import { eventNames } from "../components/header-input-group.js";

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

function addHeaderInput(header = "", value = "", enabled = true, index) {
	const inputs = document.getElementById("inputs");

	const headerInputGroup = document.createElement("header-input-group");
	// @ts-ignore
	headerInputGroup.headerNameInput.value = header;
	// @ts-ignore
	headerInputGroup.headerValueInput.value = value;
	// @ts-ignore
	headerInputGroup.enableCheckbox.checked = enabled;

	if (index % 2 === 0) {
		// @ts-ignore
		headerInputGroup.container.classList.add("container-even");
	}

	inputs.appendChild(headerInputGroup);
}

function refreshHeaderIndexes() {
	const inputsContainer = document.getElementById("inputs");
	const isEven = (i) => i % 2 === 0;

	for (let inputGroupIndex in Array.from(inputsContainer.children)) {
		const inputGroup = inputsContainer.children[inputGroupIndex];
		if (isEven(inputGroupIndex)) {
			// @ts-ignore
			inputGroup.container.classList.remove("container-odd");
			// @ts-ignore
			inputGroup.container.classList.add("container-even");
		} else {
			// @ts-ignore
			inputGroup.container.classList.remove("container-even");
			// @ts-ignore
			inputGroup.container.classList.add("container-odd");
		}
	}
}

function buildHeadersForm(requestHeaders) {
	let index = 0;
	for (const { header, value } of Object.values(requestHeaders)) {
		addHeaderInput(header, value, true, index);
		index++;
	}

	const headers = document.getElementById("headers");
	headers.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Read the inputs from the headers form
		const newHeaders = [];

		// TODO: filter to only inlcude active checked
		const inputsContainer = document.getElementById("inputs");

		const inputGroups = Array.from(inputsContainer.children);
		const keyValuePairs = [];
		for (let inputGroup of inputGroups) {
			// @ts-ignore
			const inputs = inputGroup.container.getElementsByTagName("input");
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
		refreshHeaderIndexes();
	});
}

window.addEventListener(eventNames.deleteHeader, (e) => {
	setTimeout(() => {
		refreshHeaderIndexes();
	}, 0);
});

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
	};

	// @ts-ignore
	const preset = presets[e.target.value];

	const inputsContainer = document.getElementById("inputs");
	const inputGroups = Array.from(inputsContainer.children);
	let missingHeaders = preset;
	for (let inputGroup of inputGroups) {
		// @ts-ignore
		const inputs = inputGroup.container.getElementsByTagName("input");
		const headerInput = inputs[0];
		const valueInput = inputs[1];

		if (preset[headerInput.value]) {
			valueInput.value = preset[headerInput.value];
			delete missingHeaders[headerInput.value];
		}
	}

	for (const [header, value] of Object.entries(missingHeaders)) {
		addHeaderInput(header, value, true, inputGroups.length);
	}
});
