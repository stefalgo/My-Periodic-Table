function URL_readParam(name) {
    const url = new URL(window.location);
    return url.searchParams.get(name);
}

function URL_removeParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
}

function URL_setParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
}