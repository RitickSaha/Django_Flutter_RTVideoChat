'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  ".firebase/hosting.cHVibGlj.cache": "7eaa49dc35cfb73e726e591a59cc4987",
"404.html": "0a27a4163254fc8fce870c8cc3a3f94f",
"assets/AssetManifest.json": "91e46c96aac8272acbf9375ba72e3426",
"assets/assets/1.jpeg": "40851a219f75a38592a16763bb5dbbf4",
"assets/assets/10.jpeg": "e04323f875b5489ec04921a55628ee5e",
"assets/assets/11.jpeg": "0b6f57416bd0fa2bf9509014a132159c",
"assets/assets/12.jpeg": "9ae913e57b55e3fca36817ffbd453ef1",
"assets/assets/13.jpeg": "24f5cd9ffcc43a166b67415e3412b5f7",
"assets/assets/14.jpeg": "56d584c977125d2385d1a737c61227d8",
"assets/assets/15.jpeg": "04e19be6dd5f44dfa05a4fff2b589b5b",
"assets/assets/16.jpeg": "cc00b5ea7b276499684e106fae481251",
"assets/assets/17.jpeg": "9a26ece2c53e75e830f1f25b01656b6d",
"assets/assets/18.jpeg": "863832f067331263a02e0d33f2671ac8",
"assets/assets/19.jpeg": "dbb51de2876d23106bfc3c11dec49109",
"assets/assets/2.jpeg": "ebd438ba679da8d98326deec07f45b5c",
"assets/assets/20.jpeg": "e1295b41521c1cce38b80ee5bf9f120e",
"assets/assets/3.jpeg": "b5ac8128e9ce8615e18b0f8ca1221215",
"assets/assets/4.jpeg": "5d46dfa722d4dd8c2aa81c2c8adb5233",
"assets/assets/5.jpeg": "f804dd5d963c3f50b2bb8f4e54d6e1ac",
"assets/assets/6.jpeg": "7bfcdd47a1e5ba4c0a4c5f9070dfe874",
"assets/assets/7.jpeg": "0660934bc16f60cace4fa00307532805",
"assets/assets/8.jpeg": "e3a6704f32c106a9b294c85943c18fe2",
"assets/assets/9.jpeg": "1762a3b06b31911f39193393bc3893ff",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "cf4d447b7bfbf554d4632f3eafa8652c",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"firebase.json": "ceb3227e948a2fffb08892a8749cf74e",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "03c1848ec864b86e678b0bcf2b0a27a4",
"/": "03c1848ec864b86e678b0bcf2b0a27a4",
"main.dart.js": "a3bb353260eb0237884e8458d818f757",
"manifest.json": "6a9d104524557997b97ce0ef9ae99618",
"version.json": "861fd1f35c5eb74c973b9b08f04a055c"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
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
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
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
