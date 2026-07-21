import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head } from '@inertiajs/react';
import React from 'react';

// Read-only presentation helpers.
const format = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
};

// Format a stored UTC timestamp (ISO string ending in `Z`) for display, keeping
// the clock time in UTC so it matches the stored instant regardless of the
// viewer's local timezone. Falls back to N/A / raw value when appropriate.
const formatDateTimeUTC = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value); // fall back to raw if unparseable
    return (
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'UTC',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(d) + ' UTC'
    );
};

const Field = ({ label, value, full = false }) => (
    <div className={full ? 'sm:col-span-2' : ''}>
        <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-white/70">
            {label}
        </label>
        <div className="w-full px-4 py-2 text-gray-800 break-words whitespace-pre-wrap border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white">
            {format(value)}
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 dark:text-white">
            {title}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
);

export default function show({ wholesale_dealer_application }) {
    const app = wholesale_dealer_application || {};

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Wholesale Dealer Application" />

                <BreadCrumb
                    header={'View Wholesale Dealer Application'}
                    parent={'Wholesale Dealer Applications'}
                    parent_link={route('dashboard.wholesale-dealer-applications.index')}
                    child={'View Application'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">
                                <LinkButton
                                    Text={'Back To Applications'}
                                    URL={route('dashboard.wholesale-dealer-applications.index')}
                                    Icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                            />
                                        </svg>
                                    }
                                />
                            </div>

                            <div className="max-w-4xl px-4 mx-auto mt-6">
                                <div className="p-8 bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal dark:text-white/80">
                                    <Section title="Application Summary">
                                        <Field label="Application ID" value={app.application_id} />
                                        <Field label="Status" value={app.status} />
                                        <Field label="Submitted At" value={formatDateTimeUTC(app.submitted_at)} />
                                        <Field label="Received At" value={formatDateTimeUTC(app.created_at)} />
                                    </Section>

                                    <Section title="Business Profile & Purchase Authority">
                                        <Field
                                            label="Applying to purchase inventory for resale?"
                                            value={app.purchase_inventory_for_resale}
                                        />
                                        <Field label="Company / Store Name" value={app.company_store_name} />
                                        <Field label="Registered Legal Business Name" value={app.legal_business_name} />
                                        <Field label="Legal Entity Type" value={app.legal_entity_type} />
                                        <Field label="Other Legal Entity Type" value={app.legal_entity_type_other} />
                                        <Field
                                            label="Business Registration / Tax / Reseller ID"
                                            value={app.business_registration_tax_reseller_id}
                                        />
                                        <Field
                                            label="Registration ID Not Applicable"
                                            value={app.registration_id_not_applicable}
                                        />
                                        <Field label="Year Established" value={app.year_established} />
                                        <Field label="Country of Registration" value={app.country_of_registration} />
                                        <Field label="Registered City" value={app.registered_city} />
                                        <Field label="Contact Person" value={app.contact_person} />
                                        <Field label="Job Title" value={app.job_title} />
                                        <Field label="Purchase & Payment Authority" value={app.purchase_authority} />
                                        <Field label="Final Approver Name" value={app.purchase_decision_maker_name} />
                                        <Field label="Final Approver Email" value={app.purchase_decision_maker_email} />
                                        <Field label="Business Email" value={app.business_email} />
                                        <Field label="Phone / WhatsApp" value={app.phone_whatsapp} />
                                        <Field label="Preferred Contact Method" value={app.preferred_contact_method} />
                                        <Field label="Telegram Username" value={app.telegram_username} />
                                        <Field label="Business Type" value={app.business_type} full />
                                        <Field label="Other Business Type" value={app.business_type_other} />
                                        <Field label="Sales Channel(s)" value={app.sales_channels} full />
                                        <Field label="Primary Storefront / Business URL" value={app.primary_storefront_url} full />
                                        <Field label="No Public Online Presence" value={app.no_public_online_presence} />
                                        <Field
                                            label="Business Location Address or Map"
                                            value={app.business_location_address_or_map}
                                            full
                                        />
                                    </Section>

                                    <Section title="Sales Capacity & Purchase Plan">
                                        <Field label="Years Selling Smartphones" value={app.years_selling_smartphones} />
                                        <Field label="Main Customer Type" value={app.main_customer_type} />
                                        <Field label="Number of Retail Locations" value={app.number_of_retail_locations} />
                                        <Field
                                            label="Active Reseller / B2B Buyers"
                                            value={app.number_of_active_reseller_or_b2b_buyers}
                                        />
                                        <Field
                                            label="Avg Monthly Sales - Last 3 Months (Units)"
                                            value={app.average_monthly_smartphone_sales_last_3_months_units}
                                        />
                                        <Field
                                            label="Avg Monthly Purchases - Last 3 Months (Units)"
                                            value={app.average_monthly_smartphone_purchase_last_3_months_units}
                                        />
                                        <Field
                                            label="Largest Single Purchase - Last 12 Months (Units)"
                                            value={app.largest_single_smartphone_purchase_last_12_months_units}
                                        />
                                        <Field
                                            label="Main Brands / Models Currently Sold"
                                            value={app.main_brands_models_currently_sold}
                                            full
                                        />
                                        <Field
                                            label="Can Provide Verification Records"
                                            value={app.can_provide_verification_records}
                                        />
                                        <Field label="Target Brand(s)" value={app.target_brands} full />
                                        <Field label="Other Target Brand(s)" value={app.target_brand_other} />
                                        <Field label="Priority Target Models" value={app.priority_target_models} full />
                                        <Field label="Preferred Condition(s)" value={app.preferred_conditions} full />
                                        <Field
                                            label="Essential Product Requirements"
                                            value={app.essential_product_requirements}
                                            full
                                        />
                                        <Field
                                            label="Other Essential Requirement"
                                            value={app.essential_product_requirements_other}
                                        />
                                        <Field label="Initial Order Quantity (Units)" value={app.initial_order_quantity_units} />
                                        <Field
                                            label="Available Budget for Initial Order (USD)"
                                            value={app.available_initial_order_budget_usd}
                                        />
                                        <Field label="Initial-Order Budget Status" value={app.initial_order_budget_status} />
                                        <Field
                                            label="Expected Monthly Order Volume (Units)"
                                            value={app.expected_monthly_order_volume_units}
                                        />
                                        <Field
                                            label="Expected Monthly Purchase Budget (USD)"
                                            value={app.expected_monthly_purchase_budget_usd}
                                        />
                                        <Field label="Expected Order Frequency" value={app.expected_order_frequency} />
                                        <Field label="First Paid Order Readiness" value={app.first_paid_order_readiness} />
                                        <Field label="Acceptable Payment Term(s)" value={app.acceptable_payment_terms} full />
                                        <Field
                                            label="Other Acceptable Payment Term"
                                            value={app.acceptable_payment_terms_other}
                                        />
                                    </Section>

                                    <Section title="Markets, Import Readiness & Compliance">
                                        <Field label="Shipping Destination Country" value={app.shipping_destination_country} />
                                        <Field label="Shipping Destination City" value={app.shipping_destination_city} />
                                        <Field label="Primary Final Country of Resale" value={app.primary_final_resale_country} />
                                        <Field
                                            label="Additional Final Resale Markets"
                                            value={app.additional_final_resale_markets}
                                            full
                                        />
                                        <Field label="Currently Import Smartphones" value={app.currently_import_smartphones} />
                                        <Field label="Import Experience" value={app.import_experience} />
                                        <Field label="Importer of Record" value={app.importer_of_record} />
                                        <Field
                                            label="Needs Logistics / Import Guidance"
                                            value={app.needs_logistics_or_import_guidance}
                                        />
                                        <Field
                                            label="Used / Open-Box Import Legality Confirmed"
                                            value={app.used_open_box_import_legality}
                                        />
                                        <Field
                                            label="Reasons for Korean Supplier"
                                            value={app.reasons_for_korean_supplier}
                                            full
                                        />
                                        <Field label="Other Reason" value={app.reason_for_korean_supplier_other} />
                                        <Field label="Additional Context" value={app.additional_context} full />
                                    </Section>

                                    <Section title="Agreements">
                                        <Field label="Information Accurate" value={app.agreement_information_accurate} />
                                        <Field
                                            label="Authorized Representative"
                                            value={app.agreement_authorized_representative}
                                        />
                                        <Field label="Wholesale Program Type" value={app.agreement_wholesale_program_type} />
                                        <Field
                                            label="Verification / Contact / Privacy"
                                            value={app.agreement_verification_contact_privacy}
                                        />
                                        <Field label="No Guaranteed Approval" value={app.agreement_no_guaranteed_approval} />
                                        <Field label="Trade Compliance" value={app.agreement_trade_compliance} />
                                    </Section>

                                    <Section title="Source & Audit">
                                        <Field label="Form Name" value={app.form_name} />
                                        <Field label="Form Version" value={app.form_version} />
                                        <Field label="Source Page" value={app.source_page} full />
                                        <Field label="Referrer" value={app.referrer} full />
                                        <Field label="UTM Source" value={app.utm_source} />
                                        <Field label="UTM Medium" value={app.utm_medium} />
                                        <Field label="UTM Campaign" value={app.utm_campaign} />
                                        <Field label="UTM Term" value={app.utm_term} />
                                        <Field label="UTM Content" value={app.utm_content} />
                                        <Field label="IP Address" value={app.ip_address} />
                                        <Field label="User Agent" value={app.user_agent} full />
                                    </Section>
                                </div>
                            </div>
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
