# Contributing to the browser extension

Thank you for showing an interest in contributing 💜

The goal of this browser extension is to help developers of [Podium applications](https://podium-lib.io/) test and debug their apps.

The extension targets [WebExtension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) Manifest V3 for [cross-browser support](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension).

If you're new to extension development, a great place to start is Mozilla's [WebExtension workshop](https://extensionworkshop.com/). Some other documentation for extension authors that may be helpful:

- [MDN - Build a cross-browser extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension)
- [Chrome - Your first extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)
- [MDN - Your first extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)

## Building

To build the extension:

```
npm install --legacy-peer-deps
npm run build
```

The extension JavaScript bundle is generated to the `public/` directory, and the packaged extension to `dist/`.

## Testing

We use [`web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) to get a quick and simple development environment in Firefox.

1. Install Firefox if you haven't
2. Run `npm install --legacy-peer-deps`
3. Run `npm start`

Firefox will open automatically. You should see two windows: one browser window, and a floating window of devtools. The devtools window is inspecting the extension, and starts empty. In the browser window, go to a test application (for instance start [server/example](../server/example/)) and open the devtools to reveal the Podium panel.

### Manual testing

The process is similar across browsers. Also note that some changes may require a reinstall or a refresh inside the browser settings.

- [Chrome: Reload the extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#reload)
- [Firefox: Testing](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#testing)

#### Firefox

- Open [about:debugging](about:debugging#/runtime/this-firefox) and click This Firefox
- Click Load Temporary Add-on
- Select `build/manifest.json`

You'll have to [repeat the steps](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing) the next time you start Firefox, and hit the refresh button when you rebuild the extension.

#### Chrome

The approach should be similar in Chromium-based browsers.

- Open [chrome://extensions/](chrome://extensions/)
  - Toggle Developer mode on in the top-right if it's not on already.
- Click Load unpacked
- Select the `build/` directory

The extension should now be installed and ready for testing. You may have to [hit the refresh button when you rebuild](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#reload) the extension.
