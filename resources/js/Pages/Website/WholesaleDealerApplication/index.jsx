import WebInput from '@/Components/WebInput';
import WebSelectInput from '@/Components/WebSelectInput';
import WebTextArea from '@/Components/WebTextArea';
import Spinner from '@/Components/Spinner';
import Toast from '@/Components/Toast';
import { useLanguageStore } from '@/Hooks/useLanguageStore';
import { useTranslation } from '@/Hooks/useTranslation';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import goBackOrHome from '@/Helpers/backNavigationHelper';
import { trackPixelEvent } from '@/Helpers/metaPixel';
import COUNTRIES from './countries';

// Canonical English option values. Display labels are translated with t(); the
// value submitted to (and stored by) the server stays English so the admin
// dashboard reads consistent data. Conditional-trigger values (e.g. 'Other',
// 'Physical Store', 'Distributor', 'Telegram') are ported verbatim from the
// governing embed so the show/hide logic keys off the exact same strings.
const YES = 'Yes';
const NO = 'No';

const RESALE_OPTIONS = [
    { value: YES, label: 'Yes, for resale through our business' },
    { value: NO, label: 'No / I am seeking another type of partnership' },
];

const YESNO_OPTIONS = [
    { value: YES, label: 'Yes' },
    { value: NO, label: 'No' },
];

const BUDGET_OPTIONS = [
    { value: 'Under $10,000', label: 'Under $10,000' },
    { value: '$10,000 - $24,999', label: '$10,000 - $24,999' },
    { value: '$25,000 - $49,999', label: '$25,000 - $49,999' },
    { value: '$50,000 - $99,999', label: '$50,000 - $99,999' },
    { value: '$100,000 - $249,999', label: '$100,000 - $249,999' },
    { value: '$250,000+', label: '$250,000+' },
];

const SELECT_OPTIONS = {
    legal_entity_type: [
        { value: 'Corporation / Limited Company', label: 'Corporation / Limited Company' },
        { value: 'Partnership', label: 'Partnership' },
        { value: 'Sole Proprietor', label: 'Sole Proprietor' },
        { value: 'Individual Trader', label: 'Individual Trader' },
        { value: 'Other', label: 'Other' },
    ],
    purchase_authority: [
        { value: 'Authorized to approve purchases and payments', label: 'I am authorized to approve purchases and payments' },
        { value: 'Participates in the decision', label: 'I participate in the decision, but final approval is shared' },
        { value: 'Another person approves', label: 'No, another person gives final approval' },
    ],
    preferred_contact_method: [
        { value: 'Email', label: 'Email' },
        { value: 'WhatsApp', label: 'WhatsApp' },
        { value: 'Telegram', label: 'Telegram' },
        { value: 'Phone', label: 'Phone' },
    ],
    main_customer_type: [
        { value: 'Retail Consumers', label: 'Retail Consumers' },
        { value: 'Resellers', label: 'Resellers' },
        { value: 'Corporate Buyers', label: 'Corporate Buyers' },
        { value: 'Mixed', label: 'Mixed' },
    ],
    available_initial_order_budget_usd: BUDGET_OPTIONS,
    expected_monthly_purchase_budget_usd: BUDGET_OPTIONS,
    initial_order_budget_status: [
        { value: 'Approved and available now', label: 'Approved and available now' },
        { value: 'Expected within 30 days', label: 'Expected within 30 days' },
        { value: 'Requires internal approval', label: 'Requires internal approval' },
        { value: 'Not yet confirmed', label: 'Not yet confirmed' },
    ],
    expected_order_frequency: [
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Twice a month', label: 'Twice a Month' },
        { value: 'Monthly', label: 'Monthly' },
        { value: 'As needed', label: 'As Needed' },
    ],
    first_paid_order_readiness: [
        { value: 'Within 7 days', label: 'Within 7 days' },
        { value: 'Within 8-30 days', label: 'Within 8-30 days' },
        { value: 'Within 1-3 months', label: 'Within 1-3 months' },
        { value: 'More than 3 months', label: 'More than 3 months' },
        { value: 'Researching suppliers only', label: 'Researching suppliers only' },
    ],
    import_experience: [
        { value: 'None', label: 'None' },
        { value: 'Under 1 year', label: 'Under 1 Year' },
        { value: '1-3 years', label: '1-3 Years' },
        { value: '3-5 years', label: '3-5 Years' },
        { value: '5+ years', label: '5+ Years' },
    ],
    importer_of_record: [
        { value: 'Our company', label: 'Our Company' },
        { value: 'Local import partner', label: 'Our Local Import Partner' },
        { value: 'Customs or logistics partner', label: 'Our Customs / Logistics Partner' },
        { value: 'Not yet arranged', label: 'Not Yet Arranged' },
        { value: 'Need guidance', label: 'Need Guidance' },
    ],
    used_open_box_import_legality: [
        { value: 'Yes, confirmed', label: 'Yes, Confirmed' },
        { value: 'No', label: 'No' },
        { value: 'Not sure / Need guidance', label: 'Not Sure / Need Guidance' },
    ],
};

const CHECKBOX_OPTIONS = {
    business_type: ['Retailer', 'Online Seller', 'Marketplace Seller', 'Importer', 'Distributor', 'B2B Wholesaler', 'Other'],
    sales_channels: ['Physical Store', 'Own Website', 'Online Marketplace', 'Social Commerce', 'B2B Distribution'],
    target_brands: ['Apple iPhone', 'Samsung Galaxy', 'Other'],
    preferred_conditions: ['Sealed New', 'Open Box', 'Used Grade A', 'Used Grade B'],
    essential_product_requirements: [
        'Factory unlocked',
        'Specific regional variants',
        'Minimum battery health',
        'Specific storage capacities',
        'Original box',
        'Accessories',
        'Warranty',
        'Clean IMEI',
        'Other',
    ],
    acceptable_payment_terms: [
        '100% bank transfer before shipment',
        'Deposit with balance before shipment',
        'Approved escrow',
        'Credit terms required',
        'Consignment required',
        'Other',
    ],
    reasons_for_korean_supplier: [
        'Better pricing',
        'More reliable inventory',
        'Korean or global variants',
        'Used-device quality',
        'Consistent grading',
        'Faster replenishment',
        'Diversify suppliers',
        'Other',
    ],
};

