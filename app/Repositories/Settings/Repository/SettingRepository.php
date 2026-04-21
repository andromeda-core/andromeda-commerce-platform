<?php

namespace App\Repositories\Settings\Repository;

use App\Jobs\AppDarkLogoDestroyOnAWS;
use App\Jobs\AppDarkLogoStoreOnAWS;
use App\Jobs\AppFaviconDestroyOnAWS;
use App\Jobs\AppFaviconStoreOnAWS;
use App\Jobs\AppLightLogoDestroyOnAWS;
use App\Jobs\AppLightLogoStoreOnAWS;
use App\Jobs\AppPWALogoDestroyOnAWS;
use App\Jobs\AppPWALogoStoreOnAWS;
use App\Models\AdditionalFeeList;
use App\Models\Addon;
use App\Models\AttributionRewardSetting;
use App\Models\AwsSetting;
use App\Models\Capacity;
use App\Models\Color;
use App\Models\CommissionSetting;
use App\Models\Condition;
use App\Models\Country;
use App\Models\CourierCompany;
use App\Models\Currency;
use App\Models\DormancySetting;
use App\Models\GeneralSetting;
use App\Models\GoogleMapSetting;
use App\Models\MetaSetting;
use App\Models\ModelName;
use App\Models\NowPayment;
use App\Models\Permission;
use App\Models\PrivacyPolicy;
use App\Models\ReturnPolicy;
use App\Models\RewardSetting;
use App\Models\Role;
use App\Models\ShippingPolicy;
use App\Models\SmtpSetting;
use App\Models\SpecialCountry;
use App\Models\StorageLocation;
use App\Models\TermsOfService;
use App\Models\UnsettledAccountNotificationSetting;
use App\Repositories\Settings\Interface\ISettingRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Intervention\Image\ImageManager;
use Str;

class SettingRepository implements ISettingRepository
{
    public function __construct(
        private GeneralSetting $general_setting,
        private SmtpSetting $smtp_setting,
        private Role $role,
        private Permission $permission,
        private Color $color,
        private ModelName $model_name,
        private Capacity $capacity,
        private StorageLocation $storage_location,
        private Currency $currency,
        private AdditionalFeeList $additional_fee_list,
        private RewardSetting $reward_setting,
        private CommissionSetting $commission_setting,
        private Country $country,
        private SpecialCountry $special_country,
        private AwsSetting $aws_setting,
        private GoogleMapSetting $google_map_setting,
        private MetaSetting $meta_setting,
        private NowPayment $now_payment,
        private ReturnPolicy $return_policy,
        private CourierCompany $courier_company,
        private Condition $condition,
        private Addon $addon,
        private ShippingPolicy $shipping_policy,
        private TermsOfService $terms_of_service,
        private PrivacyPolicy $privacy_policy,
        private DormancySetting $dormancy_setting,
        private UnsettledAccountNotificationSetting $unsettled_account_notification_setting,
        private AttributionRewardSetting $attribution_reward_setting

    ) {}

    // General Setting
    public function getGenralSetting()
    {
        $general_setting = $this->general_setting->first();

        return $general_setting;
    }

