import {StrictMode, lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {Admin, Resource} from 'react-admin';
import {dataProvider} from './dataProvider';
import Dashboard from './dashboard/Dashboard';
import MyLayout from './layout/MyLayout';

// Lazy loading des composants de ressources
const CityList = lazy(() => import('./resources/cities/CityList'));
const CityShow = lazy(() => import('./resources/cities/CityShow'));
const MeasureList = lazy(() => import('./resources/measures/MeasureList'));
const MeasureShow = lazy(() => import('./resources/measures/MeasureShow'));

const LoadingFallback = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
    }}>
        Chargement...
    </div>
);

const App = () => (
    <Suspense fallback={<LoadingFallback/>}>
        <Admin
            dataProvider={dataProvider}
            dashboard={Dashboard}
            layout={MyLayout}
        >
            <Resource
                name="cities"
                list={CityList}
                show={CityShow}
                recordRepresentation="ville"
            />
            <Resource
                name="measures"
                list={MeasureList}
                show={MeasureShow}
                recordRepresentation="id"
            />
        </Admin>
    </Suspense>
);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App/>
    </StrictMode>
);