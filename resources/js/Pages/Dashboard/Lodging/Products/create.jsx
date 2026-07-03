import Form from './Partials/Form';

export default function create({ from_floors,to_floors, amenities, dashboard_users, accommodation_distributors, enums, languages, googleMapSettings }) {
    return (
        <Form
            mode="create"
            from_floors={from_floors}
            to_floors={to_floors}
            amenities={amenities}
            dashboard_users={dashboard_users}
            accommodation_distributors={accommodation_distributors}
            enums={enums}
            languages={languages}
            googleMapSettings={googleMapSettings}
        />
    );
}
