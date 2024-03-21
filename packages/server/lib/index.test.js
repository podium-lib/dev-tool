import { beforeEach, test } from "node:test";
import assert from "node:assert";
import express from "express";
import Podlet from "@podium/podlet";
import request from "supertest";
import DevTool from "./index.js";

let app;
/**
 * @type {Podlet}
 */
let podlet;
let devTool;

beforeEach(() => {
	podlet = new Podlet({
		name: "myPodlet",
		version: "1.0.0",
		pathname: "/",
		development: true,
	});

	devTool = new DevTool({});
	devTool.register(podlet);

	app = express();

	app.use(podlet.middleware());

	app.get(podlet.manifest(), (req, res) => {
		res.json(podlet);
	});

	app.get(podlet.content(), (req, res) => {
		res.json({ context: res.locals.podium.context });
	});
});

test("get dev tool information", async () => {
	const { body } = await request(devTool.app).get("/");
	assert.ok(body.enabled);
	assert.ok(body.version);
});

test("start and stop methods", async (t) => {
	const logger = {
		trace: t.mock.fn(),
		debug: t.mock.fn(),
		info: t.mock.fn(),
		warn: t.mock.fn(),
		error: t.mock.fn(),
		fatal: t.mock.fn(),
	};
	devTool = new DevTool({ logger });
	devTool.register(podlet);

	await devTool.start();
	await devTool.stop();

	assert.match(logger.trace.mock.calls[0].arguments[0], /dev tool server started on port "8172" \(in/);
	assert.match(logger.trace.mock.calls[1].arguments[0], /dev tool server shutdown in/);
	assert.equal(logger.trace.mock.calls.length, 2);
});

test("starting on a random port", async (t) => {
	const logger = {
		trace: t.mock.fn(),
		debug: t.mock.fn(),
		info: t.mock.fn(),
		warn: t.mock.fn(),
		error: t.mock.fn(),
		fatal: t.mock.fn(),
	};
	devTool = new DevTool({ logger, port: 0 });
	devTool.register(podlet);

	await devTool.start();
	await devTool.stop();

	assert.match(logger.trace.mock.calls[0].arguments[0], /dev tool server started on port "/);
	assert.notEqual(logger.trace.mock.calls[0].arguments[0], "undefined");
	assert.notEqual(logger.trace.mock.calls[0].arguments[0], "null");
	assert.notEqual(logger.trace.mock.calls[0].arguments[0], "8172");
	assert.equal(logger.trace.mock.calls.length, 2);
});

test("get all podlet information", async () => {
	const { body } = await request(devTool.app).get("/podlet");
	assert.deepStrictEqual(body, [
		{
			css: [],
			js: [],
			content: "/",
			fallback: "",
			name: "myPodlet",
			proxy: {},
			version: "1.0.0",
		},
	]);
});

test("get single podlet information", async () => {
	const { body } = await request(devTool.app).get("/podlet/myPodlet");
	assert.deepStrictEqual(body, {
		css: [],
		js: [],
		content: "/",
		fallback: "",
		name: "myPodlet",
		proxy: {},
		version: "1.0.0",
	});
});

test("get all contexts", async () => {
	const { body } = await request(devTool.app).get("/context");
	assert.deepStrictEqual(body, [
		{
			name: "myPodlet",
			context: {
				debug: "false",
				deviceType: "desktop",
				locale: "en-US",
				mountOrigin: "",
				mountPathname: "/",
				publicPathname: "/podium-resource/myPodlet",
				requestedBy: "myPodlet",
			},
		},
	]);
});

test("set value on all contexts", async () => {
	await request(devTool.app).post("/context").send({ mountOrigin: "http://fake.com:1337" });

	const { body } = await request(app).get("/");
	assert.deepStrictEqual(body, {
		context: {
			debug: "false",
			deviceType: "desktop",
			locale: "en-US",
			mountOrigin: "http://fake.com:1337",
			mountPathname: "/",
			publicPathname: "/podium-resource/myPodlet",
			requestedBy: "myPodlet",
		},
	});
});

test("set value on all contexts", async () => {
	await request(devTool.app).post("/context/myPodlet").send({ mountOrigin: "http://superfake.com:1337" });

	const { body } = await request(app).get("/");
	assert.deepStrictEqual(body, {
		context: {
			debug: "false",
			deviceType: "desktop",
			locale: "en-US",
			mountOrigin: "http://superfake.com:1337",
			mountPathname: "/",
			publicPathname: "/podium-resource/myPodlet",
			requestedBy: "myPodlet",
		},
	});
});

test("get single context by podlet name", async () => {
	const { body } = await request(devTool.app)
		.get("/context/myPodlet")
		.expect(200)
		.expect("Content-Type", "application/json; charset=utf-8");

	assert.deepStrictEqual(body, {
		publicPathname: "/podium-resource/myPodlet",
		mountPathname: "/",
		mountOrigin: "",
		requestedBy: "myPodlet",
		deviceType: "desktop",
		locale: "en-US",
		debug: "false",
	});
});
