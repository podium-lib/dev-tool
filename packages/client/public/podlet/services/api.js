/**
 * @typedef {object} PodletContext
 * @property {string} name
 * @property {Context} context
 */

/**
 * @typedef {Record<string, string>} Context
 */

export default class Api {
	base = "http://localhost:8172/";

	url(endpoint) {
		const url = new URL(endpoint, this.base);
		return url.href;
	}

	async getMeta() {
		try {
			const data = await fetch(this.url("/"));
			return await data.json();
		} catch (err) {
			console.error(`Unable to fetch devtool metadata at ${this.url("/")}`, err);
		}
	}

	async getPodlets() {
		try {
			const data = await fetch(this.url("/podlet"));
			return await data.json();
		} catch (err) {
			console.error(`Unable to fetch devtool podlet data at ${this.url("/podlet")}`, err);
		}
	}

	async getPodlet(name) {
		try {
			const data = await fetch(this.url("/podlet/" + name));
			return await data.json();
		} catch (err) {
			console.error(`Unable to fetch devtool podlet data at ${this.url("/podlet/" + name)}`, err);
		}
	}

	/**
	 * @returns {Promise<PodletContext[]>}
	 */
	async getContexts() {
		try {
			const data = await fetch(this.url("/context"));
			return await data.json();
		} catch (err) {
			console.error(`Unable to fetch devtool context data at ${this.url("/context")}`, err);
			throw err;
		}
	}

	async getContext(name) {
		try {
			const data = await fetch(this.url("/context/" + name));
			return await data.json();
		} catch (err) {
			console.error(`Unable to fetch devtool context data at ${this.url("/context/" + name)}`, err);
		}
	}

	async setContexts(context) {
		try {
			await fetch(this.url("/context"), {
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify(context),
			});
		} catch (err) {
			console.error(`Unable to update devtool context data at ${this.url("/context")}`, err);
		}
	}

	/**
	 * @param {string} name
	 * @param {Context} context
	 */
	async setContext(name, context) {
		try {
			const response = await fetch(this.url("/context/" + name), {
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify(context),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok.");
			}
		} catch (err) {
			console.error(`Unable to update devtool context data at ${this.url("/context/" + name)}`, err);
		}
	}
}
