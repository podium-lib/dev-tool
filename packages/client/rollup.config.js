import fs from "node:fs";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import rollupPluginReplace from "@rollup/plugin-replace";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const config = {
	input: "src/index.jsx",
	plugins: [
		commonjs(),
		nodeResolve({
			extensions: [".js", ".jsx"],
		}),
		babel({
			babelHelpers: "bundled",
			presets: ["@babel/preset-react"],
			extensions: [".js", ".jsx"],
		}),
		rollupPluginReplace({
			"process.env.NODE_ENV": JSON.stringify("production"),
			"process.env.EXT_VERSION": JSON.stringify(pkg.version),
			preventAssignment: true,
		}),
	],
	output: [
		{
			format: "esm",
			file: "public/devtools.js",
			inlineDynamicImports: true,
		},
	],
};

export default config;
