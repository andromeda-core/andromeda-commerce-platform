import Form from './Partials/Form';

export default function create({ from_floors,to_floors, amenities, dashboard_users, enums, languages, googleMapSettings }) {
    return (
        <Form
            mode="create"
            from_floors={from_floors}
            to_floors={to_floors}
            amenities={amenities}
            dashboard_users={dashboard_users}
            enums={enums}
            languages={languages}
            googleMapSettings={googleMapSettings}
        />
    );
}
