import simpleRestProvider from 'ra-data-simple-rest';
import fakeDataProvider from 'ra-data-fakerest';
import measures from '../data/measures.json';
import cities from '../data/cities.json';

// URL of the live API (server/) that queries the real High5 Neon Postgres database.
// Set VITE_API_URL in a .env file at the project root to point at it, e.g.:
//   VITE_API_URL=http://localhost:4000
const apiUrl = import.meta.env.VITE_API_URL;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let baseProvider;

if (apiUrl) {
    // Live mode: talk to the Express API backed by the real warehouse.
    baseProvider = simpleRestProvider(apiUrl);
} else {
    // Fallback mode: no API configured, serve the last static snapshot
    // (see scripts/prep_data.py) so the app still works out of the box.
    console.warn(
        '[dataProvider] VITE_API_URL is not set — falling back to the static JSON snapshot. ' +
        'Set VITE_API_URL and start server/ to use the live High5 database.'
    );
    baseProvider = fakeDataProvider({ measures, cities }, false);
}

export const dataProvider = new Proxy(baseProvider, {
    get(target, name) {
        return async (...args) => {
            if (!apiUrl) await delay(120);
            return target[name](...args);
        };
    },
});
