<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $category
 * @property string|null $value_type
 * @property numeric|null $default_value
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList whereDefaultValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdditionalFeeList whereValueType($value)
 */
	class AdditionalFeeList extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property numeric $price
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Smartphone> $smartphones
 * @property-read int|null $smartphones_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Addon whereUpdatedAt($value)
 */
	class Addon extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $aws_access_key_id
 * @property string $aws_secret_access_key
 * @property string $aws_region
 * @property string $aws_bucket
 * @property string|null $aws_url
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereAwsAccessKeyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereAwsBucket($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereAwsRegion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereAwsSecretAccessKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereAwsUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AwsSetting whereUpdatedAt($value)
 */
	class AwsSetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $batch_name
 * @property int $total_quantity
 * @property numeric $base_purchase_unit_price
 * @property int|null $supplier_id
 * @property array<array-key, mixed>|null $extra_costs
 * @property numeric $total_batch_cost
 * @property numeric $final_unit_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $vat
 * @property array<array-key, mixed>|null $invoices
 * @property-read mixed $added_at
 * @property-read mixed $invoice_urls
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Inventory> $inventory_items
 * @property-read int|null $inventory_items_count
 * @property-read \App\Models\Supplier|null $supplier
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereBasePurchaseUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereBatchName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereExtraCosts($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereFinalUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereInvoices($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereSupplierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereTotalBatchCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereTotalQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Batch whereVat($value)
 */
	class Batch extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $post_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \App\Models\Post $post
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bookmark newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bookmark newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bookmark query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bookmark whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bookmark whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bookmark wherePostId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bookmark whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bookmark whereUserId($value)
 */
	class Bookmark extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Smartphone> $smartphone
 * @property-read int|null $smartphone_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Capacity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Capacity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Capacity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Capacity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Capacity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Capacity whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Capacity whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Capacity whereUpdatedAt($value)
 */
	class Capacity extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property int|null $smartphone_id
 * @property string $type
 * @property int $quantity
 * @property int|null $color_id
 * @property numeric $unit_price
 * @property numeric $total_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $capacity
 * @property string|null $color_name
 * @property-read \App\Models\Color|null $color
 * @property-read \App\Models\Customer $customer
 * @property-read \App\Models\Smartphone|null $smartphone
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereCapacity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereColorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereColorName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereUpdatedAt($value)
 */
	class CartItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $short_description
 * @property array<array-key, mixed>|null $thumbnail
 * @property int|null $distributor_id
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Distributor|null $distributor
 * @property-read mixed $added_at
 * @property-read mixed $thumbnail_url
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Smartphone> $smartphones
 * @property-read int|null $smartphones_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereDistributorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereShortDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereThumbnail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereUpdatedAt($value)
 */
	class Category extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $address
 * @property string|null $bank_name
 * @property string|null $bank_account_name
 * @property string|null $iban
 * @property string|null $swift_code
 * @property string $bank_account_no
 * @property numeric|null $point_accumulation_rate
 * @property string $type
 * @property string $referral_code
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property numeric|null $commission_rate
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read int|null $orders_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereBankAccountName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereBankAccountNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereBankName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereIban($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator wherePointAccumulationRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereReferralCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereSwiftCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Collaborator whereUserId($value)
 */
	class Collaborator extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $order_id
 * @property int $collaborator_id
 * @property numeric $commission_rate
 * @property numeric $commission_amount
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Collaborator $collaborator
 * @property-read mixed $added_at
 * @property-read \App\Models\Order|null $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission whereCollaboratorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission whereCommissionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission wherePaidAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CollaboratorCommission whereUpdatedAt($value)
 */
	class CollaboratorCommission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Color whereUpdatedAt($value)
 */
	class Color extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property numeric $commission_rate
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommissionSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommissionSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommissionSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommissionSetting whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommissionSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommissionSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommissionSetting whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommissionSetting whereUpdatedAt($value)
 */
	class CommissionSetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Condition newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Condition newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Condition query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Condition whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Condition whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Condition whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Condition whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Condition whereUpdatedAt($value)
 */
	class Condition extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $iso_code
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country whereIsoCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Country whereUpdatedAt($value)
 */
	class Country extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $courier_name
 * @property string $courier_code
 * @property string $tracking_url
 * @property int $is_international
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany whereCourierCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany whereCourierName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany whereIsInternational($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany whereTrackingUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourierCompany whereUpdatedAt($value)
 */
	class CourierCompany extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $symbol
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereSymbol($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereUpdatedAt($value)
 */
	class Currency extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int|null $country_id
 * @property string|null $state
 * @property string|null $city
 * @property string|null $postal_code
 * @property string|null $address_line1
 * @property string|null $address_line2
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CartItem> $cart_items
 * @property-read int|null $cart_items_count
 * @property-read \App\Models\Country|null $country
 * @property-read mixed $active_shipping_address
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read int|null $orders_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ShippingAddress> $shippingAddresses
 * @property-read int|null $shipping_addresses_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereAddressLine1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereAddressLine2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer wherePostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereUserId($value)
 */
	class Customer extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $ip_address
 * @property string $name
 * @property string $email
 * @property string $phone
 * @property string $reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DataDeletionRequest whereUpdatedAt($value)
 */
	class DataDeletionRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $address
 * @property string|null $bank_name
 * @property string|null $bank_account_name
 * @property string|null $iban
 * @property string|null $swift_code
 * @property string $bank_account_no
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property numeric|null $commission_rate
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 * @property-read int|null $categories_count
 * @property-read mixed $added_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereBankAccountName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereBankAccountNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereBankName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereIban($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereSwiftCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereUserId($value)
 */
	class Distributor extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $order_id
 * @property int $distributor_id
 * @property numeric $commission_rate
 * @property numeric $commission_amount
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Distributor $distributor
 * @property-read mixed $added_at
 * @property-read \App\Models\Order|null $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission whereCommissionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission whereDistributorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission wherePaidAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DistributorCommission whereUpdatedAt($value)
 */
	class DistributorCommission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Post> $posts
 * @property-read int|null $posts_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereUpdatedAt($value)
 */
	class Floor extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $app_name
 * @property string $contact_email
 * @property string $contact_number
 * @property string|null $app_main_logo_dark
 * @property string|null $app_main_logo_light
 * @property string|null $app_favicon
 * @property string|null $app_product_delivery_info
 * @property string|null $app_pwa_logo
 * @property string|null $app_description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $app_favicon_url
 * @property-read mixed $app_main_logo_dark_url
 * @property-read mixed $app_main_logo_light_url
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereAppDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereAppFavicon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereAppMainLogoDark($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereAppMainLogoLight($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereAppName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereAppProductDeliveryInfo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereAppPwaLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereContactEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereContactNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralSetting whereUpdatedAt($value)
 */
	class GeneralSetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $google_map_api_key
 * @property string $google_map_id
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting whereGoogleMapApiKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting whereGoogleMapId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoogleMapSetting whereUpdatedAt($value)
 */
	class GoogleMapSetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $smartphone_id
 * @property int $batch_id
 * @property int|null $storage_location_id
 * @property string $imei1
 * @property string|null $imei2
 * @property string|null $eid
 * @property string|null $serial_no
 * @property \Illuminate\Support\Carbon|null $returned_date
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Batch $batch
 * @property-read mixed $added_at
 * @property-read \App\Models\Smartphone $smartphone
 * @property-read \App\Models\StorageLocation|null $storage_location
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereBatchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereEid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereImei1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereImei2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereReturnedDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereSerialNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereStorageLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Inventory whereUpdatedAt($value)
 */
	class Inventory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Translation> $translations
 * @property-read int|null $translations_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language whereUpdatedAt($value)
 */
	class Language extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $platform_user_id
 * @property int $user_id
 * @property string $platform
 * @property array<array-key, mixed> $raw_summary
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact wherePlatform($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact wherePlatformUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact whereRawSummary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaContact whereUserId($value)
 */
	class MetaContact extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $meta_fb_app_id
 * @property string $meta_fb_app_secret
 * @property string|null $meta_fb_app_name
 * @property string|null $meta_fb_page_access_token
 * @property string|null $meta_fb_page_username
 * @property string|null $meta_fb_page_id
 * @property string $meta_fb_token_type
 * @property string|null $meta_verify_token
 * @property string|null $meta_ig_app_id
 * @property string|null $meta_ig_app_secret
 * @property string|null $meta_ig_app_name
 * @property string|null $meta_ig_access_token
 * @property string|null $meta_ig_username
 * @property string|null $meta_ig_account_id
 * @property string|null $meta_ig_bussiness_account_id
 * @property string $meta_ig_token_type
 * @property string|null $meta_ig_token_expires_at
 * @property string|null $meta_fb_token_expires_at
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaFbAppId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaFbAppName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaFbAppSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaFbPageAccessToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaFbPageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaFbPageUsername($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaFbTokenExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaFbTokenType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgAccessToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgAppId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgAppName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgAppSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgBussinessAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgTokenExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgTokenType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaIgUsername($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereMetaVerifyToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetaSetting whereUpdatedAt($value)
 */
	class MetaSetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Smartphone> $smartphones
 * @property-read int|null $smartphones_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModelName newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModelName newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModelName query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModelName whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModelName whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModelName whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModelName whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModelName whereUpdatedAt($value)
 */
	class ModelName extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $now_payment_api_key
 * @property string $now_payment_public_key
 * @property string $now_payment_baseurl
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment whereNowPaymentApiKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment whereNowPaymentBaseurl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment whereNowPaymentPublicKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NowPayment whereUpdatedAt($value)
 */
	class NowPayment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $order_no
 * @property int|null $customer_id
 * @property int|null $shipping_address_id
 * @property numeric $amount
 * @property string $status
 * @property string|null $payment_method
 * @property string|null $np_id
 * @property int|null $collaborator_id
 * @property string|null $courier_company
 * @property \Illuminate\Support\Carbon|null $shipping_date
 * @property string|null $tracking_no
 * @property string|null $courier_invoice
 * @property string|null $payment_proof
 * @property int $is_cash_collected
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property numeric $sub_total
 * @property numeric $import_tax
 * @property numeric $shipping_fee
 * @property numeric $addons_sub_total
 * @property-read \App\Models\Collaborator|null $collaborator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CollaboratorCommission> $collaboratorCommissions
 * @property-read int|null $collaborator_commissions_count
 * @property-read \App\Models\Customer|null $customer
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $orderItems
 * @property-read int|null $order_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PackageRecording> $orderPackageRecordings
 * @property-read int|null $order_package_recordings_count
 * @property-read \App\Models\ShippingAddress|null $shippingAddress
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplierCommission> $supplierCommissions
 * @property-read int|null $supplier_commissions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereAddonsSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCollaboratorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCourierCompany($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCourierInvoice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereImportTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereIsCashCollected($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereNpId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereOrderNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePaymentProof($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingAddressId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereTrackingNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereUpdatedAt($value)
 */
	class Order extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property int|null $color_id
 * @property int $smartphone_id
 * @property int $quantity
 * @property numeric $unit_price
 * @property numeric $sub_total
 * @property numeric $shipping_cost
 * @property numeric $import_cost
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Color|null $color
 * @property-read mixed $added_at
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\Smartphone $smartphone
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SmartphoneOrderItemAddon> $smartphoneAddons
 * @property-read int|null $smartphone_addons_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereColorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereImportCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereShippingCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereUpdatedAt($value)
 */
	class OrderItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property string|null $package_video
 * @property string|null $thumbnail_url
 * @property int $is_opened
 * @property \Illuminate\Support\Carbon|null $opened_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \App\Models\Order $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereIsOpened($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereOpenedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording wherePackageVideo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereThumbnailUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereUpdatedAt($value)
 */
	class PackageRecording extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property string $parent_name
 * @property string $icon
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereGuardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereParentName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission withoutRole($roles, $guard = null)
 */
	class Permission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $user_id
 * @property int|null $floor_id
 * @property string $title
 * @property string $content
 * @property array<array-key, mixed>|null $images
 * @property array<array-key, mixed>|null $videos
 * @property string|null $slug
 * @property string|null $tag
 * @property numeric|null $latitude
 * @property numeric|null $longitude
 * @property string|null $location_name
 * @property string $post_type
 * @property int $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $bookmarkedByUsers
 * @property-read int|null $bookmarked_by_users_count
 * @property-read \App\Models\Floor|null $floor
 * @property-read mixed $added_at
 * @property-read mixed $created_at_time
 * @property-read mixed $is_bookmarked
 * @property-read mixed $post_image_urls
 * @property-read mixed $post_video_urls
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereFloorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereImages($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereLocationName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post wherePostType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereTag($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereVideos($value)
 */
	class Post extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property array<array-key, mixed> $content
 * @property string $slug
 * @property int|null $language_id
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read mixed $human_updated_at
 * @property-read \App\Models\Language|null $language
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereUpdatedAt($value)
 */
	class ReturnPolicy extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $points
 * @property \Illuminate\Support\Carbon $expires_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint wherePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardPoint whereUserId($value)
 */
	class RewardPoint extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property numeric $reward_rate
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardSetting whereRewardRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardSetting whereUpdatedAt($value)
 */
	class RewardSetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $guard_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereGuardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role withoutPermission($permissions)
 */
	class Role extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string|null $query
 * @property string|null $filters
 * @property string|null $filter_summary
 * @property string|null $filters_hash
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int $results_count
 * @property string|null $results
 * @property-read mixed $added_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereFilterSummary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereFilters($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereFiltersHash($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereQuery($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereResults($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereResultsCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchHistory whereUserId($value)
 */
	class SearchHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property int|null $country_id
 * @property string $name
 * @property string $phone
 * @property string $state
 * @property string $city
 * @property string $postal_code
 * @property string $address_line1
 * @property string|null $address_line2
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Country|null $country
 * @property-read \App\Models\Customer $customer
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereAddressLine1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereAddressLine2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress wherePostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddress whereUpdatedAt($value)
 */
	class ShippingAddress extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property array<array-key, mixed> $color_ids
 * @property int|null $model_name_id
 * @property string|null $model_searchable_name
 * @property int|null $capacity_id
 * @property int|null $category_id
 * @property int|null $floor_id
 * @property int|null $country_id
 * @property int|null $condition_id
 * @property int|null $delivery_days
 * @property int|null $courier_company_id
 * @property int|null $return_policy_id
 * @property string $upc
 * @property string|null $content
 * @property string|null $tag
 * @property string|null $slug
 * @property array<array-key, mixed>|null $images
 * @property array<array-key, mixed>|null $videos
 * @property numeric|null $latitude
 * @property numeric|null $longitude
 * @property string|null $location_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property array<array-key, mixed>|null $product_details
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Addon> $addons
 * @property-read int|null $addons_count
 * @property-read \App\Models\Capacity|null $capacity
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CartItem> $cart_items
 * @property-read int|null $cart_items_count
 * @property-read \App\Models\Category|null $category
 * @property-read \App\Models\Condition|null $condition
 * @property-read \App\Models\Country|null $country
 * @property-read \App\Models\CourierCompany|null $courier_company
 * @property-read \App\Models\Floor|null $floor
 * @property-read mixed $added_at
 * @property-read mixed $colors
 * @property-read mixed $created_at_time
 * @property-read mixed $smartphone_image_urls
 * @property-read mixed $smartphone_video_urls
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Inventory> $inventory_items
 * @property-read int|null $inventory_items_count
 * @property-read \App\Models\ModelName|null $model_name
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $orders
 * @property-read int|null $orders_count
 * @property-read \App\Models\ReturnPolicy|null $return_policy
 * @property-read \App\Models\SmartphoneForSale|null $selling_info
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SmartphoneCartAddon> $smartphoneAddons
 * @property-read int|null $smartphone_addons_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereCapacityId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereColorIds($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereConditionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereCourierCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereDeliveryDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereFloorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereImages($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereLocationName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereModelNameId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereModelSearchableName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereProductDetails($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereReturnPolicyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereTag($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereUpc($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereVideos($value)
 */
	class Smartphone extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $quantity
 * @property int $addon_id
 * @property int $smartphone_id
 * @property int $customer_id
 * @property numeric $total_price
 * @property numeric $unit_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Addon $addon
 * @property-read \App\Models\Customer $customer
 * @property-read \App\Models\Smartphone $smartphone
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereAddonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereUpdatedAt($value)
 */
	class SmartphoneCartAddon extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $smartphone_id
 * @property numeric $selling_price
 * @property string $total_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $shipping_fee_id
 * @property int|null $import_tax_id
 * @property-read mixed $added_at
 * @property-read \App\Models\AdditionalFeeList|null $import_tax
 * @property-read \App\Models\AdditionalFeeList|null $shipping_fee
 * @property-read \App\Models\Smartphone $smartphone
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale whereImportTaxId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale whereSellingPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale whereShippingFeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale whereSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneForSale whereUpdatedAt($value)
 */
	class SmartphoneForSale extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $smartphone_id
 * @property int $order_item_id
 * @property int $addon_id
 * @property int $customer_id
 * @property string $name
 * @property int $quantity
 * @property numeric $unit_price
 * @property numeric $total_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Addon $addon
 * @property-read \App\Models\Customer $customer
 * @property-read \App\Models\OrderItem $orderItem
 * @property-read \App\Models\Smartphone $smartphone
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereAddonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereOrderItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneOrderItemAddon whereUpdatedAt($value)
 */
	class SmartphoneOrderItemAddon extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $smtp_mailer
 * @property string|null $smtp_scheme
 * @property string|null $smtp_host
 * @property string|null $smtp_port
 * @property string|null $smtp_username
 * @property string|null $smtp_password
 * @property string $smtp_mail_from_address
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereSmtpHost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereSmtpMailFromAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereSmtpMailer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereSmtpPassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereSmtpPort($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereSmtpScheme($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereSmtpUsername($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmtpSetting whereUpdatedAt($value)
 */
	class SmtpSetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $country_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Country $country
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialCountry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialCountry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialCountry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialCountry whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialCountry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialCountry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SpecialCountry whereUpdatedAt($value)
 */
	class SpecialCountry extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $address
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Inventory> $inventory_items
 * @property-read int|null $inventory_items_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StorageLocation whereUpdatedAt($value)
 */
	class StorageLocation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $company_name
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Batch> $batches
 * @property-read int|null $batches_count
 * @property-read mixed $added_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereUserId($value)
 */
	class Supplier extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $order_id
 * @property int $supplier_id
 * @property numeric $commission_rate
 * @property numeric $commission_amount
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \App\Models\Order|null $order
 * @property-read \App\Models\Supplier $supplier
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission whereCommissionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission wherePaidAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission whereSupplierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierCommission whereUpdatedAt($value)
 */
	class SupplierCommission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $language_id
 * @property int $translation_key_id
 * @property string $value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Language $language
 * @property-read \App\Models\TranslationKey $translationKeys
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation whereTranslationKeyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Translation whereValue($value)
 */
	class Translation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $key
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Translation> $translations
 * @property-read int|null $translations_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TranslationKey newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TranslationKey newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TranslationKey query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TranslationKey whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TranslationKey whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TranslationKey whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TranslationKey whereUpdatedAt($value)
 */
	class TranslationKey extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string $language_locale
 * @property int $language_id
 * @property string|null $profile
 * @property int $is_active
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Post> $bookMarkedPosts
 * @property-read int|null $book_marked_posts_count
 * @property-read \App\Models\Collaborator|null $collaborator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CollaboratorCommission> $collaboratorCommissionUsers
 * @property-read int|null $collaborator_commission_users_count
 * @property-read \App\Models\Customer|null $customer
 * @property-read \App\Models\Distributor|null $distributor
 * @property-read mixed $added_at
 * @property-read mixed $avatar
 * @property-read mixed $points
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MetaContact> $metaContacts
 * @property-read int|null $meta_contacts_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Post> $posts
 * @property-read int|null $posts_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\RewardPoint> $reward_points
 * @property-read int|null $reward_points_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \App\Models\Supplier|null $supplier
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplierCommission> $supplierCommissionUsers
 * @property-read int|null $supplier_commission_users_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLanguageLocale($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereProfile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent implements \Illuminate\Contracts\Auth\MustVerifyEmail {}
}

