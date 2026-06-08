import Form from './Partials/Form';

export default function edit({ floors, amenities, dashboard_users, enums, lodging_product, googleMapSettings }) {
    return (
        <Form
            mode="edit"
            floors={floors}
            amenities={amenities}
            dashboard_users={dashboard_users}
            enums={enums}
            lodging_product={lodging_product}
            googleMapSettings={googleMapSettings}
        />
    );
}
