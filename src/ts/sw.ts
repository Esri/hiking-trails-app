type Asset = Request | string;

declare const serviceWorkerOption: {
  assets: string[];
};

const CACHE_NAME = "hiking-trails-v7";

function generateAssets(): Asset[] {
  const assets: Asset[] = [];

  generateAppResources(assets);
  generateRootResources(assets);

  return assets;
}

function generateAppResources(assets: Asset[]) {
  for (const asset of serviceWorkerOption.assets) {
    assets.push(asset);
  }
}

function generateRootResources(assets: Asset[]) {
  const root = self.location.pathname.replace(/\/sw\.js$/g, "");

  assets.push(root);
  assets.push(`${root}/`);
  assets.push(`${root}/index.html`);
  assets.push(`${root}/manifest.json`);
  assets.push(`${root}/src/img/esri-10GlobeLogo_1C.png`);
  assets.push(`${root}/src/img/background.jpg`);
}

const imageryDomain = "services.arcgisonline.com";

self.addEventListener("install", (event: any) => {
  console.log("install");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        const assets = generateAssets();
        return cache.addAll(assets);
      })
  );
});

self.addEventListener("activate", (event: any) => {
});

self.addEventListener("fetch", (event: any) => {
  // Swivel imagery if needed to the one that we cached
  const re = /https:\/\/(server|services)\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer/i;

  let req: Request;

  if (imageryDomain && re.test(event.request.url)) {
    const url = event.request.url.replace(re, `https://${imageryDomain}/ArcGIS/rest/services/World_Imagery/MapServer`);
    req = new Request(url, event.request);
  }
  else {
    req = event.request;
  }

  event.respondWith(
    caches.match(req, { ignoreVary: true })
      .then(response => {
        if (response) {
          return response;
        }

        const fetchRequest = req.clone();

        return fetch(fetchRequest)
          .then(response => {
            if (!response || (response.type !== "opaque" && response.status !== 200) || response.type === "error") {
              return response;
            }

            if (req.url.indexOf("chrome-extension:") === 0) {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(req, responseToCache);
              });

            return response;
          });
      })
  );
});
