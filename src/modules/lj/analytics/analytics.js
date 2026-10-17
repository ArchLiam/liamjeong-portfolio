/**
 * Analytics: sends named events to Umami Cloud, which the layout loads
 * (cookieless) only on liamjeong.com. Nothing here can break the page: on the
 * server, in tests, on any other host, or when Umami is blocked or still
 * loading, `window.umami` is missing and the calls do nothing.
 *
 * Elements opt in with `data-track="Event name"`; each `data-track-<key>`
 * attribute adds a property. `lj-app` listens for clicks once, at its root.
 *
 * Umami's own `data-umami-event` is deliberately not used: on a link it
 * cancels the click, waits for its request, then navigates by hand, which
 * turns `<a download>` into opening the PDF and stalls the link while the
 * request is slow. Here the click is left alone; Umami sends with
 * `keepalive`, so the event survives the navigation.
 */
export function track(name, data) {
    try {
        const umami = typeof window === 'undefined' ? undefined : window.umami;
        if (name && umami && typeof umami.track === 'function') {
            umami.track(name, data);
        }
    } catch {
        // Analytics must never break the page
    }
}

export function trackClick(event) {
    const target = event.target;
    const el =
        target && typeof target.closest === 'function'
            ? target.closest('[data-track]')
            : null;
    if (!el) {
        return;
    }
    // A <summary> click toggles its <details>; count only the opening
    if (el.tagName === 'SUMMARY' && el.parentElement.open) {
        return;
    }
    const data = {};
    [...el.attributes].forEach(({ name, value }) => {
        const key = name.match(/^data-track-(.+)$/);
        if (key) {
            data[key[1]] = value;
        }
    });
    track(el.dataset.track, Object.keys(data).length ? data : undefined);
}
