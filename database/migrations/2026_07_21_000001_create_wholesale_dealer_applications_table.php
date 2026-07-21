<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Wholesale Dealer Application — standalone lead-capture table.
     * SEPARATE STANDALONE DOMAIN: no FK or linkage to orders / order_items /
     * payments / smartphones / lodging / commissions / attribution. Field names
     * are ported verbatim from the governing embed form.
     */
    public function up(): void
    {
        Schema::create('wholesale_dealer_applications', function (Blueprint $table) {
            // Identity
            $table->id();
            $table->string('public_id')->unique();       // WDA-<uuid>
            $table->string('application_id')->unique();   // human-facing id (same WDA-<uuid> value)

            // ---- Step 1: Program fit ----
            $table->string('purchase_inventory_for_resale'); // fit-gate value (required)

            // ---- Step 1: Registered business ----
            $table->string('company_store_name');
            $table->string('legal_business_name');
            $table->string('legal_entity_type');
            $table->string('legal_entity_type_other')->nullable(); // required only when entity type = Other
            $table->string('business_registration_tax_reseller_id')->nullable(); // required unless N/A flag set
            $table->boolean('registration_id_not_applicable')->default(false);
            $table->unsignedInteger('year_established');
            $table->string('country_of_registration');
            $table->string('registered_city');

            // ---- Step 1: Applicant & decision authority ----
            $table->string('contact_person');
            $table->string('job_title');
            $table->string('purchase_authority');
            $table->string('purchase_decision_maker_name')->nullable();  // conditional
            $table->string('purchase_decision_maker_email')->nullable(); // conditional
            $table->string('business_email');
            $table->string('phone_whatsapp');
            $table->string('preferred_contact_method');
            $table->string('telegram_username')->nullable(); // required only when contact method = Telegram

            // ---- Step 1: Business model & sales presence ----
            $table->json('business_type');                // business_type[]
            $table->string('business_type_other')->nullable();
            $table->json('sales_channels');               // sales_channels[]
            $table->string('primary_storefront_url')->nullable(); // required unless offline-only
            $table->boolean('no_public_online_presence')->default(false);
            $table->text('business_location_address_or_map')->nullable(); // required only when offline-only

            // ---- Step 2: Current smartphone business ----
            $table->unsignedInteger('years_selling_smartphones');
            $table->string('main_customer_type');
            $table->unsignedInteger('number_of_retail_locations')->nullable();            // conditional (physical store)
            $table->unsignedInteger('number_of_active_reseller_or_b2b_buyers')->nullable(); // conditional (distributor/b2b)
            $table->unsignedInteger('average_monthly_smartphone_sales_last_3_months_units');
            $table->unsignedInteger('average_monthly_smartphone_purchase_last_3_months_units');
            $table->unsignedInteger('largest_single_smartphone_purchase_last_12_months_units');
            $table->text('main_brands_models_currently_sold');
            $table->string('can_provide_verification_records');

            // ---- Step 2: Target inventory ----
            $table->json('target_brands');                // target_brands[]
            $table->string('target_brand_other')->nullable();
            $table->text('priority_target_models');
            $table->json('preferred_conditions');         // preferred_conditions[]
            $table->json('essential_product_requirements')->nullable(); // optional group
            $table->string('essential_product_requirements_other')->nullable();

            // ---- Step 2: Order, budget & payment readiness ----
            $table->unsignedInteger('initial_order_quantity_units');
            $table->string('available_initial_order_budget_usd');   // range select (string)
            $table->string('initial_order_budget_status');
            $table->unsignedInteger('expected_monthly_order_volume_units');
            $table->string('expected_monthly_purchase_budget_usd'); // range select (string)
            $table->string('expected_order_frequency');
            $table->string('first_paid_order_readiness');
            $table->json('acceptable_payment_terms');     // acceptable_payment_terms[]
            $table->string('acceptable_payment_terms_other')->nullable();

            // ---- Step 3: Shipping & final resale markets ----
            $table->string('shipping_destination_country');
            $table->string('shipping_destination_city');
            $table->string('primary_final_resale_country');
            $table->text('additional_final_resale_markets')->nullable(); // optional

            // ---- Step 3: Import responsibility ----
            $table->string('currently_import_smartphones');
            $table->text('import_experience');
            $table->string('importer_of_record');
            $table->string('needs_logistics_or_import_guidance');
            $table->string('used_open_box_import_legality')->nullable(); // conditional (used/open-box)

            // ---- Step 3: Business motivation ----
            $table->json('reasons_for_korean_supplier'); // reasons_for_korean_supplier[]
            $table->string('reason_for_korean_supplier_other')->nullable();
            $table->text('additional_context')->nullable(); // optional

            // ---- Step 3: Agreements (all required) ----
            $table->boolean('agreement_information_accurate')->default(false);
            $table->boolean('agreement_authorized_representative')->default(false);
            $table->boolean('agreement_wholesale_program_type')->default(false);
            $table->boolean('agreement_verification_contact_privacy')->default(false);
            $table->boolean('agreement_no_guaranteed_approval')->default(false);
            $table->boolean('agreement_trade_compliance')->default(false);

            // ---- Meta / hidden (stored as-is for audit) ----
            $table->string('form_name')->nullable();
            $table->string('form_version')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->text('source_page')->nullable();
            $table->text('referrer')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('utm_content')->nullable();

            // ---- Status + audit ----
            $table->enum('status', ['new', 'reviewing', 'qualified', 'rejected'])->default('new');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();

            // Dashboard triage lookups
            $table->index('status');
            $table->index('business_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wholesale_dealer_applications');
    }
};
