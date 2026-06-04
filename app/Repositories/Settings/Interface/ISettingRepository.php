<?php

namespace App\Repositories\Settings\Interface;

use Illuminate\Http\Request;

interface ISettingRepository
{
    // General Setting
    public function getGenralSetting();

    public function updateGeneralSetting(Request $request);

    // Smtp Setting
    public function getSmtpSetting();

    public function updateSmtpSetting(Request $request);

    // Role Setting
    public function getAllRoles();

    public function getSingleRole($id);

    public function storeRole(Request $request);

    public function updateRole(Request $request, string $id);

    public function destroyRole(string $id);

    public function destroyRoleBySelection(Request $request);

    // Permission Settings
    public function getAllPermissions(Request $request);

    public function getSinglePermission($id);

    public function storePermission(Request $request);

    public function updatePermission(Request $request, string $id);

    public function destroyPermission(string $id);

    public function destroyPermissionBySelection(Request $request);

    public function getManageblePermissions(string $id);

    public function syncPermissions(Request $request, string $id);

    // Colors
    public function getAllColors();

    public function getSingleColor($id);

    public function storeColor(Request $request);

    public function updateColor(Request $request, string $id);

    public function destroyColor(string $id);

    public function destroyColorBySelection(Request $request);

    // Model Names
    public function getAllModelNames();

    public function getSingleModelName(string $id);

    public function storeModelName(Request $request);

    public function updateModelName(Request $request, string $id);

    public function destroyModelName(string $id);

    public function destroyModelNameBySelection(Request $request);

    // Capcacites
    public function getAllCapacities();

    public function getSingleCapacity(string $id);

    public function storeCapacity(Request $request);

    public function updateCapacity(Request $request, string $id);

    public function destroyCapacity(string $id);

    public function destroyCapacityBySelection(Request $request);

    // Storage Locations
    public function getAllStorageLocations();

    public function getSingleStorageLocation(string $id);

    public function storeStorageLocation(Request $request);

    public function updateStorageLocation(Request $request, string $id);

    public function destroyStorageLocation(string $id);

    public function destroyStorageLocationBySelection(Request $request);

    // Currencies

    public function getAllCurrencies();

    public function getSingleCurrency(string $id);

    public function storeCurrency(Request $request);

    public function updateCurrency(Request $request, string $id);

    public function destroyCurrency(string $id);

    public function destroyCurrencyBySelection(Request $request);

    public function toggleCurrencyStatus(string $id);

    // Additional Fees List

    public function getAllAdditionalFeeLists();

    public function getSingleAdditionalFeeList(string $id);

    public function storeAdditionalFeeList(Request $request);

    public function updateAdditionalFeeList(Request $request, string $id);

    public function destroyAdditionalFeeList(string $id);

    public function destroyAdditionalFeeListBySelection(Request $request);

    // Reward Setting

    public function getRewardPointSetting();

    public function updateRewardPointSetting(Request $request);

    // Commission Setting

    public function getAllCommissionSettings();

    public function getSingleCommissionSetting(string $id);

    public function storeCommissionSetting(Request $request);

    public function updateCommissionSetting(Request $request, string $id);

    public function destroyCommissionSetting(string $id);

    public function destroyCommissionSettingBySelection(Request $request);

    // COuntries Setting
    public function getAllCountries(Request $request);

    public function getSingleCountry(string $id);

    public function storeCountry(Request $request);

    public function updateCountry(Request $request, string $id);

    public function destroyCountry(string $id);

    public function destroyCountryBySelection(Request $request);

    // Special Country Settings
    public function getAllSpecialCountries(Request $request);

    public function getSingleSpecialCountry(string $id);

    public function storeSpecialCountry(Request $request);

    public function destroySpecialCountry(string $id);

    public function destroySpecialCountryBySelection(Request $request);

    public function getCountries();

    public function getCountriesForSaleForm(?int $smartphoneForSaleId = null);

    // AWS Settings
    public function getAllAwsSettings();

    public function getSingleAwsSetting(string $id);

    public function storeAwsSetting(Request $request);

    public function updateAwsSetting(Request $request, string $id);

    public function destroyAwsSetting(string $id);

    public function destroyAwsSettingBySelection(Request $request);