// Field -> human label (used by the validation summary + inline errors). Also
// the canonical set of static keys consumed via __().
const LABELS = {
    purchase_inventory_for_resale: 'Are you applying to purchase smartphone inventory for resale?',
    company_store_name: 'Company / Store Name',
    legal_business_name: 'Registered Legal Business Name',
    legal_entity_type: 'Legal Entity Type',
    legal_entity_type_other: 'Other Legal Entity Type',
    business_registration_tax_reseller_id: 'Business Registration / Tax / Reseller ID',
    year_established: 'Year Established',
    country_of_registration: 'Country of Registration',
    registered_city: 'Registered City',
    contact_person: 'Contact Person',
    job_title: 'Job Title',
    purchase_authority: 'Purchase & Payment Authority',
    purchase_decision_maker_name: 'Final Approver Name',
    purchase_decision_maker_email: 'Final Approver Business Email',
    business_email: 'Business Email',
    phone_whatsapp: 'Phone / WhatsApp',
    preferred_contact_method: 'Preferred Contact Method',
    telegram_username: 'Telegram Username',
    business_type: 'Business Type',
    business_type_other: 'Other Business Type',
    sales_channels: 'Sales Channel(s)',
    primary_storefront_url: 'Primary Storefront / Business URL',
    business_location_address_or_map: 'Business Location Address or Map Link',
    years_selling_smartphones: 'Years Selling Smartphones',
    main_customer_type: 'Main Customer Type',
    number_of_retail_locations: 'Number of Retail Locations',
    number_of_active_reseller_or_b2b_buyers: 'Active Reseller / B2B Buyers',
    average_monthly_smartphone_sales_last_3_months_units: 'Average Monthly Smartphone Sales - Last 3 Months (Units)',
    average_monthly_smartphone_purchase_last_3_months_units: 'Average Monthly Smartphone Purchases - Last 3 Months (Units)',
    largest_single_smartphone_purchase_last_12_months_units: 'Largest Single Smartphone Purchase - Last 12 Months (Units)',
    main_brands_models_currently_sold: 'Main Brands / Models Currently Sold',
    can_provide_verification_records: 'Can you provide business registration and sales or purchase records if requested?',
    target_brands: 'Target Brand(s)',
    target_brand_other: 'Other Target Brand(s)',
    priority_target_models: 'Priority Target Models - Maximum 3',
    preferred_conditions: 'Preferred Condition(s)',
    essential_product_requirements: 'Essential Product Requirements',
    essential_product_requirements_other: 'Other Essential Requirement',
    initial_order_quantity_units: 'Initial Order Quantity (Units)',
    available_initial_order_budget_usd: 'Available Budget for Initial Order (USD)',
    initial_order_budget_status: 'Initial-Order Budget Status',
    expected_monthly_order_volume_units: 'Expected Monthly Order Volume (Units)',
    expected_monthly_purchase_budget_usd: 'Expected Monthly Purchase Budget (USD)',
    expected_order_frequency: 'Expected Order Frequency',
    first_paid_order_readiness: 'When could you place your first paid order?',
    acceptable_payment_terms: 'Acceptable Payment Term(s)',
    acceptable_payment_terms_other: 'Other Acceptable Payment Term',
    shipping_destination_country: 'Shipping Destination Country',
    shipping_destination_city: 'Shipping Destination City',
    primary_final_resale_country: 'Primary Final Country of Resale',
    additional_final_resale_markets: 'Additional Final Resale Markets',
    currently_import_smartphones: 'Do you currently import smartphones?',
    import_experience: 'Import Experience',
    importer_of_record: 'Who will act as the Importer of Record?',
    needs_logistics_or_import_guidance: 'Do you need support arranging shipping or import documentation?',
    used_open_box_import_legality: 'Have you confirmed that used or open-box smartphones can be legally imported into the destination country?',
    reasons_for_korean_supplier: 'Why are you looking for a Korean smartphone supplier?',
    reason_for_korean_supplier_other: 'Other Reason',
    additional_context: 'Additional Business or Order Context',
    agreement_information_accurate: 'I confirm that the information provided is accurate and may be used to evaluate this dealer application.',
    agreement_authorized_representative: 'I confirm that I am authorized to submit this application on behalf of the business.',
    agreement_wholesale_program_type: 'I understand that this is a wholesale inventory-purchase program, not an affiliate, commission, free-sample, dropshipping, or consignment program.',
    agreement_verification_contact_privacy: 'I consent to business verification and application-related contact, and I have read the Privacy Policy.',
    agreement_no_guaranteed_approval: 'I understand that submitting this application does not guarantee dealer approval or product allocation.',
    agreement_trade_compliance: 'I confirm that products will be imported, marketed, and resold in compliance with applicable laws and will not be diverted to prohibited parties or restricted destinations.',
};

const AGREEMENT_FIELDS = [
    'agreement_information_accurate',
    'agreement_authorized_representative',
    'agreement_wholesale_program_type',
    'agreement_verification_contact_privacy',
    'agreement_no_guaranteed_approval',
    'agreement_trade_compliance',
];

const INTEGER_FIELDS = [
    'year_established',
    'years_selling_smartphones',
    'number_of_retail_locations',
    'number_of_active_reseller_or_b2b_buyers',
    'average_monthly_smartphone_sales_last_3_months_units',
    'average_monthly_smartphone_purchase_last_3_months_units',
    'largest_single_smartphone_purchase_last_12_months_units',
    'initial_order_quantity_units',
    'expected_monthly_order_volume_units',
];

// Maps each server-validated field to the 0-based step that renders it, so a
// server validation error can jump the user to the right step and show inline.
const FIELD_STEP = {
    // Step 1 (Business)
    purchase_inventory_for_resale: 0,
    company_store_name: 0,
    legal_business_name: 0,
    legal_entity_type: 0,
    legal_entity_type_other: 0,
    business_registration_tax_reseller_id: 0,
    registration_id_not_applicable: 0,
    year_established: 0,
    country_of_registration: 0,
    registered_city: 0,
    contact_person: 0,
    job_title: 0,
    purchase_authority: 0,
    purchase_decision_maker_name: 0,
    purchase_decision_maker_email: 0,
    business_email: 0,
    phone_whatsapp: 0,
    preferred_contact_method: 0,
    telegram_username: 0,
    business_type: 0,
    business_type_other: 0,
    sales_channels: 0,
    primary_storefront_url: 0,
    no_public_online_presence: 0,
    business_location_address_or_map: 0,
    // Step 2 (Capacity)
    years_selling_smartphones: 1,
    main_customer_type: 1,
    number_of_retail_locations: 1,
    number_of_active_reseller_or_b2b_buyers: 1,
    average_monthly_smartphone_sales_last_3_months_units: 1,
    average_monthly_smartphone_purchase_last_3_months_units: 1,
    largest_single_smartphone_purchase_last_12_months_units: 1,
    main_brands_models_currently_sold: 1,
    can_provide_verification_records: 1,
    target_brands: 1,
    target_brand_other: 1,
    priority_target_models: 1,
    preferred_conditions: 1,
    essential_product_requirements: 1,
    essential_product_requirements_other: 1,
    initial_order_quantity_units: 1,
    available_initial_order_budget_usd: 1,
    initial_order_budget_status: 1,
    expected_monthly_order_volume_units: 1,
    expected_monthly_purchase_budget_usd: 1,
    expected_order_frequency: 1,
    first_paid_order_readiness: 1,
    acceptable_payment_terms: 1,
    acceptable_payment_terms_other: 1,
    // Step 3 (Import)
    shipping_destination_country: 2,
    shipping_destination_city: 2,
    primary_final_resale_country: 2,
    additional_final_resale_markets: 2,
    currently_import_smartphones: 2,
    import_experience: 2,
    importer_of_record: 2,
    needs_logistics_or_import_guidance: 2,
    used_open_box_import_legality: 2,
    reasons_for_korean_supplier: 2,
    reason_for_korean_supplier_other: 2,
    additional_context: 2,
    agreement_information_accurate: 2,
    agreement_authorized_representative: 2,
    agreement_wholesale_program_type: 2,
    agreement_verification_contact_privacy: 2,
    agreement_no_guaranteed_approval: 2,
    agreement_trade_compliance: 2,
};

