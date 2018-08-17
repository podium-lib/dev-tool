export default class Page {
    devtools = !!window.chrome && window.chrome.devtools;

    reload() {
        if (this.devtools) {
            window.chrome.devtools.inspectedWindow.reload();
        }
    }

    onChange(cb) {
        if (this.devtools) {
            window.chrome.devtools.network.onNavigated.addListener(cb);
        }
    }

    async url() {
        if (this.devtools) {
            const url = await new Promise(resolve => {
                window.chrome.devtools.inspectedWindow.eval(
                    'window.location',
                    {},
                    resolve
                );
            });
            return url.origin;
        } else {
            const search = window.location.search;
            const query = new URLSearchParams(search);
            return query.get('api');
        }
    }
}
