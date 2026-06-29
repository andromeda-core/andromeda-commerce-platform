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
 * @property int $user_id
 * @property string $signal_type
 * @property string $context
 * @property array<array-key, mixed> $meta
 * @property string $status
 * @property int|null $resolved_by
 * @property string|null $resolved_at
 * @property string|null $expires_at
 * @property string|null $expired_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $is_active
 * @property-read mixed $detected_at
 * @property-read \App\Models\User|null $resolvedBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereContext($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereExpiredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereMeta($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereResolvedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereResolvedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereSignalType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountRiskSignal whereUserId($value)
 */
	class AccountRiskSignal extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string|null $route
 * @property string $path
 * @property string $ip_address
 * @property string $user_agent
 * @property string|null $device_fingerprint
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog whereDeviceFingerprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog wherePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog whereRoute($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog whereUserAgent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ActionLog whereUserId($value)
 */
	class ActionLog extends \Eloquent {}
}

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
 * @property int $order_id
 * @property int $product_link_id
 * @property int $rewarded_to_user_id
 * @property int $smartphone_id
 * @property string $calculation_type
 * @property numeric $calculation_value
 * @property numeric $order_amount
 * @property numeric $reward_amount
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $released_at
 * @property \Illuminate\Support\Carbon|null $reversed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\ProductLink $productLink
 * @property-read \App\Models\User $rewardedTo
 * @property-read \App\Models\Smartphone $smartphone
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereCalculationType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereCalculationValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereOrderAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereProductLinkId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereReleasedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereReversedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereRewardAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereRewardedToUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionReward whereUpdatedAt($value)
 */
	class AttributionReward extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $calculation_type
 * @property numeric $value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionRewardSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionRewardSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionRewardSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionRewardSetting whereCalculationType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionRewardSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionRewardSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionRewardSetting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributionRewardSetting whereValue($value)
 */
	class AttributionRewardSetting extends \Eloquent {}
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
 * @property string $vat
 * @property array<array-key, mixed>|null $invoices
 * @property numeric $final_unit_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
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
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SmartphoneCartAddon> $smartphoneAddonItems
 * @property-read int|null $smartphone_addon_items_count
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
 * @property string $translatable_type
 * @property int $translatable_id
 * @property int $language_id
 * @property string $field
 * @property string|null $value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Language $language
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $translatable
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation whereField($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation whereTranslatableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation whereTranslatableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContentTranslation whereValue($value)
 */
	class ContentTranslation extends \Eloquent {}
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
 * @property int|null $country_id
 * @property numeric $exchange_rate
 * @property string|null $rate_source
 * @property \Illuminate\Support\Carbon|null $rate_updated_at
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Country|null $country
 * @property-read string|null $added_at
 * @property-read string|null $formatted_exchange_rate_updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereExchangeRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereRateSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereRateUpdatedAt($value)
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
 * @property string|null $note
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CartItem> $cart_items
 * @property-read int|null $cart_items_count
 * @property-read \App\Models\Country|null $country
 * @property-read mixed $active_shipping_address
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderCancelationRequest> $orderCancelationRequests
 * @property-read int|null $order_cancelation_requests_count
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereNote($value)
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
 * @property string|null $phone
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
 * @property string|null $postal_code
 * @property string|null $bank_name
 * @property string|null $bank_account_name
 * @property string|null $iban
 * @property string|null $swift_code
 * @property string $bank_account_no
 * @property int $can_verify_inventory
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereCanVerifyInventory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereIban($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distributor wherePostalCode($value)
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
 * @property string $dormancy_threshold_type
 * @property int $dormancy_threshold_value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DormancySetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DormancySetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DormancySetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DormancySetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DormancySetting whereDormancyThresholdType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DormancySetting whereDormancyThresholdValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DormancySetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DormancySetting whereUpdatedAt($value)
 */
	class DormancySetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $old_email
 * @property string $new_email
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $changed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereChangedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereNewEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereOldEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereUserAgent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeLog whereUserId($value)
 */
	class EmailChangeLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $old_email
 * @property string $new_email
 * @property string|null $token
 * @property string $status
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $expires_at
 * @property string|null $confirmed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereNewEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereOldEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereUserAgent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmailChangeRequest whereUserId($value)
 */
	class EmailChangeRequest extends \Eloquent {}
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
 * @property string $public_id
 * @property string $original_name
 * @property string|null $file_name
 * @property string $folder
 * @property string|null $file_path
 * @property string|null $file_url
 * @property string|null $mime_type
 * @property string|null $extension
 * @property int|null $size
 * @property string $upload_status
 * @property int|null $uploaded_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string|null $created_at_formatted
 * @property-read string|null $human_size
 * @property-read \App\Models\User|null $uploadedBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereExtension($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereFileUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereFolder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereOriginalName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereUploadStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImage whereUploadedBy($value)
 */
	class InternalProductImage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImageFolder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImageFolder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImageFolder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImageFolder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImageFolder whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImageFolder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImageFolder whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalProductImageFolder whereUpdatedAt($value)
 */
	class InternalProductImageFolder extends \Eloquent {}
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
 * @property int $verified_by_id
 * @property int $inventory_id
 * @property string|null $screen_recording_video
 * @property string|null $scene_video
 * @property string|null $scanned_code
 * @property string|null $barcode_photo
 * @property string|null $verified_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Inventory $inventory
 * @property-read \App\Models\User $verifiedBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereBarcodePhoto($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereInventoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereScannedCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereSceneVideo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereScreenRecordingVideo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryVerification whereVerifiedById($value)
 */
	class InventoryVerification extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property int|null $country_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Country|null $country
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Translation> $translations
 * @property-read int|null $translations_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Language whereCountryId($value)
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
 * @property string $name
 * @property string|null $icon
 * @property string|null $category
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LodgingProduct> $products
 * @property-read int|null $products_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LodgingRoom> $rooms
 * @property-read int|null $rooms_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingAmenity whereUpdatedAt($value)
 */
	class LodgingAmenity extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lodging_product_id
 * @property string|null $policy_name
 * @property string|null $free_cancellation_deadline
 * @property array<array-key, mixed>|null $refund_schedule
 * @property string|null $no_show_policy
 * @property string|null $rejection_refund_policy
 * @property string|null $non_refundable_reasons
 * @property bool $requires_admin_confirmation
 * @property numeric|null $service_fee
 * @property bool $service_fee_online
 * @property numeric|null $cleaning_fee
 * @property bool $cleaning_fee_online
 * @property numeric|null $tax_amount
 * @property bool $tax_online
 * @property numeric|null $extra_guest_fee
 * @property string|null $extra_guest_fee_display_text
 * @property numeric|null $child_fee
 * @property string|null $child_fee_display_text
 * @property numeric|null $pet_fee
 * @property string|null $pet_fee_display_text
 * @property numeric|null $extension_fee
 * @property string|null $extension_fee_display_text
 * @property numeric|null $security_deposit
 * @property string|null $security_deposit_display_text
 * @property numeric|null $onsite_payment_amount
 * @property string|null $onsite_payment_amount_display_text
 * @property numeric|null $damage_fee
 * @property string|null $damage_fee_display_text
 * @property numeric|null $minibar_incidental_fee
 * @property string|null $minibar_incidental_fee_display_text
 * @property numeric|null $onsite_tax
 * @property string|null $onsite_tax_display_text
 * @property string|null $damage_policy
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
 * @property-read \App\Models\LodgingProduct $lodgingProduct
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereChildFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereChildFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereCleaningFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereCleaningFeeOnline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereDamageFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereDamageFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereDamagePolicy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereExtensionFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereExtensionFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereExtraGuestFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereExtraGuestFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereFreeCancellationDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereLodgingProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereMinibarIncidentalFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereMinibarIncidentalFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereNoShowPolicy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereNonRefundableReasons($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereOnsitePaymentAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereOnsitePaymentAmountDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereOnsiteTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereOnsiteTaxDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy wherePetFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy wherePetFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy wherePolicyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereRefundSchedule($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereRejectionRefundPolicy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereRequiresAdminConfirmation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereSecurityDeposit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereSecurityDepositDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereServiceFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereServiceFeeOnline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereTaxOnline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCancellationPolicy whereUpdatedAt($value)
 */
	class LodgingCancellationPolicy extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lodging_product_id
 * @property string|null $checkin_time
 * @property string|null $checkout_time
 * @property bool $early_checkin_available
 * @property numeric|null $early_checkin_fee
 * @property string|null $early_checkin_fee_display_text
 * @property bool $late_checkout_available
 * @property numeric|null $late_checkout_fee
 * @property string|null $late_checkout_fee_display_text
 * @property string|null $checkin_method
 * @property bool $front_desk_available
 * @property bool $self_checkin_available
 * @property bool $contactless_checkin_available
 * @property bool $host_meet_checkin_available
 * @property string|null $instructions_sent_when
 * @property string|null $same_day_booking_notice
 * @property string|null $early_entry_penalty
 * @property string|null $late_checkout_penalty
 * @property bool $id_verification_required
 * @property string|null $minor_policy
 * @property string|null $mixed_gender_policy
 * @property string|null $noise_party_restriction
 * @property string|null $party_policy
 * @property string|null $checkin_instruction_message
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
 * @property-read \App\Models\LodgingProduct $lodgingProduct
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereCheckinInstructionMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereCheckinMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereCheckinTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereCheckoutTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereContactlessCheckinAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereEarlyCheckinAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereEarlyCheckinFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereEarlyCheckinFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereEarlyEntryPenalty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereFrontDeskAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereHostMeetCheckinAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereIdVerificationRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereInstructionsSentWhen($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereLateCheckoutAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereLateCheckoutFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereLateCheckoutFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereLateCheckoutPenalty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereLodgingProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereMinorPolicy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereMixedGenderPolicy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereNoisePartyRestriction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy wherePartyPolicy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereSameDayBookingNotice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereSelfCheckinAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingCheckinPolicy whereUpdatedAt($value)
 */
	class LodgingCheckinPolicy extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $public_id
 * @property int $lodging_product_id
 * @property int|null $source_post_id
 * @property int|null $source_product_id
 * @property string|null $file_path
 * @property string|null $file_url
 * @property string|null $file_name
 * @property string $type
 * @property string|null $thumbnail_url
 * @property string|null $mime_type
 * @property int|null $size
 * @property string $upload_status
 * @property string|null $caption
 * @property string|null $alt_text
 * @property array<array-key, mixed>|null $hashtags
 * @property string|null $space_ref
 * @property string|null $time_ref
 * @property string|null $evidence_role
 * @property string|null $future_payload_ref
 * @property string $visibility
 * @property int|null $sort_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\LodgingProduct $lodgingProduct
 * @property-read \App\Models\Post|null $sourcePost
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereAltText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereCaption($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereEvidenceRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereFileUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereFuturePayloadRef($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereHashtags($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereLodgingProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereSourcePostId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereSourceProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereSpaceRef($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereThumbnailUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereTimeRef($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereUploadStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingMedia whereVisibility($value)
 */
	class LodgingMedia extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lodging_product_id
 * @property bool $parking_available
 * @property bool $parking_free
 * @property int|null $spaces_per_room
 * @property string|null $parking_type
 * @property bool $pre_registration_required
 * @property string|null $parking_availability_time
 * @property string|null $before_checkin_after_checkout
 * @property string|null $full_lot_policy
 * @property bool $nearby_parking_available
 * @property bool $fee_paid_by_guest
 * @property string|null $vehicle_height_limit
 * @property string|null $large_vehicle_restrictions
 * @property string|null $modified_vehicle_restriction
 * @property string|null $supercar_restriction
 * @property bool $ev_charging_available
 * @property bool $refund_if_no_parking
 * @property numeric|null $extra_parking_fee
 * @property string|null $extra_parking_fee_display_text
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
 * @property-read \App\Models\LodgingProduct $lodgingProduct
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereBeforeCheckinAfterCheckout($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereEvChargingAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereExtraParkingFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereExtraParkingFeeDisplayText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereFeePaidByGuest($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereFullLotPolicy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereLargeVehicleRestrictions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereLodgingProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereModifiedVehicleRestriction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereNearbyParkingAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereParkingAvailabilityTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereParkingAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereParkingFree($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereParkingType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy wherePreRegistrationRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereRefundIfNoParking($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereSpacesPerRoom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereSupercarRestriction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingParkingPolicy whereVehicleHeightLimit($value)
 */
	class LodgingParkingPolicy extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $public_id
 * @property string|null $slug
 * @property string $property_name
 * @property string $property_type
 * @property string|null $city_region
 * @property string|null $location_description
 * @property numeric|null $latitude
 * @property numeric|null $longitude
 * @property string|null $location_name
 * @property int|null $floor_id
 * @property int|null $floor_start_id
 * @property int|null $floor_end_id
 * @property string|null $tag
 * @property string|null $content
 * @property string|null $base_checkin_time
 * @property string|null $base_checkout_time
 * @property numeric|null $from_price
 * @property bool $is_active
 * @property bool $is_reservation_closed
 * @property int|null $assigned_dashboard_user_id
 * @property string $booking_source
 * @property string $source_of_truth
 * @property string $sync_status
 * @property string|null $external_provider
 * @property string|null $external_listing_id
 * @property string|null $external_api_render_mode
 * @property array<array-key, mixed>|null $external_api_payload_snapshot
 * @property string|null $msap_uri
 * @property string|null $msap_event_ref
 * @property array<array-key, mixed>|null $element_bundle
 * @property bool $msap_ready
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LodgingAmenity> $amenities
 * @property-read int|null $amenities_count
 * @property-read \App\Models\User|null $assignedDashboardUser
 * @property-read \App\Models\LodgingCancellationPolicy|null $cancellationPolicy
 * @property-read \App\Models\LodgingCheckinPolicy|null $checkinPolicy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
 * @property-read \App\Models\Floor|null $floor
 * @property-read \App\Models\Floor|null $floorEnd
 * @property-read \App\Models\Floor|null $floorStart
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LodgingMedia> $media
 * @property-read int|null $media_count
 * @property-read \App\Models\LodgingParkingPolicy|null $parkingPolicy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LodgingRoom> $rooms
 * @property-read int|null $rooms_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereAssignedDashboardUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereBaseCheckinTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereBaseCheckoutTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereBookingSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereCityRegion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereElementBundle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereExternalApiPayloadSnapshot($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereExternalApiRenderMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereExternalListingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereExternalProvider($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereFloorEndId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereFloorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereFloorStartId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereFromPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereIsReservationClosed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereLocationDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereLocationName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereMsapEventRef($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereMsapReady($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereMsapUri($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct wherePropertyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct wherePropertyType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereSourceOfTruth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereSyncStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereTag($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingProduct whereUpdatedAt($value)
 */
	class LodgingProduct extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lodging_room_id
 * @property string $name
 * @property string|null $stay_type
 * @property numeric|null $original_price
 * @property numeric $sale_price
 * @property numeric|null $discount_rate
 * @property numeric|null $member_price
 * @property bool $crypto_supported
 * @property array<array-key, mixed>|null $payment_methods
 * @property bool $is_cancellable
 * @property bool $is_non_refundable
 * @property bool $breakfast_included
 * @property bool $free_parking_included
 * @property bool $early_checkin_included
 * @property bool $late_checkout_included
 * @property bool $consecutive_nights_allowed
 * @property int|null $remaining_room_count
 * @property bool $is_bookable
 * @property bool $is_active
 * @property int|null $minimum_nights
 * @property int|null $maximum_nights
 * @property string|null $booking_cutoff_time
 * @property bool $same_day_booking_allowed
 * @property string|null $external_rate_plan_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
 * @property-read \App\Models\LodgingRoom $lodgingRoom
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereBookingCutoffTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereBreakfastIncluded($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereConsecutiveNightsAllowed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereCryptoSupported($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereDiscountRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereEarlyCheckinIncluded($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereExternalRatePlanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereFreeParkingIncluded($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereIsBookable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereIsCancellable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereIsNonRefundable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereLateCheckoutIncluded($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereLodgingRoomId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereMaximumNights($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereMemberPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereMinimumNights($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereOriginalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan wherePaymentMethods($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereRemainingRoomCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereSalePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereSameDayBookingAllowed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereStayType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRatePlan whereUpdatedAt($value)
 */
	class LodgingRatePlan extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $public_id
 * @property string|null $reservation_no
 * @property int|null $customer_id
 * @property int $lodging_product_id
 * @property int|null $lodging_room_id
 * @property int|null $lodging_rate_plan_id
 * @property \Illuminate\Support\Carbon $checkin_date
 * @property \Illuminate\Support\Carbon $checkout_date
 * @property int $guest_count
 * @property string|null $request_message
 * @property string|null $property_name_snapshot
 * @property string|null $room_name_snapshot
 * @property string|null $rate_plan_name_snapshot
 * @property numeric|null $price_snapshot
 * @property int|null $nights
 * @property numeric|null $online_amount
 * @property string|null $currency_code
 * @property string $status
 * @property string|null $previous_status
 * @property string $availability_mode
 * @property bool $requires_hotel_approval
 * @property int|null $assigned_dashboard_user_id
 * @property string|null $hotel_approval_status
 * @property int|null $hotel_approved_by
 * @property \Illuminate\Support\Carbon|null $hotel_approved_at
 * @property string|null $hotel_rejected_reason
 * @property string|null $hotel_rejection_note
 * @property string|null $alternative_room_suggestion
 * @property string|null $alternative_date_suggestion
 * @property string $payment_timing
 * @property string $approval_source
 * @property \Illuminate\Support\Carbon|null $approval_expires_at
 * @property \Illuminate\Support\Carbon|null $hotel_response_deadline
 * @property string $booking_source
 * @property string $source_of_truth
 * @property string $sync_status
 * @property string|null $external_provider
 * @property string|null $external_listing_id
 * @property string|null $external_room_id
 * @property string|null $external_rate_plan_id
 * @property string|null $external_booking_id
 * @property string|null $external_case_id
 * @property string|null $msap_uri
 * @property string|null $msap_event_ref
 * @property string|null $event_id
 * @property array<array-key, mixed>|null $element_bundle
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $assignedDashboardUser
 * @property-read \App\Models\Customer|null $customer
 * @property-read \App\Models\User|null $hotelApprovedBy
 * @property-read \App\Models\LodgingProduct $lodgingProduct
 * @property-read \App\Models\LodgingRatePlan|null $lodgingRatePlan
 * @property-read \App\Models\LodgingRoom|null $lodgingRoom
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LodgingReservationPayment> $payments
 * @property-read int|null $payments_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereAlternativeDateSuggestion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereAlternativeRoomSuggestion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereApprovalExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereApprovalSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereAssignedDashboardUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereAvailabilityMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereBookingSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereCheckinDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereCheckoutDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereCurrencyCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereElementBundle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereExternalBookingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereExternalCaseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereExternalListingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereExternalProvider($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereExternalRatePlanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereExternalRoomId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereGuestCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereHotelApprovalStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereHotelApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereHotelApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereHotelRejectedReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereHotelRejectionNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereHotelResponseDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereLodgingProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereLodgingRatePlanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereLodgingRoomId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereMsapEventRef($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereMsapUri($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereNights($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereOnlineAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation wherePaymentTiming($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation wherePreviousStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation wherePriceSnapshot($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation wherePropertyNameSnapshot($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereRatePlanNameSnapshot($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereRequestMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereRequiresHotelApproval($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereReservationNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereRoomNameSnapshot($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereSourceOfTruth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereSyncStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservation whereUpdatedAt($value)
 */
	class LodgingReservation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lodging_reservation_id
 * @property string $status
 * @property string $method_type
 * @property numeric|null $amount
 * @property numeric|null $price_amount
 * @property string|null $price_currency
 * @property string|null $pay_currency
 * @property string|null $external_ref
 * @property string|null $tx_hash
 * @property string|null $nowpayments_invoice_id
 * @property string|null $nowpayments_payment_id
 * @property string|null $nowpayments_payment_url
 * @property string|null $nowpayments_order_id
 * @property string|null $nowpayments_payment_status
 * @property \Illuminate\Support\Carbon|null $nowpayments_ipn_received_at
 * @property \Illuminate\Support\Carbon|null $payment_link_created_at
 * @property \Illuminate\Support\Carbon|null $payment_expires_at
 * @property \Illuminate\Support\Carbon|null $payment_confirmed_at
 * @property \Illuminate\Support\Carbon|null $failed_at
 * @property string|null $msap_uri
 * @property string|null $event_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\LodgingReservation $lodgingReservation
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereExternalRef($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereFailedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereLodgingReservationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereMethodType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereMsapUri($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereNowpaymentsInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereNowpaymentsIpnReceivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereNowpaymentsOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereNowpaymentsPaymentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereNowpaymentsPaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereNowpaymentsPaymentUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment wherePayCurrency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment wherePaymentConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment wherePaymentExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment wherePaymentLinkCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment wherePriceAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment wherePriceCurrency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereTxHash($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingReservationPayment whereUpdatedAt($value)
 */
	class LodgingReservationPayment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lodging_product_id
 * @property string $room_name
 * @property string $room_type
 * @property int $standard_guests
 * @property int|null $max_guests
 * @property int|null $bedrooms_count
 * @property int|null $beds_count
 * @property array<array-key, mixed>|null $bed_types
 * @property string|null $bed_size
 * @property int|null $bathrooms_count
 * @property int|null $toilets_count
 * @property bool $is_bathroom_private
 * @property bool $has_jacuzzi
 * @property bool $has_bathtub
 * @property bool $has_shower_booth
 * @property string|null $view_type
 * @property string|null $view_type_other
 * @property string|null $room_size
 * @property string|null $room_floor_label
 * @property bool $is_smoking_allowed
 * @property bool $children_allowed
 * @property bool $pets_allowed
 * @property bool $is_random_assignment
 * @property int|null $remaining_room_count
 * @property bool $is_available
 * @property string|null $external_room_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LodgingAmenity> $amenities
 * @property-read int|null $amenities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
 * @property-read \App\Models\LodgingProduct $lodgingProduct
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LodgingRatePlan> $ratePlans
 * @property-read int|null $rate_plans_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereBathroomsCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereBedSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereBedTypes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereBedroomsCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereBedsCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereChildrenAllowed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereExternalRoomId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereHasBathtub($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereHasJacuzzi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereHasShowerBooth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereIsAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereIsBathroomPrivate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereIsRandomAssignment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereIsSmokingAllowed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereLodgingProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereMaxGuests($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom wherePetsAllowed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereRemainingRoomCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereRoomFloorLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereRoomName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereRoomSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereRoomType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereStandardGuests($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereToiletsCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereViewType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LodgingRoom whereViewTypeOther($value)
 */
	class LodgingRoom extends \Eloquent {}
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
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
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
 * @property string|null $event_id
 * @property string|null $msap_uri
 * @property string|null $order_no
 * @property int|null $customer_id
 * @property string|null $shipping_name
 * @property string|null $shipping_phone
 * @property string|null $shipping_address_line1
 * @property string|null $shipping_address_line2
 * @property string|null $shipping_city
 * @property string|null $shipping_state
 * @property string|null $shipping_postal_code
 * @property string|null $shipping_country
 * @property numeric $amount
 * @property numeric|null $points_used
 * @property numeric|null $full_amount
 * @property string $status
 * @property bool $is_delivery_confirmed
 * @property bool $is_purchase_confirmed
 * @property string|null $previous_status
 * @property string|null $payment_method
 * @property string|null $secondary_payment_method
 * @property string|null $np_id
 * @property int|null $collaborator_id
 * @property int|null $attribution_link_id
 * @property int|null $attributed_to_user_id
 * @property int|null $attributed_smartphone_id
 * @property string|null $courier_company
 * @property string|null $courier_company_address
 * @property string|null $courier_company_postal_code
 * @property string|null $courier_company_phone
 * @property \Illuminate\Support\Carbon|null $shipping_date
 * @property string|null $tracking_no
 * @property string|null $courier_invoice
 * @property string|null $payment_proof
 * @property int $is_cash_collected
 * @property array<array-key, mixed>|null $final_attachments
 * @property \Illuminate\Support\Carbon|null $delivered_at
 * @property \Illuminate\Support\Carbon|null $delivery_confirmed_at
 * @property string|null $purchase_confirmed_at
 * @property string|null $expires_at
 * @property string|null $expired_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property numeric $sub_total
 * @property numeric $import_tax
 * @property numeric $shipping_fee
 * @property numeric $addons_sub_total
 * @property-read \App\Models\OrderAddressChangeRequest|null $addressChangeRequest
 * @property-read \App\Models\SupplierAssignedOrder|null $assignedSupplier
 * @property-read \App\Models\Smartphone|null $attributedSmartphone
 * @property-read \App\Models\User|null $attributedToUser
 * @property-read \App\Models\ProductLink|null $attributionLink
 * @property-read \App\Models\AttributionReward|null $attributionReward
 * @property-read \App\Models\OrderCancelationRequest|null $cancelationRequest
 * @property-read \App\Models\Collaborator|null $collaborator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CollaboratorCommission> $collaboratorCommissions
 * @property-read int|null $collaborator_commissions_count
 * @property-read \App\Models\OrderCurrencySnapshot|null $currencySnapshot
 * @property-read \App\Models\Customer|null $customer
 * @property-read mixed $added_at
 * @property-read mixed $address_change_request_status
 * @property-read mixed $cancelation_request_status
 * @property-read mixed $is_address_change_requested
 * @property-read mixed $is_cancelation_requested
 * @property-read mixed $is_refund_requested
 * @property-read mixed $refund_request_status
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $orderItems
 * @property-read int|null $order_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PackageRecording> $orderPackageRecordings
 * @property-read int|null $order_package_recordings_count
 * @property-read \App\Models\Payment|null $payment
 * @property-read \App\Models\OrderRefund|null $refund
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplierCommission> $supplierCommissions
 * @property-read int|null $supplier_commissions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereAddonsSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereAttributedSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereAttributedToUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereAttributionLinkId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCollaboratorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCourierCompany($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCourierCompanyAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCourierCompanyPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCourierCompanyPostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCourierInvoice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereDeliveredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereDeliveryConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereExpiredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereFinalAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereFullAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereImportTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereIsCashCollected($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereIsDeliveryConfirmed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereIsPurchaseConfirmed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereMsapUri($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereNpId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereOrderNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePaymentProof($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePointsUsed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePreviousStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePurchaseConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereSecondaryPaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingAddressLine1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingAddressLine2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingPostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingState($value)
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
 * @property int $customer_id
 * @property string $shipping_name
 * @property string $shipping_phone
 * @property string $shipping_address_line1
 * @property string|null $shipping_address_line2
 * @property string $shipping_city
 * @property string $shipping_state
 * @property string $shipping_country
 * @property string $shipping_postal_code
 * @property string $reason
 * @property string|null $note
 * @property string $status
 * @property string|null $requested_at
 * @property string|null $approved_at
 * @property string|null $rejected_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customer $customer
 * @property-read mixed $added_at
 * @property-read \App\Models\Order $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereRejectedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereRequestedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereShippingAddressLine1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereShippingAddressLine2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereShippingCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereShippingCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereShippingName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereShippingPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereShippingPostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereShippingState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderAddressChangeRequest whereUpdatedAt($value)
 */
	class OrderAddressChangeRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property int $order_id
 * @property string $reason
 * @property string|null $note
 * @property string $status
 * @property string|null $requested_at
 * @property string|null $approved_at
 * @property string|null $rejected_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customer $customer
 * @property-read mixed $added_at
 * @property-read \App\Models\Order $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereRejectedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereRequestedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCancelationRequest whereUpdatedAt($value)
 */
	class OrderCancelationRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $address
 * @property string $postal_code
 * @property string $phone
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany wherePostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCourierCompany whereUpdatedAt($value)
 */
	class OrderCourierCompany extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property string $base_currency
 * @property numeric $base_amount
 * @property string $display_currency
 * @property numeric $display_amount
 * @property numeric $exchange_rate
 * @property string|null $rate_source
 * @property \Illuminate\Support\Carbon|null $rate_timestamp
 * @property string|null $selected_pay_currency
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $rate_timestamp_display
 * @property-read string $selected_pay_currency_display
 * @property-read \App\Models\Order $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereBaseAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereBaseCurrency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereDisplayAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereDisplayCurrency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereExchangeRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereRateSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereRateTimestamp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereSelectedPayCurrency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCurrencySnapshot whereUpdatedAt($value)
 */
	class OrderCurrencySnapshot extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property int|null $color_id
 * @property int $smartphone_id
 * @property int|null $inventory_item_id
 * @property array<array-key, mixed>|null $inventory_item_ids
 * @property int $quantity
 * @property numeric $unit_price
 * @property numeric $sub_total
 * @property numeric $shipping_cost
 * @property numeric $import_cost
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Color|null $color
 * @property-read mixed $added_at
 * @property-read \App\Models\Inventory|null $inventoryItem
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereInventoryItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereInventoryItemIds($value)
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
 * @property int $customer_id
 * @property string $refund_status
 * @property string|null $refund_method
 * @property string $refund_reason
 * @property string|null $defect_evidence_video
 * @property string|null $return_packaging_video
 * @property string|null $scanned_code
 * @property string|null $refund_reference
 * @property string|null $return_tracking_image
 * @property string|null $return_tracking_uploaded_at
 * @property \Illuminate\Support\Carbon|null $return_tracking_deadline_at
 * @property bool $is_auto_rejected
 * @property string|null $note
 * @property numeric $refund_amount
 * @property string|null $requested_at
 * @property string|null $approved_at
 * @property string|null $rejected_at
 * @property string|null $completed_at
 * @property string|null $withdrawn_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customer $customer
 * @property-read mixed $added_at
 * @property-read int|null $hours_remaining
 * @property-read string|null $return_tracking_image_url
 * @property-read \App\Models\Order $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereDefectEvidenceVideo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereIsAutoRejected($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereRefundAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereRefundMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereRefundReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereRefundReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereRefundStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereRejectedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereRequestedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereReturnPackagingVideo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereReturnTrackingDeadlineAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereReturnTrackingImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereReturnTrackingUploadedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereScannedCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderRefund whereWithdrawnAt($value)
 */
	class OrderRefund extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property string|null $barcode_photo
 * @property string|null $screen_recording_video
 * @property string|null $scene_video
 * @property bool $is_visible
 * @property int $is_opened
 * @property \Illuminate\Support\Carbon|null $opened_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $screen_recording_thumbnail
 * @property string|null $scene_video_thumbnail
 * @property-read mixed $added_at
 * @property-read \App\Models\Order $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereBarcodePhoto($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereIsOpened($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereIsVisible($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereOpenedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereSceneVideo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereSceneVideoThumbnail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereScreenRecordingThumbnail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereScreenRecordingVideo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PackageRecording whereUpdatedAt($value)
 */
	class PackageRecording extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property string $status
 * @property string|null $method_type
 * @property string|null $external_ref
 * @property string|null $tx_hash
 * @property numeric|null $amount
 * @property \Illuminate\Support\Carbon|null $confirmed_at
 * @property \Illuminate\Support\Carbon|null $finalized_at
 * @property \Illuminate\Support\Carbon|null $reversed_at
 * @property \Illuminate\Support\Carbon|null $failed_at
 * @property \Illuminate\Support\Carbon|null $canceled_at
 * @property string|null $event_id
 * @property string|null $msap_uri
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read \App\Models\Order $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereCanceledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereExternalRef($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereFailedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereFinalizedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereMethodType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereMsapUri($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereReversedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereTxHash($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payment whereUpdatedAt($value)
 */
	class Payment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property string $parent_name
 * @property string|null $alias
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereAlias($value)
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
 * @property int $order_id
 * @property numeric $commission_rate
 * @property numeric $commission_amount
 * @property string $payout_method
 * @property numeric|null $received_amount
 * @property string|null $received_method
 * @property int|null $currency_id
 * @property string|null $recorded_at
 * @property int|null $recorded_by
 * @property string|null $note
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Currency|null $currency
 * @property-read mixed $added_at
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\User|null $recordedBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereCommissionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereCurrencyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission wherePayoutMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereReceivedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereReceivedMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereRecordedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereRecordedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PlatformCommission whereUpdatedAt($value)
 */
	class PlatformCommission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $event_id
 * @property string|null $msap_uri
 * @property string|null $public_id
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
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereFloorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereImages($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereLocationName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post whereMsapUri($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post wherePostType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Post wherePublicId($value)
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
 * @property int $value
 * @property string $type
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read mixed $type_label
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceRange whereValue($value)
 */
	class PriceRange extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property array<array-key, mixed> $content
 * @property string $slug
 * @property string $company_name
 * @property string $country
 * @property string $state
 * @property string $dpo_name
 * @property string $dpo_email
 * @property string $dpo_phone
 * @property string $dpo_address
 * @property int|null $language_id
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read mixed $human_updated_at
 * @property-read \App\Models\Language|null $language
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereDpoAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereDpoEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereDpoName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereDpoPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PrivacyPolicy whereUpdatedAt($value)
 */
	class PrivacyPolicy extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $link_public_id
 * @property int $smartphone_id
 * @property int $user_id
 * @property int|null $post_id
 * @property string $status
 * @property string|null $event_id
 * @property string|null $msap_uri
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $added_at
 * @property-read string $shareable_url
 * @property-read \App\Models\Post|null $post
 * @property-read \App\Models\Smartphone $smartphone
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereLinkPublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereMsapUri($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink wherePostId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereSmartphoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductLink whereUserId($value)
 */
	class ProductLink extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $company_name
 * @property string $country
 * @property string $state
 * @property string $dpo_name
 * @property string $dpo_email
 * @property string $dpo_phone
 * @property string $dpo_address
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereDpoAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereDpoEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereDpoName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereDpoPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnPolicy whereState($value)
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
 * @property int $user_id
 * @property array<array-key, mixed>|null $old_shipping_address
 * @property array<array-key, mixed>|null $new_shipping_address
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog whereNewShippingAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog whereOldShippingAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog whereUserAgent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingAddressChangeLog whereUserId($value)
 */
	class ShippingAddressChangeLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property array<array-key, mixed> $content
 * @property string $slug
 * @property string $company_name
 * @property string $country
 * @property string $dpo_name
 * @property string $dpo_email
 * @property string $dpo_phone
 * @property string $dpo_address
 * @property string $state
 * @property int|null $language_id
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read mixed $human_updated_at
 * @property-read \App\Models\Language|null $language
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereDpoAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereDpoEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereDpoName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereDpoPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingPolicy whereUpdatedAt($value)
 */
	class ShippingPolicy extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $event_id
 * @property string|null $msap_uri
 * @property string|null $public_id
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
 * @property int|null $shipping_policy_id
 * @property string $upc
 * @property string|null $content
 * @property string|null $tag
 * @property bool $is_sold_out
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
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContentTranslation> $contentTranslations
 * @property-read int|null $content_translations_count
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
 * @property-read \App\Models\ShippingPolicy|null $shipping_policy
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereFloorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereImages($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereIsSoldOut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereLocationName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereModelNameId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereModelSearchableName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereMsapUri($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereProductDetails($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereReturnPolicyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Smartphone whereShippingPolicyId($value)
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
 * @property int $cart_item_id
 * @property int $customer_id
 * @property numeric $total_price
 * @property numeric $unit_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Addon $addon
 * @property-read \App\Models\CartItem $cartItem
 * @property-read \App\Models\Customer $customer
 * @property-read \App\Models\Smartphone $smartphone
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereAddonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCartAddon whereCartItemId($value)
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
 * @property int $country_id
 * @property int $smartphone_for_sale_id
 * @property numeric $price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Country $country
 * @property-read mixed $added_at
 * @property-read \App\Models\SmartphoneForSale $selling_info
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice whereSmartphoneForSaleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryPrice whereUpdatedAt($value)
 */
	class SmartphoneCountryPrice extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $smartphone_for_sale_id
 * @property int $country_id
 * @property int|null $shipping_fee_id
 * @property int|null $import_tax_id
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Country $country
 * @property-read \App\Models\AdditionalFeeList|null $importTax
 * @property-read \App\Models\AdditionalFeeList|null $shippingFee
 * @property-read \App\Models\SmartphoneForSale $smartphoneForSale
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping whereImportTaxId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping whereShippingFeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping whereSmartphoneForSaleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SmartphoneCountryShipping whereUpdatedAt($value)
 */
	class SmartphoneCountryShipping extends \Eloquent {}
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
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SmartphoneCountryShipping> $countryShippings
 * @property-read int|null $country_shippings_count
 * @property-read mixed $added_at
 * @property-read string $total_price_with_tax
 * @property-read \App\Models\AdditionalFeeList|null $import_tax
 * @property-read \App\Models\AdditionalFeeList|null $shipping_fee
 * @property-read \App\Models\Smartphone $smartphone
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SmartphoneCountryPrice> $territory_prices
 * @property-read int|null $territory_prices_count
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
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplierAssignedOrder> $assignedOrders
 * @property-read int|null $assigned_orders_count
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
 * @property int $order_id
 * @property int $supplier_id
 * @property int|null $assigned_by
 * @property int|null $batch_id
 * @property string|null $assigned_at
 * @property string $status
 * @property string|null $note
 * @property array<array-key, mixed>|null $draft_data
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $assignedBy
 * @property-read \App\Models\Batch|null $batch
 * @property-read mixed $added_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplierAssignmentLog> $logs
 * @property-read int|null $logs_count
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\Supplier $supplier
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereAssignedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereAssignedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereBatchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereDraftData($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereSupplierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignedOrder whereUpdatedAt($value)
 */
	class SupplierAssignedOrder extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $supplier_assigned_order_id
 * @property int $created_by
 * @property string|null $memo
 * @property string|null $file_path
 * @property string|null $file_name
 * @property string|null $file_type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\SupplierAssignedOrder $assignment
 * @property-read \App\Models\User $author
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereFileType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereMemo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereSupplierAssignedOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplierAssignmentLog whereUpdatedAt($value)
 */
	class SupplierAssignmentLog extends \Eloquent {}
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
 * @property string $name
 * @property array<array-key, mixed> $content
 * @property string $slug
 * @property string $company_name
 * @property string $country
 * @property string $state
 * @property string $dpo_name
 * @property string $dpo_email
 * @property string $dpo_phone
 * @property string $dpo_address
 * @property int|null $language_id
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $added_at
 * @property-read mixed $human_updated_at
 * @property-read \App\Models\Language|null $language
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereDpoAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereDpoEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereDpoName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereDpoPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TermsOfService whereUpdatedAt($value)
 */
	class TermsOfService extends \Eloquent {}
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
 * @property int $user_id
 * @property int|null $order_id
 * @property string $reason
 * @property array<array-key, mixed>|null $meta
 * @property string $status
 * @property string $detected_at
 * @property string|null $resolved_at
 * @property int $is_system_resolved
 * @property int|null $resolved_by
 * @property string|null $note
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Order|null $order
 * @property-read \App\Models\User|null $resolvedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UnsettledAccountNotificationLog> $unsettledNotificationLogs
 * @property-read int|null $unsettled_notification_logs_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereDetectedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereIsSystemResolved($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereMeta($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereResolvedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereResolvedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccount whereUserId($value)
 */
	class UnsettledAccount extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $unsettled_account_id
 * @property string $channel
 * @property string $message
 * @property int $is_system_sent
 * @property \App\Models\User|null $sent_by
 * @property string $sent_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\UnsettledAccount $unsettledAccount
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereChannel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereIsSystemSent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereSentAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereSentBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereUnsettledAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationLog whereUserId($value)
 */
	class UnsettledAccountNotificationLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $reason
 * @property int $delay
 * @property string $channel
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting whereChannel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting whereDelay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnsettledAccountNotificationSetting whereUpdatedAt($value)
 */
	class UnsettledAccountNotificationSetting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property int $is_email_verification_sent
 * @property string $password
 * @property int $is_agreed_to_terms
 * @property string $language_locale
 * @property int $language_id
 * @property string|null $profile
 * @property string|null $remember_token
 * @property string|null $last_activity_at
 * @property int $is_dormant
 * @property string|null $dormant_at
 * @property string $status
 * @property string|null $deactivated_at
 * @property string|null $suspended_at
 * @property string|null $under_dispute_at
 * @property string|null $under_investigation_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ActionLog> $actionLogs
 * @property-read int|null $action_logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Post> $bookMarkedPosts
 * @property-read int|null $book_marked_posts_count
 * @property-read \App\Models\Collaborator|null $collaborator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CollaboratorCommission> $collaboratorCommissionUsers
 * @property-read int|null $collaborator_commission_users_count
 * @property-read \App\Models\Customer|null $customer
 * @property-read \App\Models\Distributor|null $distributor
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EmailChangeLog> $emailChangeLogs
 * @property-read int|null $email_change_logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EmailChangeRequest> $emailChangeRequests
 * @property-read int|null $email_change_requests_count
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
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AccountRiskSignal> $riskSignalResolvedBy
 * @property-read int|null $risk_signal_resolved_by_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AccountRiskSignal> $riskSignals
 * @property-read int|null $risk_signals_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ShippingAddressChangeLog> $shippingAddressChangeLogs
 * @property-read int|null $shipping_address_change_logs_count
 * @property-read \App\Models\Supplier|null $supplier
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplierCommission> $supplierCommissionUsers
 * @property-read int|null $supplier_commission_users_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UnsettledAccountNotificationLog> $unsettleAccountNotificationLogs
 * @property-read int|null $unsettle_account_notification_logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UnsettledAccountNotificationLog> $unsettleAccountNotificationLogsSentBy
 * @property-read int|null $unsettle_account_notification_logs_sent_by_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UnsettledAccount> $unsettledIssues
 * @property-read int|null $unsettled_issues_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UnsettledAccount> $unsettledIssuesResolvedBy
 * @property-read int|null $unsettled_issues_resolved_by_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDeactivatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDormantAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsAgreedToTerms($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsDormant($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsEmailVerificationSent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLanguageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLanguageLocale($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastActivityAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereProfile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereSuspendedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUnderDisputeAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUnderInvestigationAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent implements \Illuminate\Contracts\Auth\MustVerifyEmail {}
}

