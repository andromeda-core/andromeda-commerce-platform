<?php

use App\Http\Controllers\Dashboard\BatchController;
use App\Http\Controllers\Dashboard\BookmarkController;
use App\Http\Controllers\Dashboard\CategoryController;
use App\Http\Controllers\Dashboard\CollaboratorController;
use App\Http\Controllers\Dashboard\Commissions\CollaboratorCommissionController;
use App\Http\Controllers\Dashboard\Commissions\DistributorCommissionController;
use App\Http\Controllers\Dashboard\Commissions\SupplierCommissionController;
use App\Http\Controllers\Dashboard\CustomerController;
use App\Http\Controllers\Dashboard\DataDeletionRequestController;
use App\Http\Controllers\Dashboard\DistributorController;
use App\Http\Controllers\Dashboard\FloorController;
use App\Http\Controllers\Dashboard\HomeController;
use App\Http\Controllers\Dashboard\InventoryController;
use App\Http\Controllers\Dashboard\OrderController;
use App\Http\Controllers\Dashboard\PackageRecordingController;
use App\Http\Controllers\Dashboard\PostController;
use App\Http\Controllers\Dashboard\ProfileController;
use App\Http\Controllers\Dashboard\RewardPointController;
use App\Http\Controllers\Dashboard\SettingController;
use App\Http\Controllers\Dashboard\SmartphoneController;
use App\Http\Controllers\Dashboard\SmartphoneForSaleController;
use App\Http\Controllers\Dashboard\SupplierController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Website\BookmarkController as WebsiteBookmarkController;
use App\Http\Controllers\Website\CartController;
use App\Http\Controllers\Website\CheckoutController;
use App\Http\Controllers\Website\DataDeletionRequestController as WebsiteDataDeletionRequestController;
use App\Http\Controllers\Website\GlobalFilterController;
use App\Http\Controllers\Website\GlobalSearchController;
use App\Http\Controllers\Website\HomeController as WebsiteHomeController;
use App\Http\Controllers\Website\PostController as WebsitePostController;
use App\Http\Controllers\Website\PrivacyPolicyController;
use App\Http\Controllers\Website\ProductController;
use App\Http\Controllers\Website\ProfileController as WebsiteProfileController;
use Illuminate\Support\Facades\Route;

// Website Un Auth Routes
// Home
Route::get('/', [WebsiteHomeController::class, 'index'])->name('home');

