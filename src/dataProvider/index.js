import fakeDataProvider from 'ra-data-fakerest';
import measures from '../data/measures.json';
import cities from '../data/cities.json';


const baseData = {
    measures, cities,
};

const baseProvider = fakeDataProvider(baseData, false);


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const dataProvider = new Proxy(baseProvider, {
    get(target, name) {
        return async (...args) => {
            await delay(120);
            return target[name](...args);
        };
    },
});
