const LOCAL_STORAGE_KEY = 'pxu-shopify-surface-pick-up';
const loadingClass = 'surface-pick-up--loading';

const isNotExpired = timestamp => timestamp + 1000 * 60 * 60 <= Date.now();

const removeTrailingSlash = s => s.replace(/(.*)\/$/, '$1');

// Haversine Distance
// The haversine formula is an equation giving great-circle distances between
// two points on a sphere from their longitudes and latitudes
const calculateDistance = (
  latitude1,
  longitude1,
  latitude2,
  longitude2,
  unitSystem,
) => {
  const dtor = Math.PI / 180;
  const radius = unitSystem === 'metric' ? 6378.14 : 3959;

  const rlat1 = latitude1 * dtor;
  const rlong1 = longitude1 * dtor;
  const rlat2 = latitude2 * dtor;
  const rlong2 = longitude2 * dtor;

  const dlon = rlong1 - rlong2;
  const dlat = rlat1 - rlat2;

  const a = Math.sin(dlat / 2) ** 2
    + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
};

const getGeoLocation = () => new Promise((resolve, reject) => {
  const options = {
    maximumAge: 3600000, // 1 hour
    timeout: 5000,
  };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve(coords), reject, options);
  } else {
    reject();
  }
});

let location = null;

const setLocation = ({ latitude, longitude }) => new Promise(resolve => {
  const cachedLocation = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

  const newData = {
    latitude,
    longitude,
    timestamp: Date.now(),
  };

  location = newData;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));

  if (
    cachedLocation !== null
    && cachedLocation.latitude === latitude
    && cachedLocation.longitude === longitude
    // Valid for 1 hour - per Debut's example
    && isNotExpired(cachedLocation.timestamp)
  ) {
    resolve({ latitude, longitude });
    return;
  }

  fetch('/localization.json', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latitude, longitude }),
  }).then(() => resolve({ latitude, longitude }));
});

const getLocation = () => new Promise(resolve => {
  if (location && isNotExpired(location.timestamp)) {
    resolve(location);
    return;
  }

  resolve(getGeoLocation().then(setLocation));
});

export default class SurfacePickUp {
  constructor(el, options) {
    this.el = el;
    this.options = {
      root_url: (window.Theme && window.Theme.routes && window.Theme.routes.root_url) || '',
      ...options,
    };

    this.options.root_url = removeTrailingSlash(this.options.root_url);

    this.callbacks = [];
    this.onBtnPress = null;
    this.latestVariantId = null;

    this.pickUpEnabled = localStorage.getItem(LOCAL_STORAGE_KEY) !== null;
  }

  load(variantId) {
    // If no variant is available, empty element and quick-return
    if (!variantId) {
      this.el.innerHTML = '';
      return;
    }
    // Because Shopify doesn't expose any `pick_up_enabled` data on the shop object, we
    // don't know if the variant might be, or is definitely not available for pick up.
    // Until we know the shop has > 0 pick up locations, we want to avoid prompting the
    // user for location data (it's annoying, and only makes sense to do if we use it).
    //
    // Instead, we have to make an initial request, check and see if any pick up locations
    // were returned, then ask for the users location, then make another request to get the
    // location-aware pick up locations.
    //
    // As far as I can tell the pick up aware locations differ only in sort order - which
    // we could do on the front end - but we're following this approach to ensure future
    // compatibility with any changes Shopify makes (maybe disabling options based on
    // user location, or whatever else).
    //
    // Shopify has indicated they will look into adding pick_up_enabled data to the shop
    // object, which which case this method can be greatly simplifed into 2 simple cases.

    this.latestVariantId = variantId;

    const getLocationThenInjectData = () => getLocation()
      // If we get a location, inject data using that location
      .then(coords => this._getData(variantId)
        .then(data => this._injectData(data, coords)))
      // Otherwise, inject data without location
      .catch(() => this._getData(variantId)
        .then(data => this._injectData(data, null)));

    this.el.classList.add(loadingClass);

    // If we've previously seen some pick up locations we know this variant may be available
    // for pick up, so we request browser location data.
    if (this.pickUpEnabled) {
      return getLocationThenInjectData();
    }

    return this._getData(variantId)
      .then(data => {
        if (data.items.length > 0) {
          this.pickUpEnabled = true;
          // Inject initial data - the store displayed may not be the closest, since it was
          // determined by IP geolocation, instead of browser side location. But better
          // than nothing.
          this._injectData(data, null);

          // Then get browser location and go through the process again with the new location
          // data. Any subsequent variants will skip the initial request and go
          // directly to the browser based location data.
          return getLocationThenInjectData();
        }

        // If there are no items (pick up locations), just inject the (empty) data and return.
        // We will continue to check for pick up locations on any new variants, since depending
        // on product availability, the first product may have no pick up locations even if the
        // store does have some.
        return this._injectData(data, null);
      });
  }

  onModalRequest(callback) {
    if (this.callbacks.indexOf(callback) >= 0) return;

    this.callbacks.push(callback);
  }

  offModalRequest(callback) {
    this.callbacks.splice(this.callbacks.indexOf(callback));
  }

  unload() {
    this.callbacks = [];
    this.el.innerHTML = '';
  }

  _getData(variantId) {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      const requestUrl = `${this.options.root_url}/variants/${variantId}/?section_id=surface-pick-up`;

      xhr.open('GET', requestUrl, true);

      xhr.onload = () => {
        const el = xhr.response;

        const embed = el.querySelector('[data-html="surface-pick-up-embed"]');
        const itemsContainer = el.querySelector('[data-html="surface-pick-up-items"]');
        const items = itemsContainer.content.querySelectorAll('[data-surface-pick-up-item]');
        resolve({
          embed,
          itemsContainer,
          items,
          variantId,
        });
      };

      xhr.onerror = () => {
        resolve({
          embed: { innerHTML: '' },
          itemsContainer: { innerHTML: '' },
          items: [],
          variantId,
        });
      };

      xhr.responseType = 'document';
      xhr.send();
    });
  }

  _injectData({
    embed,
    itemsContainer,
    items,
    variantId,
  },
  userCoords) {
    if (variantId !== this.latestVariantId) {
      return null;
    }

    this.el.innerHTML = embed.innerHTML;
    this.el.classList.remove(loadingClass);

    if (items.length === 0) {
      return this.el;
    }

    let processedDistances = false;

    const processDistances = () => {
      if (processedDistances) return;
      processedDistances = true;
      items.forEach(item => {
        const distanceEl = item.querySelector('[data-distance]');
        const distanceUnitEl = item.querySelector('[data-distance-unit]');
        const unitSystem = distanceUnitEl.dataset.distanceUnit;
        const itemLatitude = parseFloat(distanceEl.dataset.latitude);
        const itemLongitude = parseFloat(distanceEl.dataset.longitude);

        if (userCoords && isFinite(itemLatitude) && isFinite(itemLongitude)) {
          const distance = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            itemLatitude,
            itemLongitude,
            unitSystem,
          );

          distanceEl.innerHTML = distance.toFixed(1);
        } else {
          distanceEl.remove();
          distanceUnitEl.remove();
        }
      });
    };

    this.el.querySelector('[data-surface-pick-up-embed-modal-btn]').addEventListener('click', () => {
      processDistances();
      this.callbacks.forEach(callback => callback(itemsContainer.innerHTML));
    });

    return this.el;
  }
}
