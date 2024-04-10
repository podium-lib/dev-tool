import Api from "./services/api.js";

const api = new Api();

async function connect() {
	const contexts = await api.getContexts();

	const podlets = document.getElementById("podlets");

	// remove existing DOM
	while (podlets.firstChild) {
		podlets.removeChild(podlets.firstChild);
	}

	for (const podlet of contexts) {
		const article = document.createElement("article");
		podlets.appendChild(article);

		const heading = document.createElement("h2");
		heading.textContent = podlet.name;

		article.appendChild(heading);

		const form = document.createElement("form");
		article.appendChild(form);

		let i = 0;
		for (const [name, value] of Object.entries(podlet.context)) {
			const wrapperElement = document.createElement("div");

			const id = `${podlet.name}${i++}`;
			const label = document.createElement("label");
			label.htmlFor = id;
			label.textContent = name;
			wrapperElement.appendChild(label);

			const input = document.createElement("input");
			input.id = id;
			input.name = name;
			input.value = value;
			wrapperElement.appendChild(input);

			form.appendChild(wrapperElement);
		}

		const submit = document.createElement("button");
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
	statusMeta.textContent = `DevTools API version ${meta.version}`;
}

// Try to connect using defaults
connect();

const connection = document.getElementById("connection");
connection.addEventListener("submit", async (e) => {
	e.preventDefault();

	api.base = connection.querySelector('input[name="apibase"]').value;

	await connect();
});