Route::group(['as' => 'website.'], function () {
    // Posts
    Route::controller(WebsitePostController::class)->name('posts.')->group(function () {
        Route::get('/posts', 'index')->name('index');
        Route::get('/posts-getmore', 'getMorePosts')->name('getmore');
        Route::get('posts-getrelated/{slug?}', 'getRelatedPosts')->name('getrelated');
        Route::get('/posts-getsingle/{slug?}', 'getSinglePostBySlug')->name('getsingle');
        Route::put('/posts-bookmark', 'bookmark')->name('bookmark')->middleware('auth');
        Route::get('/hashtag/{hashtag?}', 'hashtagIndex')->name('hashtag.index');
        Route::post('/hashtag-results', 'hashtagResults')->name('hashtag-results');
    });

    // Global Search Route
    Route::controller(GlobalSearchController::class)->name('global-search.')->group(function () {
        Route::get('/global-search', 'index')->name('index');

        /**
         * @Perfect But Joseph Changed The Filter Logic
         */
        // Route::post('/global-search', 'search')->name('search');

        Route::post('/global-search-auto-completion', 'autoCompletion')->name('auto-completion');
        Route::post('/global-search-get-place-details', 'getPlaceDetails')->name('get-place-details');
        Route::match(['get', 'post'], 'global-search-results', 'results')->name('results');
        Route::get('/global-search-getmoreresults', 'getMoreResults')->name('getmoreresults');
        Route::delete('/global-search-search-session-destroy', 'searchSessionDestroy')->name('search-session-destroy');
        Route::delete('global-search-destroy-history', 'destroyHistory')->name('search-history-destroy');
    });

    // Global Filters
    Route::controller(GlobalFilterController::class)->name('global-filters.')->group(function () {
        Route::get('/global-filters', 'index')->name('index');
    });

    // Privacy Policy Route
    Route::get('/privacy-policy', PrivacyPolicyController::class)->name('privacy-policy.index');

    // Data Deletion Routes
    Route::controller(WebsiteDataDeletionRequestController::class)->middleware('auth')->name('data-deletion.')->group(function () {
        Route::get('/data-deletion', 'index')->name('index');
        Route::post('/data-deletion-store', 'store')->name('store');
    });

    // Bookmark Routes
    Route::controller(WebsiteBookmarkController::class)->middleware('auth')->name('bookmarks.')->group(function () {
        Route::get('/bookmarks', 'index')->name('index');
        Route::get('/bookmarks/get-bookmarked-posts', 'getBookmarkedPosts')->name('get-bookmarked-posts');
    });

    // Product Routes
    Route::controller(ProductController::class)->name('products.')->group(function () {
        Route::get('/products/get-single-smartphone/{slug?}', 'getSingleSmartphone')->name('get-single-smartphone');
    });

    // Cart Routes
    Route::controller(CartController::class)->middleware('auth')->name('carts.')->group(function () {
        Route::get('/cart', 'index')->name('index');
        Route::get('/cart-get-items', 'getCartItems')->name('get-cart-items');
        Route::get('/cart-get-items-count', 'getItemsCount')->name('get-items-count');
        Route::post('/cart/add-item', 'addItem')->name('add-item');
        Route::delete('/cart/remove-item', 'removeItem')->name('remove-item');
        Route::put('/cart/update-item', 'updateItem')->name('update-item');
        Route::post('/cart/referal-code', 'referalCode')->name('referal-code');
        Route::delete('/cart/remove-referal', 'removeReferal')->name('remove-referal');
    });

    // Checkout Routes

    Route::controller(CheckoutController::class)->middleware('auth')->name('checkout.')->group(function () {
        Route::get('/checkout', 'index')->name('index');
    });

    // Profile Routes
    Route::controller(WebsiteProfileController::class)->middleware('auth')->name('profile.')->group(function () {
        Route::get('/profile', 'index')->name('index');
        Route::put('/profile/details/update/{id?}', 'update')->name('update-profile');
        Route::put('profile/change-password/{id?}', 'changePassword')->name('change-password');
    });

});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', HomeController::class)->name('dashboard');

    // Dashboard Routes With Prefixed /dashboard and named as dashboard. to seprate Webiste and Dashboard Logics And routes
    Route::prefix('/dashboard')->name('dashboard.')->group(function () {

        // Posts / Blogs Routes
        Route::controller(PostController::class)->name('posts.')->group(function () {
            Route::get('/posts', 'index')->name('index');
            Route::get('/posts-create', 'create')->name('create');
            Route::post('/posts-store', 'store')->name('store');
            Route::get('/posts-edit/{slug?}', 'edit')->name('edit');
            Route::put('/posts-update/{slug?}', 'update')->name('update');
            Route::get('/posts-view/{slug?}', 'show')->name('show');
            Route::put('/posts-bookmarks-toggle', 'toggleBookmark')->name('bookmarks.toggle');
            Route::delete('/posts-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/posts-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');

            // Google Locaiton AutoCompletion Route  For Posts
            Route::post('/posts-google-location-autocomplete', 'googleLocationAutoComplete')->name('google.location.autocomplete');
            Route::post('/posts-google-location-place-details', 'googleLocationPlaceDetails')->name('google.location.placedetails');
        });

        // Floor Routes
        Route::controller(FloorController::class)->name('floors.')->group(function () {

            Route::get('/floors', 'index')->name('index');
            Route::get('/floors-create', 'create')->name('create');
            Route::post('/floors-store', 'store')->name('store');
            Route::get('/floors-edit/{id?}', 'edit')->name('edit');
            Route::put('/floors-update/{id?}', 'update')->name('update');
            Route::delete('/floors-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/floors-delete-by-selection', 'destroyBySelection')->name('destroybyselection');

        });

        // Bookmark Routes
        Route::controller(BookmarkController::class)->name('bookmarks.')->group(function () {
            Route::get('/bookmarks', 'index')->name('index');
            Route::put('/bookmarks-toggle', 'toggleBookmark')->name('toggle');
            Route::delete('/bookmarks-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/bookmarks-delete-by-selection', 'destroyBySelection')->name('destroybyselection');

        });

        // User Routes
        Route::controller(UserController::class)->name('users.')->group(function () {
            Route::get('/users', 'index')->name('index');
            Route::get('/users-create', 'create')->name('create');
            Route::post('/users-store', 'store')->name('store');
            Route::get('/users-edit/{id?}', 'edit')->name('edit');
            Route::put('/users-update/{id?}', 'update')->name('update');
            Route::get('/users-view/{id?}', 'show')->name('show');
            Route::delete('/users-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/users-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Supplier Routes
        Route::controller(SupplierController::class)->name('suppliers.')->group(function () {

            Route::get('/suppliers', 'index')->name('index');
            Route::get('/suppliers-create', 'create')->name('create');
            Route::post('/suppliers-store', 'store')->name('store');
            Route::get('/suppliers-edit/{id?}', 'edit')->name('edit');
            Route::put('/suppliers-update/{id?}', 'update')->name('update');
            Route::get('/suppliers-view/{id?}', 'show')->name('show');
            Route::delete('/suppliers-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/suppliers-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Collaborator Routes
        Route::controller(CollaboratorController::class)->name('collaborators.')->group(function () {

            Route::get('/collaborators', 'index')->name('index');
            Route::get('/collaborators-create', 'create')->name('create');
            Route::post('/collaborators-store', 'store')->name('store');
            Route::get('/collaborators-edit/{id?}', 'edit')->name('edit');
            Route::put('/collaborators-update/{id?}', 'update')->name('update');
            Route::get('/collaborators-view/{id?}', 'show')->name('show');
            Route::delete('/collaborators-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/collaborators-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Distributor Routes

        Route::controller(DistributorController::class)->name('distributors.')->group(function () {

            Route::get('/distributors', 'index')->name('index');
            Route::get('/distributors-create', 'create')->name('create');
            Route::post('/distributors-store', 'store')->name('store');
            Route::get('/distributors-edit/{id?}', 'edit')->name('edit');
            Route::put('/distributors-update/{id?}', 'update')->name('update');
            Route::get('/distributors-view/{id?}', 'show')->name('show');
            Route::delete('/distributors-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/distributors-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Customer Routes
        Route::controller(CustomerController::class)->name('customers.')->group(function () {

            Route::get('/customers', 'index')->name('index');
            Route::get('/customers-create', 'create')->name('create');
            Route::post('/customers-store', 'store')->name('store');
            Route::get('/customers-edit/{id?}', 'edit')->name('edit');
            Route::put('/customers-update/{id?}', 'update')->name('update');
            Route::get('/customers-view/{id?}', 'show')->name('show');
            Route::delete('/customers-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/customers-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Smart Phone Routes
        Route::controller(SmartphoneController::class)->name('smartphones.')->group(function () {

            Route::get('/smartphones', 'index')->name('index');
            Route::get('/smartphones-create', 'create')->name('create');
            Route::post('/smartphones-store', 'store')->name('store');
            Route::get('/smartphones-edit/{id?}', 'edit')->name('edit');
            Route::put('/smartphones-update/{id?}', 'update')->name('update');
            Route::get('/smartphones-view/{id?}', 'show')->name('show');
            Route::delete('/smartphones-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/smartphones-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Batch Routes
        Route::controller(BatchController::class)->name('batches.')->group(function () {

            Route::get('/batches', 'index')->name('index');
            Route::get('/batches-create', 'create')->name('create');
            Route::post('/batches-store', 'store')->name('store');
            Route::get('/batches-edit/{id?}', 'edit')->name('edit');
            Route::put('/batches-update/{id?}', 'update')->name('update');
            Route::delete('/batches-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/batches-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');

        });

        // Inventory Routes
        Route::controller(InventoryController::class)->name('inventories.')->group(function () {

            Route::get('/inventories', 'index')->name('index');
            Route::get('/inventories-edit/{id?}', 'edit')->name('edit');
            Route::put('/inventories-update/{id?}', 'update')->name('update');
            Route::delete('/inventories-destroy/{id?}', 'destroy')->name('destroy');
            Route::get('/inventories-get-smart-phone-by-upc/{upc}', 'getSmartPhoneByUpc')->name('getsmartphonebyupc');
            Route::delete('/inventories-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Order Routes
        Route::controller(OrderController::class)->name('orders.')->group(function () {

            Route::get('/orders', 'index')->name('index');
            Route::get('/orders-create', 'create')->name('create');
            Route::post('/orders-store', 'store')->name('store');
            Route::get('/orders-edit/{id?}', 'edit')->name('edit');
            Route::put('/orders-update/{id?}', 'update')->name('update');
            Route::get('/orders-view/{id?}', 'show')->name('show');
            Route::post('/order-package-recordings-store', 'packageRecordingStore')->name('packagerecordingstore');
            Route::delete('/orders-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/orders-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            Route::put('/orders-update-cash-collected-status/{id?}', 'updateCashCollectedStatus')->name('updatecashcollectedstatus');
        });

        // Package Recording Routes
        Route::controller(PackageRecordingController::class)->name('package-recordings.')->group(function () {

            Route::get('/package-recordings', 'index')->name('index');
            Route::get('/package-recordings-create', 'create')->name('create');
            Route::post('/package-recordings-store', 'store')->name('store');
            // Route::get('/package-recordings-edit/{id?}', 'edit')->name('edit');
            // Route::put('/package-recordings-update/{id?}', 'update')->name('update');
            Route::delete('/package-recordings-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/package-recordings-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Smartphone For Sale Routes
        Route::controller(SmartphoneForSaleController::class)->name('smartphone-for-sales.')->group(function () {

            Route::get('/smartphone-for-sales', 'index')->name('index');
            Route::get('/smartphone-for-sales-create', 'create')->name('create');
            Route::post('/smartphone-for-sales-store', 'store')->name('store');
            Route::get('/smartphone-for-sales-edit/{id?}', 'edit')->name('edit');
            Route::put('/smartphone-for-sales-update/{id?}', 'update')->name('update');
            Route::delete('/smartphone-for-sales-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/smartphone-for-sales-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Category Routes
        Route::controller(CategoryController::class)->name('categories.')->group(function () {

            Route::get('/categories', 'index')->name('index');
            Route::get('/categories-create', 'create')->name('create');
            Route::post('/categories-store', 'store')->name('store');
            Route::get('/categories-edit/{id?}', 'edit')->name('edit');
            Route::put('/categories-update/{id?}', 'update')->name('update');
            Route::get('/categories-view/{id?}', 'show')->name('show');
            Route::delete('/categories-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/categories-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Reward Point Routes
        Route::controller(RewardPointController::class)->name('reward-points.')->group(function () {

            Route::get('/reward-points', 'index')->name('index');
            Route::get('/reward-points-create', 'create')->name('create');
            Route::post('/reward-points-store', 'store')->name('store');
            Route::get('/reward-points-edit/{id?}', 'edit')->name('edit');
            Route::put('/reward-points-update/{id?}', 'update')->name('update');
            Route::delete('/reward-points-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/reward-points-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Commision Routes Group
        Route::prefix('/commissions')->name('commissions.')->group(function () {

            // Supplier Commission Route Group
            Route::controller(SupplierCommissionController::class)->name('supplier-commissions.')->group(function () {
                Route::get('/supplier-commissions', 'index')->name('index');
                Route::get('/supplier-commissions/{id?}', 'edit')->name('edit');
                Route::put('/supplier-commissions/{id?}', 'update')->name('update');
                Route::delete('/supplier-commissions/{id?}', 'destroy')->name('destroy');
                Route::delete('/supplier-commissions-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            });

            // Collaborator Commission Route Group
            Route::controller(CollaboratorCommissionController::class)->name('collaborator-commissions.')->group(function () {
                Route::get('/collaborator-commissions', 'index')->name('index');
                Route::get('/collaborator-commissions/{id?}', 'edit')->name('edit');
                Route::put('/collaborator-commissions/{id?}', 'update')->name('update');
                Route::delete('/collaborator-commissions/{id?}', 'destroy')->name('destroy');
                Route::delete('/collaborator-commissions-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            });

            // Distributor Commission Route Group
            Route::controller(DistributorCommissionController::class)->name('distributor-commissions.')->group(function () {
                Route::get('/distributor-commissions', 'index')->name('index');
                Route::get('/distributor-commissions/{id?}', 'edit')->name('edit');
                Route::put('/distributor-commissions/{id?}', 'update')->name('update');
                Route::delete('/distributor-commissions/{id?}', 'destroy')->name('destroy');
                Route::delete('/distributor-commissions-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            });
        });

        // Profile Routes
        Route::controller(ProfileController::class)->group(function () {
            Route::get('/profile', 'index')->name('profile.index');
            Route::put('/profile-update', 'updateProfile')->name('profile.update');
            Route::put('/profile-password-update', 'updatePassword')->name('profile.password.update');
            Route::delete('/profile/account-destroy', 'destroyAccount')->name('profile.account.destroy');
        });

        // Data Deletion Request Routes
        Route::controller(DataDeletionRequestController::class)->name('data-deletion-requests.')->group(function () {
            Route::get('/data-deletion-requests', 'index')->name('index');
        });

        // Setting Routes
        Route::controller(SettingController::class)->as('settings.')
            ->middleware(['permission:Settings View'])
            ->group(function () {
                Route::get('/settings', 'index')->name('index');

                // Prefixed As /settings On Grouped Routes
                Route::prefix('/settings')->group(function () {
                    // General Setting Routess
                    Route::get('/general-settings', 'generalSetting')->name('general.setting');
                    Route::put('/settings/general-settings-update', 'updateGeneralSetting')->name('general.setting.update');

                    // SMTP Setting Routes
                    Route::get('/smtp-settings', 'smtpSetting')->name('smtp.setting');
                    Route::put('/smtp-settings-update', 'updateSmtpSetting')->name('smtp.setting.update');

                    // Role Setting Routes
                    Route::get('/roles', 'roleIndex')->name('roles.index');
                    Route::get('/roles-create', 'roleCreate')->name('roles.create');
                    Route::post('/roles-store', 'roleStore')->name('roles.store');
                    Route::get('/roles-edit/{id?}', 'roleEdit')->name('roles.edit');
                    Route::put('/roles-update/{id?}', 'roleUpdate')->name('roles.update');
                    Route::delete('/roles-destroy/{id?}', 'roleDestroy')->name('roles.destroy');
                    Route::delete('/roles-destroy-by-selection', 'destroyRoleBySelection')->name('roles.destroybyselection');

                    if (app()->isLocal()) {

                        Route::get('/permissions', 'permissionsIndex')->name('permissions.index');
                        Route::get('/permissions-create', 'permissionCreate')->name('permissions.create');
                        Route::post('/permissions-store', 'permissionStore')->name('permissions.store');
                        Route::get('/permissions-edit/{id?}', 'permissionEdit')->name('permissions.edit');
                        Route::put('/permissions-update/{id?}', 'permissionUpdate')->name('permissions.update');
                        Route::delete('/permissions-destroy/{id?}', 'permissionDestroy')->name('permissions.destroy');
                        Route::delete('/permissions-destroy-by-selection', 'destroyPermissionBySelection')->name('permissions.destroybyselection');

                    }

                    Route::get('/permissions-manage/{id?}', 'permissionManage')->name('permissions.manage');
                    Route::put('/permissions-sync/{id?}', 'permissionSync')->name('permissions.sync');
                    // Color Routes
                    Route::get('/colors', 'colorIndex')->name('colors.index');
                    Route::get('/colors-create', 'colorCreate')->name('colors.create');
                    Route::post('/colors-store', 'colorStore')->name('colors.store');
                    Route::get('/colors-edit/{id?}', 'colorEdit')->name('colors.edit');
                    Route::put('/colors-update/{id?}', 'colorUpdate')->name('colors.update');
                    Route::delete('/colors-destroy/{id?}', 'colorDestroy')->name('colors.destroy');
                    Route::delete('/colors-destroy-by-selection', 'destroyColorBySelection')->name('colors.destroybyselection');

                    // Model Name Routes
                    Route::get('/model-names', 'modelNameIndex')->name('model_names.index');
                    Route::get('/model-names-create', 'modelNameCreate')->name('model_names.create');
                    Route::post('/model-names-store', 'modelNameStore')->name('model_names.store');
                    Route::get('/model-names-edit/{id?}', 'modelNameEdit')->name('model_names.edit');
                    Route::put('/model-names-update/{id?}', 'modelNameUpdate')->name('model_names.update');
                    Route::delete('/model-names-destroy/{id?}', 'modelNameDestroy')->name('model_names.destroy');
                    Route::delete('/model-names-destroy-by-selection', 'destroyModelNameBySelection')->name('model_names.destroybyselection');

                    // Capcaity Routes
                    Route::get('/capacities', 'capacityIndex')->name('capacities.index');
                    Route::get('/capacities-create', 'capacityCreate')->name('capacities.create');
                    Route::post('/capacities-store', 'capacityStore')->name('capacities.store');
                    Route::get('/capacities-edit/{id?}', 'capacityEdit')->name('capacities.edit');
                    Route::put('/capacities-update/{id?}', 'capacityUpdate')->name('capacities.update');
                    Route::delete('/capacities-destroy/{id?}', 'capacityDestroy')->name('capacities.destroy');
                    Route::delete('/capacities-destroy-by-selection', 'destroyCapacityBySelection')->name('capacities.destroybyselection');

                    // Storage Location Routes
                    Route::get('/storage-locations', 'storageLocationIndex')->name('storage_locations.index');
                    Route::get('/storage-locations-create', 'storageLocationCreate')->name('storage_locations.create');
                    Route::post('/storage-locations-store', 'storageLocationStore')->name('storage_locations.store');
                    Route::get('/storage-locations-edit/{id?}', 'storageLocationEdit')->name('storage_locations.edit');
                    Route::put('/storage-locations-update/{id?}', 'storageLocationUpdate')->name('storage_locations.update');
                    Route::delete('/storage-locations-destroy/{id?}', 'storageLocationDestroy')->name('storage_locations.destroy');
                    Route::delete('/storage-locations-destroy-by-selection', 'destroyStorageLocationBySelection')->name('storage_locations.destroybyselection');

                    // Currency Routes
                    Route::get('/currencies', 'currencyIndex')->name('currencies.index');
                    Route::get('/currencies-create', 'currencyCreate')->name('currencies.create');
                    Route::post('/currencies-store', 'currencyStore')->name('currencies.store');
                    Route::get('/currencies-edit/{id?}', 'currencyEdit')->name('currencies.edit');
                    Route::put('/currencies-update/{id?}', 'currencyUpdate')->name('currencies.update');
                    Route::put('/currencies-toggle/{id?}', 'toggleCurrencyStatus')->name('currencies.toggle');
                    Route::delete('/currencies-destroy/{id?}', 'currencyDestroy')->name('currencies.destroy');
                    Route::delete('/currencies-destroy-by-selection', 'destroycurrencyBySelection')->name('currencies.destroybyselection');

                    // Additional Fee List Routes
                    Route::get('/additional-fee-lists', 'additionalFeeListIndex')->name('additional_fee_lists.index');
                    Route::get('/additional-fee-lists-create', 'additionalFeeListCreate')->name('additional_fee_lists.create');
                    Route::post('/additional-fee-lists-store', 'additionalFeeListStore')->name('additional_fee_lists.store');
                    Route::get('/additional-fee-lists-edit/{id?}', 'additionalFeeListEdit')->name('additional_fee_lists.edit');
                    Route::put('/additional-fee-lists-update/{id?}', 'additionalFeeListUpdate')->name('additional_fee_lists.update');
                    Route::put('/additional-fee-lists-toggle/{id?}', 'toggleAdditionalFeeListStatus')->name('additional_fee_lists.toggle');
                    Route::delete('/additional-fee-lists-destroy/{id?}', 'additionalFeeListDestroy')->name('additional_fee_lists.destroy');
                    Route::delete('/additional-fee-lists-destroy-by-selection', 'destroyAdditionalFeeListBySelection')->name('additional_fee_lists.destroybyselection');

                    // Reward Setting Routes
                    Route::get('/reward-point-setting', 'rewardPointSettingIndex')->name('reward-point-setting.index');
                    Route::put('/reward-point-setting-update', 'rewardPointSettingUpdate')->name('reward-point-setting.update');

                    // Commission Setting Routes
                    Route::get('/commission-settings', 'commissionSettingIndex')->name('commission-settings.index');
                    Route::get('/commission-settings-create', 'commissionSettingCreate')->name('commission-settings.create');
                    Route::post('/commission-settings-store', 'commissionSettingStore')->name('commission-settings.store');
                    Route::get('/commission-settings-edit/{id?}', 'commissionSettingEdit')->name('commission-settings.edit');
                    Route::put('/commission-settings-update/{id?}', 'commissionSettingUpdate')->name('commission-settings.update');
                    Route::delete('/commission-settings-destroy/{id?}', 'destroyCommissionSetting')->name('commission-settings.destroy');
                    Route::delete('/commission-settings-destroy-by-selection', 'destroyCommissionSettingBySelection')->name('commission-settings.destroybyselection');

                    // Country Routes
                    Route::get('/countries', 'countryIndex')->name('countries.index');
                    Route::get('/countries-create', 'countryCreate')->name('countries.create');
                    Route::post('/countries-store', 'countryStore')->name('countries.store');
                    Route::get('/countries-edit/{id?}', 'countryEdit')->name('countries.edit');
                    Route::put('/countries-update/{id?}', 'countryUpdate')->name('countries.update');
                    Route::delete('/countries-destroy/{id?}', 'countryDestroy')->name('countries.destroy');
                    Route::delete('/countries-destroy-by-selection', 'countryDestroyBySelection')->name('countries.destroybyselection');

                    // Special Country Routes
                    Route::get('/special-countries', 'specialCountryIndex')->name('special-countries.index');
                    Route::get('/special-countries-create', 'specialCountryCreate')->name('special-countries.create');
                    Route::post('/special-countries-store', 'specialCountryStore')->name('special-countries.store');
                    Route::delete('/special-countries-destroy/{id?}', 'specialCountryDestroy')->name('special-countries.destroy');
                    Route::delete('/special-countries-destroy-by-selection', 'specialCountryDestroyBySelection')->name('special-countries.destroybyselection');

                    // AWS Setting Routes
                    Route::get('/aws-settings', 'awsSettingsIndex')->name('aws-settings.index');
                    Route::get('/aws-settings-create', 'awsSettingCreate')->name('aws-settings.create');
                    Route::post('/aws-settings-store', 'awsSettingStore')->name('aws-settings.store');
                    Route::get('/aws-settings-edit/{id?}', 'awsSettingEdit')->name('aws-settings.edit');
                    Route::put('/aws-settings-update/{id?}', 'awsSettingUpdate')->name('aws-settings.update');
                    Route::put('/aws-settings-toggle-status/{id?}', 'awsSettingToggleStatus')->name('aws-settings.toggle-status');
                    Route::delete('/aws-settings-destroy/{id?}', 'awsSettingDestroy')->name('aws-settings.destroy');
                    Route::delete('/aws-settings-destroy-by-selection', 'awsSettingDestroyBySelection')->name('aws-settings.destroybyselection');

                    // Google Map Setting Routes
                    Route::get('/google-map-settings', 'googleMapSettingsIndex')->name('google-map-settings.index');
                    Route::get('/google-map-settings-create', 'googleMapSettingCreate')->name('google-map-settings.create');
                    Route::post('/google-map-settings-store', 'googleMapSettingStore')->name('google-map-settings.store');
                    Route::get('/google-map-settings-edit/{id?}', 'googleMapSettingEdit')->name('google-map-settings.edit');
                    Route::put('/google-map-settings-update/{id?}', 'googleMapSettingUpdate')->name('google-map-settings.update');
                    Route::put('/google-map-settings-toggle-status/{id?}', 'googleMapSettingToggleStatus')->name('google-map-settings.toggle-status');
                    Route::delete('/google-map-settings-destroy/{id?}', 'googleMapSettingDestroy')->name('google-map-settings.destroy');
                    Route::delete('/google-map-settings-destroy-by-selection', 'googleMapSettingDestroyBySelection')->name('google-map-settings.destroybyselection');

                    // Meta Setting Routes
                    Route::get('/meta-settings', 'metaSettingsIndex')->name('meta-settings.index');
                    Route::get('/meta-settings-create', 'metaSettingCreate')->name('meta-settings.create');
                    Route::post('/meta-settings-store', 'metaSettingStore')->name('meta-settings.store');
                    Route::get('/meta-settings-edit/{id?}', 'metaSettingEdit')->name('meta-settings.edit');
                    Route::put('/meta-settings-update/{id?}', 'metaSettingUpdate')->name('meta-settings.update');
                    Route::put('/meta-settings-toggle-status/{id?}', 'metaSettingToggleStatus')->name('meta-settings.toggle-status');
                    Route::delete('/meta-settings-destroy/{id?}', 'metaSettingDestroy')->name('meta-settings.destroy');
                    Route::delete('/meta-settings-destroy-by-selection', 'metaSettingDestroyBySelection')->name('meta-settings.destroybyselection');

                });

            });
    });

    // Order Invoice Routes
    Route::controller(OrderController::class)->name('orders.')->group(function () {
        // Customer Order Invoice
        Route::get('/orders-customer-order-invoice/{order_no?}', 'customerOrderInvoice')->name('customer-order-invoice');

        // Shipping Invoice
        Route::get('/orders-shipping-invoice/{order_no?}', 'shippingInvoice')->name('shipping-invoice');
    });

});

// Dynamic Manifest JSON Route For PWA

Route::get('/pwa-manifest', function () {

    $general_setting = Cache::get('general_config');

    $name = $general_setting->app_name ?? config('app.name');
    $shortName = null;
    if (str_contains($name, ' ')) {
        // Name contains spaces → take first letter of each word
        $shortName = collect(explode(' ', $name))
            ->filter() // remove empty values
            ->map(fn ($word) => strtoupper(substr($word, 0, 1)))
            ->join('');
    } else {
        // No spaces → take all capital letters (e.g., YesBigShop → YBS)
        preg_match_all('/[A-Z]/', $name, $matches);
        $shortName = ! empty($matches[0])
            ? implode('', $matches[0])
            : strtoupper(substr($name, 0, 3));
    }

    $favicon = $general_setting->app_favicon ?? asset('assets/images/Logo/512512.png');

    $themeColor = '#f1f5f9';
    $backgroundColor = '#f1f5f9';

    $manifest = [
        'name' => $name,
        'short_name' => $shortName ?? $name,
        'description' => $general_setting->app_description ?? 'Shop smarter with YesBigShop — your modern global marketplace offering trending products, secure checkout, and fast delivery, all in one simple app.',
        'start_url' => '/',
        'display' => 'standalone',
        'theme_color' => $themeColor,
        'background_color' => $backgroundColor,
        'icons' => [
            [
                'src' => $favicon,
                'sizes' => '192x192',
                'type' => 'image/png',
            ],
            [
                'src' => $favicon,
                'sizes' => '512x512',
                'type' => 'image/png',
            ],
        ],
    ];

    return response($manifest, 200)
        ->header('Content-Type', 'application/manifest+json');

})->name('pwa.manifest');

require __DIR__.'/auth.php';
