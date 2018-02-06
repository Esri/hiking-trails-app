var serviceWorkerOption = {
  "assets": [
    "/hiking-app/dist/fonts/674f50d287a8c48dc19ba404d20fe713.eot",
    "/hiking-app/dist/fonts/af7ae505a9eed503f8b8e6982036873e.woff2",
    "/hiking-app/dist/fonts/fee66e712a8a08eef5805a46892932ad.woff",
    "/hiking-app/dist/fonts/b06871f281fee6b241d60582ae9369b9.ttf",
    "/hiking-app/dist/main.bundle.js",
    "/hiking-app/dist/main.css"
  ]
};
        
        /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var CACHE_NAME = "hiking-trails-v1";
function generateAssets() {
    var assets = [];
    generateAppResources(assets);
    generateRootResources(assets);
    // generateAPIResources(assets);
    // generatePortalResources(assets);
    // generateBasemapResources(assets);
    // generateGroundResources(assets);
    return assets;
}
function generateAppResources(assets) {
    for (var _i = 0, _a = serviceWorkerOption.assets; _i < _a.length; _i++) {
        var asset = _a[_i];
        assets.push(asset);
    }
}
function generateRootResources(assets) {
    var root = self.location.pathname.replace(/\/sw\.js$/g, "");
    assets.push(root);
    assets.push(root + "/");
    assets.push(root + "/index.html");
    assets.push(root + "/manifest.json");
    assets.push(root + "/src/img/esri-10GlobeLogo_1C.png");
}
// function generateAPIResources(assets: Asset[]) {
//   const resources = [
//     "dojo/dojo.js",
//     "dojo/nls/dojo_en-us.js",
//     "esri/views/SceneView.js",
//     "esri/WebScene.js",
//     "esri/views/nls/SceneView_en-us.js",
//     "dojo/resources/blank.gif",
//     "esri/workers/mutableWorker.js",
//     "esri/workers/indexWorker.js",
//     "esri/workers/scripts/helpers.js",
//     "esri/workers/scripts/indexInterface.js",
//     "esri/workers/libs/rtree.js",
//     "esri/geometry/geometryEngine.js",
//     "esri/layers/GraphicsLayer.js",
//     "esri/layers/support/ElevationQuery.js",
//     "esri/portal/support/layersLoader.js",
//     "esri/views/layers/GroupLayerView.js",
//     "esri/views/3d/webgl-engine/lib/SmaaRenderPassData.js",
//     "esri/layers/support/ElevationTile.js",
//     "esri/views/3d/layers/TileLayerView3D.js",
//     "esri/css/main.css",
//     "esri/themes/base/icons/fonts/CalciteWebCoreIcons.ttf?cu4poq",
//     "esri/themes/base/fonts/avenir-next/Avenir_Next_W00_400.woff2",
//     "esri/views/3d/environment/resources/stars.wsv"
//   ];
//   assets.push("https://jsdev.arcgis.com/4.7/");
//   for (const resource of resources) {
//     assets.push(`https://jsdev.arcgis.com/4.7/${resource}`);
//   }
// }
var imageryDomain = "services.arcgisonline.com";
// function generateTileResources(serverUrl: string, numLevels: number, assets: Asset[]) {
//   assets.push(`${serverUrl}?f=json`);
//   for (let i = 0; i < numLevels; i++) {
//     let n = 1 << i;
//     assets.push(`${serverUrl}/tilemap/${i}/0/0/32/32`);
//     for (let x = 0; x < n; x++) {
//       for (let y = 0; y < n; y++) {
//         assets.push(`${serverUrl}/tile/${i}/${x}/${y}`);
//       }
//     }
//   }
// }
// function generateBasemapResources(assets: Asset[]) {
//   const serverUrl = `https://${imageryDomain}/ArcGIS/rest/services/World_Imagery/MapServer`;
//   const cachedLevels = 3;
//   generateTileResources(serverUrl, cachedLevels, assets);
// }
// function generateGroundResources(assets: Asset[]) {
//   const serverUrl = "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer";
//   const cachedLevels = 2;
//   generateTileResources(serverUrl, cachedLevels, assets);
// }
// function generatePortalResources(assets: Asset[]) {
//   assets.push(
//     "https://www.arcgis.com/sharing/rest/portals/self?f=json&culture=en-us"
//   );
// }
self.addEventListener("install", function (event) {
    console.log("install");
    event.waitUntil(caches.open(CACHE_NAME)
        .then(function (cache) {
        var assets = generateAssets();
        return cache.addAll(assets);
    }));
});
self.addEventListener("activate", function (event) {
});
self.addEventListener("fetch", function (event) {
    // Swivel imagery if needed to the one that we cached
    var re = /https:\/\/(server|services)\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer/i;
    var req;
    if (imageryDomain && re.test(event.request.url)) {
        var url = event.request.url.replace(re, "https://" + imageryDomain + "/ArcGIS/rest/services/World_Imagery/MapServer");
        req = new Request(url, event.request);
    }
    else {
        req = event.request;
    }
    event.respondWith(caches.match(req, { ignoreVary: true })
        .then(function (response) {
        if (response) {
            return response;
        }
        var fetchRequest = req.clone();
        return fetch(fetchRequest)
            .then(function (response) {
            if (!response || (response.type !== "opaque" && response.status !== 200) || response.type === "error") {
                return response;
            }
            if (req.url.indexOf("chrome-extension:") === 0) {
                return response;
            }
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
                .then(function (cache) {
                cache.put(req, responseToCache);
            });
            return response;
        });
    }));
});


/***/ })
/******/ ]);