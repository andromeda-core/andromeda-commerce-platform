<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Str;

class WholesaleDealerApplication extends Model
{
    protected $table = 'wholesale_dealer_applications';

    protected $fillable = [
        // Identity
        'public_id',
        'application_id',

        // Step 1 — Program fit
        'purchase_inventory_for_resale',

        // Step 1 — Registered business
        'company_store_name',
        'legal_business_name',
        'legal_entity_type',
        'legal_entity_type_other',
        'business_registration_tax_reseller_id',
        'registration_id_not_applicable',
        'year_established',
        'country_of_registration',
        'registered_city',

        // Step 1 — Applicant & decision authority
        'contact_person',
        'job_title',
        'purchase_authority',
        'purchase_decision_maker_name',
        'purchase_decision_maker_email',
        'business_email',
        'phone_whatsapp',
        'preferred_contact_method',
        'telegram_username',

        // Step 1 — Business model & sales presence
        'business_type',
        'business_type_other',
        'sales_channels',
        'primary_storefront_url',
        'no_public_online_presence',
        'business_location_address_or_map',

        // Step 2 — Current smartphone business
        'years_selling_smartphones',
        'main_customer_type',
        'number_of_retail_locations',
        'number_of_active_reseller_or_b2b_buyers',
        'average_monthly_smartphone_sales_last_3_months_units',
        'average_monthly_smartphone_purchase_last_3_months_units',
        'largest_single_smartphone_purchase_last_12_months_units',
        'main_brands_models_currently_sold',
        'can_provide_verification_records',

        // Step 2 — Target inventory
        'target_brands',
        'target_brand_other',
        'priority_target_models',
        'preferred_conditions',
        'essential_product_requirements',
        'essential_product_requirements_other',

        // Step 2 — Order, budget & payment readiness
        'initial_order_quantity_units',
        'available_initial_order_budget_usd',
        'initial_order_budget_status',
        'expected_monthly_order_volume_units',
        'expected_monthly_purchase_budget_usd',
        'expected_order_frequency',
        'first_paid_order_readiness',
        'acceptable_payment_terms',
        'acceptable_payment_terms_other',

        // Step 3 — Shipping & final resale markets
        'shipping_destination_country',
        'shipping_destination_city',
        'primary_final_resale_country',
        'additional_final_resale_markets',

        // Step 3 — Import responsibility
        'currently_import_smartphones',
        'import_experience',
        'importer_of_record',
        'needs_logistics_or_import_guidance',
        'used_open_box_import_legality',

        // Step 3 — Business motivation
        'reasons_for_korean_supplier',
        'reason_for_korean_supplier_other',
        'additional_context',

        // Step 3 — Agreements
        'agreement_information_accurate',
        'agreement_authorized_representative',
        'agreement_wholesale_program_type',
        'agreement_verification_contact_privacy',
        'agreement_no_guaranteed_approval',
        'agreement_trade_compliance',

        // Meta / hidden
        'form_name',
        'form_version',
        'submitted_at',
        'source_page',
        'referrer',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',

        // Status + audit
        'status',
        'ip_address',
        'user_agent',
    ];

    // Static Booting — identity generation only.
    protected static function booted()
    {
        static::creating(function ($application) {
            if (empty($application->public_id)) {
                $application->public_id = 'WDA-'.(string) Str::uuid();
            }

            // Human-facing application id mirrors the public_id (WDA-<uuid>).
            if (empty($application->application_id)) {
                $application->application_id = $application->public_id;
            }
        });
    }

    // Casting
    protected $casts = [
        // Checkbox-group arrays
        'business_type' => 'array',
        'sales_channels' => 'array',
        'target_brands' => 'array',
        'preferred_conditions' => 'array',
        'essential_product_requirements' => 'array',
        'acceptable_payment_terms' => 'array',
        'reasons_for_korean_supplier' => 'array',

        // Boolean flags
        'registration_id_not_applicable' => 'boolean',
        'no_public_online_presence' => 'boolean',

        // Agreements
        'agreement_information_accurate' => 'boolean',
        'agreement_authorized_representative' => 'boolean',
        'agreement_wholesale_program_type' => 'boolean',
        'agreement_verification_contact_privacy' => 'boolean',
        'agreement_no_guaranteed_approval' => 'boolean',
        'agreement_trade_compliance' => 'boolean',

        // Whole-number integers
        'year_established' => 'integer',
        'years_selling_smartphones' => 'integer',
        'number_of_retail_locations' => 'integer',
        'number_of_active_reseller_or_b2b_buyers' => 'integer',
        'average_monthly_smartphone_sales_last_3_months_units' => 'integer',
        'average_monthly_smartphone_purchase_last_3_months_units' => 'integer',
        'largest_single_smartphone_purchase_last_12_months_units' => 'integer',
        'initial_order_quantity_units' => 'integer',
        'expected_monthly_order_volume_units' => 'integer',

        // Timestamp
        'submitted_at' => 'datetime',
    ];
}
