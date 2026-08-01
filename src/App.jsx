import { Admin, Resource } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import frenchMessages from 'ra-language-french';
import LocationCityIcon from '@mui/icons-material/LocationCityRounded';
import TableRowsIcon from '@mui/icons-material/TableRowsRounded';

import { dataProvider } from './dataProvider';
import { aqiTheme } from './theme';
import Dashboard from './dashboard/Dashboard';
import MyLayout from './layout/MyLayout';
import MeasureList from './resources/measures/MeasureList';
import MeasureShow from './resources/measures/MeasureShow';
import CityList from './resources/cities/CityList';
import CityShow from './resources/cities/CityShow';

const i18nProvider = polyglotI18nProvider(() => frenchMessages, 'fr');

export default function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      theme={aqiTheme}
      darkTheme={aqiTheme}
      defaultTheme="dark"
      layout={MyLayout}
      dashboard={Dashboard}
      title="Atlas Qualité de l'Air"
      disableTelemetry
    >
      <Resource
        name="measures"
        list={MeasureList}
        show={MeasureShow}
        icon={TableRowsIcon}
        options={{ label: 'Relevés' }}
      />
      <Resource
        name="cities"
        list={CityList}
        show={CityShow}
        icon={LocationCityIcon}
        options={{ label: 'Villes' }}
      />
    </Admin>
  );
}