    public function updateGeneralSetting(Request $request)
    {

        $validated_req = $request->validate([
            'app_name' => ['required', 'min:4', 'string', 'max:100'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_number' => ['required', 'max:50'],
            ...($request->hasFile('app_main_logo_dark') ? ['app_main_logo_dark' => 'nullable|image|max:2048'] : []),
            ...($request->hasFile('app_main_logo_light') ? ['app_main_logo_light' => 'nullable|image|max:2048'] : []),
            ...($request->hasFile('app_favicon') ? ['app_favicon' => 'nullable|image|max:2048'] : []),
            ...($request->hasFile('app_pwa_logo') ? ['app_pwa_logo' => 'nullable|image|max:2048'] : []),
            'app_description' => ['nullable', 'min:30', 'string', 'max:1000'],
            'app_product_delivery_info' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $general_setting = $this->general_setting->first();

            if ($request->boolean('is_removed_app_main_logo_dark') && ! $request->hasFile('app_main_logo_dark')) {
                if (! empty($general_setting->app_main_logo_dark)) {
                    dispatch(new AppDarkLogoDestroyOnAWS($general_setting->app_main_logo_dark));
                    $validated_req['app_main_logo_dark'] = null;
                }
            }

            if ($request->boolean('is_removed_app_main_logo_light') && ! $request->hasFile('app_main_logo_light')) {

                if (! empty($general_setting->app_main_logo_light)) {
                    dispatch(new AppLightLogoDestroyOnAWS($general_setting->app_main_logo_light));
                    $validated_req['app_main_logo_light'] = null;
                }
            }

            if ($request->boolean('is_removed_app_favicon') && ! $request->hasFile('app_favicon')) {
                if (! empty($general_setting->app_favicon)) {
                    dispatch(new AppFaviconDestroyOnAWS($general_setting->app_favicon));
                    $validated_req['app_favicon'] = null;
                }
            }

            if ($request->boolean('is_removed_app_pwa_logo') && ! $request->hasFile('app_pwa_logo')) {
                if (! empty($general_setting->app_favicon)) {
                    dispatch(new AppPWALogoDestroyOnAWS($general_setting->app_pwa_logo));
                    $validated_req['app_pwa_logo'] = null;
                }
            }

            if ($request->hasFile('app_favicon')) {

                if (! empty($general_setting->app_favicon)) {
                    dispatch(new AppFaviconDestroyOnAWS($general_setting->app_favicon));
                }

                $favicon = $request->file('app_favicon');
                $new_favicon_name = time() . uniqid() . '.' . $favicon->getClientOriginalExtension();

                $resizedImage = ImageManager::imagick()
                    ->read($favicon)
                    ->resize(512, 512)
                    ->contain(512, 512)
                    ->encodeByExtension('png', quality: 80);

                $tempPath = 'temp/uploads/' . $new_favicon_name;
                Storage::disk('local')->put($tempPath, (string) $resizedImage);
                $validated_req['app_favicon'] = null;

                dispatch(new AppFaviconStoreOnAWS($tempPath, $general_setting));
            }

            if ($request->hasFile('app_pwa_logo')) {

                if (! empty($general_setting->app_pwa_logo)) {
                    dispatch(new AppPWALogoDestroyOnAWS($general_setting->app_pwa_logo));
                }

                $logo = $request->file('app_pwa_logo');
                $new_logo_name = time() . uniqid() . '.' . $logo->getClientOriginalExtension();

                $resizedImage = ImageManager::imagick()
                    ->read($logo)
                    ->resize(512, 512)
                    ->contain(512, 512)
                    ->encodeByExtension('png', quality: 80);

                $tempPath = 'temp/uploads/' . $new_logo_name;
                Storage::disk('local')->put($tempPath, (string) $resizedImage);
                $validated_req['app_pwa_logo'] = null;

                dispatch(new AppPWALogoStoreOnAWS($tempPath, $general_setting));
            }

            if ($request->hasFile('app_main_logo_dark')) {

                if (! empty($general_setting->app_main_logo_dark)) {
                    dispatch(new AppDarkLogoDestroyOnAWS($general_setting->app_main_logo_dark));
                }

                $app_main_logo_dark = $request->file('app_main_logo_dark');

                $new_app_main_logo_dark_name = time() . uniqid() . '.' . $app_main_logo_dark->getClientOriginalExtension();

                $resizedImage = ImageManager::imagick()
                    ->read($app_main_logo_dark)
                    ->resize(512, 512)
                    ->contain(512, 512)
                    ->encodeByExtension($app_main_logo_dark->getClientOriginalExtension(), quality: 80);

                $tempPath = 'temp/uploads/' . $new_app_main_logo_dark_name;
                Storage::disk('local')->put($tempPath, (string) $resizedImage);
                $validated_req['app_main_logo_dark'] = null;

                dispatch(new AppDarkLogoStoreOnAWS($tempPath, $general_setting));

                // $validated_req['app_main_logo_dark'] = $new_app_main_logo_dark_name;
                // $app_main_logo_dark->move($directory, $new_app_main_logo_dark_name);

            }

            if ($request->hasFile('app_main_logo_light')) {

                if (! empty($general_setting->app_main_logo_light)) {
                    dispatch(new AppLightLogoDestroyOnAWS($general_setting->app_main_logo_light));
                }

                $app_main_logo_light = $request->file('app_main_logo_light');
                $new_app_main_logo_light_name = time() . uniqid() . '.' . $app_main_logo_light->getClientOriginalExtension();

                $resizedImage = ImageManager::imagick()
                    ->read($app_main_logo_light)
                    ->resize(512, 512)
                    ->contain(512, 512)
                    ->encodeByExtension($app_main_logo_light->getClientOriginalExtension(), quality: 80);

                $tempPath = 'temp/uploads/' . $new_app_main_logo_light_name;
                Storage::disk('local')->put($tempPath, (string) $resizedImage);
                $validated_req['app_main_logo_light'] = null;

                dispatch(new AppLightLogoStoreOnAWS($tempPath, $general_setting));

                // $validated_req['app_main_logo_light'] = $new_app_main_logo_light_name;
                // $app_main_logo_light->move($directory, $new_app_main_logo_light_name);

            }

            if (! empty($general_setting)) {
                $general_setting->update($validated_req);

                return [
                    'status' => true,
                    'message' => 'General Setting Updated Successfully',
                ];
            }

            $this->general_setting->create($validated_req);

            return [
                'status' => true,
                'message' => 'General Setting Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Smtp Setting
    public function getSmtpSetting()
    {
        $smtp_setting = $this->smtp_setting->first();

        return $smtp_setting;
    }

    public function updateSmtpSetting(Request $request)
    {
        $validated_req = $request->validate([
            'smtp_mailer' => ['required', 'string', 'max:100'],
            'smtp_scheme' => ['nullable', 'string', 'max:100'],
            'smtp_host' => ['nullable', 'string', 'max:255'],
            'smtp_port' => ['nullable', 'numeric'],
            'smtp_username' => ['nullable', 'string', 'max:255'],
            'smtp_password' => ['nullable', 'string', 'max:255'],
            'smtp_mail_from_address' => ['required', 'email', 'max:255'],
        ]);

        try {
            if ($this->smtp_setting->exists()) {
                $this->smtp_setting->first()->update($validated_req);

                return [
                    'status' => true,
                    'message' => 'SMTP Setting Updated Successfully',
                ];
            }

            $this->smtp_setting->create($validated_req);

            return [
                'status' => true,
                'message' => 'SMTP Setting Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Role Setting
    public function getAllRoles()
    {
        $roles = $this->role->orderBy('id', 'asc')->paginate(10);

        return $roles;
    }

    public function getSingleRole($id)
    {
        $role = $this->role->find($id);

        return $role;
    }

    public function storeRole(Request $request)
    {
        $validated_req = $request->validate([
            'name' => 'required|unique:roles,name',
            'description' => 'nullable',
        ]);

        try {

            if ($this->role->create($validated_req)) {
                return [
                    'status' => true,
                    'message' => 'Role Created Successfully',
                ];
            }

            throw new Exception('Something Went Wrong While Creating Role');
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateRole(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => 'required|unique:roles,name,' . $id,
            'description' => 'nullable',
        ]);

        try {
            $system_defined_role_ids = [1, 2, 3, 4, 5];
            $system_defined_role_names = ['Admin', 'Customer', 'Collaborator', 'Supplier', 'Distributor'];

            $role = $this->getSingleRole($id);
            if (empty($role)) {
                throw new Exception('Role Not Found');
            }

            if (in_array($role->id, $system_defined_role_ids) && ! in_array($request->name, $system_defined_role_names)) {
                throw new Exception('System Defined Role Can Not Be Changed');
            }

            if ($role->update($validated_req)) {
                return [
                    'status' => true,
                    'message' => 'Role Updated Successfully',
                ];
            }

            throw new Exception('Something Went Wrong While Updating Role');
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyRole(string $id)
    {
        try {

            $system_defined_role_ids = [1, 2, 3, 4, 5];
            if (in_array($id, $system_defined_role_ids)) {
                throw new Exception('System Defined Role Can Not Be Deleted');
            }

            $role = $this->getSingleRole($id);
            if (empty($role)) {
                throw new Exception('Role Not Found');
            }

            if ($role->delete()) {
                return [
                    'status' => true,
                    'message' => 'Role Deleted Successfully',
                ];
            }

            throw new Exception('Something Went Wrong While Deleting Role');
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyRoleBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Role');
            }

            $system_defined_role_ids = [1, 2, 3, 4, 5];

            foreach ($ids as $id) {
                if (in_array($id, $system_defined_role_ids)) {
                    throw new Exception('System Defined Role Can Not Be Deleted');
                }
            }

            $deleted = $this->role->destroy($ids);

            if ($deleted !== count($ids)) {
                return [
                    'status' => false,
                    'message' => 'Something Went Wrong While Deleting Role',
                ];
            }

            return [
                'status' => true,
                'message' => 'Role Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Permission Settings
    public function getAllPermissions(Request $request)
    {
        $permissions = $this->permission
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->input('search') . '%');
            })
            ->latest()
            ->paginate(10);

        return $permissions;
    }

    public function getSinglePermission($id)
    {
        $permission = $this->permission->find($id);

        return $permission;
    }

    public function storePermission(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'unique:permissions,name'],
            'icon' => ['required', 'max:100'],
            'alias' => ['nullable', 'max:100'],
            'parent_name' => ['required', 'max:255'],
        ]);

        try {
            $created = $this->permission->create(array_merge($validated_req, ['guard_name' => 'web']));

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Permission');
            }

            return [
                'status' => true,
                'message' => 'Permission Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updatePermission(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'unique:permissions,name,' . $id],
            'icon' => ['required', 'max:100'],
            'alias' => ['nullable', 'max:100'],
            'parent_name' => ['required', 'max:255'],
        ]);

        try {
            $permission = $this->getSinglePermission($id);

            if (empty($permission)) {
                throw new Exception('Permission Not Found');
            }

            $updated = $permission->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Permission');
            }

            return [
                'status' => true,
                'message' => 'Permission Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPermission(string $id)
    {
        try {
            $permission = $this->getSinglePermission($id);
            if (empty($permission)) {
                throw new Exception('Permission Not Found');
            }

            $deleted = $permission->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Permission');
            }

            return [
                'status' => true,
                'message' => 'Permission Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPermissionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Permission');
            }

            $deleted = $this->permission->destroy($ids);

            if ($deleted !== count($ids)) {
                return [
                    'status' => false,
                    'message' => 'Something Went Wrong While Deleting Permission',
                ];
            }

            return [
                'status' => true,
                'message' => 'Permission Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getManageblePermissions(string $id)
    {
        $all_permissions = $this->permission
            ->orderBy('created_at', 'asc')

            ->get()
            ->groupBy('parent_name')
            ->map(function ($permissions) {
                return [
                    'icon' => $permissions->first()->icon,
                    'parent_name' => $permissions->first()->parent_name,
                    'items' => $permissions,
                ];
            });

        $role = $this->getSingleRole($id);

        if (empty($role)) {
            throw new Exception('Role Not Found');
        }

        $assigned_permissions = $role->getAllPermissions()->pluck('id')->toArray();

        return [
            'all_permissions' => $all_permissions,
            'assigned_permissions' => $assigned_permissions,
            'role_id' => $id,
        ];
    }

    public function syncPermissions(Request $request, string $id)
    {

        $request->validate([
            'permission_ids' => ['nullable', 'array'],
        ]);

        try {
            $role = $this->getSingleRole($id);

            if (empty($role)) {
                throw new Exception('Role Not Found');
            }

            $role->syncPermissions($request->input('permission_ids'));

            return [
                'status' => true,
                'message' => 'Permissions Synced Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Colors
    public function getAllColors()
    {
        $colors = $this->color->latest()->paginate(10);

        return $colors;
    }

    public function getSingleColor($id)
    {
        $color = $this->color->find($id);

        return $color;
    }

    public function storeColor(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'unique:colors,name'],
            'code' => ['required', 'max:255', 'starts_with:#', 'unique:colors,code'],
            'is_active' => ['required', 'boolean'],
        ], [
            [
                'name.required' => 'Color Name Is Required',
                'name.unique' => 'Color Name Already Exists',
                'name.max' => 'Color Name Must Not Exceed 255 Characters',
                'code.required' => 'Color Code Is Required',
                'code.unique' => 'Color Code Already Exists',
                'code.max' => 'Color Code Must Not Exceed 255 Characters',
                'code.starts_with' => 'Color Code Must Start With #',
                'is_active.required' => 'Status Is Required',
                'is_active.boolean' => 'Status Must Be Active Or In-Active',
            ],
        ]);

        try {
            $created = $this->color->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Color');
            }

            return [
                'status' => true,
                'message' => 'Color Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateColor(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'unique:colors,name,' . $id],
            'code' => ['required', 'max:255', 'starts_with:#', 'unique:colors,code,' . $id],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Color Name Is Required',
            'name.unique' => 'Color Name Already Exists',
            'name.max' => 'Color Name Must Not Exceed 255 Characters',
            'code.required' => 'Color Code Is Required',
            'code.unique' => 'Color Code Already Exists',
            'code.max' => 'Color Code Must Not Exceed 255 Characters',
            'code.starts_with' => 'Color Code Must Start With #',
            'is_active.required' => 'Status Is Required',
            'is_active.boolean' => 'Status Must Be Active Or In-Active',
        ]);

        try {
            $color = $this->getSingleColor($id);

            if (empty($color)) {
                throw new Exception('Color Not Found');
            }

            $updated = $color->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Color');
            }

            return [
                'status' => true,
                'message' => 'Color Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyColor(string $id)
    {
        try {
            $color = $this->getSingleColor($id);

            if (empty($color)) {
                throw new Exception('Color Not Found');
            }

            $deleted = $color->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Color');
            }

            return [
                'status' => true,
                'message' => 'Color Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyColorBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Color');
            }

            $deleted = $this->color->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Color');
            }

            return [
                'status' => true,
                'message' => 'Color Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Model Names
    public function getAllModelNames()
    {
        $model_names = $this->model_name->latest()->paginate(10);

        return $model_names;
    }

    public function getSingleModelName(string $id)
    {
        $model_name = $this->model_name->find($id);

        return $model_name;
    }

    public function storeModelName(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'unique:model_names,name'],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Model Name Is Required',
            'name.unique' => 'Model Name Already Exists',
            'name.max' => 'Model Name Must Not Exceed 255 Characters',
            'is_active.required' => 'Status Is Required',
            'is_active.boolean' => 'Status Must Be Active Or In-Active',
        ]);

        try {
            $created = $this->model_name->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Model Name');
            }

            return [
                'status' => true,
                'message' => 'Model Name Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateModelName(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'unique:model_names,name,' . $id],
            'is_active' => ['required', 'boolean'],

        ], [
            'name.required' => 'Model Name Is Required',
            'name.unique' => 'Model Name Already Exists',
            'name.max' => 'Model Name Must Not Exceed 255 Characters',
            'is_active.required' => 'Status Is Required',
            'is_active.boolean' => 'Status Must Be Active Or In-Active',
        ]);

        try {
            $model_name = $this->getSingleModelName($id);

            if (empty($model_name)) {
                throw new Exception('Model Name Not Found');
            }

            $updated = $model_name->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Model Name');
            }

            return [
                'status' => true,
                'message' => 'Model Name Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyModelName(string $id)
    {
        try {
            $model_name = $this->getSingleModelName($id);

            if (empty($model_name)) {
                throw new Exception('Model Name Not Found');
            }

            $deleted = $model_name->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Model Name');
            }

            return [
                'status' => true,
                'message' => 'Model Name Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyModelNameBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Model Name');
            }

            $deleted = $this->model_name->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Model Name');
            }

            return [
                'status' => true,
                'message' => 'Model Name Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Capcacites
    public function getAllCapacities()
    {
        $capacities = $this->capacity->latest()->paginate(10);

        return $capacities;
    }

    public function getSingleCapacity(string $id)
    {
        $capacity = $this->capacity->find($id);

        return $capacity;
    }

    public function storeCapacity(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'unique:capacities,name'],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Capacity Is Required',
            'name.unique' => 'Capacity Already Exists',
            'name.max' => 'Capacity Must Not Exceed 255 Characters',
            'is_active.required' => 'Status Is Required',
            'is_active.boolean' => 'Status Must Be Active Or In-Active',
        ]);

        try {
            $created = $this->capacity->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Capacity');
            }

            return [
                'status' => true,
                'message' => 'Capacity Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCapacity(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'unique:capacities,name,' . $id],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Capacity Is Required',
            'name.unique' => 'Capacity Already Exists',
            'name.max' => 'Capacity Must Not Exceed 255 Characters',
            'is_active.required' => 'Status Is Required',
            'is_active.boolean' => 'Status Must Be Active Or In-Active',
        ]);

        try {
            $capacity = $this->getSingleCapacity($id);

            if (empty($capacity)) {
                throw new Exception('Capacity Not Found');
            }

            $updated = $capacity->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Capacity');
            }

            return [
                'status' => true,
                'message' => 'Capacity Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCapacity(string $id)
    {
        try {
            $capacity = $this->getSingleCapacity($id);

            if (empty($capacity)) {
                throw new Exception('Capacity Not Found');
            }

            $deleted = $capacity->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Capacity');
            }

            return [
                'status' => true,
                'message' => 'Capacity Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCapacityBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Capacity');
            }

            $deleted = $this->capacity->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Capacity');
            }

            return [
                'status' => true,
                'message' => 'Capacity Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Storage Locations
    public function getAllStorageLocations()
    {
        $storage_locations = $this->storage_location->latest()->paginate(10);

        return $storage_locations;
    }

    public function getSingleStorageLocation(string $id)
    {
        $storage_location = $this->storage_location->find($id);

        return $storage_location;
    }

    public function storeStorageLocation(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'string', 'unique:storage_locations,name'],
            'address' => ['nullable', 'unique:storage_locations,address'],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Storage Location Name Is Required',
            'name.max' => 'Storage Location Name Must Not Exceed 255 Characters',
            'name.string' => 'Storage Location Name Must Be String',
            'name.unique' => 'Storage Location Is Already Exists',

            'address.unique' => 'Storage Location Address Is Already Exists',

            'is_active.required' => 'Status Is Required',
            'is_active.boolean' => 'Status Must Be Active Or In-Active',
        ]);

        try {
            $created = $this->storage_location->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Storage Location');
            }

            return [
                'status' => true,
                'message' => 'Storage Location Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateStorageLocation(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'string', 'unique:storage_locations,name,' . $id],
            'address' => ['nullable', 'unique:storage_locations,address,' . $id],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Storage Location Name Is Required',
            'name.max' => 'Storage Location Name Must Not Exceed 255 Characters',
            'name.string' => 'Storage Location Name Must Be String',
            'name.unique' => 'Storage Location Is Already Exists',

            'address.unique' => 'Storage Location Address Is Already Exists',

            'is_active.required' => 'Status Is Required',
            'is_active.boolean' => 'Status Must Be Active Or In-Active',

        ]);

        try {

            $storage_location = $this->getSingleStorageLocation($id);

            if (empty($storage_location)) {
                throw new Exception('Storage Location Not Found');
            }

            $updated = $storage_location->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Storage Location');
            }

            return [
                'status' => true,
                'message' => 'Storage Location Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyStorageLocation(string $id)
    {
        try {
            $storage_location = $this->getSingleStorageLocation($id);

            if (empty($storage_location)) {
                throw new Exception('Storage Location Not Found');
            }

            $deleted = $storage_location->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Storage Location');
            }

            return [
                'status' => true,
                'message' => 'Storage Location Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyStorageLocationBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Storage Location');
            }

            $deleted = $this->storage_location->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Storage Location');
            }

            return [
                'status' => true,
                'message' => 'Storage Locations Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Currencies

    public function getAllCurrencies()
    {
        $currencies = $this->currency->latest()->paginate(10);

        return $currencies;
    }

    public function getSingleCurrency(string $id)
    {
        $currency = $this->currency->find($id);

        return $currency;
    }

    public function storeCurrency(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:100', 'string', 'unique:currencies,name'],
            'symbol' => ['required', 'max:10', 'string', 'unique:currencies,symbol'],
        ], [
            'name.required' => 'Currency Name Is Required',
            'name.max' => 'Currency Name Must Not Exceed 100 Characters',
            'name.string' => 'Currency Name Must Be String',
            'name.unique' => 'Currency Is Already Exists',

            'symbol.required' => 'Currency Symbol Is Required',
            'symbol.max' => 'Currency Symbol Must Not Exceed 10 Characters',
            'symbol.string' => 'Currency Symbol Must Be String',
            'symbol.unique' => 'Currency Symbol Is Already Exists',

        ]);

        try {

            if ($this->currency->count() == 0) {
                $validated_req['is_active'] = true;
            }

            $created = $this->currency->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Currency');
            }

            return [
                'status' => true,
                'message' => 'Currency Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCurrency(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:100', 'string', 'unique:currencies,name,' . $id],
            'symbol' => ['required', 'max:10', 'string', 'unique:currencies,symbol,' . $id],
        ], [
            'name.required' => 'Currency Name Is Required',
            'name.max' => 'Currency Name Must Not Exceed 100 Characters',
            'name.string' => 'Currency Name Must Be String',
            'name.unique' => 'Currency Is Already Exists',

            'symbol.required' => 'Currency Symbol Is Required',
            'symbol.max' => 'Currency Symbol Must Not Exceed 10 Characters',
            'symbol.string' => 'Currency Symbol Must Be String',
            'symbol.unique' => 'Currency Symbol Is Already Exists',

        ]);

