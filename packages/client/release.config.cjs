/**
 * @type {import('semantic-release').Options}
 */
const config = {
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		"@semantic-release/changelog",
		[
			"semantic-release-firefox",
			{
				channel: "listed",
				extensionId: "podium-dev-tool@podium-lib.io",
				sourceDir: "./public",
				targetXpi: "podium_developer_tools.xpi",
			},
		],
		[
			"@semantic-release/github",
			{
				assets: "release/*.tgz",
			},
		],
		"@semantic-release/git",
	],
	preset: "angular",
	branches: [
		{
			name: "main",
		},
	],
};

module.exports = config;
