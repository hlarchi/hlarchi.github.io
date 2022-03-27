'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "manifest.json": "4fbfe324828902236d2e7a61e66d7470",
"main.dart.js": "bc46f56bd459e8bcd6e0ebfdbb74c15f",
"favicon.png": "13c2a5b30f5d7ba5f048938bbbd0ef8e",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"icons/apple-touch-icon.png": "218d1aa586b5cd132adecc96a1367688",
"icons/Icon-192.png": "b40f125401e273abca134ab1a7867d79",
"icons/Icon-512.png": "abdb9217ebce2eb9291dc73cf7346e02",
"index.html": "14f59013483bb03672d79c009e6572c9",
"/": "14f59013483bb03672d79c009e6572c9",
"assets/NOTICES": "7bb0c55c9bb3b14eca6490f924a91817",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/asset/image/bees.gif": "7501ebe8165def4ab89dabc8157c8381",
"assets/asset/image/bg2.png": "1759d364c9be99b1808a05c2b699d1f9",
"assets/asset/image/twitter.png": "10b5fd3b3361c9634acd2266b0aeb2c6",
"assets/asset/image/bg4.png": "bbfd575081b22579040f86ce57f43ffd",
"assets/asset/image/dead.gif": "235b5db2bf6f3c663da7d278af631dd1",
"assets/asset/image/player1.gif": "111563015235ca4491b11d8e60f8096e",
"assets/asset/image/boxBorder.png": "72cffe4317a55d500572d43bd2bff851",
"assets/asset/image/KYC.png": "ae9fa0ccace2b520b2fbfc9f56a592f7",
"assets/asset/image/bg5.png": "db08ba3309f516682e0f06ff06ae94d5",
"assets/asset/image/bg1.png": "f19255b4e2acf33f1276fc8a6302aa1a",
"assets/asset/image/player2.gif": "bb3e831c416d15a9299d598988065cf4",
"assets/asset/image/loading.gif": "9065e954bc4949d92a390716cd2a96fb",
"assets/asset/image/hidden.png": "154cc0900c65fc8d48b7cbc3b995205c",
"assets/asset/image/player4.gif": "643219cc80b1ea6759f0e529764330ce",
"assets/asset/image/bg3.png": "acff68d56d266295ea66a07a20d72000",
"assets/asset/image/bg6.jpg": "688e9e6bbc371e297dcbce4ebd9d3959",
"assets/asset/image/discord.png": "3774633d15e3122d723c1db26ed3da9a",
"assets/asset/image/boxLevel.png": "d261ccf67ce8ad999b19dda8c344a722",
"assets/asset/image/player3.gif": "70082091b19c54521e3442cff8daa59b",
"assets/asset/image/logo1.png": "b3c422e604fee850665070fbdbf9f4c9",
"assets/asset/image/wasps.gif": "7d9bd05aa9d09fc661180791fd8c7ace",
"assets/asset/contract/waspVsBeeNFT.json": "ce9ff7ad8da165c5fe273053a9ef3e9c",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/AssetManifest.json": "3860b1c8acd452dd2b89b43871be5893",
"version.json": "aae9f2fedece4856ff736b5e1f433780"
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
