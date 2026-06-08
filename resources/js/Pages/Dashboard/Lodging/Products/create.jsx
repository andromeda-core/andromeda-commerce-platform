import Form from './Partials/Form';

export default function create({ floors, amenities, dashboard_users, enums, googleMapSettings }) {
    return (
        <Form
            mode="create"
            floors={floors}
            amenities={amenities}
            dashboard_users={dashboard_users}
            enums={enums}
            googleMapSettings={googleMapSettings}
        />
    );
}
