(() => {
    const title = document.currentScript?.getAttribute('data-title');
    const metadata = navigator.mediaSession?.metadata;

    if (title && metadata) {
        metadata.title = title;
    }
})();