<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Settings\Interface\ISettingRepository;
use App\Repositories\TranslationSystem\Language\Interface\ILanguageRepository;
use Artisan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function __construct(
        private ISettingRepository $setting,
        private ILanguageRepository $language
    ) {}

    // Menu Page

    public function index()
    {
        return Inertia::render('Dashboard/Settings/index');
    }

    // General Setting
    public function generalSetting()
    {
        $general_setting = $this->setting->getGenralSetting();

        return Inertia::render('Dashboard/Settings/GeneralSetting/index', compact('general_setting'));
    }

    public function updateGeneralSetting(Request $request)
    {
        $updated = $this->setting->updateGeneralSetting($request);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        Artisan::call('queue:restart');

        return back();
    }

    // Smtp Setting
    public function smtpSetting()
    {
        $smtp_setting = $this->setting->getSmtpSetting();

        return Inertia::render('Dashboard/Settings/SMTPSetting/index', compact('smtp_setting'));
    }

    public function updateSmtpSetting(Request $request)
    {
        $updated = $this->setting->updateSmtpSetting($request);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        Artisan::call('queue:restart');

        return back()->with('success', $updated['message']);
    }

    // Role Setting
    public function roleIndex()
    {
        $roles = $this->setting->getAllRoles();

        $can_view_permission_module = app()->isLocal();

        return Inertia::render('Dashboard/Settings/Roles/index', compact('roles', 'can_view_permission_module'));
    }

    public function roleCreate()
    {
        return Inertia::render('Dashboard/Settings/Roles/create');
    }

    public function roleStore(Request $request)
    {
        $created = $this->setting->storeRole($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.roles.index')->with('success', $created['message']);
    }

    public function roleEdit(?string $id = null)
    {

        if (empty($id)) {
            return to_route('dashboard.settings.roles.index')->with('error', 'Role ID not found');
        }

        $role = $this->setting->getSingleRole($id);

        if (empty($role)) {
            return to_route('dashboard.settings.roles.index')->with('error', 'Role not found');
        }

        return Inertia::render('Dashboard/Settings/Roles/edit', compact('role'));
    }

    public function roleUpdate(Request $request, ?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'Role ID not found');
        }

        $updated = $this->setting->updateRole($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.roles.index')->with('success', $updated['message']);
    }

    public function roleDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Role ID not found');
        }
        $deleted = $this->setting->destroyRole($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.settings.roles.index')->with('success', $deleted['message']);
    }

    public function destroyRoleBySelection(Request $request)
    {
        $deleted = $this->setting->destroyRoleBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.settings.roles.index')->with('success', $deleted['message']);
    }

    // Permission Methods
    public function permissionsIndex(Request $request)
    {
        $permissions = $this->setting->getAllPermissions($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/Settings/Permissions/index', compact('permissions', 'search'));

    }

    public function permissionCreate()
    {
        return Inertia::render('Dashboard/Settings/Permissions/create');
    }

    public function permissionStore(Request $request)
    {
        $created = $this->setting->storePermission($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.permissions.index')->with('success', $created['message']);
    }

    public function permissionEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.permissions.index')->with('error', 'Permission ID not found');
        }

        $permission = $this->setting->getSinglePermission($id);

        if (empty($permission)) {
            return to_route('dashboard.settings.permissions.index')->with('error', 'Permission not found');
        }

        return Inertia::render('Dashboard/Settings/Permissions/edit', compact('permission'));
    }

    public function permissionUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Permission ID not found');
        }

        $updated = $this->setting->updatePermission($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.permissions.index')->with('success', $updated['message']);
    }

    public function permissionDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Permission ID not found');
        }

        $deleted = $this->setting->destroyPermission($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyPermissionBySelection(Request $request)
    {
        $deleted = $this->setting->destroyPermissionBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function permissionManage(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.roles.index')->with('error', 'Role ID not found');
        }

        $data = $this->setting->getManageblePermissions($id);

        $all_permissions = $data['all_permissions'];
        $assigned_permissions = $data['assigned_permissions'];
        $role_id = $data['role_id'];

        return Inertia::render('Dashboard/Settings/Permissions/manage', compact('all_permissions', 'assigned_permissions', 'role_id'));
    }

    public function permissionSync(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Role ID not found');
        }

        $synced = $this->setting->syncPermissions($request, $id);

        if ($synced['status'] === false) {
            return back()->with('error', $synced['message']);
        }

        return back()->with('success', $synced['message']);
    }

    // Color Methods
    public function colorIndex()
    {
        $colors = $this->setting->getAllColors();

        return Inertia::render('Dashboard/Settings/Colors/index', compact('colors'));
    }

    public function colorCreate()
    {
        return Inertia::render('Dashboard/Settings/Colors/create');
    }

    public function colorStore(Request $request)
    {
        $created = $this->setting->storeColor($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.colors.index')->with('success', $created['message']);
    }

    public function colorEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.colors.index')->with('error', 'Color ID not found');
        }

        $color = $this->setting->getSingleColor($id);

        if (empty($color)) {
            return to_route('dashboard.settings.colors.index')->with('error', 'Color not found');
        }

        return Inertia::render('Dashboard/Settings/Colors/edit', compact('color'));
    }

    public function colorUpdate(Request $request, ?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'Color ID not found');
        }

        $updated = $this->setting->updateColor($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.colors.index')->with('success', $updated['message']);
    }

    public function colorDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Color ID not found');
        }

        $deleted = $this->setting->destroyColor($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.settings.colors.index')->with('success', $deleted['message']);
    }

    public function destroyColorBySelection(Request $request)
    {
        $deleted = $this->setting->destroyColorBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.settings.colors.index')->with('success', $deleted['message']);
    }

    // Model Name Methods

    public function modelNameIndex()
    {
        $model_names = $this->setting->getAllModelNames();

        return Inertia::render('Dashboard/Settings/ModelNames/index', compact('model_names'));
    }

    public function modelNameCreate()
    {
        return Inertia::render('Dashboard/Settings/ModelNames/create');
    }

    public function modelNameStore(Request $request)
    {
        $created = $this->setting->storeModelName($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.model_names.index')->with('success', $created['message']);
    }

    public function modelNameEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.model_names.index')->with('error', 'Model Name ID not found');
        }

        $model_name = $this->setting->getSingleModelName($id);

        if (empty($model_name)) {
            return to_route('dashboard.settings.model_names.index')->with('error', 'Model Name not found');
        }

        return Inertia::render('Dashboard/Settings/ModelNames/edit', compact('model_name'));
    }

    public function modelNameUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Model Name ID not found');
        }

        $updated = $this->setting->updateModelName($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.model_names.index')->with('success', $updated['message']);
    }

    public function modelNameDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Model Name ID not found');
        }

        $deleted = $this->setting->destroyModelName($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.settings.model_names.index')->with('success', $deleted['message']);
    }

    public function destroyModelNameBySelection(Request $request)
    {
        $deleted = $this->setting->destroyModelNameBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.settings.model_names.index')->with('success', $deleted['message']);
    }

    public function capacityIndex()
    {
        $capacities = $this->setting->getAllCapacities();

        return Inertia::render('Dashboard/Settings/Capacities/index', compact('capacities'));
    }

    public function capacityCreate()
    {
        return Inertia::render('Dashboard/Settings/Capacities/create');
    }

    public function capacityStore(Request $request)
    {
        $created = $this->setting->storeCapacity($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.capacities.index')->with('success', $created['message']);
    }

    public function capacityEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.capacities.index')->with('error', 'Capacity ID not found');
        }

        $capacity = $this->setting->getSingleCapacity($id);

        if (empty($capacity)) {
            return to_route('dashboard.settings.capacities.index')->with('error', 'Capacity not found');
        }

        return Inertia::render('Dashboard/Settings/Capacities/edit', compact('capacity'));
    }

    public function capacityUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Capacity ID not found');
        }

        $updated = $this->setting->updateCapacity($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.capacities.index')->with('success', $updated['message']);
    }

    public function capacityDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Capacity ID not found');
        }

        $deleted = $this->setting->destroyCapacity($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.settings.capacities.index')->with('success', $deleted['message']);
    }

    public function destroyCapacityBySelection(Request $request)
    {
        $deleted = $this->setting->destroyCapacityBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.settings.capacities.index')->with('success', $deleted['message']);
    }

    // Storage Locations
    public function storageLocationIndex()
    {
        $storage_locations = $this->setting->getAllStorageLocations();

        return Inertia::render('Dashboard/Settings/StorageLocations/index', compact('storage_locations'));
    }

    public function storageLocationCreate()
    {
        return Inertia::render('Dashboard/Settings/StorageLocations/create');
    }

    public function storageLocationStore(Request $request)
    {
        $created = $this->setting->storeStorageLocation($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.storage_locations.index')->with('success', $created['message']);
    }

    public function storageLocationEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.storage_locations.index')->with('error', 'Storage Location ID not found');
        }

        $storage_location = $this->setting->getSingleStorageLocation($id);

        if (empty($storage_location)) {
            return to_route('dashboard.settings.storage_locations.index')->with('error', 'Storage Location not found');
        }

        return Inertia::render('Dashboard/Settings/StorageLocations/edit', compact('storage_location'));
    }

    public function storageLocationUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Storage Location ID not found');
        }

        $updated = $this->setting->updateStorageLocation($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.storage_locations.index')->with('success', $updated['message']);
    }

    public function storageLocationDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Storage Location ID not found');
        }

        $deleted = $this->setting->destroyStorageLocation($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyStorageLocationBySelection(Request $request)
    {
        $deleted = $this->setting->destroyStorageLocationBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Currencies Methods

    public function currencyIndex()
    {
        $currencies = $this->setting->getAllCurrencies();

        return Inertia::render('Dashboard/Settings/Currencies/index', compact('currencies'));
    }

    public function currencyCreate()
    {
        return Inertia::render('Dashboard/Settings/Currencies/create');
    }

    public function currencyStore(Request $request)
    {
        $created = $this->setting->storeCurrency($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.currencies.index')->with('success', $created['message']);
    }

    public function currencyEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.currencies.index')->with('error', 'Currency ID not found');
        }

        $currency = $this->setting->getSingleCurrency($id);

        if (empty($currency)) {
            return to_route('dashboard.settings.currencies.index')->with('error', 'Currency not found');
        }

        return Inertia::render('Dashboard/Settings/Currencies/edit', compact('currency'));
    }

    public function currencyUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Currency ID not found');
        }

        $updated = $this->setting->updateCurrency($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.currencies.index')->with('success', $updated['message']);
    }

    public function currencyDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Currency ID not found');
        }

        $deleted = $this->setting->destroyCurrency($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyCurrencyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyCurrencyBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function toggleCurrencyStatus(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Currency ID not found');
        }

        $updated = $this->setting->toggleCurrencyStatus($id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }

    // Additional Fee lists

    public function additionalFeeListIndex()
    {
        $additional_fee_lists = $this->setting->getAllAdditionalFeeLists();

        return Inertia::render('Dashboard/Settings/AdditionalFeeLists/index', compact('additional_fee_lists'));
    }

    public function additionalFeeListCreate()
    {
        return Inertia::render('Dashboard/Settings/AdditionalFeeLists/create');
    }

    public function additionalFeeListStore(Request $request)
    {
        $created = $this->setting->storeAdditionalFeeList($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.additional_fee_lists.index')->with('success', $created['message']);
    }

    public function additionalFeeListEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.additional_fee_lists.index')->with('error', 'Additional Fee List ID not found');
        }

        $additional_fee_list = $this->setting->getSingleAdditionalFeeList($id);

        if (empty($additional_fee_list)) {
            return to_route('dashboard.settings.additional_fee_lists.index')->with('error', 'Additional Fee List not found');
        }

        return Inertia::render('Dashboard/Settings/AdditionalFeeLists/edit', compact('additional_fee_list'));
    }

    public function additionalFeeListUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Additional Fee List ID not found');
        }

        $updated = $this->setting->updateAdditionalFeeList($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.additional_fee_lists.index')->with('success', $updated['message']);
    }

    public function additionalFeeListDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Additional Fee List ID not found');
        }

        $deleted = $this->setting->destroyAdditionalFeeList($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyAdditionalFeeListBySelection(Request $request)
    {
        $deleted = $this->setting->destroyAdditionalFeeListBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Reward Point Setting Method

    public function rewardPointSettingIndex()
    {
        $reward_point_setting = $this->setting->getRewardPointSetting();

        return Inertia::render('Dashboard/Settings/RewardSettings/index', compact('reward_point_setting'));
    }

    public function rewardPointSettingUpdate(Request $request)
    {
        $updated = $this->setting->updateRewardPointSetting($request);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }

    // Commission Setting methods

    public function commissionSettingIndex()
    {
        $commission_settings = $this->setting->getAllCommissionSettings();

        return Inertia::render('Dashboard/Settings/CommissionSettings/index', compact('commission_settings'));
    }

    public function commissionSettingCreate()
    {
        return Inertia::render('Dashboard/Settings/CommissionSettings/create');
    }

    public function commissionSettingStore(Request $request)
    {
        $created = $this->setting->storeCommissionSetting($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.commission-settings.index')->with('success', $created['message']);
    }

    public function commissionSettingEdit(?string $id = null)
    {

        if (empty($id)) {
            return to_route('dashboard.settings.commission-settings.index')->with('error', 'Commission Setting ID not found');
        }

        $commission_setting = $this->setting->getSingleCommissionSetting($id);
        if (empty($commission_setting)) {
            return to_route('dashboard.settings.commission-settings.index')->with('error', 'Commission Setting not found');
        }

        return Inertia::render('Dashboard/Settings/CommissionSettings/edit', compact('commission_setting'));
    }

    public function commissionSettingUpdate(Request $request, ?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'Commission Setting ID not found');
        }

        $updated = $this->setting->updateCommissionSetting($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.commission-settings.index')->with('success', $updated['message']);
    }

    public function destroyCommissionSetting(?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'Commission Setting ID not found');
        }

        $deleted = $this->setting->destroyCommissionSetting($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyCommissionSettingBySelection(Request $request)
    {
        $deleted = $this->setting->destroyCommissionSettingBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);

    }

    // Countries
    public function countryIndex(Request $request)
    {
        $countries = $this->setting->getAllCountries($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/Settings/Countries/index', compact('countries', 'search'));
    }

    public function countryCreate()
    {
        return Inertia::render('Dashboard/Settings/Countries/create');
    }

    public function countryStore(Request $request)
    {
        $created = $this->setting->storeCountry($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.countries.index')->with('success', $created['message']);
    }

    public function countryEdit(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.countries.index')->with('error', 'Country ID not found');
        }

        $country = $this->setting->getSingleCountry($id);
        if (empty($country)) {
            return to_route('dashboard.settings.countries.index')->with('error', 'Country not found');
        }

        return Inertia::render('Dashboard/Settings/Countries/edit', compact('country'));
    }

    public function countryUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.countries.index')->with('error', 'Country ID not found');
        }

        $updated = $this->setting->updateCountry($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.countries.index')->with('success', $updated['message']);
    }

    public function countryDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Country ID not found');
        }

        $deleted = $this->setting->destroyCountry($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function countryDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyCountryBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Special Country
    public function specialCountryIndex(Request $request)
    {
        $special_countries = $this->setting->getAllSpecialCountries($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/Settings/SpecialCountries/index', compact('special_countries', 'search'));

    }

    public function specialCountryCreate()
    {
        $countries = $this->setting->getCountries();

        return Inertia::render('Dashboard/Settings/SpecialCountries/create', compact('countries'));
    }

    public function specialCountryStore(Request $request)
    {
        $created = $this->setting->storeSpecialCountry($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.special-countries.index')->with('success', $created['message']);
    }

    public function specialCountryDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Special Country ID Not Found');
        }

        $deleted = $this->setting->destroySpecialCountry($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function specialCountryDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroySpecialCountryBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);

    }

    // AWS Settings
    public function awsSettingsIndex()
    {
        $aws_settings = $this->setting->getAllAwsSettings();

        return Inertia::render('Dashboard/Settings/AwsSettings/index', compact('aws_settings'));
    }

    public function awsSettingCreate()
    {
        return Inertia::render('Dashboard/Settings/AwsSettings/create');
    }

    public function awsSettingStore(Request $request)
    {
        $created = $this->setting->storeAwsSetting($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.aws-settings.index')->with('success', $created['message']);
    }

    public function awsSettingEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.aws-settings.index')->with('error', 'Aws Setting ID not found');
        }

        $aws_setting = $this->setting->getSingleAwsSetting($id);

        return Inertia::render('Dashboard/Settings/AwsSettings/edit', compact('aws_setting'));
    }

    public function awsSettingUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.aws-settings.index')->with('error', 'Aws Setting ID not found');
        }

        $updated = $this->setting->updateAwsSetting($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.aws-settings.index')->with('success', $updated['message']);
    }

    public function awsSettingDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Aws Setting ID not found');
        }

        $deleted = $this->setting->destroyAwsSetting($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function awsSettingDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyAwsSettingBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function awsSettingToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Aws Setting ID not found');
        }

        $updated = $this->setting->toggleAwsSettingStatus($id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }

    // Google Map Setting

    public function googleMapSettingsIndex()
    {
        $google_map_settings = $this->setting->getAllGoogleMapSettings();

        return Inertia::render('Dashboard/Settings/GoogleMapSettings/index', compact('google_map_settings'));
    }

    public function googleMapSettingCreate()
    {
        return Inertia::render('Dashboard/Settings/GoogleMapSettings/create');
    }

    public function googleMapSettingStore(Request $request)
    {
        $created = $this->setting->storeGoogleMapSetting($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.google-map-settings.index')->with('success', $created['message']);
    }

    public function googleMapSettingEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.google-map-settings.index')->with('error', 'Google Map Setting ID not found');
        }

        $google_map_setting = $this->setting->getSingleGoogleMapSetting($id);

        return Inertia::render('Dashboard/Settings/GoogleMapSettings/edit', compact('google_map_setting'));
    }

    public function googleMapSettingUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.google-map-settings.index')->with('error', 'Google Map Setting ID not found');
        }

        $updated = $this->setting->updateGoogleMapSetting($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.google-map-settings.index')->with('success', $updated['message']);
    }

    public function googleMapSettingDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Google Map Setting ID not found');
        }

        $deleted = $this->setting->destroyGoogleMapSetting($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function googleMapSettingDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyGoogleMapSettingBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function googleMapSettingToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Google Map Setting ID not found');
        }

        $updated = $this->setting->toggleGoogleMapSettingStatus($id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);

    }

    // Meta Setting

    public function metaSettingsIndex()
    {
        $meta_settings = $this->setting->getAllMetaSettings();

        return Inertia::render('Dashboard/Settings/MetaSettings/index', compact('meta_settings'));
    }

    public function metaSettingCreate()
    {
        return Inertia::render('Dashboard/Settings/MetaSettings/create');
    }

    public function metaSettingStore(Request $request)
    {
        $created = $this->setting->storeMetaSetting($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.meta-settings.index')->with('success', $created['message']);
    }

    public function metaSettingEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.meta-settings.index')->with('error', 'Meta Setting ID not found');
        }

        $meta_setting = $this->setting->getSingleMetaSetting($id);

        if (empty($meta_setting)) {
            return to_route('dashboard.settings.meta-settings.index')->with('error', 'Meta Setting Not Found');
        }

        return Inertia::render('Dashboard/Settings/MetaSettings/edit', compact('meta_setting'));
    }

    public function metaSettingUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.meta-settings.index')->with('error', 'Meta Setting ID not found');
        }

        $updated = $this->setting->updateMetaSetting($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.meta-settings.index')->with('success', $updated['message']);
    }

    public function metaSettingDestroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Meta Setting ID not found');
        }

        $deleted = $this->setting->destroyMetaSetting($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function metaSettingDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyMetaSettingBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function metaSettingToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Meta Setting ID not found');
        }

        $updated = $this->setting->toggleMetaSettingStatus($id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);

    }

    public function NOWPaymentSettingsIndex()
    {

        $now_payment_settings = $this->setting->getAllNOWPaymentSettings();

        return Inertia::render('Dashboard/Settings/NowPaymentSettings/index', compact('now_payment_settings'));
    }

    public function NOWPaymentSettingCreate()
    {
        return Inertia::render('Dashboard/Settings/NowPaymentSettings/create');
    }

    public function NOWPaymentSettingStore(Request $request)
    {
        $response = $this->setting->storeNOWPaymentSetting($request);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return to_route('dashboard.settings.now-payment-settings.index')->with('success', $response['message']);
    }

    public function NOWPaymentSettingEdit(?string $id = null)
    {

        if (empty($id)) {
            return to_route('dashboard.settings.now-payment-settings.index')->with('error', 'Now Payment Setting ID not found');
        }

        $now_payment_setting = $this->setting->getSingleNOWPayemntSetting($id);

        if (empty($now_payment_setting)) {
            return to_route('dashboard.settings.now-payment-settings.index')->with('error', 'Now Payment Setting Not Found');
        }

        return Inertia::render('Dashboard/Settings/NowPaymentSettings/edit', compact('now_payment_setting'));
    }

    public function NOWPaymentSettingUpdate(Request $request, ?string $id = null)
    {

        if (empty($id)) {
            return to_route('dashboard.settings.now-payment-settings.index')->with('error', 'Now Payment Setting ID not found');
        }

        $updated = $this->setting->updateNOWPaymentSetting($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.now-payment-settings.index')->with('success', $updated['message']);
    }

    public function NOWPaymentSettingToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.now-payment-settings.index')->with('error', 'Now Payment Setting ID not found');
        }

        $response = $this->setting->toggleNOWPaymentSettingStatus($id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function NOWPaymentSettingDestroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.now-payment-settings.index')->with('error', 'Now Payment Setting ID not found');
        }

        $deleted = $this->setting->destroyNOWPaymentSetting($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);

    }

    public function NOWPaymentSettingDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyNOWPaymentSettingBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);

    }

    // Return Policy Methods
    public function returnPolicyIndex()
    {
        $return_policies = $this->setting->getAllReturnPolicies();

        return Inertia::render('Dashboard/Settings/ReturnPolicy/index', compact('return_policies'));

    }

    public function returnPolicyCreate()
    {
        $languages = $this->language->getAllLanguagesWithoutPagination();

        return Inertia::render('Dashboard/Settings/ReturnPolicy/create', compact('languages'));
    }

    public function returnPolicyEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.return-policy-settings.index')->with('error', 'Return Policy ID not found');
        }

        $return_policy = $this->setting->getSingleReturnPolicy($id);

        if (empty($return_policy)) {
            return to_route('dashboard.settings.return-policy-settings.index')->with('error', 'Return Policy Not Found');
        }

        $languages = $this->language->getAllLanguagesWithoutPagination();

        return Inertia::render('Dashboard/Settings/ReturnPolicy/edit', compact('return_policy', 'languages'));
    }

    public function returnPolicyStore(Request $request)
    {
        $created = $this->setting->storeReturnPolicy($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.return-policy-settings.index')->with('success', $created['message']);
    }

    public function returnPolicyUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.return-policy-settings.index')->with('error', 'Return Policy ID not found');
        }

        $updated = $this->setting->updateReturnPolicy($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.return-policy-settings.index')->with('success', $updated['message']);
    }

    public function returnPolicyToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.return-policy-settings.index')->with('error', 'Return Policy ID not found');
        }

        $response = $this->setting->toggleReturnPolicyStatus($id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function returnPolicyDestroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.return-policy-settings.index')->with('error', 'Return Policy ID not found');
        }

        $deleted = $this->setting->destroyReturnPolicy($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function returnPolicyDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyReturnPolicyBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Shipping Policy Methods
    public function shippingPolicyIndex()
    {
        $shipping_policies = $this->setting->getAllShippingPolicies();

        return Inertia::render('Dashboard/Settings/ShippingPolicy/index', compact('shipping_policies'));

    }

    public function shippingPolicyCreate()
    {
        $languages = $this->language->getAllLanguagesWithoutPagination();

        return Inertia::render('Dashboard/Settings/ShippingPolicy/create', compact('languages'));
    }

    public function shippingPolicyEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.shipping-policy-settings.index')->with('error', 'Shipping Policy ID not found');
        }

        $shipping_policy = $this->setting->getSingleShippingPolicy($id);

        if (empty($shipping_policy)) {
            return to_route('dashboard.settings.shipping-policy-settings.index')->with('error', 'Shipping Policy Not Found');
        }

        $languages = $this->language->getAllLanguagesWithoutPagination();

        return Inertia::render('Dashboard/Settings/ShippingPolicy/edit', compact('shipping_policy', 'languages'));
    }

    public function shippingPolicyStore(Request $request)
    {
        $created = $this->setting->storeShippingPolicy($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.shipping-policy-settings.index')->with('success', $created['message']);
    }

    public function shippingPolicyUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.shipping-policy-settings.index')->with('error', 'Shipping Policy ID not found');
        }

        $updated = $this->setting->updateShippingPolicy($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.shipping-policy-settings.index')->with('success', $updated['message']);
    }

    public function shippingPolicyToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.shipping-policy-settings.index')->with('error', 'Shipping Policy ID not found');
        }

        $response = $this->setting->toggleShippingPolicyStatus($id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function shippingPolicyDestroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.shipping-policy-settings.index')->with('error', 'Shipping Policy ID not found');
        }

        $deleted = $this->setting->destroyShippingPolicy($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function shippingPolicyDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyShippingPolicyBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Terms Of Service Methods
    public function termsOfServiceIndex()
    {
        $terms_of_services = $this->setting->getAllTermsOfServices();

        return Inertia::render('Dashboard/Settings/TermsOfService/index', compact('terms_of_services'));

    }

    public function termsOfServiceCreate()
    {
        $languages = $this->language->getAllLanguagesWithoutPagination();

        return Inertia::render('Dashboard/Settings/TermsOfService/create', compact('languages'));
    }

    public function termsOfServiceEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.terms-of-service-settings.index')->with('error', 'Terms Of Service ID not found');
        }

        $terms_of_service = $this->setting->getSingleTermsOfService($id);

        if (empty($terms_of_service)) {
            return to_route('dashboard.settings.terms-of-service-settings.index')->with('error', 'Terms Of Service Not Found');
        }

        $languages = $this->language->getAllLanguagesWithoutPagination();

        return Inertia::render('Dashboard/Settings/TermsOfService/edit', compact('terms_of_service', 'languages'));
    }

    public function termsOfServiceStore(Request $request)
    {
        $created = $this->setting->storeTermsOfService($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.terms-of-service-settings.index')->with('success', $created['message']);
    }

    public function termsOfServiceUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.terms-of-service-settings.index')->with('error', 'Terms Of Service ID not found');
        }

        $updated = $this->setting->updateTermsOfService($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.terms-of-service-settings.index')->with('success', $updated['message']);
    }

    public function termsOfServiceToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.terms-of-service-settings.index')->with('error', 'Terms Of Service ID not found');
        }

        $response = $this->setting->toggleTermsOfServiceStatus($id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function termsOfServiceDestroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.terms-of-service-settings.index')->with('error', 'Terms Of Service ID not found');
        }

        $deleted = $this->setting->destroyTermsOfService($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function termsOfServiceDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyTermsOfServiceBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Privacy Policy Methods
    public function privacyPolicyIndex()
    {
        $privacy_policies = $this->setting->getAllPrivacyPolicy();

        return Inertia::render('Dashboard/Settings/PrivacyPolicy/index', compact('privacy_policies'));

    }

    public function privacyPolicyCreate()
    {
        $languages = $this->language->getAllLanguagesWithoutPagination();

        return Inertia::render('Dashboard/Settings/PrivacyPolicy/create', compact('languages'));
    }

    public function privacyPolicyEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.privacy-policy-settings.index')->with('error', 'Privacy Policy ID not found');
        }

        $privacy_policy = $this->setting->getSinglePrivacyPolicy($id);

        if (empty($privacy_policy)) {
            return to_route('dashboard.settings.privacy-policy-settings.index')->with('error', 'Privacy Policy Not Found');
        }

        $languages = $this->language->getAllLanguagesWithoutPagination();

        return Inertia::render('Dashboard/Settings/PrivacyPolicy/edit', compact('privacy_policy', 'languages'));
    }

    public function privacyPolicyStore(Request $request)
    {
        $created = $this->setting->storePrivacyPolicy($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.privacy-policy-settings.index')->with('success', $created['message']);
    }

    public function privacyPolicyUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.privacy-policy-settings.index')->with('error', 'Privacy Policy ID not found');
        }

        $updated = $this->setting->updatePrivacyPolicy($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.privacy-policy-settings.index')->with('success', $updated['message']);
    }

    public function privacyPolicyToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.privacy-policy-settings.index')->with('error', 'Privacy Policy ID not found');
        }

        $response = $this->setting->togglePrivacyPolicyStatus($id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function privacyPolicyDestroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.privacy-policy-settings.index')->with('error', 'Privacy Policy ID not found');
        }

        $deleted = $this->setting->destroyPrivacyPolicy($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function privacyPolicyDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyPrivacyPolicyBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Courier Company Methods
    public function courierCompanyIndex()
    {
        $courier_companies = $this->setting->getAllCourierCompanies();

        return Inertia::render('Dashboard/Settings/CourierCompany/index', compact('courier_companies'));

    }

    public function courierCompanyCreate()
    {
        return Inertia::render('Dashboard/Settings/CourierCompany/create');
    }

    public function courierCompanyEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.courier-company-settings.index')->with('error', 'Courier Company ID not found');
        }

        $courier_company = $this->setting->getSingleCourierCompany($id);

        if (empty($courier_company)) {
            return to_route('dashboard.settings.courier-company-settings.index')->with('error', 'Courier Company Not Found');
        }

        return Inertia::render('Dashboard/Settings/CourierCompany/edit', compact('courier_company'));
    }

    public function courierCompanyStore(Request $request)
    {
        $created = $this->setting->storeCourierCompany($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.courier-company-settings.index')->with('success', $created['message']);
    }

    public function courierCompanyUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.courier-company-settings.index')->with('error', 'Courier Company ID not found');
        }

        $updated = $this->setting->updateCourierCompany($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.courier-company-settings.index')->with('success', $updated['message']);
    }

    public function courierCompanyToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.courier-company-settings.index')->with('error', 'Courier Company ID not found');
        }

        $response = $this->setting->toggleCourierCompanyStatus($id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function courierCompanyDestroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.courier-company-settings.index')->with('error', 'Courier Company ID not found');
        }

        $deleted = $this->setting->destroyCourierCompany($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function courierCompanyDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyCourierCompanyBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Condition Methods
    public function conditionIndex()
    {
        $conditions = $this->setting->getAllConditions();

        return Inertia::render('Dashboard/Settings/Conditions/index', compact('conditions'));

    }

    public function conditionCreate()
    {
        return Inertia::render('Dashboard/Settings/Conditions/create');
    }

    public function conditionEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.condition-settings.index')->with('error', 'Condition ID not found');
        }

        $condition = $this->setting->getSingleCondition($id);

        if (empty($condition)) {
            return to_route('dashboard.settings.condition-settings.index')->with('error', 'Condition Not Found');
        }

        return Inertia::render('Dashboard/Settings/Conditions/edit', compact('condition'));
    }

    public function conditionStore(Request $request)
    {
        $created = $this->setting->storeCondition($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.condition-settings.index')->with('success', $created['message']);
    }

    public function conditionUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.condition-settings.index')->with('error', 'Condition ID not found');
        }

        $updated = $this->setting->updateCondition($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.condition-settings.index')->with('success', $updated['message']);
    }

    public function conditionToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.condition-settings.index')->with('error', 'Condition ID not found');
        }

        $response = $this->setting->toggleConditionStatus($id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function conditionDestroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.condition-settings.index')->with('error', 'Condition ID not found');
        }

        $deleted = $this->setting->destroyCondition($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function conditionDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyConditionBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Addon Methods
    public function addonIndex()
    {
        $addons = $this->setting->getAllAddons();

        return Inertia::render('Dashboard/Settings/Addons/index', compact('addons'));

    }

    public function addonCreate()
    {
        return Inertia::render('Dashboard/Settings/Addons/create');
    }

    public function addonEdit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.addon-settings.index')->with('error', 'Addon ID not found');
        }

        $addon = $this->setting->getSingleAddon($id);

        if (empty($addon)) {
            return to_route('dashboard.settings.addon-settings.index')->with('error', 'Addon Not Found');
        }

        return Inertia::render('Dashboard/Settings/Addons/edit', compact('addon'));
    }

    public function addonStore(Request $request)
    {
        $created = $this->setting->storeAddon($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.settings.addon-settings.index')->with('success', $created['message']);
    }

    public function addonUpdate(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.addon-settings.index')->with('error', 'Addon ID not found');
        }

        $updated = $this->setting->updateAddon($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.settings.addon-settings.index')->with('success', $updated['message']);
    }

    public function addonToggleStatus(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.addon-settings.index')->with('error', 'Addon ID not found');
        }

        $response = $this->setting->toggleAddonStatus($id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function addonDestroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.settings.addon-settings.index')->with('error', 'Addon ID not found');
        }

        $deleted = $this->setting->destroyAddon($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function addonDestroyBySelection(Request $request)
    {
        $deleted = $this->setting->destroyAddonBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // Dormancy Setting
    public function dormancySettingIndex()
    {
        $dormancy_setting = $this->setting->getDormancySetting();

        return Inertia::render('Dashboard/Settings/DormancySetting/index', compact('dormancy_setting'));
    }

    public function dormancySettingSave(Request $request)
    {
        $saved = $this->setting->saveDormancySetting($request);

        if ($saved['status'] === false) {
            return back()->with('error', $saved['message']);
        }

        return to_route('dashboard.settings.dormancy-setting.index')->with('success', $saved['message']);
    }

    public function unsettledAccountsNotificationSetting()
    {
        $settings = $this->setting->getUnsettledAccountsNotificationSettings();

        return Inertia::render('Dashboard/Settings/UnsettledAccountsNotificationSettings/index', compact('settings'));
    }

    public function saveUnsettledAccountsNotificationSetting(Request $request)
    {
        $saved = $this->setting->saveUnsettledAccountsNotificationSettings($request);

        if ($saved['status'] === false) {
            return back()->with('error', $saved['message']);
        }

        return back()->with('success', $saved['message']);
    }
}