const createInitialState = () => ({
    // Program fit
    purchase_inventory_for_resale: '',

    // Registered business
    company_store_name: '',
    legal_business_name: '',
    legal_entity_type: '',
    legal_entity_type_other: '',
    business_registration_tax_reseller_id: '',
    registration_id_not_applicable: false,
    year_established: '',
    country_of_registration: '',
    registered_city: '',

    // Applicant & authority
    contact_person: '',
    job_title: '',
    purchase_authority: '',
    purchase_decision_maker_name: '',
    purchase_decision_maker_email: '',
    business_email: '',
    phone_whatsapp: '',
    preferred_contact_method: '',
    telegram_username: '',

    // Business model & sales presence
    business_type: [],
    business_type_other: '',
    sales_channels: [],
    primary_storefront_url: '',
    no_public_online_presence: false,
    business_location_address_or_map: '',

    // Current smartphone business
    years_selling_smartphones: '',
    main_customer_type: '',
    number_of_retail_locations: '',
    number_of_active_reseller_or_b2b_buyers: '',
    average_monthly_smartphone_sales_last_3_months_units: '',
    average_monthly_smartphone_purchase_last_3_months_units: '',
    largest_single_smartphone_purchase_last_12_months_units: '',
    main_brands_models_currently_sold: '',
    can_provide_verification_records: '',

    // Target inventory
    target_brands: [],
    target_brand_other: '',
    priority_target_models: '',
    preferred_conditions: [],
    essential_product_requirements: [],
    essential_product_requirements_other: '',

    // Order, budget & payment
    initial_order_quantity_units: '',
    available_initial_order_budget_usd: '',
    initial_order_budget_status: '',
    expected_monthly_order_volume_units: '',
    expected_monthly_purchase_budget_usd: '',
    expected_order_frequency: '',
    first_paid_order_readiness: '',
    acceptable_payment_terms: [],
    acceptable_payment_terms_other: '',

    // Shipping & resale
    shipping_destination_country: '',
    shipping_destination_city: '',
    primary_final_resale_country: '',
    additional_final_resale_markets: '',

    // Import responsibility
    currently_import_smartphones: '',
    import_experience: '',
    importer_of_record: '',
    needs_logistics_or_import_guidance: '',
    used_open_box_import_legality: '',

    // Business motivation
    reasons_for_korean_supplier: [],
    reason_for_korean_supplier_other: '',
    additional_context: '',

    // Agreements
    agreement_information_accurate: false,
    agreement_authorized_representative: false,
    agreement_wholesale_program_type: false,
    agreement_verification_contact_privacy: false,
    agreement_no_guaranteed_approval: false,
    agreement_trade_compliance: false,

    // Hidden meta (populated on mount)
    form_name: 'Wholesale Dealer Application',
    form_version: 'v2-business-qualification',
    submitted_at: '',
    source_page: '',
    referrer: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',

    // Honeypot: must stay empty for real users.
    company_website_confirm: '',
});

const STEPS = [
    { title: 'Business', subtitle: 'Company & authority' },
    { title: 'Capacity', subtitle: 'Sales & purchase plan' },
    { title: 'Import', subtitle: 'Markets & compliance' },
];

