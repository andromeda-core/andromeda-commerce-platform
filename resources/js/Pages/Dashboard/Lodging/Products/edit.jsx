import Form from './Partials/Form';

export default function edit({ from_floors,to_floors, amenities, dashboard_users, accommodation_distributors, enums, languages, lodging_product, googleMapSettings }) {
    return (
        <Form
            mode="edit"
            from_floors={from_floors}
            to_floors={to_floors}
            amenities={amenities}
            dashboard_users={dashboard_users}
            accommodation_distributors={accommodation_distributors}
            enums={enums}
            languages={languages}
            lodging_product={lodging_product}
            googleMapSettings={googleMapSettings}
        />
    );
}
