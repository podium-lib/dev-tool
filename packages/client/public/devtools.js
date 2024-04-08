import Api from "./services/api.js";

const api = new Api();

const connection = document.getElementById("connection");
connection.addEventListener("submit", async (e) => {
	e.preventDefault();

	api.host = connection.querySelector('input[name="host"]').value;
	api.port = connection.querySelector('input[name="port"]').value;

	const currentUrl = new URL(window.location.href);
	currentUrl.searchParams.set("host", api.host);
	currentUrl.searchParams.set("port", api.port);
	window.history.pushState({}, "", currentUrl.href);

	const meta = await api.getMeta();
	console.log(meta);

	const contexts = await api.getContexts();
	console.log(contexts);
});