        try {
            $currency = $this->getSingleCurrency($id);

            if (empty($currency)) {
                throw new Exception('Currency Not Found');
            }

            $updated = $currency->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Currency');
            }

            return [
                'status' => true,
                'message' => 'Currency Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCurrency(string $id)
    {
        try {

            if ($this->currency->count() < 2) {
                throw new Exception('Please Create New Currency Before Deleting This One Because You Have Only One Currency And One Active Currency Should Be Present');
            }

            $currency = $this->getSingleCurrency($id);

            if (empty($currency)) {
                throw new Exception('Currency Not Found');
            }

            $deleted = $currency->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Currency');
            }

            $this->currency->first()->update(['is_active' => true]);

            return [
                'status' => true,
                'message' => 'Currency Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCurrencyBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Currency');
            }

            $currencies = $this->currency->whereIn('id', $ids)->get();

            if ($currencies->isEmpty()) {
                throw new Exception('Currency Not Found');
            }

            foreach ($currencies as $currency) {
                $response = $this->destroyCurrency($currency->id);

                if ($response['status'] == false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Currencies Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleCurrencyStatus(string $id)
    {
        try {
            $currency = $this->getSingleCurrency($id);

            if (empty($currency)) {
                throw new Exception('Currency Not Found');
            }

            if ($currency->is_active == 1) {
                return [
                    'status' => false,
                    'message' => 'The currently active currency cannot be deactivated unless a new currency is activated. It will be automatically deactivated when a new currency is set as active.',

                ];
            }

            // Deactivate all currencies
            $this->currency->where('is_active', true)->update([
                'is_active' => false,
            ]);

            $currency->is_active = true;
            $currency->save();

            return [
                'status' => true,
                'message' => 'Currency Activated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Additional Fees List

    public function getAllAdditionalFeeLists()
    {
        $additional_fee_lists = $this->additional_fee_list->latest()->paginate(10);

        return $additional_fee_lists;
    }

    public function getSingleAdditionalFeeList(string $id)
    {
        $additional_fee_list = $this->additional_fee_list->find($id);

        return $additional_fee_list;
    }

    public function storeAdditionalFeeList(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'unique:additional_fee_lists,name'],
            'category' => ['required', 'string', 'in:shipping_fee,import_tax', 'max:255'],
            'value_type' => ['required', 'string', 'in:fixed,percentage'],
            'default_value' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        try {
            $created = $this->additional_fee_list->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Additional Fee List');
            }

            return [
                'status' => true,
                'message' => 'Additional Fee List Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateAdditionalFeeList(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'unique:additional_fee_lists,name,' . $id],
            'category' => ['required', 'string', 'in:shipping_fee,import_tax', 'max:255'],
            'value_type' => ['required', 'string', 'in:fixed,percentage'],
            'default_value' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        try {
            $additional_fee_list = $this->getSingleAdditionalFeeList($id);

            if (empty($additional_fee_list)) {
                throw new Exception('Additional Fee List Not Found');
            }

            $updated = $additional_fee_list->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Additional Fee List');
            }

            return [
                'status' => true,
                'message' => 'Additional Fee List Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAdditionalFeeList(string $id)
    {
        try {
            $additional_fee_list = $this->getSingleAdditionalFeeList($id);

            if (empty($additional_fee_list)) {
                throw new Exception('Additional Fee List Not Found');
            }

            $deleted = $additional_fee_list->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Additional Fee List');
            }

            return [
                'status' => true,
                'message' => 'Additional Fee List Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAdditionalFeeListBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Additional Fee List');
            }

            $deleted = $this->additional_fee_list->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Additional Fee List');
            }

            return [
                'status' => true,
                'message' => 'Additional Fee List Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Reward Setting

    public function getRewardPointSetting()
    {
        $reward_setting = $this->reward_setting->first();

        return $reward_setting;
    }

    public function updateRewardPointSetting(Request $request)
    {
        $validated_req = $request->validate([
            'reward_rate' => ['required', 'numeric', 'max:100'],
        ]);

        try {
            if ($this->reward_setting->exists()) {
                $this->reward_setting->first()->update($validated_req);
            } else {
                $this->reward_setting->create($validated_req);
            }

            return [
                'status' => true,
                'message' => 'Reward Setting Saved Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAllCommissionSettings()
    {
        $commission_settings = $this->commission_setting->latest()->paginate(10);

        return $commission_settings;
    }

    public function getSingleCommissionSetting(string $id)
    {
        $commission_setting = $this->commission_setting->find($id);

        return $commission_setting;
    }

    public function storeCommissionSetting(Request $request)
    {
        $validated_req = $request->validate([
            'type' => ['required', 'in:collaborator,distributor,supplier,platform', 'unique:commission_settings,type'],
            'commission_rate' => ['required', 'numeric', 'min:1', 'max:100'],
        ], [
            'type.unique' => 'This Type Already Exists',
            'type.in' => 'Type Must Be Collaborator, Distributor Or Supplier Or Platform',
        ]);

        try {
            $created = $this->commission_setting->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Commission Setting');
            }

            return [
                'status' => true,
                'message' => 'Commission Setting Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCommissionSetting(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'type' => ['required', 'in:collaborator,distributor,supplier,platform', 'unique:commission_settings,type,' . $id],
            'commission_rate' => ['required', 'numeric', 'min:1', 'max:100'],
        ], [
            'type.unique' => 'This Type Already Exists',
            'type.in' => 'Type Must Be Collaborator, Distributor Or Supplier Or Platform',
        ]);

        try {
            $commission_setting = $this->getSingleCommissionSetting($id);

            if (empty($commission_setting)) {
                throw new Exception('Commission Setting Not Found');
            }

            $updated = $commission_setting->update($validated_req);

            if (empty($updated)) {
                throw new Exception('Something Went Wrong While Updating Commission Setting');
            }

            return [
                'status' => true,
                'message' => 'Commission Setting Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCommissionSetting(string $id)
    {
        try {
            $commission_setting = $this->getSingleCommissionSetting($id);

            if (empty($commission_setting)) {
                throw new Exception('Commission Setting Not Found');
            }

            $deleted = $commission_setting->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Commission Setting');
            }

            return [
                'status' => true,
                'message' => 'Commission Setting Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCommissionSettingBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Commission Setting');
            }

            $deleted = $this->commission_setting->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Commission Setting');
            }

            return [
                'status' => true,
                'message' => 'Commission Settings Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // COuntries Setting
    public function getAllCountries(Request $request)
    {
        $countries = $this->country
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($subQuery) use ($request) {
                    $subQuery->where('name', 'like', '%' . $request->input('search') . '%')
                        ->orWhere('iso_code', 'like', '%' . $request->input('search') . '%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $countries;
    }

    public function getSingleCountry(string $id)
    {
        $country = $this->country->find($id);

        return $country;
    }

    public function storeCountry(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:100', 'unique:countries,name'],
            'iso_code' => ['required', 'max:2', 'unique:countries,iso_code'],
            'is_active' => ['required', 'boolean'],
        ]);

        try {
            $created = $this->country->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Country');
            }

            return [
                'status' => true,
                'message' => 'Country Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCountry(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:100', 'unique:countries,name,' . $id],
            'iso_code' => ['required', 'max:2', 'unique:countries,iso_code,' . $id],
            'is_active' => ['required', 'boolean'],
        ]);

        try {

            $country = $this->getSingleCountry($id);

            if (empty($country)) {
                throw new Exception('Country Not Found');
            }

            $updated = $country->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Country');
            }

            return [
                'status' => true,
                'message' => 'Country Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCountry(string $id)
    {
        try {
            $country = $this->getSingleCountry($id);

            if (empty($country)) {
                throw new Exception('Country Not Found');
            }

            $deleted = $country->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Country');
            }

            return [
                'status' => true,
                'message' => 'Country Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCountryBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Country');
            }

            $deleted = $this->country->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Country');
            }

            return [
                'status' => true,
                'message' => 'Countries Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Special Country Settings
    public function getAllSpecialCountries(Request $request)
    {
        $special_countries = $this->special_country
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->whereHas('country', function ($subQuery) use ($request) {
                    $subQuery->where('name', 'like', '%' . $request->input('search') . '%')
                        ->orWhere('iso_code', 'like', '%' . $request->input('search') . '%');
                });
            })
            ->with('country')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $special_countries;
    }

    public function getSingleSpecialCountry(string $id)
    {
        $special_country = $this->special_country->find($id);

        return $special_country;
    }

    public function storeSpecialCountry(Request $request)
    {
        $validated_req = $request->validate([
            'country_id' => ['required', 'exists:countries,id', 'unique:special_countries,country_id'],
        ], [
            'country_id.required' => 'Country Is Required',
            'country_id.exists' => 'The Selected Country Is not Exists',
            'country_id.unique' => 'Selected Country Is Already Exists in Special Countries',
        ]);

        try {
            $created = $this->special_country->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating Special Country');
            }

            return [
                'status' => true,
                'message' => 'Special Country created successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySpecialCountry(string $id)
    {
        try {
            $special_country = $this->special_country->find($id);

            if (empty($special_country)) {
                throw new Exception('Special Country not found');
            }

            $deleted = $special_country->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting Special Country');
            }

            return [
                'status' => true,
                'message' => 'Special Country deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySpecialCountryBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Special Country');
            }

            $deleted = $this->special_country->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Special Country');
            }

            return [
                'status' => true,
                'message' => 'Special Countries deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getCountries()
    {
        return $this->country
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    // AWS Settings
    public function getAllAwsSettings()
    {
        $aws_settings = $this->aws_setting->latest()->paginate(10);

        return $aws_settings;
    }

    public function getSingleAwsSetting(string $id)
    {
        $aws_setting = $this->aws_setting->find($id);

        return $aws_setting;
    }

    public function storeAwsSetting(Request $request)
    {
        $validated_req = $request->validate([
            'aws_access_key_id' => ['required', 'string', 'max:255', 'unique:aws_settings,aws_access_key_id'],
            'aws_secret_access_key' => ['required', 'string', 'max:255', 'unique:aws_settings,aws_secret_access_key'],
            'aws_region' => ['required', 'string', 'max:50'],
            'aws_bucket' => ['required', 'string', 'min:3', 'max:63', 'unique:aws_settings,aws_bucket'],
            'aws_url' => ['nullable', 'string', 'starts_with:https://', 'url'],
        ]);

        try {

            if ($this->aws_setting->doesntExist()) {
                $validated_req['is_active'] = true;
            }

            $created = $this->aws_setting->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating Aws Setting');
            }

            return [
                'status' => true,
                'message' => 'Aws Setting created successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateAwsSetting(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'aws_access_key_id' => ['required', 'string', 'max:255', 'unique:aws_settings,aws_access_key_id,' . $id],
            'aws_secret_access_key' => ['required', 'string', 'max:255', 'unique:aws_settings,aws_secret_access_key,' . $id],
            'aws_region' => ['required', 'string', 'max:50'],
            'aws_bucket' => ['required', 'string', 'min:3', 'max:63', 'unique:aws_settings,aws_bucket,' . $id],
            'aws_url' => ['nullable', 'string', 'starts_with:https://', 'url'],
        ]);

        try {
            $aws_setting = $this->getSingleAwsSetting($id);

            if (empty($aws_setting)) {
                throw new Exception('Aws Setting Not Found');
            }

            $updated = $aws_setting->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating Aws Setting');
            }

            return [
                'status' => true,
                'message' => 'Aws Setting updated successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAwsSetting(string $id)
    {
        try {
            $aws_setting = $this->getSingleAwsSetting($id);

            if (empty($aws_setting)) {
                throw new Exception('Aws Setting Not Found');
            }

            DB::transaction(function () use ($aws_setting, $id) {

                if ($aws_setting->is_active && $this->aws_setting->count() > 1) {
                    $this->aws_setting->whereNot('id', $id)->first()->update(['is_active' => true]);
                }

                $deleted = $aws_setting->delete();

                if (! $deleted) {
                    throw new Exception('Something Went Wrong While Deleting Aws Setting');
                }
            });

            return [
                'status' => true,
                'message' => 'Aws Setting deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAwsSettingBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Aws Setting');
            }

            foreach ($ids as $id) {
                $response = $this->destroyAwsSetting($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Aws Setting deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleAwsSettingStatus(string $id)
    {
        try {

            $aws_setting = $this->getSingleAwsSetting($id);

            if (empty($aws_setting)) {
                throw new Exception('Aws Setting Not Found');
            }

            $already_active_setting = $this->aws_setting->where('is_active', true)->first();
            if (empty($already_active_setting)) {
                throw new Exception('Something Went Wrong While Activating Aws Setting Status');
            }

            if ($aws_setting->is($already_active_setting)) {
                throw new Exception('This  Aws Setting Already Active. And Cannot Be Deactivated Until Another Aws Setting Is Activated');
            }

            DB::transaction(function () use ($aws_setting, $already_active_setting) {
                $already_active_setting->update(['is_active' => false]);
                $aws_setting->update(['is_active' => true]);
            });

            return [
                'status' => true,
                'message' => 'Aws Setting Activated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Google Map Settings
    public function getAllGoogleMapSettings()
    {
        $google_map_settings = $this->google_map_setting->latest()->paginate(10);

        return $google_map_settings;
    }

    public function getSingleGoogleMapSetting(string $id)
    {
        $google_map_setting = $this->google_map_setting->find($id);

        return $google_map_setting;
    }

    public function storeGoogleMapSetting(Request $request)
    {
        $validated_req = $request->validate([
            'google_map_api_key' => ['required', 'string', 'max:255', 'unique:google_map_settings,google_map_api_key'],
            'google_map_id' => ['required', 'string', 'max:255', 'unique:google_map_settings,google_map_id'],
        ]);

        try {
            if ($this->google_map_setting->count() == 0) {
                $validated_req['is_active'] = true;
            }

            $created = $this->google_map_setting->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating google map setting');
            }

            return [
                'status' => true,
                'message' => 'Google Map Setting Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateGoogleMapSetting(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'google_map_api_key' => ['required', 'string', 'max:255', 'unique:google_map_settings,google_map_api_key,' . $id],
            'google_map_id' => ['required', 'string', 'max:255', 'unique:google_map_settings,google_map_id,' . $id],
        ]);

        try {
            $google_map_setting = $this->getSingleGoogleMapSetting($id);

            if (empty($google_map_setting)) {
                throw new Exception('Google Map Setting Not Found');
            }

            $updated = $google_map_setting->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating google map setting');
            }

            return [
                'status' => true,
                'message' => 'Google Map Setting Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyGoogleMapSetting(string $id)
    {
        try {
            $google_map_setting = $this->getSingleGoogleMapSetting($id);

            if (empty($google_map_setting)) {
                throw new Exception('Google Map Setting Not Found');
            }

            DB::transaction(function () use ($google_map_setting, $id) {

                if ($google_map_setting->is_active && $this->google_map_setting->count() > 1) {
                    $this->google_map_setting->whereNot('id', $id)->first()->update(['is_active' => true]);
                }

                $deleted = $google_map_setting->delete();

                if (! $deleted) {
                    throw new Exception('Something Went Wrong While Deleting Google Map Setting');
                }
            });

            return [
                'status' => true,
                'message' => 'Google Map Setting deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyGoogleMapSettingBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Google Map Setting');
            }

            foreach ($ids as $id) {
                $response = $this->destroyGoogleMapSetting($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Google Map Setting deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleGoogleMapSettingStatus(string $id)
    {
        try {

            $google_map_setting = $this->getSingleGoogleMapSetting($id);

            if (empty($google_map_setting)) {
                throw new Exception('Google Map Setting Not Found');
            }

            $already_active_setting = $this->google_map_setting->where('is_active', true)->first();
            if (empty($already_active_setting)) {
                throw new Exception('Something Went Wrong While Activating Google Map Setting Status');
            }

            if ($google_map_setting->is($already_active_setting)) {
                throw new Exception('This Google Map Setting Already Active. And Cannot Be Deactivated Until Another Google Map Setting Is Activated');
            }

            DB::transaction(function () use ($google_map_setting, $already_active_setting) {
                $already_active_setting->update(['is_active' => false]);
                $google_map_setting->update(['is_active' => true]);
            });

            return [
                'status' => true,
                'message' => 'Google Map Setting Activated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Meta Settings
    public function getAllMetaSettings()
    {
        $meta_settings = $this->meta_setting->latest()->paginate(10);

        return $meta_settings;
    }

    public function getSingleMetaSetting(string $id)
    {
        $meta_setting = $this->meta_setting->find($id);

        return $meta_setting;
    }

    public function storeMetaSetting(Request $request)
    {
        $validated_req = $request->validate([
            'meta_fb_app_name' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_name'],
            'meta_fb_app_id' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_id'],
            'meta_fb_app_secret' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_secret'],
            'meta_fb_page_access_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_page_access_token'],
            'meta_verify_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_verify_token'],
            'meta_fb_page_username' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_page_username'],
            'meta_ig_app_name' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_name'],
            'meta_ig_app_id' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_id'],
            'meta_ig_app_secret' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_secret'],
            'meta_ig_username' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_username'],
            'meta_ig_access_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_access_token'],
        ]);

        try {
            if ($this->meta_setting->count() == 0) {
                $validated_req['is_active'] = true;
            }

            $created = $this->meta_setting->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating meta setting');
            }

            return [
                'status' => true,
                'message' => 'Meta Setting Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateMetaSetting(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'meta_fb_app_name' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_name,' . $id],
            'meta_fb_app_id' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_id,' . $id],
            'meta_fb_app_secret' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_secret,' . $id],
            'meta_fb_page_access_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_page_access_token,' . $id],
            'meta_verify_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_verify_token,' . $id],
            'meta_fb_page_username' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_page_username,' . $id],
            'meta_ig_app_name' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_name,' . $id],
            'meta_ig_app_id' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_id,' . $id],
            'meta_ig_app_secret' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_secret,' . $id],
            'meta_ig_username' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_username,' . $id],
            'meta_ig_access_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_access_token,' . $id],
        ]);

        try {
            $meta_setting = $this->getSingleMetaSetting($id);

            if (empty($meta_setting)) {
                throw new Exception('Meta Setting Not Found');
            }

            $updated = $meta_setting->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating meta setting');
            }

            return [
                'status' => true,
                'message' => 'Meta Setting Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyMetaSetting(string $id)
    {
        try {
            $meta_setting = $this->getSingleMetaSetting($id);

            if (empty($meta_setting)) {
                throw new Exception('Meta Setting Not Found');
            }

            DB::transaction(function () use ($meta_setting, $id) {

                if ($meta_setting->is_active && $this->meta_setting->count() > 1) {
                    $this->meta_setting->whereNot('id', $id)->first()->update(['is_active' => true]);
                }

                $deleted = $meta_setting->delete();

                if (! $deleted) {
                    throw new Exception('Something Went Wrong While Deleting Meta Setting');
                }
            });

            return [
                'status' => true,
                'message' => 'Meta Setting deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyMetaSettingBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please select at least one meta setting');
            }

            foreach ($ids as $id) {
                $response = $this->destroyMetaSetting($id);
                if ($response['status'] == false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Meta Setting deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleMetaSettingStatus(string $id)
    {
        try {

            $meta_setting = $this->getSingleMetaSetting($id);

            if (empty($meta_setting)) {
                throw new Exception('Meta Setting Not Found');
            }

            $already_active_setting = $this->meta_setting->where('is_active', true)->first();
            if (empty($already_active_setting)) {
                throw new Exception('Something Went Wrong While Activating Meta Setting Status');
            }

            if ($meta_setting->is($already_active_setting)) {
                throw new Exception('This Meta Setting Already Active. And Cannot Be Deactivated Until Another Meta Setting Is Activated');
            }

            DB::transaction(function () use ($meta_setting, $already_active_setting) {
                $already_active_setting->update(['is_active' => false]);
                $meta_setting->update(['is_active' => true]);
            });

            return [
                'status' => true,
                'message' => 'Meta Setting Activated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // NOWPayment Settings
    public function getAllNOWPaymentSettings()
    {
        $now_payment_settings = $this->now_payment->latest()->paginate(10);

        return $now_payment_settings;
    }

    public function getSingleNOWPayemntSetting(string $id)
    {
        $now_payment_setting = $this->now_payment->find($id);

        return $now_payment_setting;
    }

    public function storeNOWPaymentSetting(Request $request)
    {
        $validated_req = $request->validate([
            'now_payment_api_key' => ['required', 'string', 'max:255', 'unique:now_payments,now_payment_api_key'],
            'now_payment_public_key' => ['required', 'string', 'max:255', 'unique:now_payments,now_payment_public_key'],
            'now_payment_baseurl' => ['required', 'string', 'max:255'],
        ]);

        try {
            if ($this->now_payment->count() == 0) {
                $validated_req['is_active'] = true;
            }

            $created = $this->now_payment->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating NOWPayment setting');
            }

            return [
                'status' => true,
                'message' => 'NOWPayment Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateNOWPaymentSetting(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'now_payment_api_key' => ['required', 'string', 'max:255', 'unique:now_payments,now_payment_api_key,' . $id],
            'now_payment_public_key' => ['required', 'string', 'max:255', 'unique:now_payments,now_payment_public_key,' . $id],
            'now_payment_baseurl' => ['required', 'string', 'max:255'],
        ]);

        try {
            $now_payment_setting = $this->getSingleNOWPayemntSetting($id);

            if (empty($now_payment_setting)) {
                throw new Exception('NOWPayment Setting Not Found');
            }

            $updated = $now_payment_setting->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating NOWPayment setting');
            }

            return [
                'status' => true,
                'message' => 'NOWPayment Setting Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyNOWPaymentSetting(string $id)
    {
        try {
            $now_payment_setting = $this->getSingleNOWPayemntSetting($id);

            if (empty($now_payment_setting)) {
                throw new Exception('NOWPayemnt Setting Not Found');
            }

            DB::transaction(function () use ($now_payment_setting, $id) {

                if ($now_payment_setting->is_active && $this->now_payment->count() > 1) {
                    $this->now_payment->whereNot('id', $id)->first()->update(['is_active' => true]);
                }

                $deleted = $now_payment_setting->delete();

                if (! $deleted) {
                    throw new Exception('Something Went Wrong While Deleting NOWPayment Setting');
                }
            });

            return [
                'status' => true,
                'message' => 'NOWPayment Setting deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyNOWPaymentSettingBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please select at least one NOWPayment setting');
            }

            foreach ($ids as $id) {
                $response = $this->destroyNOWPaymentSetting($id);
                if ($response['status'] == false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'NOWPayment Setting deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleNOWPaymentSettingStatus(string $id)
    {
        try {

            $now_payment_setting = $this->getSingleNOWPayemntSetting($id);

            if (empty($now_payment_setting)) {
                throw new Exception('NOWPayment Setting Not Found');
            }

            $already_active_setting = $this->now_payment->where('is_active', true)->first();
            if (empty($already_active_setting)) {
                throw new Exception('Something Went Wrong While Activating NOWPayment Setting Status');
            }

            if ($now_payment_setting->is($already_active_setting)) {
                throw new Exception('This NOWPayment Setting Already Active. And Cannot Be Deactivated Until Another NOWPayment Setting Is Activated');
            }

            DB::transaction(function () use ($now_payment_setting, $already_active_setting) {
                $already_active_setting->update(['is_active' => false]);
                $now_payment_setting->update(['is_active' => true]);
            });

            return [
                'status' => true,
                'message' => 'NOWPayment Setting Activated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Return Policy Settings
    public function getAllReturnPolicies()
    {
        $return_policies = $this->return_policy->with(['language'])->latest()->paginate(10);

        return $return_policies;
    }

    public function getSingleReturnPolicy(string $id)
    {
        $return_policy = $this->return_policy->find($id);

        return $return_policy;
    }

    public function storeReturnPolicy(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array', 'min:1'],
            'content.*.title' => ['required', 'string', 'max:255'],
            'content.*.content' => ['required', 'string'],
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'dpo_name' => ['required', 'string', 'max:255'],
            'dpo_email' => ['required', 'string', 'email', 'max:255'],
            'dpo_phone' => ['required', 'string', 'max:255'],
            'dpo_address' => ['required', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
        ], [
            'content.*.title.required' => 'title is required',
            'content.*.content.required' => 'content is required',
        ]);

        // Check each content item for empty HTML
        foreach ($validated_req['content'] as $index => $section) {

            if (empty($section['title'])) {
                throw ValidationException::withMessages([
                    "content.{$index}.title" => 'Section ' . ($index + 1) . ' title is required',
                ]);
            }

            $cleanContent = trim($section['content']);
            if (in_array($cleanContent, ['<p><br></p>', '<p></p>', ''])) {
                throw ValidationException::withMessages([
                    "content.{$index}.content" => 'Section ' . ($index + 1) . ' content is required',
                ]);
            }
        }

        try {

            $existingPolicy = $this->return_policy->where('name', $validated_req['name'])->first();

            if (! empty($existingPolicy)) {
                $validated_req['slug'] = $existingPolicy->slug;
            } else {
                $slug = Str::slug($validated_req['name']);

                if (empty($slug)) {
                    $slug = 'return-policy-' . Str::random(8);
                }

                $validated_req['slug'] = $slug;
            }

            $created = $this->return_policy->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating return policy');
            }

            return [
                'status' => true,
                'message' => 'Return Policy Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateReturnPolicy(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array', 'min:1'],
            'content.*.title' => ['required', 'string', 'max:255'],
            'content.*.content' => ['required', 'string'],
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'dpo_name' => ['required', 'string', 'max:255'],
            'dpo_email' => ['required', 'string', 'email', 'max:255'],
            'dpo_phone' => ['required', 'string', 'max:255'],
            'dpo_address' => ['required', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
        ], [
            'content.*.title.required' => 'title is required',
            'content.*.content.required' => 'content is required',

        ]);

        // Check each content item for empty HTML
        foreach ($validated_req['content'] as $index => $section) {

            if (empty($section['title'])) {
                throw ValidationException::withMessages([
                    "content.{$index}.title" => 'Section ' . ($index + 1) . ' title is required',
                ]);
            }

            $cleanContent = trim($section['content']);
            if (in_array($cleanContent, ['<p><br></p>', '<p></p>', ''])) {
                throw ValidationException::withMessages([
                    "content.{$index}.content" => 'Section ' . ($index + 1) . ' content is required',
                ]);
            }
        }

        try {

            $return_policy = $this->getSingleReturnPolicy($id);

            if (empty($return_policy)) {
                throw new Exception('Return Policy Not Found');
            }

            $return_policy->fill($validated_req);

            if ($return_policy->isDirty('name')) {
                $existingPolicy = $this->return_policy->where('name', $validated_req['name'])->first();

                if (! empty($existingPolicy)) {
                    $validated_req['slug'] = $existingPolicy->slug;
                } else {
                    $slug = Str::slug($validated_req['name']);

                    if (empty($slug)) {
                        $slug = 'return-policy-' . Str::random(8);
                    }

                    $validated_req['slug'] = $slug;
                }
            }

            $updated = $return_policy->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating return policy');
            }

            return [
                'status' => true,
                'message' => 'Return Policy Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleReturnPolicyStatus(string $id)
    {
        try {
            $return_policy = $this->getSingleReturnPolicy($id);
            if (empty($return_policy)) {
                throw new Exception('Return Policy Not Found');
            }

            $return_policy->update(['is_active' => ! $return_policy->is_active]);

            return [
                'status' => true,
                'message' => 'Return Policy Status Toggled Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyReturnPolicy(string $id)
    {
        try {
            $return_policy = $this->getSingleReturnPolicy($id);
            if (empty($return_policy)) {
                throw new Exception('Return Policy Not Found');
            }

            $deleted = $return_policy->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting return policy');
            }

            return [
                'status' => true,
                'message' => 'Return Policy Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyReturnPolicyBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Return Policy');
            }

            $deleted = $this->return_policy->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something went wrong while deleting return policy');
            }

            return [
                'status' => true,
                'message' => 'Return Policy Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Shipping Policy Settings
    public function getAllShippingPolicies()
    {
        $shipping_policies = $this->shipping_policy->with(['language'])->latest()->paginate(10);

        return $shipping_policies;
    }

    public function getSingleShippingPolicy(string $id)
    {
        $shipping_policy = $this->shipping_policy->find($id);

        return $shipping_policy;
    }

    public function storeShippingPolicy(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array', 'min:1'],
            'content.*.title' => ['required', 'string', 'max:255'],
            'content.*.content' => ['required', 'string'],
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'dpo_name' => ['required', 'string', 'max:255'],
            'dpo_email' => ['required', 'string', 'email', 'max:255'],
            'dpo_phone' => ['required', 'string', 'max:255'],
            'dpo_address' => ['required', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
        ], [
            'content.*.title.required' => 'title is required',
            'content.*.content.required' => 'content is required',
        ]);

        // Check each content item for empty HTML
        foreach ($validated_req['content'] as $index => $section) {

            if (empty($section['title'])) {
                throw ValidationException::withMessages([
                    "content.{$index}.title" => 'Section ' . ($index + 1) . ' title is required',
                ]);
            }

            $cleanContent = trim($section['content']);
            if (in_array($cleanContent, ['<p><br></p>', '<p></p>', ''])) {
                throw ValidationException::withMessages([
                    "content.{$index}.content" => 'Section ' . ($index + 1) . ' content is required',
                ]);
            }
        }

        try {

            $existingPolicy = $this->shipping_policy->where('name', $validated_req['name'])->first();

            if (! empty($existingPolicy)) {
                $validated_req['slug'] = $existingPolicy->slug;
            } else {
                $slug = Str::slug($validated_req['name']);

                if (empty($slug)) {
                    $slug = 'shipping-policy-' . Str::random(8);
                }

                $validated_req['slug'] = $slug;
            }

            $created = $this->shipping_policy->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating Shipping Policy');
            }

            return [
                'status' => true,
                'message' => 'Shipping Policy Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateShippingPolicy(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array', 'min:1'],
            'content.*.title' => ['required', 'string', 'max:255'],
            'content.*.content' => ['required', 'string'],
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'dpo_name' => ['required', 'string', 'max:255'],
            'dpo_email' => ['required', 'string', 'email', 'max:255'],
            'dpo_phone' => ['required', 'string', 'max:255'],
            'dpo_address' => ['required', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
        ], [
            'content.*.title.required' => 'title is required',
            'content.*.content.required' => 'content is required',

        ]);

        // Check each content item for empty HTML
        foreach ($validated_req['content'] as $index => $section) {

            if (empty($section['title'])) {
                throw ValidationException::withMessages([
                    "content.{$index}.title" => 'Section ' . ($index + 1) . ' title is required',
                ]);
            }

            $cleanContent = trim($section['content']);
            if (in_array($cleanContent, ['<p><br></p>', '<p></p>', ''])) {
                throw ValidationException::withMessages([
                    "content.{$index}.content" => 'Section ' . ($index + 1) . ' content is required',
                ]);
            }
        }

        try {

            $shipping_policy = $this->getSingleShippingPolicy($id);

            if (empty($shipping_policy)) {
                throw new Exception('Shipping Policy Not Found');
            }

            $shipping_policy->fill($validated_req);

            if ($shipping_policy->isDirty('name')) {
                $existingPolicy = $this->shipping_policy->where('name', $validated_req['name'])->first();

                if (! empty($existingPolicy)) {
                    $validated_req['slug'] = $existingPolicy->slug;
                } else {
                    $slug = Str::slug($validated_req['name']);

                    if (empty($slug)) {
                        $slug = 'shipping-policy-' . Str::random(8);
                    }

                    $validated_req['slug'] = $slug;
                }
            }

            $updated = $shipping_policy->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating Shipping policy');
            }

            return [
                'status' => true,
                'message' => 'Shipping Policy Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleShippingPolicyStatus(string $id)
    {
        try {
            $shipping_policy = $this->getSingleShippingPolicy($id);
            if (empty($shipping_policy)) {
                throw new Exception('Shipping Policy Not Found');
            }

            $shipping_policy->update(['is_active' => ! $shipping_policy->is_active]);

            return [
                'status' => true,
                'message' => 'Shipping Policy Status Toggled Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyShippingPolicy(string $id)
    {
        try {
            $shipping_policy = $this->getSingleShippingPolicy($id);
            if (empty($shipping_policy)) {
                throw new Exception('Shipping Policy Not Found');
            }

            $deleted = $shipping_policy->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting Shipping policy');
            }

            return [
                'status' => true,
                'message' => 'Shipping Policy Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyShippingPolicyBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Shipping Policy');
            }

            $deleted = $this->shipping_policy->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something went wrong while deleting Shipping policy');
            }

            return [
                'status' => true,
                'message' => 'Shipping Policy Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Terms Of Service Settings
    public function getAllTermsOfServices()
    {
        $terms_of_services = $this->terms_of_service->with(['language'])->latest()->paginate(10);

        return $terms_of_services;
    }

    public function getSingleTermsOfService(string $id)
    {
        $terms_of_service = $this->terms_of_service->find($id);

        return $terms_of_service;
    }

    public function storeTermsOfService(Request $request)
    {

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array', 'min:1'],
            'content.*.title' => ['required', 'string', 'max:255'],
            'content.*.content' => ['required', 'string'],
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'dpo_name' => ['required', 'string', 'max:255'],
            'dpo_email' => ['required', 'string', 'email', 'max:255'],
            'dpo_phone' => ['required', 'string', 'max:255'],
            'dpo_address' => ['required', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
        ], [
            'content.*.title.required' => 'title is required',
            'content.*.content.required' => 'content is required',
        ]);

        // Check each content item for empty HTML
        foreach ($validated_req['content'] as $index => $section) {

            if (empty($section['title'])) {
                throw ValidationException::withMessages([
                    "content.{$index}.title" => 'Section ' . ($index + 1) . ' title is required',
                ]);
            }

            $cleanContent = trim($section['content']);
            if (in_array($cleanContent, ['<p><br></p>', '<p></p>', ''])) {
                throw ValidationException::withMessages([
                    "content.{$index}.content" => 'Section ' . ($index + 1) . ' content is required',
                ]);
            }
        }

        try {

            $existingPolicy = $this->terms_of_service->where('name', $validated_req['name'])->first();

            if (! empty($existingPolicy)) {
                $validated_req['slug'] = $existingPolicy->slug;
            } else {
                $slug = Str::slug($validated_req['name']);

                if (empty($slug)) {
                    $slug = 'terms_of_service-' . Str::random(8);
                }

                $validated_req['slug'] = $slug;
            }

            $created = $this->terms_of_service->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating Terms Of Service');
            }

            return [
                'status' => true,
                'message' => 'Terms Of Service Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateTermsOfService(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array', 'min:1'],
            'content.*.title' => ['required', 'string', 'max:255'],
            'content.*.content' => ['required', 'string'],
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'dpo_name' => ['required', 'string', 'max:255'],
            'dpo_email' => ['required', 'string', 'email', 'max:255'],
            'dpo_phone' => ['required', 'string', 'max:255'],
            'dpo_address' => ['required', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
        ], [
            'content.*.title.required' => 'title is required',
            'content.*.content.required' => 'content is required',

        ]);

        // Check each content item for empty HTML
        foreach ($validated_req['content'] as $index => $section) {

            if (empty($section['title'])) {
                throw ValidationException::withMessages([
                    "content.{$index}.title" => 'Section ' . ($index + 1) . ' title is required',
                ]);
            }

            $cleanContent = trim($section['content']);
            if (in_array($cleanContent, ['<p><br></p>', '<p></p>', ''])) {
                throw ValidationException::withMessages([
                    "content.{$index}.content" => 'Section ' . ($index + 1) . ' content is required',
                ]);
            }
        }

        try {

            $terms_of_service = $this->getSingleTermsOfService($id);

            if (empty($terms_of_service)) {
                throw new Exception('Terms Of Service Not Found');
            }

            $terms_of_service->fill($validated_req);

            if ($terms_of_service->isDirty('name')) {
                $existingPolicy = $this->terms_of_service->where('name', $validated_req['name'])->first();

                if (! empty($existingPolicy)) {
                    $validated_req['slug'] = $existingPolicy->slug;
                } else {
                    $slug = Str::slug($validated_req['name']);

                    if (empty($slug)) {
                        $slug = 'terms_of_service-' . Str::random(8);
                    }

                    $validated_req['slug'] = $slug;
                }
            }

            $updated = $terms_of_service->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating Terms Of Service');
            }

            return [
                'status' => true,
                'message' => 'Terms Of Service Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleTermsOfServiceStatus(string $id)
    {
        try {
            $terms_of_service = $this->getSingleTermsOfService($id);
            if (empty($terms_of_service)) {
                throw new Exception('Terms Of Service Not Found');
            }

            $terms_of_service->update(['is_active' => ! $terms_of_service->is_active]);

            return [
                'status' => true,
                'message' => 'Terms Of Service Status Toggled Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyTermsOfService(string $id)
    {
        try {
            $terms_of_service = $this->getSingleTermsOfService($id);
            if (empty($terms_of_service)) {
                throw new Exception('Terms Of Service Not Found');
            }

            $deleted = $terms_of_service->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting Terms of Service');
            }

            return [
                'status' => true,
                'message' => 'Terms Of Service Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyTermsOfServiceBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Terms Of Service');
            }

            $deleted = $this->terms_of_service->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something went wrong while deleting Terms Of Service');
            }

            return [
                'status' => true,
                'message' => 'Terms Of Service Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Privacy Policy Settings
    public function getAllPrivacyPolicy()
    {
        $privacy_policy = $this->privacy_policy->with(['language'])->latest()->paginate(10);

        return $privacy_policy;
    }

    public function getSinglePrivacyPolicy(string $id)
    {
        $privacy_policy = $this->privacy_policy->find($id);

        return $privacy_policy;
    }

    public function storePrivacyPolicy(Request $request)
    {

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array', 'min:1'],
            'content.*.title' => ['required', 'string', 'max:255'],
            'content.*.content' => ['required', 'string'],
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'dpo_name' => ['required', 'string', 'max:255'],
            'dpo_email' => ['required', 'string', 'email', 'max:255'],
            'dpo_phone' => ['required', 'string', 'max:255'],
            'dpo_address' => ['required', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
        ], [
            'content.*.title.required' => 'title is required',
            'content.*.content.required' => 'content is required',
        ]);

        // Check each content item for empty HTML
        foreach ($validated_req['content'] as $index => $section) {

            if (empty($section['title'])) {
                throw ValidationException::withMessages([
                    "content.{$index}.title" => 'Section ' . ($index + 1) . ' title is required',
                ]);
            }

            $cleanContent = trim($section['content']);
            if (in_array($cleanContent, ['<p><br></p>', '<p></p>', ''])) {
                throw ValidationException::withMessages([
                    "content.{$index}.content" => 'Section ' . ($index + 1) . ' content is required',
                ]);
            }
        }

        try {

            $existingPolicy = $this->privacy_policy->where('name', $validated_req['name'])->first();

            if (! empty($existingPolicy)) {
                $validated_req['slug'] = $existingPolicy->slug;
            } else {
                $slug = Str::slug($validated_req['name']);

                if (empty($slug)) {
                    $slug = 'privacy_policy-' . Str::random(8);
                }

                $validated_req['slug'] = $slug;
            }

            $created = $this->privacy_policy->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating Privacy Policy');
            }

            return [
                'status' => true,
                'message' => 'Privacy Policy Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updatePrivacyPolicy(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array', 'min:1'],
            'content.*.title' => ['required', 'string', 'max:255'],
            'content.*.content' => ['required', 'string'],
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'dpo_name' => ['required', 'string', 'max:255'],
            'dpo_email' => ['required', 'string', 'email', 'max:255'],
            'dpo_phone' => ['required', 'string', 'max:255'],
            'dpo_address' => ['required', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
        ], [
            'content.*.title.required' => 'title is required',
            'content.*.content.required' => 'content is required',

        ]);

        // Check each content item for empty HTML
        foreach ($validated_req['content'] as $index => $section) {

            if (empty($section['title'])) {
                throw ValidationException::withMessages([
                    "content.{$index}.title" => 'Section ' . ($index + 1) . ' title is required',
                ]);
            }

            $cleanContent = trim($section['content']);
            if (in_array($cleanContent, ['<p><br></p>', '<p></p>', ''])) {
                throw ValidationException::withMessages([
                    "content.{$index}.content" => 'Section ' . ($index + 1) . ' content is required',
                ]);
            }
        }

        try {

            $privacy_policy = $this->getSinglePrivacyPolicy($id);

            if (empty($privacy_policy)) {
                throw new Exception('Privacy Policy Not Found');
            }

            $privacy_policy->fill($validated_req);

            if ($privacy_policy->isDirty('name')) {
                $existingPolicy = $this->privacy_policy->where('name', $validated_req['name'])->first();

                if (! empty($existingPolicy)) {
                    $validated_req['slug'] = $existingPolicy->slug;
                } else {
                    $slug = Str::slug($validated_req['name']);

                    if (empty($slug)) {
                        $slug = 'privacy_policy-' . Str::random(8);
                    }

                    $validated_req['slug'] = $slug;
                }
            }

            $updated = $privacy_policy->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating Privacy Policy');
            }

            return [
                'status' => true,
                'message' => 'Privacy Policy Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function togglePrivacyPolicyStatus(string $id)
    {
        try {
            $privacy_policy = $this->getSinglePrivacyPolicy($id);
            if (empty($privacy_policy)) {
                throw new Exception('Privacy Policy Not Found');
            }

            $privacy_policy->update(['is_active' => ! $privacy_policy->is_active]);

            return [
                'status' => true,
                'message' => 'Privacy Policy Status Toggled Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPrivacyPolicy(string $id)
    {
        try {
            $privacy_policy = $this->getSinglePrivacyPolicy($id);
            if (empty($privacy_policy)) {
                throw new Exception('Privacy Policy Not Found');
            }

            $deleted = $privacy_policy->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting Privacy Policy');
            }

            return [
                'status' => true,
                'message' => 'Privacy Policy Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPrivacyPolicyBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Privacy Policy');
            }

            $deleted = $this->privacy_policy->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something went wrong while deleting Privacy Policy');
            }

            return [
                'status' => true,
                'message' => 'Privacy Policy Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Courier Company Settings
    public function getAllCourierCompanies()
    {
        $courier_companies = $this->courier_company->latest()->paginate(10);

        return $courier_companies;
    }

    public function getSingleCourierCompany(string $id)
    {
        $courier_company = $this->courier_company->find($id);

        return $courier_company;
    }

    public function storeCourierCompany(Request $request)
    {
        $validated_req = $request->validate([
            'courier_name' => ['required', 'string', 'max:255'],
            'courier_code' => ['required', 'string', 'max:255'],
            'tracking_url' => ['required', 'string', 'max:255'],
            'is_international' => ['sometimes', 'boolean'],
        ]);

        try {
            $created = $this->courier_company->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating courier company');
            }

            return [
                'status' => true,
                'message' => 'Courier Company Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCourierCompany(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'courier_name' => ['required', 'string', 'max:255'],
            'courier_code' => ['required', 'string', 'max:255'],
            'tracking_url' => ['required', 'string', 'max:255'],
            'is_international' => ['sometimes', 'boolean'],
        ]);

        try {
            $courier_company = $this->getSingleCourierCompany($id);
            if (empty($courier_company)) {
                throw new Exception('Courier Company Not Found');
            }

            $updated = $courier_company->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating courier company');
            }

            return [
                'status' => true,
                'message' => 'Courier Company Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleCourierCompanyStatus(string $id)
    {
        try {
            $courier_company = $this->getSingleCourierCompany($id);
            if (empty($courier_company)) {
                throw new Exception('Courier Company Not Found');
            }

            $updated = $courier_company->update([
                'is_active' => ! $courier_company->is_active,
            ]);

            if (! $updated) {
                throw new Exception('Something went wrong while updating courier company');
            }

            return [
                'status' => true,
                'message' => 'Courier Company Status Toggled Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCourierCompany(string $id)
    {
        try {
            $courier_company = $this->getSingleCourierCompany($id);
            if (empty($courier_company)) {
                throw new Exception('Courier Company Not Found');
            }

            $deleted = $courier_company->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting courier company');
            }

            return [
                'status' => true,
                'message' => 'Courier Company Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCourierCompanyBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Courier Company Not Found');
            }

            $deleted = $this->courier_company->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something went wrong while deleting courier company');
            }

            return [
                'status' => true,
                'message' => 'Courier Company Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Conditions Settings
    public function getAllConditions()
    {
        $conditions = $this->condition->latest()->paginate(10);

        return $conditions;
    }

    public function getSingleCondition(string $id)
    {
        $condition = $this->condition->find($id);

        return $condition;
    }

    public function storeCondition(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        try {
            $created = $this->condition->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating condition');
            }

            return [
                'status' => true,
                'message' => 'Condition Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCondition(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        try {
            $condition = $this->getSingleCondition($id);
            if (empty($condition)) {
                throw new Exception('Condition Not Found');
            }

            $updated = $condition->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating condition');
            }

            return [
                'status' => true,
                'message' => 'Condition Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleConditionStatus(string $id)
    {
        try {
            $condition = $this->getSingleCondition($id);
            if (empty($condition)) {
                throw new Exception('Condition Not Found');
            }

            $updated = $condition->update([
                'is_active' => ! $condition->is_active,
            ]);

            if (! $updated) {
                throw new Exception('Something went wrong while updating condition');
            }

            return [
                'status' => true,
                'message' => 'Condition Status Toggled Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCondition(string $id)
    {
        try {
            $condition = $this->getSingleCondition($id);
            if (empty($condition)) {
                throw new Exception('Condition Not Found');
            }

            $deleted = $condition->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting condition');
            }

            return [
                'status' => true,
                'message' => 'Condition Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyConditionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Condition');
            }

            $deleted = $this->condition->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Condition');
            }

            return [
                'status' => true,
                'message' => 'Condition Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Addons Settings
    public function getAllAddons()
    {
        $addons = $this->addon->latest()->paginate(10);

        return $addons;
    }

    public function getSingleAddon(string $id)
    {
        $addon = $this->addon->find($id);

        return $addon;
    }

    public function storeAddon(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'decimal:2', 'min:0'],
        ]);

        try {
            $created = $this->addon->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating addon');
            }

            return [
                'status' => true,
                'message' => 'Addon Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateAddon(Request $request, string $id)
    {

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'decimal:2', 'min:0'],
        ]);

        try {
            $addon = $this->getSingleAddon($id);
            if (empty($addon)) {
                throw new Exception('Addon Not Found');
            }

            $updated = $addon->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating addon');
            }

            return [
                'status' => true,
                'message' => 'Addon Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleAddonStatus(string $id)
    {
        try {
            $addon = $this->getSingleAddon($id);
            if (empty($addon)) {
                throw new Exception('Addon Not Found');
            }

            $updated = $addon->update([
                'is_active' => ! $addon->is_active,
            ]);

            if (! $updated) {
                throw new Exception('Something went wrong while updating addon');
            }

            return [
                'status' => true,
                'message' => 'Addon Status Toggled Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAddon(string $id)
    {
        try {
            $addon = $this->getSingleAddon($id);
            if (empty($addon)) {
                throw new Exception('Addon Not Found');
            }

            $deleted = $addon->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting addon');
            }

            return [
                'status' => true,
                'message' => 'Addon Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAddonBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Addon');
            }

            $deleted = $this->addon->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Addon');
            }

            return [
                'status' => true,
                'message' => 'Addon Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Dormancy Setting
    public function getDormancySetting()
    {
        $dormancy_setting = $this->dormancy_setting->first();

        return $dormancy_setting;
    }

    public function saveDormancySetting(Request $request)
    {
        try {
            $validated_req = $request->validate([
                'dormancy_threshold_type' => ['required', 'in:minutes,days,months,years'],
                'dormancy_threshold_value' => ['required', 'integer', 'min:1'],
            ]);

            $dormancy_setting = $this->getDormancySetting();

            if (empty($dormancy_setting)) {
                $dormancy_setting = $this->dormancy_setting->create($validated_req);
            } else {
                $dormancy_setting->update($validated_req);
            }

            return [
                'status' => true,
                'message' => 'Dormancy Setting Saved Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getUnsettledAccountsNotificationSettings()
    {
        $settings = $this->unsettled_account_notification_setting::all()
            ->groupBy('reason')
            ->map(function ($items) {
                $item = $items->first();

                return [
                    'delay' => $item->delay,
                    'channel' => $item->channel,
                    'is_active' => (bool) $item->is_active,
                ];
            });

        return $settings;
    }

    public function saveUnsettledAccountsNotificationSettings(Request $request)
    {
        DB::beginTransaction();

        try {

            $request->validate(
                [
                    'settings' => ['required', 'array'],
                    'settings.*.delay' => ['required', 'integer', 'min:1'],
                    'settings.*.channel' => ['required', 'in:in_app,email'],
                    'settings.*.is_active' => ['required', 'boolean'],
                ],
                [
                    'settings.required' => 'Please configure at least one notification setting.',
                    'settings.array' => 'Invalid notification settings format.',

                    'settings.*.delay.required' => 'Please enter a delay (in hours) for each notification.',
                    'settings.*.delay.integer' => 'The delay must be a valid number of hours.',
                    'settings.*.delay.min' => 'The delay must be at least 1 hour.',

                    'settings.*.channel.required' => 'Please select a notification channel (Email or In-App).',
                    'settings.*.channel.in' => 'The selected notification channel is not valid.',

                    'settings.*.is_active.required' => 'Please specify whether the notification is active.',
                    'settings.*.is_active.boolean' => 'Invalid value for notification status.',
                ]
            );

            $settings = $request->input('settings');
            foreach ($settings as $reason => $setting) {

                $this->unsettled_account_notification_setting->updateOrCreate(
                    [
                        'reason' => $reason,
                    ],
                    [
                        'delay' => $setting['delay'],
                        'channel' => $setting['channel'],
                        'is_active' => $setting['is_active'],
                    ]
                );
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Unsettled account notification settings saved successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }



    // Attribution Reward Setting
    public function getAttributionRewardSetting()
    {
        return $this->attribution_reward_setting->first();
    }
    public function saveAttributionRewardSetting(Request $request)
    {
        try {
            $validated_req = $request->validate([
                'calculation_type' => ['required', 'in:percentage,fixed'],
                'value' => ['required', 'numeric', 'min:0'],
            ]);

            $attribution_reward_setting = $this->getAttributionRewardSetting();

            if (empty($attribution_reward_setting)) {
                $attribution_reward_setting = $this->attribution_reward_setting->create($validated_req);
            } else {
                $attribution_reward_setting->update($validated_req);
            }

            return [
                'status' => true,
                'message' => 'Attribution Reward Setting Saved Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