const index = () => {
    const { __, loading: translationLoading } = useTranslation();
    const t = (key) => (translationLoading ? key : __(key));

    const activeLanguageLocale = useLanguageStore((state) => state.activeLanguageLocale);
    const isRtl = ['ar', 'ur'].includes(activeLanguageLocale);

    const [form, setForm] = useState(createInitialState());
    const [currentStep, setCurrentStep] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [summary, setSummary] = useState([]);
    const [submitted, setSubmitted] = useState(null); // { application_id }

    // Toast feedback (same component/pattern as the Collaborator page).
    const [successMessage, setSuccessMessage] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessMessage(true);
    };
    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorMessage(true);
    };

    // Capture hidden meta once on mount.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setForm((prev) => ({
            ...prev,
            source_page: window.location.href,
            referrer: document.referrer,
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            utm_term: params.get('utm_term') || '',
            utm_content: params.get('utm_content') || '',
        }));
    }, []);

    const setData = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const setInteger = (key, value) => setData(key, value.replace(/[^0-9]/g, ''));

    const toggleArrayValue = (key, value) =>
        setForm((prev) => {
            const current = prev[key];
            return {
                ...prev,
                [key]: current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value],
            };
        });

    // ---- Conditional visibility (mirrors the embed's show/hide logic) ----
    const cond = useMemo(() => {
        const bt = form.business_type;
        const sc = form.sales_channels;
        const pc = form.preferred_conditions;
        return {
            entityOther: form.legal_entity_type === 'Other',
            regNA: !!form.registration_id_not_applicable,
            approver:
                form.purchase_authority === 'Participates in the decision' ||
                form.purchase_authority === 'Another person approves',
            approverRequired: form.purchase_authority === 'Another person approves',
            telegram: form.preferred_contact_method === 'Telegram',
            businessTypeOther: bt.includes('Other'),
            activeBuyers: bt.some((v) => ['Distributor', 'B2B Wholesaler'].includes(v)),
            retailLocations: sc.includes('Physical Store'),
            offlineOnly: !!form.no_public_online_presence,
            targetBrandOther: form.target_brands.includes('Other'),
            requirementsOther: form.essential_product_requirements.includes('Other'),
            paymentOther: form.acceptable_payment_terms.includes('Other'),
            usedImport: pc.some((v) => ['Open Box', 'Used Grade A', 'Used Grade B'].includes(v)),
            reasonOther: form.reasons_for_korean_supplier.includes('Other'),
            ineligible: form.purchase_inventory_for_resale === NO,
        };
    }, [form]);

    // ---- Validation ----
    const buildStepValidators = () => {
        const errors = {};
        const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
        const emailRe = /^\S+@\S+\.\S+$/;

        const need = (field) => {
            if (isEmpty(form[field])) errors[field] = `${t(LABELS[field])} ${t('is required.')}`;
        };
        const needEmail = (field) => {
            if (isEmpty(form[field])) errors[field] = `${t(LABELS[field])} ${t('is required.')}`;
            else if (!emailRe.test(form[field])) errors[field] = t('Enter a valid email address.');
        };
        const needUrl = (field) => {
            if (isEmpty(form[field])) {
                errors[field] = `${t(LABELS[field])} ${t('is required.')}`;
                return;
            }
            try {
                // eslint-disable-next-line no-new
                new URL(form[field]);
            } catch {
                errors[field] = t('Enter a valid URL.');
            }
        };
        const needGroup = (field) => {
            if (!Array.isArray(form[field]) || form[field].length === 0) {
                errors[field] = `${t('Please select at least one option for')} ${t(LABELS[field])}.`;
            }
        };

        return { errors, need, needEmail, needUrl, needGroup };
    };

    const validateStep = (step) => {
        const { errors, need, needEmail, needUrl, needGroup } = buildStepValidators();

        if (step === 0) {
            need('purchase_inventory_for_resale');
            if (cond.ineligible) {
                errors.purchase_inventory_for_resale = t(
                    'This dealer application is only for businesses purchasing smartphone inventory for resale.',
                );
            }
            need('company_store_name');
            need('legal_business_name');
            need('legal_entity_type');
            if (cond.entityOther) need('legal_entity_type_other');
            if (!cond.regNA) need('business_registration_tax_reseller_id');
            need('year_established');
            need('country_of_registration');
            need('registered_city');
            need('contact_person');
            need('job_title');
            need('purchase_authority');
            if (cond.approverRequired) {
                need('purchase_decision_maker_name');
                needEmail('purchase_decision_maker_email');
            }
            needEmail('business_email');
            need('phone_whatsapp');
            need('preferred_contact_method');
            if (cond.telegram) need('telegram_username');
            needGroup('business_type');
            if (cond.businessTypeOther) need('business_type_other');
            needGroup('sales_channels');
            if (cond.offlineOnly) need('business_location_address_or_map');
            else needUrl('primary_storefront_url');
        }

        if (step === 1) {
            need('years_selling_smartphones');
            need('main_customer_type');
            if (cond.retailLocations) need('number_of_retail_locations');
            if (cond.activeBuyers) need('number_of_active_reseller_or_b2b_buyers');
            need('average_monthly_smartphone_sales_last_3_months_units');
            need('average_monthly_smartphone_purchase_last_3_months_units');
            need('largest_single_smartphone_purchase_last_12_months_units');
            need('main_brands_models_currently_sold');
            need('can_provide_verification_records');
            needGroup('target_brands');
            if (cond.targetBrandOther) need('target_brand_other');
            need('priority_target_models');
            needGroup('preferred_conditions');
            if (cond.requirementsOther) need('essential_product_requirements_other');
            need('initial_order_quantity_units');
            need('available_initial_order_budget_usd');
            need('initial_order_budget_status');
            need('expected_monthly_order_volume_units');
            need('expected_monthly_purchase_budget_usd');
            need('expected_order_frequency');
            need('first_paid_order_readiness');
            needGroup('acceptable_payment_terms');
            if (cond.paymentOther) need('acceptable_payment_terms_other');
        }

        if (step === 2) {
            need('shipping_destination_country');
            need('shipping_destination_city');
            need('primary_final_resale_country');
            need('currently_import_smartphones');
            need('import_experience');
            need('importer_of_record');
            need('needs_logistics_or_import_guidance');
            if (cond.usedImport) need('used_open_box_import_legality');
            needGroup('reasons_for_korean_supplier');
            if (cond.reasonOther) need('reason_for_korean_supplier_other');
            AGREEMENT_FIELDS.forEach((field) => {
                if (!form[field]) errors[field] = t('This confirmation is required.');
            });
        }

        return errors;
    };

    const applyErrors = (errors) => {
        setFieldErrors(errors);
        const messages = Object.keys(errors).map((key) => errors[key]);
        setSummary(messages);
        if (messages.length) {
            const firstKey = Object.keys(errors)[0];
            requestAnimationFrame(() => {
                const el = document.getElementById(firstKey);
                if (el && typeof el.focus === 'function') el.focus();
                document
                    .getElementById('wda-validation-summary')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
        return messages.length === 0;
    };

    // Surface Laravel server-side validation errors ({ field: [msg, ...] }) in the
    // same top summary + inline slots as front-end errors, jumping to the step
    // that holds the first offending field so the user can see and fix it. Falls
    // back to a generic toast only when the response carries no field errors.
    const applyServerErrors = (data) => {
        const serverErrors = data?.errors;
        if (!serverErrors || typeof serverErrors !== 'object' || Object.keys(serverErrors).length === 0) {
            showError(
                data?.message ||
                    t('Submission failed. Please try again or contact the platform administrator.'),
            );
            return;
        }
        const mapped = {};
        Object.keys(serverErrors).forEach((field) => {
            const val = serverErrors[field];
            mapped[field] = Array.isArray(val) ? val[0] : String(val);
        });
        const firstField = Object.keys(mapped)[0];
        const targetStep = FIELD_STEP[firstField];
        if (typeof targetStep === 'number') setCurrentStep(targetStep);
        applyErrors(mapped);
        showError(
            data?.message || t('Please complete all required fields before submitting.'),
        );
    };

    const goNext = () => {
        const errors = validateStep(currentStep);
        if (Object.keys(errors).length > 0) {
            applyErrors(errors);
            showError(t('Please complete all required fields before submitting.'));
            return;
        }
        // Clean transition: never carry the previous step's errors/summary onto
        // the freshly shown step.
        setFieldErrors({});
        setSummary([]);
        setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        setSummary([]);
        setFieldErrors({});
        setCurrentStep((s) => Math.max(s - 1, 0));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Empty out conditional fields that are currently hidden so stale values are
    // not submitted (mirrors the embed clearing disabled inputs).
    const buildPayload = () => {
        const payload = { ...form, submitted_at: new Date().toISOString() };
        if (!cond.entityOther) payload.legal_entity_type_other = '';
        if (cond.regNA) payload.business_registration_tax_reseller_id = '';
        if (!cond.approver) {
            payload.purchase_decision_maker_name = '';
            payload.purchase_decision_maker_email = '';
        }
        if (!cond.telegram) payload.telegram_username = '';
        if (!cond.businessTypeOther) payload.business_type_other = '';
        if (!cond.activeBuyers) payload.number_of_active_reseller_or_b2b_buyers = '';
        if (!cond.retailLocations) payload.number_of_retail_locations = '';
        if (cond.offlineOnly) payload.primary_storefront_url = '';
        else payload.business_location_address_or_map = '';
        if (!cond.targetBrandOther) payload.target_brand_other = '';
        if (!cond.requirementsOther) payload.essential_product_requirements_other = '';
        if (!cond.paymentOther) payload.acceptable_payment_terms_other = '';
        if (!cond.usedImport) payload.used_open_box_import_legality = '';
        if (!cond.reasonOther) payload.reason_for_korean_supplier_other = '';
        return payload;
    };

    // Enter inside a single-line input/select must NOT submit the form. Without
    // this, pressing Enter on step 1 or 2 fires the form submit event, which runs
    // cross-step validation before the user has reached the final step.
    const handleFormKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'textarea') return; // allow newlines in textareas
        // Block Enter from submitting OR bubbling into custom select/checkbox
        // handlers that could advance/validate the wrong step.
        e.preventDefault();
        e.stopPropagation();
    };

    const handleSubmit = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        // Only the final step submits. Submit is now an explicit onClick on a
        // type="button" button, so this can never fire from step 1/2.
        if (currentStep !== STEPS.length - 1) {
            return;
        }

        // Validate every step; jump to the first with errors. axios is reached
        // only after ALL steps pass front-end validation.
        for (let step = 0; step < STEPS.length; step += 1) {
            const errors = validateStep(step);
            if (Object.keys(errors).length > 0) {
                setCurrentStep(step);
                applyErrors(errors);
                showError(t('Please complete all required fields before submitting.'));
                return;
            }
        }

        setSummary([]);
        setFieldErrors({});
        setProcessing(true);

        try {
            const response = await axios.post(
                route('website.wholesale-dealer-application.store'),
                buildPayload(),
            );

            if (response?.data?.ok) {
                trackPixelEvent('Lead');
                setSubmitted({ application_id: response.data.application_id || null });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                applyServerErrors(response?.data);
            }
        } catch (err) {
            applyServerErrors(err?.response?.data);
        } finally {
            setProcessing(false);
        }
    };

    // ---- Render helpers (plain functions; reuse the platform Web* components) ----
    const renderText = ({ field, label, type = 'text', required = false, placeholder = '', disabled = false }) => (
        <WebInput
            Id={field}
            Name={field}
            Type={type}
            InputName={t(label)}
            Placeholder={placeholder ? t(placeholder) : ''}
            Value={form[field]}
            Required={required}
            Disabled={disabled}
            Error={fieldErrors[field]}
            Action={(e) => setData(field, e.target.value)}
            ClassName={'dark:bg-surface-1-dark'}
        />
    );

    const renderNumber = ({ field, label, required = false, placeholder = '', disabled = false }) => (
        <WebInput
            Id={field}
            Name={field}
            Type={'text'}
            InputName={t(label)}
            Placeholder={placeholder ? t(placeholder) : ''}
            Value={form[field]}
            Required={required}
            Disabled={disabled}
            Error={fieldErrors[field]}
            Action={(e) => setInteger(field, e.target.value)}
            ClassName={'dark:bg-surface-1-dark'}
        />
    );

    const renderSelect = ({ field, label, options, required = false, disabled = false, placeholder = 'Select one' }) => (
        <WebSelectInput
            key={`${field}-${translationLoading ? 'l' : 'r'}-${activeLanguageLocale}`}
            Id={field}
            Name={field}
            InputName={t(label)}
            Required={required}
            isDisabled={disabled}
            items={options.map((o) => ({ id: o.value, name: t(o.label) }))}
            itemKey={'name'}
            Value={form[field]}
            customPlaceHolder={true}
            Placeholder={t(placeholder)}
            Action={(value) => setData(field, value ?? '')}
            Error={fieldErrors[field]}
        />
    );

    const renderCountrySelect = ({ field, label, required = false }) => (
        <WebSelectInput
            Id={field}
            Name={field}
            InputName={t(label)}
            Required={required}
            items={COUNTRIES.map((c) => ({ id: c.code, name: c.name }))}
            itemKey={'name'}
            Value={form[field]}
            customPlaceHolder={true}
            Placeholder={t('Select a country')}
            Action={(value) => setData(field, value ?? '')}
            Error={fieldErrors[field]}
        />
    );

    const renderTextarea = ({ field, label, required = false, placeholder = '' }) => (
        <WebTextArea
            Id={field}
            Name={field}
            InputName={t(label)}
            Placeholder={placeholder ? t(placeholder) : ''}
            Rows={4}
            Value={form[field]}
            Required={required}
            Error={fieldErrors[field]}
            Action={(e) => setData(field, e.target.value)}
            ClassName={'dark:bg-surface-1-dark'}
        />
    );

    const renderRadioGroup = ({ field, label, options, required = false }) => (
        <div id={field}>
            <label className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark">
                {t(label)}
                {required && <span className="font-bold"> *</span>}
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {options.map((o) => (
                    <label
                        key={o.value}
                        className="flex items-center gap-2 text-sm cursor-pointer text-main-text-light dark:text-main-text-dark"
                    >
                        <input
                            type="radio"
                            name={field}
                            checked={form[field] === o.value}
                            onChange={() => setData(field, o.value)}
                            className="w-4 h-4 border-surface-3-light accent-main-text-light focus:ring-0 dark:border-surface-3-dark dark:accent-main-text-dark"
                        />
                        <span>{t(o.label)}</span>
                    </label>
                ))}
            </div>
            {fieldErrors[field] && <p className="mt-1 text-sm text-red-500">{fieldErrors[field]}</p>}
        </div>
    );

    const renderCheckboxGroup = ({ field, label, options, required = false }) => (
        <div id={field}>
            <label className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark">
                {t(label)}
                {required && <span className="font-bold"> *</span>}
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {options.map((option) => (
                    <label
                        key={option}
                        className="flex items-center gap-2 text-sm cursor-pointer text-main-text-light dark:text-main-text-dark"
                    >
                        <input
                            type="checkbox"
                            checked={form[field].includes(option)}
                            onChange={() => toggleArrayValue(field, option)}
                            className="w-4 h-4 rounded border-surface-3-light accent-main-text-light focus:ring-0 dark:border-surface-3-dark dark:accent-main-text-dark"
                        />
                        <span>{t(option)}</span>
                    </label>
                ))}
            </div>
            {fieldErrors[field] && <p className="mt-1 text-sm text-red-500">{fieldErrors[field]}</p>}
        </div>
    );

    const renderInlineCheckbox = ({ field, text }) => (
        <label className="flex items-start gap-2 mt-2 text-sm cursor-pointer text-main-text-light dark:text-main-text-dark">
            <input
                type="checkbox"
                checked={!!form[field]}
                onChange={(e) => setData(field, e.target.checked)}
                className="mt-0.5 size-4 rounded border-surface-3-light accent-main-text-light focus:ring-0 dark:border-surface-3-dark dark:accent-main-text-dark"
            />
            <span>{t(text)}</span>
        </label>
    );

    const renderAgreement = ({ field, text }) => (
        <div>
            <label className="flex items-start gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={!!form[field]}
                    onChange={(e) => setData(field, e.target.checked)}
                    className="mt-1 border-gray-300 rounded cursor-pointer size-4 shrink-0 text-main-text-light focus:ring-0 dark:border-gray-600"
                />
                <span className="text-sm leading-relaxed text-main-text-light dark:text-main-text-dark">
                    {t(text)}
                    <span className="font-bold">&nbsp;*</span>
                </span>
            </label>
            {fieldErrors[field] && <p className="mt-1 text-sm text-red-500">{fieldErrors[field]}</p>}
        </div>
    );

    const renderSubSection = ({ title, description, children }) => (
        <div className="pt-5 mt-6 border-t border-surface-3-light first:mt-0 first:border-0 first:pt-0 dark:border-surface-3-dark">
            <h3 className="text-[16px] font-semibold text-main-text-light dark:text-main-text-dark">
                {t(title)}
            </h3>
            {description && (
                <p className="mt-1 mb-4 text-sm text-sub-text-light dark:text-sub-text-dark">{t(description)}</p>
            )}
            <div className="space-y-4">{children}</div>
        </div>
    );

    const renderSection = ({ number, title, description, children }) => (
        <section className="px-4 py-5 mb-5 rounded-md bg-surface-1-light dark:bg-surface-1-dark sm:px-6">
            <div className="flex items-start gap-3">
                <span className="flex items-center justify-center rounded-md size-9 shrink-0 bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light">
                    {number}
                </span>
                <div>
                    <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {t(title)}
                    </h2>
                    <p className="mt-1 text-sm text-sub-text-light dark:text-sub-text-dark">{t(description)}</p>
                </div>
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );

    return (
        <MainLayout>
            <Head title={__('Wholesale Dealer Application', true)} />

            {(showSuccessMessage || showErrorMessage) && (
                <Toast
                    flash={{
                        ...(showErrorMessage ? { error: errorMessage } : { success: successMessage }),
                    }}
                    onClosed={(type) => {
                        if (type === 'error') {
                            setErrorMessage(null);
                            setShowErrorMessage(false);
                        }
                        if (type === 'success') {
                            setSuccessMessage(null);
                            setShowSuccessMessage(false);
                        }
                    }}
                />
            )}

            <div className="sm:px-6 lg:px-8">
                <div className="pb-24 mx-auto sm:max-w-4xl lg:mt-6 lg:max-w-7xl">
                    {/* Header */}
                    <div className="relative px-6 mx-auto my-2 sm:max-w-3xl lg:max-w-4xl">
                        <button
                            onClick={goBackOrHome}
                            className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-main-text-light dark:text-main-text-dark lg:hidden"
                        >
                            <ChevronLeft />
                        </button>

                        <p className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                            {t('Dealer Program')}
                        </p>

                        <h1 className="mt-1 text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {t('Wholesale Dealer Application')}
                        </h1>

                        <p className="max-w-2xl mt-2 text-sm text-sub-text-light dark:text-sub-text-dark">
                            {t(
                                'Apply to purchase smartphone inventory from Korea for resale. We review your legal business profile, sales and purchasing capacity, initial-order budget, payment readiness, and import setup.',
                            )}
                        </p>
                    </div>

                    <div className="px-6 mx-auto mt-6 sm:max-w-3xl lg:max-w-4xl">
                        {submitted ? (
                            <section className="px-6 py-12 text-center rounded-md bg-surface-1-light dark:bg-surface-1-dark">
                                <div className="flex items-center justify-center mx-auto mb-4 text-2xl font-bold rounded-full size-14 bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light">
                                    &#10003;
                                </div>
                                <h2 className="text-[22px] font-semibold text-main-text-light dark:text-main-text-dark">
                                    {t('Application received')}
                                </h2>
                                <p className="max-w-xl mx-auto mt-3 text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {t(
                                        'Thank you. Our team will review your business profile, recent capacity, order budget, payment readiness, and import setup. Qualified applicants will be contacted with the next steps.',
                                    )}
                                </p>
                                {submitted.application_id && (
                                    <p className="mt-5 font-semibold text-main-text-light dark:text-main-text-dark">
                                        {t('Application ID')}: {submitted.application_id}
                                    </p>
                                )}
                            </section>
                        ) : (
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                onKeyDown={handleFormKeyDown}
                                dir={isRtl ? 'rtl' : 'ltr'}
                                noValidate
                            >
                                {/* Honeypot: visually hidden, must stay empty for real users. */}
                                <input
                                    type="text"
                                    name="company_website_confirm"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    value={form.company_website_confirm}
                                    onChange={(e) => setData('company_website_confirm', e.target.value)}
                                    style={{
                                        position: 'absolute',
                                        left: '-9999px',
                                        width: '1px',
                                        height: '1px',
                                        overflow: 'hidden',
                                    }}
                                />

                                {/* Stage note */}
                                <div className="p-4 mb-5 text-sm border rounded-md border-surface-3-light bg-surface-1-light text-sub-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-sub-text-dark">
                                    <strong className="block text-main-text-light dark:text-main-text-dark">
                                        {t('Initial qualification only')}
                                    </strong>
                                    {t(
                                        'Supporting documents are not required at this stage. Qualified applicants may later be asked for business registration, store verification, and sales or purchase records.',
                                    )}
                                </div>

                                {/* Progress */}
                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    {STEPS.map((step, i) => {
                                        const isActive = i === currentStep;
                                        const isComplete = i < currentStep;
                                        return (
                                            <div
                                                key={step.title}
                                                className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                                                    isActive
                                                        ? 'border-main-text-light dark:border-main-text-dark'
                                                        : 'border-surface-3-light dark:border-surface-3-dark'
                                                }`}
                                            >
                                                <span
                                                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                        isActive || isComplete
                                                            ? 'bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light'
                                                            : 'bg-surface-2-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark'
                                                    }`}
                                                >
                                                    {isComplete ? '✓' : i + 1}
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-xs font-semibold truncate text-main-text-light dark:text-main-text-dark">
                                                        {t(step.title)}
                                                    </span>
                                                    <span className="block text-[11px] text-sub-text-light dark:text-sub-text-dark truncate hidden sm:block">
                                                        {t(step.subtitle)}
                                                    </span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Validation summary */}
                                {summary.length > 0 && (
                                    <div
                                        id="wda-validation-summary"
                                        className="p-4 mb-5 text-sm text-red-600 border border-red-300 rounded-md bg-red-50 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400"
                                    >
                                        <strong className="block mb-1">{t('Please complete the following:')}</strong>
                                        <ul className="pl-5 space-y-1 list-disc">
                                            {[...new Set(summary)].map((message, idx) => (
                                                <li key={idx}>{message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* ---------------- STEP 1: Business ---------------- */}
                                {currentStep === 0 && (
                                    <>
                                        <div className="p-4 mb-5 text-sm border rounded-md border-surface-3-light bg-surface-2-light text-sub-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-sub-text-dark">
                                            <strong className="block text-main-text-light dark:text-main-text-dark">
                                                {t('This is a wholesale inventory-purchase application.')}
                                            </strong>
                                            {t(
                                                'It is not an affiliate, commission, free-sample, dropshipping, or consignment program.',
                                            )}
                                        </div>

                                        {renderSection({
                                            number: 1,
                                            title: 'Business Profile & Purchase Authority',
                                            description:
                                                'Confirm that this program fits your business and identify the company that would place and pay for orders.',
                                            children: (
                                                <>
                                                    {renderSubSection({
                                                        title: 'Program Fit',
                                                        description:
                                                            'Applicants must be seeking smartphone inventory for resale through their own business.',
                                                        children: (
                                                            <>
                                                                {renderRadioGroup({
                                                                    field: 'purchase_inventory_for_resale',
                                                                    label: LABELS.purchase_inventory_for_resale,
                                                                    options: RESALE_OPTIONS,
                                                                    required: true,
                                                                })}
                                                                {cond.ineligible && (
                                                                    <div className="p-3 text-sm text-red-600 border border-red-300 rounded-md bg-red-50 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
                                                                        <strong className="block">
                                                                            {t(
                                                                                'This dealer application may not be the right program.',
                                                                            )}
                                                                        </strong>
                                                                        {t(
                                                                            "Andromeda's dealer review is intended for businesses purchasing inventory for resale.",
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </>
                                                        ),
                                                    })}

                                                    {renderSubSection({
                                                        title: 'Registered Business',
                                                        description:
                                                            'Use the legal details of the business that will contract, pay, import, or resell the products.',
                                                        children: (
                                                            <>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderText({
                                                                        field: 'company_store_name',
                                                                        label: LABELS.company_store_name,
                                                                        required: true,
                                                                    })}
                                                                    {renderText({
                                                                        field: 'legal_business_name',
                                                                        label: LABELS.legal_business_name,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderSelect({
                                                                        field: 'legal_entity_type',
                                                                        label: LABELS.legal_entity_type,
                                                                        options: SELECT_OPTIONS.legal_entity_type,
                                                                        required: true,
                                                                    })}
                                                                    {cond.entityOther &&
                                                                        renderText({
                                                                            field: 'legal_entity_type_other',
                                                                            label: LABELS.legal_entity_type_other,
                                                                            required: true,
                                                                        })}
                                                                </div>
                                                                <div>
                                                                    {renderText({
                                                                        field: 'business_registration_tax_reseller_id',
                                                                        label: LABELS.business_registration_tax_reseller_id,
                                                                        required: !cond.regNA,
                                                                        disabled: cond.regNA,
                                                                    })}
                                                                    {renderInlineCheckbox({
                                                                        field: 'registration_id_not_applicable',
                                                                        text: 'No registration number is issued or applicable in our jurisdiction',
                                                                    })}
                                                                    <p className="mt-1 text-xs text-sub-text-light dark:text-sub-text-dark">
                                                                        {t(
                                                                            'Documents are not uploaded now; the number may be verified later.',
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderNumber({
                                                                        field: 'year_established',
                                                                        label: LABELS.year_established,
                                                                        required: true,
                                                                    })}
                                                                    {renderCountrySelect({
                                                                        field: 'country_of_registration',
                                                                        label: LABELS.country_of_registration,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                {renderText({
                                                                    field: 'registered_city',
                                                                    label: LABELS.registered_city,
                                                                    required: true,
                                                                })}
                                                            </>
                                                        ),
                                                    })}

                                                    {renderSubSection({
                                                        title: 'Applicant & Decision Authority',
                                                        description:
                                                            'Tell us who will coordinate the application and whether that person can approve purchases and payments.',
                                                        children: (
                                                            <>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderText({
                                                                        field: 'contact_person',
                                                                        label: LABELS.contact_person,
                                                                        required: true,
                                                                    })}
                                                                    {renderText({
                                                                        field: 'job_title',
                                                                        label: LABELS.job_title,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                {renderSelect({
                                                                    field: 'purchase_authority',
                                                                    label: LABELS.purchase_authority,
                                                                    options: SELECT_OPTIONS.purchase_authority,
                                                                    required: true,
                                                                })}
                                                                {cond.approver && (
                                                                    <div className="grid gap-5 sm:grid-cols-2">
                                                                        {renderText({
                                                                            field: 'purchase_decision_maker_name',
                                                                            label: LABELS.purchase_decision_maker_name,
                                                                            required: cond.approverRequired,
                                                                        })}
                                                                        {renderText({
                                                                            field: 'purchase_decision_maker_email',
                                                                            label: LABELS.purchase_decision_maker_email,
                                                                            type: 'email',
                                                                            required: cond.approverRequired,
                                                                        })}
                                                                    </div>
                                                                )}
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderText({
                                                                        field: 'business_email',
                                                                        label: LABELS.business_email,
                                                                        type: 'email',
                                                                        required: true,
                                                                    })}
                                                                    {renderText({
                                                                        field: 'phone_whatsapp',
                                                                        label: LABELS.phone_whatsapp,
                                                                        required: true,
                                                                        placeholder: 'Include country code',
                                                                    })}
                                                                </div>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderSelect({
                                                                        field: 'preferred_contact_method',
                                                                        label: LABELS.preferred_contact_method,
                                                                        options: SELECT_OPTIONS.preferred_contact_method,
                                                                        required: true,
                                                                    })}
                                                                    {cond.telegram &&
                                                                        renderText({
                                                                            field: 'telegram_username',
                                                                            label: LABELS.telegram_username,
                                                                            required: true,
                                                                            placeholder: '@username',
                                                                        })}
                                                                </div>
                                                            </>
                                                        ),
                                                    })}

                                                    {renderSubSection({
                                                        title: 'Business Model & Sales Presence',
                                                        description:
                                                            'Select all applicable business types and sales channels. Verification details are requested only when relevant.',
                                                        children: (
                                                            <>
                                                                {renderCheckboxGroup({
                                                                    field: 'business_type',
                                                                    label: LABELS.business_type,
                                                                    options: CHECKBOX_OPTIONS.business_type,
                                                                    required: true,
                                                                })}
                                                                {cond.businessTypeOther &&
                                                                    renderText({
                                                                        field: 'business_type_other',
                                                                        label: LABELS.business_type_other,
                                                                        required: true,
                                                                    })}
                                                                {renderCheckboxGroup({
                                                                    field: 'sales_channels',
                                                                    label: LABELS.sales_channels,
                                                                    options: CHECKBOX_OPTIONS.sales_channels,
                                                                    required: true,
                                                                })}
                                                                <div>
                                                                    {renderText({
                                                                        field: 'primary_storefront_url',
                                                                        label: LABELS.primary_storefront_url,
                                                                        type: 'url',
                                                                        required: !cond.offlineOnly,
                                                                        disabled: cond.offlineOnly,
                                                                        placeholder: 'https://',
                                                                    })}
                                                                    {renderInlineCheckbox({
                                                                        field: 'no_public_online_presence',
                                                                        text: 'No public online storefront or business website',
                                                                    })}
                                                                </div>
                                                                {cond.offlineOnly &&
                                                                    renderText({
                                                                        field: 'business_location_address_or_map',
                                                                        label: LABELS.business_location_address_or_map,
                                                                        required: true,
                                                                    })}
                                                            </>
                                                        ),
                                                    })}
                                                </>
                                            ),
                                        })}
                                    </>
                                )}

                                {/* ---------------- STEP 2: Capacity ---------------- */}
                                {currentStep === 1 && (
                                    <>
                                        {renderSection({
                                            number: 2,
                                            title: 'Sales Capacity & Purchase Plan',
                                            description:
                                                'Provide recent operating figures and the budget and timing for a realistic first order.',
                                            children: (
                                                <>
                                                    {renderSubSection({
                                                        title: 'Current Smartphone Business',
                                                        description:
                                                            'Use recent operating figures, not future targets. Sales are units sold to customers; purchase volume is units sourced from all suppliers.',
                                                        children: (
                                                            <>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderNumber({
                                                                        field: 'years_selling_smartphones',
                                                                        label: LABELS.years_selling_smartphones,
                                                                        required: true,
                                                                    })}
                                                                    {renderSelect({
                                                                        field: 'main_customer_type',
                                                                        label: LABELS.main_customer_type,
                                                                        options: SELECT_OPTIONS.main_customer_type,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                {(cond.retailLocations || cond.activeBuyers) && (
                                                                    <div className="grid gap-5 sm:grid-cols-2">
                                                                        {cond.retailLocations &&
                                                                            renderNumber({
                                                                                field: 'number_of_retail_locations',
                                                                                label: LABELS.number_of_retail_locations,
                                                                                required: true,
                                                                            })}
                                                                        {cond.activeBuyers &&
                                                                            renderNumber({
                                                                                field: 'number_of_active_reseller_or_b2b_buyers',
                                                                                label: LABELS.number_of_active_reseller_or_b2b_buyers,
                                                                                required: true,
                                                                            })}
                                                                    </div>
                                                                )}
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderNumber({
                                                                        field: 'average_monthly_smartphone_sales_last_3_months_units',
                                                                        label: LABELS.average_monthly_smartphone_sales_last_3_months_units,
                                                                        required: true,
                                                                    })}
                                                                    {renderNumber({
                                                                        field: 'average_monthly_smartphone_purchase_last_3_months_units',
                                                                        label: LABELS.average_monthly_smartphone_purchase_last_3_months_units,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderNumber({
                                                                        field: 'largest_single_smartphone_purchase_last_12_months_units',
                                                                        label: LABELS.largest_single_smartphone_purchase_last_12_months_units,
                                                                        required: true,
                                                                    })}
                                                                    {renderText({
                                                                        field: 'main_brands_models_currently_sold',
                                                                        label: LABELS.main_brands_models_currently_sold,
                                                                        required: true,
                                                                        placeholder: 'e.g., iPhone 15/16, Galaxy S24/S25',
                                                                    })}
                                                                </div>
                                                                {renderRadioGroup({
                                                                    field: 'can_provide_verification_records',
                                                                    label: LABELS.can_provide_verification_records,
                                                                    options: YESNO_OPTIONS,
                                                                    required: true,
                                                                })}
                                                            </>
                                                        ),
                                                    })}

                                                    {renderSubSection({
                                                        title: 'Target Inventory',
                                                        description:
                                                            'Tell us what you are actively prepared to buy. Product availability and specifications will be confirmed after review.',
                                                        children: (
                                                            <>
                                                                {renderCheckboxGroup({
                                                                    field: 'target_brands',
                                                                    label: LABELS.target_brands,
                                                                    options: CHECKBOX_OPTIONS.target_brands,
                                                                    required: true,
                                                                })}
                                                                {cond.targetBrandOther &&
                                                                    renderText({
                                                                        field: 'target_brand_other',
                                                                        label: LABELS.target_brand_other,
                                                                        required: true,
                                                                    })}
                                                                {renderText({
                                                                    field: 'priority_target_models',
                                                                    label: LABELS.priority_target_models,
                                                                    required: true,
                                                                    placeholder:
                                                                        'e.g., iPhone 16 Pro, iPhone 15, Galaxy S25',
                                                                })}
                                                                {renderCheckboxGroup({
                                                                    field: 'preferred_conditions',
                                                                    label: LABELS.preferred_conditions,
                                                                    options: CHECKBOX_OPTIONS.preferred_conditions,
                                                                    required: true,
                                                                })}
                                                                {renderCheckboxGroup({
                                                                    field: 'essential_product_requirements',
                                                                    label: LABELS.essential_product_requirements,
                                                                    options: CHECKBOX_OPTIONS.essential_product_requirements,
                                                                })}
                                                                {cond.requirementsOther &&
                                                                    renderText({
                                                                        field: 'essential_product_requirements_other',
                                                                        label: LABELS.essential_product_requirements_other,
                                                                        required: true,
                                                                    })}
                                                            </>
                                                        ),
                                                    })}

                                                    {renderSubSection({
                                                        title: 'Order, Budget & Payment Readiness',
                                                        description:
                                                            'Enter the order you could realistically approve and fund. Budget ranges are in USD.',
                                                        children: (
                                                            <>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderNumber({
                                                                        field: 'initial_order_quantity_units',
                                                                        label: LABELS.initial_order_quantity_units,
                                                                        required: true,
                                                                    })}
                                                                    {renderSelect({
                                                                        field: 'available_initial_order_budget_usd',
                                                                        label: LABELS.available_initial_order_budget_usd,
                                                                        options: SELECT_OPTIONS.available_initial_order_budget_usd,
                                                                        required: true,
                                                                        placeholder: 'Select a range',
                                                                    })}
                                                                </div>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderSelect({
                                                                        field: 'initial_order_budget_status',
                                                                        label: LABELS.initial_order_budget_status,
                                                                        options: SELECT_OPTIONS.initial_order_budget_status,
                                                                        required: true,
                                                                    })}
                                                                    {renderNumber({
                                                                        field: 'expected_monthly_order_volume_units',
                                                                        label: LABELS.expected_monthly_order_volume_units,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderSelect({
                                                                        field: 'expected_monthly_purchase_budget_usd',
                                                                        label: LABELS.expected_monthly_purchase_budget_usd,
                                                                        options: SELECT_OPTIONS.expected_monthly_purchase_budget_usd,
                                                                        required: true,
                                                                        placeholder: 'Select a range',
                                                                    })}
                                                                    {renderSelect({
                                                                        field: 'expected_order_frequency',
                                                                        label: LABELS.expected_order_frequency,
                                                                        options: SELECT_OPTIONS.expected_order_frequency,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                {renderSelect({
                                                                    field: 'first_paid_order_readiness',
                                                                    label: LABELS.first_paid_order_readiness,
                                                                    options: SELECT_OPTIONS.first_paid_order_readiness,
                                                                    required: true,
                                                                })}
                                                                {renderCheckboxGroup({
                                                                    field: 'acceptable_payment_terms',
                                                                    label: LABELS.acceptable_payment_terms,
                                                                    options: CHECKBOX_OPTIONS.acceptable_payment_terms,
                                                                    required: true,
                                                                })}
                                                                {cond.paymentOther &&
                                                                    renderText({
                                                                        field: 'acceptable_payment_terms_other',
                                                                        label: LABELS.acceptable_payment_terms_other,
                                                                        required: true,
                                                                    })}
                                                            </>
                                                        ),
                                                    })}
                                                </>
                                            ),
                                        })}
                                    </>
                                )}

                                {/* ---------------- STEP 3: Import ---------------- */}
                                {currentStep === 2 && (
                                    <>
                                        {renderSection({
                                            number: 3,
                                            title: 'Markets, Import Readiness & Compliance',
                                            description:
                                                'Identify where inventory will be delivered and resold, who will manage import responsibility, and confirm the application terms.',
                                            children: (
                                                <>
                                                    {renderSubSection({
                                                        title: 'Shipping & Final Resale Markets',
                                                        description:
                                                            'The delivery country may differ from the final country of resale. Enter both accurately.',
                                                        children: (
                                                            <>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderCountrySelect({
                                                                        field: 'shipping_destination_country',
                                                                        label: LABELS.shipping_destination_country,
                                                                        required: true,
                                                                    })}
                                                                    {renderText({
                                                                        field: 'shipping_destination_city',
                                                                        label: LABELS.shipping_destination_city,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderCountrySelect({
                                                                        field: 'primary_final_resale_country',
                                                                        label: LABELS.primary_final_resale_country,
                                                                        required: true,
                                                                    })}
                                                                    {renderText({
                                                                        field: 'additional_final_resale_markets',
                                                                        label: LABELS.additional_final_resale_markets,
                                                                        placeholder: 'Countries or regions, separated by commas',
                                                                    })}
                                                                </div>
                                                            </>
                                                        ),
                                                    })}

                                                    {renderSubSection({
                                                        title: 'Import Responsibility',
                                                        description:
                                                            'Import arrangements and legal eligibility should be confirmed before a paid order is placed.',
                                                        children: (
                                                            <>
                                                                {renderRadioGroup({
                                                                    field: 'currently_import_smartphones',
                                                                    label: LABELS.currently_import_smartphones,
                                                                    options: YESNO_OPTIONS,
                                                                    required: true,
                                                                })}
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    {renderSelect({
                                                                        field: 'import_experience',
                                                                        label: LABELS.import_experience,
                                                                        options: SELECT_OPTIONS.import_experience,
                                                                        required: true,
                                                                    })}
                                                                    {renderSelect({
                                                                        field: 'importer_of_record',
                                                                        label: LABELS.importer_of_record,
                                                                        options: SELECT_OPTIONS.importer_of_record,
                                                                        required: true,
                                                                    })}
                                                                </div>
                                                                {renderRadioGroup({
                                                                    field: 'needs_logistics_or_import_guidance',
                                                                    label: LABELS.needs_logistics_or_import_guidance,
                                                                    options: YESNO_OPTIONS,
                                                                    required: true,
                                                                })}
                                                                {cond.usedImport &&
                                                                    renderSelect({
                                                                        field: 'used_open_box_import_legality',
                                                                        label: LABELS.used_open_box_import_legality,
                                                                        options: SELECT_OPTIONS.used_open_box_import_legality,
                                                                        required: true,
                                                                    })}
                                                            </>
                                                        ),
                                                    })}

                                                    {renderSubSection({
                                                        title: 'Business Motivation',
                                                        description:
                                                            'Structured answers help route the application to the right commercial follow-up.',
                                                        children: (
                                                            <>
                                                                {renderCheckboxGroup({
                                                                    field: 'reasons_for_korean_supplier',
                                                                    label: LABELS.reasons_for_korean_supplier,
                                                                    options: CHECKBOX_OPTIONS.reasons_for_korean_supplier,
                                                                    required: true,
                                                                })}
                                                                {cond.reasonOther &&
                                                                    renderText({
                                                                        field: 'reason_for_korean_supplier_other',
                                                                        label: LABELS.reason_for_korean_supplier_other,
                                                                        required: true,
                                                                    })}
                                                                {renderTextarea({
                                                                    field: 'additional_context',
                                                                    label: LABELS.additional_context,
                                                                    placeholder:
                                                                        'Add information that may help us evaluate or route your application.',
                                                                })}
                                                            </>
                                                        ),
                                                    })}

                                                    {renderSubSection({
                                                        title: 'Agreement',
                                                        description: 'All confirmations are required to submit the application.',
                                                        children: (
                                                            <div className="space-y-3">
                                                                {AGREEMENT_FIELDS.map((field) => (
                                                                    <React.Fragment key={field}>
                                                                        {renderAgreement({ field, text: LABELS[field] })}
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        ),
                                                    })}
                                                </>
                                            ),
                                        })}
                                    </>
                                )}

                                {/* Step actions */}
                                <div className="flex items-center justify-between gap-3 mt-2">
                                    <div>
                                        {currentStep > 0 && (
                                            <button
                                                type="button"
                                                onClick={goBack}
                                                className="text-md flex h-[50px] items-center justify-center gap-2 rounded-md border border-surface-3-light px-6 font-semibold text-main-text-light transition-all hover:bg-surface-2-light dark:border-surface-3-dark dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                                            >
                                                {t('Back')}
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                            {t('Step')} {currentStep + 1} {t('of')} {STEPS.length}
                                        </span>
                                        {currentStep < STEPS.length - 1 ? (
                                            <button
                                                key="wda-continue"
                                                type="button"
                                                onClick={goNext}
                                                className="text-md flex h-[50px] items-center justify-center gap-2 rounded-md bg-main-text-light px-6 font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                                            >
                                                {t('Continue')}
                                            </button>
                                        ) : (
                                            <button
                                                key="wda-submit"
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={processing}
                                                className={`text-md flex h-[50px] items-center justify-center gap-2 rounded-md bg-main-text-light px-6 font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${processing && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                            >
                                                {processing && <Spinner customSize={'size-5'} />}
                                                {processing ? t('Submitting...') : t('Submit Dealer Application')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default index;
