import Api from "./services/api.js";

const api = new Api();

async function connect() {
	let contexts;
	try {
		contexts = await api.getContexts();
	} catch (err) {
		const status = document.getElementById("status-meta");
		status.textContent = `error occured while connecting: ${err.message}`;
		return;
	}

	const podlets = document.getElementById("podlets");

	document.getElementById("connection").style.display = "none";

	// remove existing DOM
	while (podlets.firstChild) {
		podlets.removeChild(podlets.firstChild);
	}

	for (const podlet of contexts) {
		const article = document.createElement("article");
		article.className = "podlet-card";
		podlets.appendChild(article);

		const heading = document.createElement("h2");
		heading.className = "podlet-card-heading";
		heading.textContent = podlet.name;

		article.appendChild(heading);

		const form = document.createElement("form");
		form.className = "podlet-context-form";
		article.appendChild(form);

		let i = 0;
		for (const [name, value] of Object.entries(podlet.context)) {
			const wrapperElement = document.createElement("div");
			wrapperElement.className = "input-group";

			const id = `${podlet.name}${i++}`;
			const label = document.createElement("label");
			label.className = "input-label";
			label.htmlFor = id;
			label.textContent = name;
			wrapperElement.appendChild(label);

			const input = document.createElement("input");
			input.className = "input";
			input.id = id;
			input.name = name;
			input.value = value;
			wrapperElement.appendChild(input);

			form.appendChild(wrapperElement);
		}

		const submit = document.createElement("button");
		submit.className = "button-primary podlet-context-form-submit";
		submit.type = "submit";
		submit.textContent = `Update ${podlet.name}`;
		form.appendChild(submit);

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			const name = podlet.name;
			const context = /** @type {Record<string, string>} */ ({});
			for (const input of Array.from(form.querySelectorAll("input"))) {
				context[input.name] = input.value;
			}
			await api.setContext(name, context);
		});
	}

	const meta = await api.getMeta();
	const statusMeta = document.getElementById("status-meta");
	statusMeta.textContent = `Connected. ${contexts.length} podlets identified. DevTools API version ${meta.version}`;
}

// Try to connect using defaults
connect();

const connection = document.getElementById("connection");
connection.addEventListener("submit", async (e) => {
	e.preventDefault();

	api.base = connection.querySelector('input[name="apibase"]').value;

	await connect();
});
