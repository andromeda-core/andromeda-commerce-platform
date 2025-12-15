<?php

namespace App\Repositories\Settings\Repository;

use App\Jobs\AppDarkLogoDestroyOnAWS;
use App\Jobs\AppDarkLogoStoreOnAWS;
use App\Jobs\AppFaviconDestroyOnAWS;
use App\Jobs\AppFaviconStoreOnAWS;
use App\Jobs\AppLightLogoDestroyOnAWS;
use App\Jobs\AppLightLogoStoreOnAWS;
use App\Models\AdditionalFeeList;
use App\Models\AwsSetting;
use App\Models\Capacity;
use App\Models\Color;
use App\Models\CommissionSetting;
use App\Models\Country;
use App\Models\Currency;
use App\Models\GeneralSetting;
use App\Models\GoogleMapSetting;
use App\Models\MetaSetting;
use App\Models\ModelName;
use App\Models\NowPayment;
use App\Models\Permission;
use App\Models\RewardSetting;
use App\Models\Role;
use App\Models\SmtpSetting;
use App\Models\SpecialCountry;
use App\Models\StorageLocation;
use App\Repositories\Settings\Interface\ISettingRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

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
        private NowPayment $now_payment

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
            'contact_number' => ['required', 'regex:/^\+\d+$/'],
            ...($request->hasFile('app_main_logo_dark') ? ['app_main_logo_dark' => 'nullable|image|max:2048'] : []),
            ...($request->hasFile('app_main_logo_light') ? ['app_main_logo_light' => 'nullable|image|max:2048'] : []),
            ...($request->hasFile('app_favicon') ? ['app_favicon' => 'nullable|image|max:2048'] : []),
            'app_description' => ['nullable', 'min:30', 'string', 'max:1000'],
        ], [
            'contact_number.regex' => 'The Contact Number Accepted With + Country Code - Example: +8801xxxxxxxxx',

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

            if ($request->hasFile('app_favicon')) {

                if (! empty($general_setting->app_favicon)) {
                    dispatch(new AppFaviconDestroyOnAWS($general_setting->app_favicon));
                }

                $favicon = $request->file('app_favicon');
                $new_favicon_name = time().uniqid().'.'.$favicon->getClientOriginalExtension();

                $resizedImage = ImageManager::imagick()
                    ->read($favicon)
                    ->resize(512, 512)
                    ->contain(512, 512)
                    ->encodeByExtension('png', quality: 80);

                $tempPath = 'temp/uploads/'.$new_favicon_name;
                Storage::disk('local')->put($tempPath, (string) $resizedImage);
                $validated_req['app_favicon'] = null;

                dispatch(new AppFaviconStoreOnAWS($tempPath, $general_setting));

            }

            if ($request->hasFile('app_main_logo_dark')) {

                if (! empty($general_setting->app_main_logo_dark)) {
                    dispatch(new AppDarkLogoDestroyOnAWS($general_setting->app_main_logo_dark));
                }

                $app_main_logo_dark = $request->file('app_main_logo_dark');

                $new_app_main_logo_dark_name = time().uniqid().'.'.$app_main_logo_dark->getClientOriginalExtension();

                $resizedImage = ImageManager::imagick()
                    ->read($app_main_logo_dark)
                    ->resize(512, 512)
                    ->contain(512, 512)
                    ->encodeByExtension($app_main_logo_dark->getClientOriginalExtension(), quality: 80);

                $tempPath = 'temp/uploads/'.$new_app_main_logo_dark_name;
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
                $new_app_main_logo_light_name = time().uniqid().'.'.$app_main_logo_light->getClientOriginalExtension();

                $resizedImage = ImageManager::imagick()
                    ->read($app_main_logo_light)
                    ->resize(512, 512)
                    ->contain(512, 512)
                    ->encodeByExtension($app_main_logo_light->getClientOriginalExtension(), quality: 80);

                $tempPath = 'temp/uploads/'.$new_app_main_logo_light_name;
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
            'name' => 'required|unique:roles,name,'.$id,
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
                $query->where('name', 'like', '%'.$request->input('search').'%');
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
            'name' => ['required', 'max:255', 'unique:permissions,name,'.$id],
            'icon' => ['required', 'max:100'],
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
            'name' => ['required', 'max:255', 'unique:colors,name,'.$id],
            'code' => ['required', 'max:255', 'starts_with:#', 'unique:colors,code,'.$id],
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
            'name' => ['required', 'max:255', 'unique:model_names,name,'.$id],
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
            'name' => ['required', 'max:255', 'unique:capacities,name,'.$id],
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
            'name' => ['required', 'max:255', 'string', 'unique:storage_locations,name,'.$id],
            'address' => ['nullable', 'unique:storage_locations,address,'.$id],
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
            'name' => ['required', 'max:100', 'string', 'unique:currencies,name,'.$id],
            'symbol' => ['required', 'max:10', 'string', 'unique:currencies,symbol,'.$id],
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
            'name' => ['required', 'unique:additional_fee_lists,name,'.$id],
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
            'type' => ['required', 'in:collaborator,distributor,supplier', 'unique:commission_settings,type'],
            'commission_rate' => ['required', 'numeric', 'min:1', 'max:100'],
        ], [
            'type.unique' => 'This Type Already Exists',
            'type.in' => 'Type Must Be Collaborator, Distributor Or Supplier',
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
        } catch (Exception$e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    public function updateCommissionSetting(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'type' => ['required', 'in:collaborator,distributor,supplier', 'unique:commission_settings,type,'.$id],
            'commission_rate' => ['required', 'numeric', 'min:1', 'max:100'],
        ], [
            'type.unique' => 'This Type Already Exists',
            'type.in' => 'Type Must Be Collaborator, Distributor Or Supplier',
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

        } catch (Exception$e) {
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
        } catch (Exception$e) {
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
        } catch (Exception$e) {
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
                    $subQuery->where('name', 'like', '%'.$request->input('search').'%')
                        ->orWhere('iso_code', 'like', '%'.$request->input('search').'%');
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
            'name' => ['required', 'max:100', 'unique:countries,name,'.$id],
            'iso_code' => ['required', 'max:2', 'unique:countries,iso_code,'.$id],
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
                    $subQuery->where('name', 'like', '%'.$request->input('search').'%')
                        ->orWhere('iso_code', 'like', '%'.$request->input('search').'%');
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
        return $this->country->where('is_active', true)->get();
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
            'aws_access_key_id' => ['required', 'string', 'max:255', 'unique:aws_settings,aws_access_key_id,'.$id],
            'aws_secret_access_key' => ['required', 'string', 'max:255', 'unique:aws_settings,aws_secret_access_key,'.$id],
            'aws_region' => ['required', 'string', 'max:50'],
            'aws_bucket' => ['required', 'string', 'min:3', 'max:63', 'unique:aws_settings,aws_bucket,'.$id],
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
            'google_map_api_key' => ['required', 'string', 'max:255', 'unique:google_map_settings,google_map_api_key,'.$id],
            'google_map_id' => ['required', 'string', 'max:255', 'unique:google_map_settings,google_map_id,'.$id],
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
            'meta_fb_app_name' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_name,'.$id],
            'meta_fb_app_id' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_id,'.$id],
            'meta_fb_app_secret' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_app_secret,'.$id],
            'meta_fb_page_access_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_page_access_token,'.$id],
            'meta_verify_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_verify_token,'.$id],
            'meta_fb_page_username' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_fb_page_username,'.$id],
            'meta_ig_app_name' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_name,'.$id],
            'meta_ig_app_id' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_id,'.$id],
            'meta_ig_app_secret' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_app_secret,'.$id],
            'meta_ig_username' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_username,'.$id],
            'meta_ig_access_token' => ['required', 'string', 'max:255', 'unique:meta_settings,meta_ig_access_token,'.$id],
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
            'now_payment_api_key' => ['required', 'string', 'max:255', 'unique:now_payments,now_payment_api_key,'.$id],
            'now_payment_public_key' => ['required', 'string', 'max:255', 'unique:now_payments,now_payment_public_key,'.$id],
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
}
