'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "55d235af2d21f2f0561cf0aa6a878748",
"index.html": "faeb7dc1bdc05599e31952c385154120",
"/": "faeb7dc1bdc05599e31952c385154120",
"main.dart.js": "c0fc2dc5f6c5b8d779a24f2f331d7cac",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "b8ba3e0b4b34b7d3c1ef1fb538a66c6a",
"assets/AssetManifest.json": "9299183e2d4ba299ba059ad3728cf895",
"assets/NOTICES": "0ae4f0fd9950d3257119391e722c081d",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "ee006e63ec83e0b50c667e1e719c9739",
"assets/lib/images/voce14.jpg": "e8ffe3a50696b3487d548e8d4369dc64",
"assets/lib/images/voce1.jpg": "bbcf55c8baf235180242fafac7982102",
"assets/lib/images/voce15.jpg": "b9ee62cfbe368e2d6fb1d3bd5d4062de",
"assets/lib/images/voce17.jpg": "2579c5039b4c94b0b4cb761b928730d0",
"assets/lib/images/voce3.jpg": "c984a559ea69d3765730cb31c8c3f2f4",
"assets/lib/images/voce2.jpg": "8d7089949041afa2aa5f7568a6515357",
"assets/lib/images/voce16.jpg": "c5e8b53ede2ed143daefbe848cf21238",
"assets/lib/images/voce12.jpg": "1b2af1d2889c1f6d6d2cdb658e140599",
"assets/lib/images/voce6.jpg": "4c795b4a225e91edd2f4886dd246ccc8",
"assets/lib/images/mucca3.jpg": "19d0a678a9b36e10cb4a2feb6ab7357c",
"assets/lib/images/mucca2.jpg": "655cd1e4c74bb09fdfb2bd51a6b5879f",
"assets/lib/images/voce7.jpg": "564db7f4b18a88ea03bc9c40cda74dca",
"assets/lib/images/voce13.jpg": "9b8e25ac258aa11a50eae402d04d292d",
"assets/lib/images/voce11.jpg": "2a3b086169fa63431c7dc1f552e83935",
"assets/lib/images/voce5.jpg": "6eeaeafc94da6a9b1d2766a208e4d5cd",
"assets/lib/images/mucca1.jpg": "4e78f1b31c1da3736570cec5e8f8c861",
"assets/lib/images/voce4.jpg": "d4339805abd2a571da4e82ef7efedc3b",
"assets/lib/images/voce10.jpg": "8f5304f89a25e6343326ce2457b67e3e",
"assets/lib/images/voce9.jpg": "9e03a761e1454b3df1691fda45ae484a",
"assets/lib/images/voce8.jpg": "31de6f5d95cc47f2e1ad57174281f672",
"assets/lib/images/voce18.jpg": "9992e841315094eeb72ab52bdc1f0afd",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
