<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\WholesaleDealerApplication\Interface\IWholesaleDealerApplicationRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WholesaleDealerApplicationController extends Controller
{
    public function __construct(
        private Trans $trans,
        private IWholesaleDealerApplicationRepository $wholesale_dealer_application
    ) {}

    public function index()
    {
        return Inertia::render('Website/WholesaleDealerApplication/index');
    }

    public function store(Request $request)
    {
        // Honeypot: bots fill the hidden "company_website_confirm" field.
        // Silently accept and drop without storing.
        if (! blank($request->input('company_website_confirm'))) {
            return response()->json([
                'ok' => true,
                'application_id' => null,
            ], 200);
        }

        $currentYear = (int) date('Y');

        $validator = Validator::make($request->all(), [
            // ---- Program fit ----
            'purchase_inventory_for_resale' => ['required', 'string', 'max:255'],

            // ---- Registered business ----
            'company_store_name' => ['required', 'string', 'max:255'],
            'legal_business_name' => ['required', 'string', 'max:255'],
            'legal_entity_type' => ['required', 'string', 'max:255'],
            'legal_entity_type_other' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => $request->input('legal_entity_type') === 'Other')],
            'registration_id_not_applicable' => ['nullable', 'boolean'],
            'business_registration_tax_reseller_id' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => ! $request->boolean('registration_id_not_applicable'))],
            'year_established' => ['required', 'integer', 'min:1800', 'max:' . $currentYear],
            'country_of_registration' => ['required', 'string', 'max:255'],
            'registered_city' => ['required', 'string', 'max:255'],

            // ---- Applicant & decision authority ----
            'contact_person' => ['required', 'string', 'max:255'],
            'job_title' => ['required', 'string', 'max:255'],
            'purchase_authority' => ['required', 'string', 'max:255'],
            'purchase_decision_maker_name' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => $request->input('purchase_authority') === 'Another person approves')],
            'purchase_decision_maker_email' => ['nullable', 'email', 'max:255', Rule::requiredIf(fn() => $request->input('purchase_authority') === 'Another person approves')],
            'business_email' => ['required', 'email', 'max:255'],
            'phone_whatsapp' => ['required', 'string', 'max:255'],
            'preferred_contact_method' => ['required', 'string', 'max:255'],
            'telegram_username' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => $request->input('preferred_contact_method') === 'Telegram')],

            // ---- Business model & sales presence ----
            'business_type' => ['required', 'array', 'min:1'],
            'business_type.*' => ['string', 'max:255'],
            'business_type_other' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => in_array('Other', (array) $request->input('business_type', [])))],
            'sales_channels' => ['required', 'array', 'min:1'],
            'sales_channels.*' => ['string', 'max:255'],
            'no_public_online_presence' => ['nullable', 'boolean'],
            'primary_storefront_url' => ['nullable', 'string', 'max:500', 'url', Rule::requiredIf(fn() => ! $request->boolean('no_public_online_presence'))],
            'business_location_address_or_map' => ['nullable', 'string', 'max:1000', Rule::requiredIf(fn() => $request->boolean('no_public_online_presence'))],

            // ---- Current smartphone business ----
            'years_selling_smartphones' => ['required', 'integer', 'min:0'],
            'main_customer_type' => ['required', 'string', 'max:255'],
            'number_of_retail_locations' => ['nullable', 'integer', 'min:1', Rule::requiredIf(fn() => in_array('Physical Store', (array) $request->input('sales_channels', [])))],
            'number_of_active_reseller_or_b2b_buyers' => ['nullable', 'integer', 'min:0', Rule::requiredIf(fn() => count(array_intersect(['Distributor', 'B2B Wholesaler'], (array) $request->input('business_type', []))) > 0)],
            'average_monthly_smartphone_sales_last_3_months_units' => ['required', 'integer', 'min:0'],
            'average_monthly_smartphone_purchase_last_3_months_units' => ['required', 'integer', 'min:0'],
            'largest_single_smartphone_purchase_last_12_months_units' => ['required', 'integer', 'min:0'],
            'main_brands_models_currently_sold' => ['required', 'string', 'max:1000'],
            'can_provide_verification_records' => ['required', 'string', 'max:255'],

            // ---- Target inventory ----
            'target_brands' => ['required', 'array', 'min:1'],
            'target_brands.*' => ['string', 'max:255'],
            'target_brand_other' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => in_array('Other', (array) $request->input('target_brands', [])))],
            'priority_target_models' => ['required', 'string', 'max:1000'],
            'preferred_conditions' => ['required', 'array', 'min:1'],
            'preferred_conditions.*' => ['string', 'max:255'],
            'essential_product_requirements' => ['nullable', 'array'],
            'essential_product_requirements.*' => ['string', 'max:255'],
            'essential_product_requirements_other' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => in_array('Other', (array) $request->input('essential_product_requirements', [])))],

            // ---- Order, budget & payment readiness ----
            'initial_order_quantity_units' => ['required', 'integer', 'min:1'],
            'available_initial_order_budget_usd' => ['required', 'string', 'max:255'],
            'initial_order_budget_status' => ['required', 'string', 'max:255'],
            'expected_monthly_order_volume_units' => ['required', 'integer', 'min:1'],
            'expected_monthly_purchase_budget_usd' => ['required', 'string', 'max:255'],
            'expected_order_frequency' => ['required', 'string', 'max:255'],
            'first_paid_order_readiness' => ['required', 'string', 'max:255'],
            'acceptable_payment_terms' => ['required', 'array', 'min:1'],
            'acceptable_payment_terms.*' => ['string', 'max:255'],
            'acceptable_payment_terms_other' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => in_array('Other', (array) $request->input('acceptable_payment_terms', [])))],

            // ---- Shipping & final resale markets ----
            'shipping_destination_country' => ['required', 'string', 'max:255'],
            'shipping_destination_city' => ['required', 'string', 'max:255'],
            'primary_final_resale_country' => ['required', 'string', 'max:255'],
            'additional_final_resale_markets' => ['nullable', 'string', 'max:1000'],

            // ---- Import responsibility ----
            'currently_import_smartphones' => ['required', 'string', 'max:255'],
            'import_experience' => ['required', 'string', 'max:255'],
            'importer_of_record' => ['required', 'string', 'max:255'],
            'needs_logistics_or_import_guidance' => ['required', 'string', 'max:255'],
            'used_open_box_import_legality' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => count(array_intersect(['Open Box', 'Used Grade A', 'Used Grade B'], (array) $request->input('preferred_conditions', []))) > 0)],

            // ---- Business motivation ----
            'reasons_for_korean_supplier' => ['required', 'array', 'min:1'],
            'reasons_for_korean_supplier.*' => ['string', 'max:255'],
            'reason_for_korean_supplier_other' => ['nullable', 'string', 'max:255', Rule::requiredIf(fn() => in_array('Other', (array) $request->input('reasons_for_korean_supplier', [])))],
            'additional_context' => ['nullable', 'string', 'max:5000'],

            // ---- Agreements (all required) ----
            'agreement_information_accurate' => ['accepted'],
            'agreement_authorized_representative' => ['accepted'],
            'agreement_wholesale_program_type' => ['accepted'],
            'agreement_verification_contact_privacy' => ['accepted'],
            'agreement_no_guaranteed_approval' => ['accepted'],
            'agreement_trade_compliance' => ['accepted'],

            // ---- Meta / hidden (stored as-is for audit) ----
            'form_name' => ['nullable', 'string', 'max:255'],
            'form_version' => ['nullable', 'string', 'max:255'],
            'submitted_at' => ['nullable', 'string', 'max:255'],
            'source_page' => ['nullable', 'string', 'max:2000'],
            'referrer' => ['nullable', 'string', 'max:2000'],
            'utm_source' => ['nullable', 'string', 'max:255'],
            'utm_medium' => ['nullable', 'string', 'max:255'],
            'utm_campaign' => ['nullable', 'string', 'max:255'],
            'utm_term' => ['nullable', 'string', 'max:255'],
            'utm_content' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'ok' => false,
                'message' => $this->trans->get('Please complete all required fields before submitting.'),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Fit-gate: recalculated server-side. This program is for resale buyers only.
        if ($request->input('purchase_inventory_for_resale') === 'No') {
            return response()->json([
                'ok' => false,
                'message' => $this->trans->get('This dealer application is only for businesses purchasing smartphone inventory for resale.'),
            ], 422);
        }

        $data = $validator->validated();

        // Server-controlled audit fields (never trusted from the client).
        $data['status'] = 'new';
        $data['ip_address'] = $request->ip();
        $data['user_agent'] = (string) $request->userAgent();


        try {
            $application = $this->wholesale_dealer_application->store($data);
        } catch (\Throwable $e) {
            Log::error('Wholesale dealer application store failed', ['error' => $e->getMessage()]);

            return response()->json([
                'ok' => false,
                'message' => $this->trans->get('Submission failed. Please try again or contact the platform administrator.'),
            ], 500);
        }

        return response()->json([
            'ok' => true,
            'application_id' => $application->application_id,
        ], 200);
    }
}
