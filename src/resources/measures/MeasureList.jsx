import {
    BooleanInput,
    Datagrid,
    DateField,
    ExportButton,
    FilterButton,
    FunctionField,
    List,
    NumberField,
    SelectInput,
    TopToolbar,
} from 'react-admin';
import {Chip} from '@mui/material';
import AqiChip from '../../components/AqiChip';
import cities from '../../data/cities.json';
import {cityColor} from '../../aqi/cityPalette';

const filters = [
    <SelectInput
        key="ville"
        source="ville"
        label="Ville"
        choices={cities.map((c) => ({id: c.ville, name: c.ville}))}
        alwaysOn
    />,
    <SelectInput
        key="aqi"
        source="aqi"
        label="Niveau AQI"
        choices={[1, 2, 3, 4, 5].map((n) => ({id: n, name: `${n}`}))}
    />,
    <BooleanInput key="is_weekend" source="is_weekend" label="Week-end uniquement" name="is_weekend"/>,
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton/>
        <ExportButton/>
    </TopToolbar>
);

export default function MeasureList() {
    return (
        <List
            filters={filters}
            actions={<ListActions/>}
            sort={{field: 'timestamp_utc', order: 'DESC'}}
            perPage={25}
            title="Relevés horaires — table de faits"
        >
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
                <DateField source="timestamp_utc" label="Horodatage (UTC)" showTime/>
                <FunctionField label="AQI" render={(r) => <AqiChip value={r.aqi}/>}/>
                <NumberField source="pm2_5" label="PM2.5"/>
                <NumberField source="pm10" label="PM10"/>
                <NumberField source="o3" label="O₃"/>
                <NumberField source="no2" label="NO₂"/>
                <NumberField source="so2" label="SO₂"/>
                <NumberField source="co" label="CO"/>
                <FunctionField
                    label="Week-end"
                    render={(r) => (r.is_weekend ? <Chip size="small" label="week-end" variant="outlined"/> : null)}
                />
            </Datagrid>
        </List>
    );
}
