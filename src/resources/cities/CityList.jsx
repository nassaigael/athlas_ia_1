import {List, Datagrid, TextField, NumberField, FunctionField, DateField} from 'react-admin';
import {Chip} from '@mui/material';
import AqiChip from '../../components/AqiChip';
import {cityColor} from '../../aqi/cityPalette';

export default function CityList() {
    return (
        <List sort={{field: 'aqi_moyen', order: 'DESC'}} pagination={false} title="Villes surveillées — dimension">
            <Datagrid rowClick="show" bulkActionButtons={false}>
                <FunctionField
                    label="Ville"
                    render={(r) => (
                        <Chip
                            size="small"
                            label={r.ville}
                            sx={{
                                backgroundColor: `${cityColor(r.ville)}22`,
                                color: cityColor(r.ville),
                                border: `1px solid ${cityColor(r.ville)}66`
                            }}
                        />
                    )}
                />
                <TextField source="pays" label="Pays"/>
                <NumberField source="latitude" label="Latitude"/>
                <NumberField source="longitude" label="Longitude"/>
                <NumberField source="nb_mesures" label="Nb. mesures"/>
                <FunctionField label="AQI moyen" render={(r) => <AqiChip value={Math.round(r.aqi_moyen)}/>}/>
                <NumberField source="aqi_moyen" label="AQI moyen (précis)" options={{maximumFractionDigits: 2}}/>
                <DateField source="derniere_mesure" label="Dernier relevé" showTime/>
            </Datagrid>
        </List>
    );
}
