const log = () => {};
//const log = console.log.bind(console);

log('sw: start');

self.addEventListener('install', (event) => {
  log('sw: install event');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  log('sw: activate event');
});

const pathnameToContentMap = new Map();

self.addEventListener('fetch', (event) => {
  log('sw: fetch event', event.request.url);
  event.respondWith(async function() {
    log('sw: event respondWith', event.request.url);
    const url = new URL(event.request.url);
    log('sw: pathname:', url.pathname);
    const file = pathnameToContentMap.get(url.pathname);
    if (file) {
      log('sw: returning cached files');
      const response = new Response(file.content, {
        headers: {'Content-Type': file.type},
      });
      return response;
    }
    return await fetch(event.request);
  }());
});

const handlers = {
  cacheFile(data) {
    const {pathname, content, type} = data;
    log('sw: caching:', pathname);
    pathnameToContentMap.set(pathname, {content, type});
  },
};

self.addEventListener('message', (event) => {
  const {type, data} = event.data;
  log('sw: message:', type, data);
  const fn = handlers[type];
  if (fn) {
    fn(data);
  }
});