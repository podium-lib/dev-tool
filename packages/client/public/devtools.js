import Api from "./services/api.js";

const api = new Api();

async function connect() {
	const meta = await api.getMeta();
	const contexts = await api.getContexts();

	const pre = document.getElementById("log");
	pre.textContent = JSON.stringify(
		{
			meta,
			contexts,
		},
		null,
		2,
	);
}

// Try to connect using defaults
connect();

const connection = document.getElementById("connection");
connection.addEventListener("submit", async (e) => {
	e.preventDefault();

	api.base = connection.querySelector('input[name="apibase"]').value;

	await connect();
});
