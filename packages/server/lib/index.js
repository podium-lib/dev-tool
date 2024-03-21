import { promisify } from "node:util";
import fs from "node:fs";
import body from "body";
import Context from "@podium/context";
import cors from "cors";
import abslog from "abslog";
import express from "express";

const promisifiedBody = promisify(body);
const { name, version } = JSON.parse(fs.readFileSync(new URL(`../package.json`, import.meta.url), "utf-8"));

/**
 * @typedef {object} DeveloperToolOptions
 * @property {boolean} [enabled=true] - Enable the developer tool
 * @property {number} [port=8172] - Port that browser extension should connect to
 * @property {object} [logger=undefined] - Logger conforming to the [log4j interface](https://github.com/trygve-lie/abslog?tab=readme-ov-file#interface), or console
 */

/**
 * Class implementing APIs for the Podium browser extension.
 *
 * @see {@link https://podium-lib.io/docs/browser-extension}
 */
export default class DeveloperTool {
	/**
	 * @type {import('express').Express}
	 */
	app;

	/**
	 * @type {import('@podium/podlet').default[]}
	 */
	#podlets = [];

	/**
	 * @type {import('abslog')}
	 */
	#log;

	#enabled = true;

	#port = 8172;

	/**
	 * @param {DeveloperToolOptions} options
	 */
	constructor({ enabled = true, port = 8172, logger = undefined } = {}) {
		this.#enabled = enabled;
		this.#port = port;
		this.#log = abslog(logger);

		this.#log.debug(`${name}@${version} ${enabled ? "enabled" : "disabled"}`);

		const context = new Context({ name: "devTools" });
		this.contextParserNames = Array.from(context.parsers.keys());

		this.app = express();
		this.app.use(cors());

		this.app.get("/", this.#getVersion.bind(this));

		if (!this.#enabled) {
			return;
		}

		this.app.get("/podlet", this.#getPodlet.bind(this));
		this.app.get("/podlet/:name", this.#getPodlet.bind(this));
		this.app.get("/context", this.#getContext.bind(this));
		this.app.get("/context/:name", this.#getContext.bind(this));
		this.app.post("/context", this.#postContext.bind(this));
		this.app.post("/context/:name", this.#postContext.bind(this));
	}

	#normalize(context = {}) {
		let ctx = {};

		for (const key of this.contextParserNames) {
			ctx[key] = context[key] || "";
		}

		ctx = Object.assign(ctx, context);

		this.#log.trace(
			`Normalized set context values "${JSON.stringify(context)}" to context object "${JSON.stringify(ctx)}"`,
		);

		return ctx;
	}

	#denormalize(context) {
		const ctx = {};
		for (const key of Object.keys(context)) {
			if (context[key]) ctx[key] = context[key];
		}

		this.#log.trace(
			`Denormalized context object "${JSON.stringify(context)}" to set context values "${JSON.stringify(ctx)}"`,
		);

		return ctx;
	}

	#getVersion(req, res) {
		return res.json({ version, enabled: this.#enabled });
	}

	#getPodlet(req, res) {
		let podlets = this.#podlets.map((podlet) => podlet.toJSON());

		if (req.params.name) {
			// @ts-ignore
			[podlets] = podlets.filter((podlet) => podlet.name === req.params.name);
		}

		res.send(podlets);
	}

	#getContext(req, res) {
		let contexts = this.#podlets.map((podlet) => ({
			name: podlet.name,
			context: this.#normalize(podlet.defaults()),
		}));

		if (req.params.name) {
			// @ts-ignore
			[contexts] = contexts.filter((context) => context.name === req.params.name).map(({ context }) => context);
		}

		return res.json(contexts);
	}

	async #postContext(req, res) {
		try {
			const response = await promisifiedBody(req);

			if (response) {
				const context = this.#denormalize(JSON.parse(response));
				for (const podlet of this.#podlets) {
					if (req.params.name && req.params.name !== podlet.name)
						// eslint-disable-next-line no-continue
						continue;
					podlet.defaults(context);
				}
			}

			return res.sendStatus(204);
		} catch (err) {
			this.#log.error(err);
			return res.sendStatus(500);
		}
	}

	/**
	 * @param {import('@podium/podlet').default} podlet
	 */
	register(podlet) {
		this.#podlets.push(podlet);
	}

	/**
	 * Start the developer tool server.
	 * @returns {Promise<void>}
	 * @see {@link DeveloperTool.stop}
	 */
	start() {
		return new Promise((resolve) => {
			const start = new Date().getTime();
			this.server = this.app.listen(this.#port, () => {
				const ms = new Date().getTime() - start;
				this.#port = this.server.address().port;
				this.#log.trace(`dev tool server started on port "${this.#port}" (in ${ms} ms)`);
				resolve();
			});
		});
	}

	/**
	 * Stops the developer tool server.
	 * @returns {Promise<void>}
	 * @see {@link DeveloperTool.start}
	 */
	stop() {
		return new Promise((resolve) => {
			const start = new Date().getTime();
			this.server.close(() => {
				const ms = new Date().getTime() - start;
				this.#log.trace(`dev tool server shutdown in ${ms} ms`);
				resolve();
			});
		});
	}
}