    public function toggleAwsSettingStatus(string $id);

    // Google Map Settings
    public function getAllGoogleMapSettings();

    public function getSingleGoogleMapSetting(string $id);

    public function storeGoogleMapSetting(Request $request);

    public function updateGoogleMapSetting(Request $request, string $id);

    public function destroyGoogleMapSetting(string $id);

    public function destroyGoogleMapSettingBySelection(Request $request);

    public function toggleGoogleMapSettingStatus(string $id);

    // Meta Settings
    public function getAllMetaSettings();

    public function getSingleMetaSetting(string $id);

    public function storeMetaSetting(Request $request);

    public function updateMetaSetting(Request $request, string $id);

    public function destroyMetaSetting(string $id);

    public function destroyMetaSettingBySelection(Request $request);

    public function toggleMetaSettingStatus(string $id);

    // NOWPayment Settings
    public function getAllNOWPaymentSettings();

    public function getSingleNOWPayemntSetting(string $id);

    public function storeNOWPaymentSetting(Request $request);

    public function updateNOWPaymentSetting(Request $request, string $id);

    public function destroyNOWPaymentSetting(string $id);

    public function destroyNOWPaymentSettingBySelection(Request $request);

    public function toggleNOWPaymentSettingStatus(string $id);

    // Return Policy Settings
    public function getAllReturnPolicies();

    public function getSingleReturnPolicy(string $id);

    public function storeReturnPolicy(Request $request);

    public function updateReturnPolicy(Request $request, string $id);

    public function toggleReturnPolicyStatus(string $id);

    public function destroyReturnPolicy(string $id);

    public function destroyReturnPolicyBySelection(Request $request);

    // Shipping Policy Settings
    public function getAllShippingPolicies();

    public function getSingleShippingPolicy(string $id);

    public function storeShippingPolicy(Request $request);

    public function updateShippingPolicy(Request $request, string $id);

    public function toggleShippingPolicyStatus(string $id);

    public function destroyShippingPolicy(string $id);

    public function destroyShippingPolicyBySelection(Request $request);

    // Terms Of Service Settings
    public function getAllTermsOfServices();

    public function getSingleTermsOfService(string $id);

    public function storeTermsOfService(Request $request);

    public function updateTermsOfService(Request $request, string $id);

    public function toggleTermsOfServiceStatus(string $id);

    public function destroyTermsOfService(string $id);

    public function destroyTermsOfServiceBySelection(Request $request);

    // Privacy Policy Settings
    public function getAllPrivacyPolicy();

    public function getSinglePrivacyPolicy(string $id);

    public function storePrivacyPolicy(Request $request);

    public function updatePrivacyPolicy(Request $request, string $id);

    public function togglePrivacyPolicyStatus(string $id);

    public function destroyPrivacyPolicy(string $id);

    public function destroyPrivacyPolicyBySelection(Request $request);

    // Courier Company Settings
    public function getAllCourierCompanies();

    public function getSingleCourierCompany(string $id);

    public function storeCourierCompany(Request $request);

    public function updateCourierCompany(Request $request, string $id);

    public function toggleCourierCompanyStatus(string $id);

    public function destroyCourierCompany(string $id);

    public function destroyCourierCompanyBySelection(Request $request);

    // Conditions Settings
    public function getAllConditions();

    public function getSingleCondition(string $id);

    public function storeCondition(Request $request);

    public function updateCondition(Request $request, string $id);

    public function toggleConditionStatus(string $id);

    public function destroyCondition(string $id);

    public function destroyConditionBySelection(Request $request);

    // Addons Settings
    public function getAllAddons();

    public function getSingleAddon(string $id);

    public function storeAddon(Request $request);

    public function updateAddon(Request $request, string $id);

    public function toggleAddonStatus(string $id);

    public function destroyAddon(string $id);

    public function destroyAddonBySelection(Request $request);

    // Dormancy Setting
    public function getDormancySetting();

    public function saveDormancySetting(Request $request);

    // Unsettled Account Notification Setting
    public function getUnsettledAccountsNotificationSettings();

    public function saveUnsettledAccountsNotificationSettings(Request $request);


    // Attribution Reward Setting
    public function getAttributionRewardSetting();
    public function saveAttributionRewardSetting(Request $request);
}
