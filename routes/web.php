<?php

use App\Http\Controllers\Dashboard\AccommodationDistributorController;
use App\Http\Controllers\Dashboard\AccommodationOperatorController;
use App\Http\Controllers\Dashboard\AdBannerController;
use App\Http\Controllers\Dashboard\AttributionRewardController;
use App\Http\Controllers\Dashboard\BatchController;
use App\Http\Controllers\Dashboard\BookmarkController;
use App\Http\Controllers\Dashboard\CategoryController;
use App\Http\Controllers\Dashboard\CollaboratorController;
use App\Http\Controllers\Dashboard\Commissions\CollaboratorCommissionController;
use App\Http\Controllers\Dashboard\Commissions\DistributorCommissionController;
use App\Http\Controllers\Dashboard\Commissions\LodgingCollaboratorCommissionController;
use App\Http\Controllers\Dashboard\Commissions\LodgingDistributorCommissionController;
use App\Http\Controllers\Dashboard\Commissions\LodgingPlatformCommissionController;
use App\Http\Controllers\Dashboard\Commissions\PlatformCommissionController;
use App\Http\Controllers\Dashboard\Commissions\SupplierCommissionController;
use App\Http\Controllers\Dashboard\CustomerController;
use App\Http\Controllers\Dashboard\DataDeletionRequestController;
use App\Http\Controllers\Dashboard\WholesaleDealerApplicationController;
use App\Http\Controllers\Dashboard\DistributorController;
use App\Http\Controllers\Dashboard\FloorController;
use App\Http\Controllers\Dashboard\HomeController;
use App\Http\Controllers\Dashboard\InternalProductImageController;
use App\Http\Controllers\Dashboard\InternalProductVideoController;
use App\Http\Controllers\Dashboard\InventoryController;
use App\Http\Controllers\Dashboard\InventoryVerificationController;
use App\Http\Controllers\Dashboard\LanguageController;
use App\Http\Controllers\Dashboard\LodgingProductController;
use App\Http\Controllers\Dashboard\LodgingReservationController;
use App\Http\Controllers\Dashboard\OrderAddressChangeRequestController;
use App\Http\Controllers\Dashboard\OrderCancelationRequestController;
use App\Http\Controllers\Dashboard\OrderController;
use App\Http\Controllers\Dashboard\OrderCourierCompanyController;
use App\Http\Controllers\Dashboard\OrderRefundController;
use App\Http\Controllers\Dashboard\PackageRecordingController;
use App\Http\Controllers\Dashboard\PostController;
use App\Http\Controllers\Dashboard\PriceRangeController;
use App\Http\Controllers\Dashboard\ProductLinkController;
use App\Http\Controllers\Dashboard\ProfileController;
use App\Http\Controllers\Dashboard\RewardPointController;
use App\Http\Controllers\Dashboard\RiskSignalController;
use App\Http\Controllers\Dashboard\SettingController;
use App\Http\Controllers\Dashboard\SmartphoneController;
use App\Http\Controllers\Dashboard\SmartphoneCountryPriceController;
use App\Http\Controllers\Dashboard\SmartphoneForSaleController;
use App\Http\Controllers\Dashboard\SupplierAssignedOrderController;
use App\Http\Controllers\Dashboard\SupplierController;
use App\Http\Controllers\Dashboard\SystemLogsController;
use App\Http\Controllers\Dashboard\TemplateController;
use App\Http\Controllers\Dashboard\TranslationController;
use App\Http\Controllers\Dashboard\TranslationKeyController;
use App\Http\Controllers\Dashboard\TranslationSystemController;
use App\Http\Controllers\Dashboard\UnsettledAccountController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\DeviceFingerPrintController;
use App\Http\Controllers\MetaController;
use App\Http\Controllers\OpenAiController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\Website\AdBannerController as WebsiteAdBannerController;
use App\Http\Controllers\Website\AttributionController;
use App\Http\Controllers\Website\BookmarkController as WebsiteBookmarkController;
use App\Http\Controllers\Website\CartController;
use App\Http\Controllers\Website\CheckoutController;
use App\Http\Controllers\Website\ContactController;
use App\Http\Controllers\Website\DataDeletionRequestController as WebsiteDataDeletionRequestController;
use App\Http\Controllers\Website\GlobalFilterController;
use App\Http\Controllers\Website\GlobalSearchController;
use App\Http\Controllers\Website\HomeController as WebsiteHomeController;
use App\Http\Controllers\Website\LodgingReservationController as WebsiteLodgingReservationController;
use App\Http\Controllers\Website\NotificationController;
use App\Http\Controllers\Website\OrderCancelationRequestController as WebsiteOrderCancelationRequestController;
use App\Http\Controllers\Website\OrderController as WebsiteOrderController;
use App\Http\Controllers\Website\PostController as WebsitePostController;
use App\Http\Controllers\Website\PrivacyPolicyController;
use App\Http\Controllers\Website\ProductController;
use App\Http\Controllers\Website\ProfileController as WebsiteProfileController;
use App\Http\Controllers\Website\ReturnPolicyController as WebsiteReturnPolicyController;
use App\Http\Controllers\Website\ShippingAddressController;
use App\Http\Controllers\Website\ShippingPolicyController;
use App\Http\Controllers\Website\ShopController;
use App\Http\Controllers\Website\StayController;
use App\Http\Controllers\Website\TermsOfServiceController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;

// Home
Route::get('/', [WebsiteHomeController::class, 'index'])->name('home');

// Customer Order Invoice View Route
Route::get('/orders-customer-order-invoice/{order_no?}', [OrderController::class, 'customerOrderInvoice'])->name('orders.customer-order-invoice');

// Website Un Auth Routes
Route::group(['as' => 'website.'], function () {

    // canonical routes
    Route::get('/post/{public_id}/{slug?}', function ($public_id, $slug = null) {
        // $query = array_filter([
        //     'public_id'     =>  $public_id,
        //     'slug'          =>  $slug,
        //     'direct'      => 'true',
        //     'single_page' => 'true',
        //     // 'planet'        => request('planet'),
        //     // 'lat'           => request('lat'),
        //     // 'lng'           => request('lng'),
        //     // 'location_name' => request('location_name'),
        //     // 'timestamp'     => request('timestamp'),
        //     // 'floor'         => request('floor'),
        // ]);

        // $url = url('/') . '?' . http_build_query($query);

        $previous_url = url()->previous();

        if (! Str::of($previous_url)->contains('shop') && ! Str::of($previous_url)->contains('bookmarks') && ! Str::of($previous_url)->contains('stay')) {
            $previous_url = null;
        }

        return Inertia::render('Website/Home/index', [
            'previous_url' => $previous_url,
            'direct_post' => [
                'public_id' => $public_id,
                'slug' => $slug,
            ],
        ]);

        // return redirect()->to($url, 301);
    })->name('post.findByPublicId');

    Route::get('/product/{public_id}/{slug?}', function ($public_id, $slug = null) {
        // $query = array_filter([
        //     'm-public_id' => $public_id,
        //     'm-slug'      => $slug,
        // ]);
        // $query['direct'] = 'true';
        // $query['single_page'] = 'true';

        // $url = url('/') . '?' . http_build_query($query);

        $previous_url = url()->previous();

        if (! Str::of($previous_url)->contains('shop') && ! Str::of($previous_url)->contains('bookmarks') && ! Str::of($previous_url)->contains('stay')) {
            $previous_url = null;
        }

        return Inertia::render('Website/Home/index', [
            'previous_url' => $previous_url,
            'direct_smartphone' => [
                'public_id' => $public_id,
                'slug' => $slug,
            ],
        ]);

        // return redirect()->to($url, 301);
    })->name('product.findByPublicId');

    // Stage 3.2 — public lodging property canonical route (renders the feed with a direct_lodging deep-link).
    Route::get('/lodging/{public_id}/{slug?}', function ($public_id, $slug = null) {
        $product = \App\Models\LodgingProduct::where('public_id', $public_id)
            ->where('is_active', true)
            ->first(['id', 'public_id', 'slug']);

        if (! $product) {
            abort(404);
        }

        // 301 redirect to the canonical URL when the slug is missing or wrong.
        if ($slug !== $product->slug) {
            return redirect()->route('website.lodging.findByPublicId', [
                'public_id' => $product->public_id,
                'slug' => $product->slug,
            ], 301);
        }

        $previous_url = url()->previous();
        if (! Str::of($previous_url)->contains('shop') && ! Str::of($previous_url)->contains('bookmarks') && ! Str::of($previous_url)->contains('stay')) {
            $previous_url = null;
        }

        return Inertia::render('Website/Home/index', [
            'previous_url' => $previous_url,
            'direct_lodging' => [
                'public_id' => $product->public_id,
                'slug' => $product->slug,
            ],
        ]);
    })->name('lodging.findByPublicId');

    // Posts
    Route::controller(WebsitePostController::class)->name('posts.')->group(function () {
        Route::get('/posts', 'index')->name('index');
        Route::get('/posts-getmore', 'getMorePosts')->name('getmore');
        Route::get('posts-getrelated/{slug?}', 'getRelated')->name('getrelated');
        Route::get('/posts-getsingle/{public_id?}/{slug?}', 'getSinglePostBySlug')->name('getsingle');
        Route::put('/posts-bookmark', 'bookmark')->name('bookmark')->middleware('auth');
        Route::get('/hashtag/{hashtag?}', 'hashtagIndex')->name('hashtag.index');
        Route::post('/hashtag-results', 'hashtagResults')->name('hashtag-results');
    });

    // Global Language Route
    Route::get('/languages-translations-get-all-json', [LanguageController::class, 'getAllLanguagesAndTranslationsJson'])->name('languages-translations.getalljson');
    Route::post('/languages-set-language', [LanguageController::class, 'setLanguage'])->name('languages.set-language');

    // Currency Switcher Routes — no auth, visitors can switch too
    // The cookie drives CurrencyResolverService priority 1 (display-only, no financial effect).
    Route::post('/currency/switch', \App\Http\Controllers\Website\CurrencySwitcherController::class)->name('currency.switch');
    Route::post('/currency/reset', [\App\Http\Controllers\Website\CurrencySwitcherController::class, 'reset'])->name('currency.reset');

    // Global Search Route
    Route::controller(GlobalSearchController::class)->name('global-search.')->group(function () {
        Route::match(['get', 'post'], '/global-search', 'index')->name('index');

        /**
         * @Perfect But Joseph Changed The Filter Logic
         */
        // Route::post('/global-search', 'search')->name('search');

        Route::post('/global-search-auto-completion', 'autoCompletion')->name('auto-completion');
        Route::post('/global-search-get-place-details', 'getPlaceDetails')->name('get-place-details');
        Route::get('/global-search-getmoreresults', 'getMoreResults')->name('getmoreresults');
        // Route::delete('/global-search-search-session-destroy', 'searchSessionDestroy')->name('search-session-destroy');
        Route::delete('global-search-destroy-history', 'destroyHistory')->name('search-history-destroy');
        Route::get('/global-search-history-results', 'getSearchHistoryResults')->name('history-results');
        Route::get('/global-search-history-results-getmore', 'getSearchHistoryResultsGetMore')->name('history-results-getmore');
        Route::get('/global-search-get-history-result', 'getSingleHistoryResults')->name('get-history-result');
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
        Route::delete('/bookmarks-destroy', 'destroyBookmark')->name('destroy');
    });

    // Product Routes
    Route::controller(ProductController::class)->name('products.')->group(function () {
        Route::get('/products/get-single-smartphone/{public_id?}/{slug?}', 'getSingleSmartphone')->name('get-single-smartphone');
        Route::get('/products/preview/{public_id}', 'getProductPreview')->name('preview');

        // Stage 3.2 — single lodging property for the feed (client-side direct_lodging fetch).
        Route::get('/products/get-single-lodging/{public_id?}/{slug?}', 'getSingleLodgingForFeed')->name('get-single-lodging');
    });

    // Ad Banner Preview Route (public, no auth — needed so the ad-banner embed marker can
    // hydrate on posts visible to guests; mirrors the Product preview route above exactly).
    Route::controller(WebsiteAdBannerController::class)->name('ad-banners.')->group(function () {
        Route::get('/ad-banners/preview/{public_id}', 'preview')->name('preview');
    });

    // Cart Routes
    Route::controller(CartController::class)->middleware('auth')->name('carts.')->group(function () {
        Route::get('/cart', 'index')->name('index');
        Route::get('/cart-get-items', 'getCartItems')->name('get-cart-items');
        Route::get('/cart-get-items-count', 'getItemsCount')->name('get-items-count');
        Route::post('/cart/add-item', 'addItem')->name('add-item');
        Route::delete('/cart/remove-item', 'removeItem')->name('remove-item');
        Route::put('/cart/update-item', 'updateItem')->name('update-item');
        Route::put('/cart/update-smartphone-addon-item', 'updateSmartphoneAddonItem')->name('update-smartphone-addon-item');
        Route::delete('/cart/remove-smartphone-addon-item', 'removeSmartphoneAddonItem')->name('remove-smartphone-addon-item');
        Route::post('/cart/referal-code', 'referalCode')->name('referal-code');
        Route::delete('/cart/remove-referal', 'removeReferal')->name('remove-referal');
        Route::post('/cart-item-buy-now', 'buyNow')->name('buy-now');
    });

    // Checkout Routes
    Route::controller(CheckoutController::class)->middleware('auth')->name('checkout.')->group(function () {
        Route::post('/checkout/single-product-checkout-sesson-store', 'singleProductCheckoutSessionStore')->name('single-product-checkout-session_store');
        Route::get('/checkout', 'index')->name('index');
        Route::post('/checkout', 'store')->name('store');
        Route::get('/checkout/crypto/success', 'cryptoPaymentSuccess')->name('crypto-payment-success');
        // Route::get('/checkout/crypto/cancel', 'cryptoPaymentCancel')->name('crypto-payment-cancel');
        // Route::post('/checkout/crypto/ipn', 'cryptoPaymentIpn')->name('crypto-payment-ipn');

    });

    // Order Routes
    Route::controller(WebsiteOrderController::class)->middleware('auth')->name('orders.')->group(function () {
        Route::get('/orders', 'index')->name('index');
        Route::get('/orders/order-view/{order_no?}', 'show')->name('order-view');
        Route::get('/orders/{order_no?}/refund', 'refundIndex')->name('refund.index');
        Route::post('/orders/{order_no?}/refund', 'refundRequestStore')->name('refund.request.store');
        Route::get('/orders/{order_no?}/shipping-address-change-request', 'shippingAddressChangeRequestIndex')->name('address-change-request.index');
        Route::post('/orders/{order_no?}/shipping-address-change-request', 'shippingAddressChangeRequestStore')->name('address-change-request.store');
        Route::post('/orders/upload-payment-proof', 'uploadPaymentProof')->name('upload-payment-proof');
        Route::post('/orders/mark-packaging-video-viewed', 'markPackagingVideoViewed')->name('mark-packaging-video-viewed');
        Route::post('/orders/pay-now', 'payNow')->name('pay-now');
        Route::post('/orders/address-change/withdrawl', 'addressChangeWithdrawl')->name('address-change.withdrawl');
        Route::post('/orders/refund/withdrawl', 'refundWithdrawl')->name('refund.withdrawl');
        Route::post('/orders/re-order', 'reOrder')->name('re-order');
        Route::post('/orders/verify-imei', 'verifyOrderProduct')->name('verify');
        Route::post('/orders/{order_no}/refund/upload-tracking-slip', 'uploadReturnTrackingSlip')->name('refund.upload-tracking-slip');
    });

    // Lodging Reservation Routes (customer-facing). No UI here — Stage 3 wires the product page.
    Route::controller(WebsiteLodgingReservationController::class)->middleware('auth')->name('lodging-reservations.')->group(function () {
        Route::post('/lodging-reservations-store', 'store')->name('store');

        // Referral fix — "Apply" preview (lookup + points preview only, correctly spelled
        // referral-code; no session/cart state like the phone side's referal-code endpoint).
        Route::post('/lodging-reservations-referral-code', 'previewReferralCode')->name('referral-code');

        // Stage 2.4 Fix 2 — NOWPayments success_url landing (read-only, status-aware).
        Route::get('/lodging-reservations/payment-success/{reservation_no?}', 'paymentSuccess')->name('payment-success');

        // Stage 3.1 — customer My Reservations (list + detail). Read-only, customer-scoped.
        Route::get('/reservations', 'index')->name('index');
        Route::get('/reservations/{reservation_no}', 'show')->name('show');
    });

    // Profile Routes
    Route::controller(WebsiteProfileController::class)->middleware('auth')->name('profile.')->group(function () {
        Route::get('/profile', 'index')->name('index');
        Route::put('/profile/details/update/{id?}', 'update')->name('update-profile');
        Route::put('profile/change-password/{id?}', 'changePassword')->name('change-password');
        Route::put('/profile/upload-profile', 'uploadProfilePicture')->name('upload-profile-picture');

        // Active Dormant Account Routes
        Route::get('/profile/activate-dormant-account', 'activateDormantAccountIndex')->name('activate-dormant-account.index');
        Route::put('/profile/activate-dormant-account', 'activateDormantAccountActive')->name('activate-dormant-account.active');

        // Active Deactivated Account Routes
        Route::get('/profile/activate-deactive-account', 'activateDeactiveAccountIndex')->name('activate-deactive-account.index');
        Route::put('/profile/activate-deactive-account', 'activateDeactiveAccountActive')->name('activate-deactive-account.active');

        // Suspend Account Route
        Route::get('/profile/suspend-account', 'suspendAccountIndex')->name('suspend-account.index');

        // Email Change Verification Route
        Route::get('/profile/email-change/verify/{token?}', 'emailChangeVerify')->name('email-change.verify');
    });

    // Contact Us Routes
    Route::controller(ContactController::class)->name('contact.')->group(function () {
        Route::get('/contact', 'index')->name('index');
        Route::post('/contact-store', 'store')->name('store');
    });

    // Collaborator application (public, native page, emails to verification@andromeda.blue)
    Route::get('/collaborator-application', [\App\Http\Controllers\Website\CollaboratorApplicationController::class, 'index'])
        ->name('collaborator-application.index');

    Route::post('/collaborator-application', [\App\Http\Controllers\Website\CollaboratorApplicationController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('collaborator-application.store');

    // Wholesale Dealer application (public, native page; persisted + emails to verification@andromeda.blue)
    Route::get('/wholesale-dealer-application', [\App\Http\Controllers\Website\WholesaleDealerApplicationController::class, 'index'])
        ->name('wholesale-dealer-application.index');

    Route::post('/wholesale-dealer-application', [\App\Http\Controllers\Website\WholesaleDealerApplicationController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('wholesale-dealer-application.store');

    // Notification Routes
    Route::controller(NotificationController::class)->middleware('auth')->name('notifications.')->group(function () {
        Route::get('/notifications', 'index')->name('index');
        Route::put('/notifications/mark-as-seen/{id?}', 'markNotificationAsSeen')->name('mark-as-seen');
        Route::put('/notifications/mark-all-as-seen/{id?}', 'markAllNotificationsAsSeen')->name('mark-all-as-seen');
        Route::delete('/notifications/destroy/{id?}', 'destroyNotification')->name('destroy');
    });

    // Shipping Address Routes
    Route::resource('/shipping-addresses', ShippingAddressController::class)->except(['show', 'edit', 'create']);
    Route::put('/shipping-address-status-toggle/{id?}', [ShippingAddressController::class, 'toggleStatus'])->name('shipping-addresses.toggle-status');
    Route::post('/shipping-address-store-from-profile', [ShippingAddressController::class, 'storeShippingAddressFromProfile'])->name('shipping-addresses.store.from-profile');

    // Order Cancelation Routes
    Route::get('/order-cancelation-request/{order_no?}', [WebsiteOrderCancelationRequestController::class, 'index'])->name('order-cancelation.index');
    Route::post('/order-cancelation-request/{order_no?}', [WebsiteOrderCancelationRequestController::class, 'store'])->name('order-cancelation.store');
    Route::post('/order/cancelation/withdrwal-request', [WebsiteOrderCancelationRequestController::class, 'widthdrawal'])->name('order-cancelation.withdrawl');

    // Return Policy Routes
    Route::get('/return-policy/{slug?}/{smartphone_slug?}', WebsiteReturnPolicyController::class)->name('return-policy.index');

    // Shipping Policy
    Route::get('/shipping-policy/{slug?}/{smartphone_slug?}', ShippingPolicyController::class)->name('shipping-policy.index');

    // Terms Of Service Route
    Route::get('/terms-of-service', TermsOfServiceController::class)->name('terms-of-service.index');

    // Shop Routes
    Route::match(['get', 'post'], '/shop', ShopController::class)->name('shop.index');
    Route::get('/shop/loadMore', [ShopController::class, 'loadMore'])->name('shop.loadMore');

    // Stay Routes (public lodging browse grid; mirrors Shop)
    Route::match(['get', 'post'], '/stay', StayController::class)->name('stay.index');
    Route::get('/stay/loadMore', [StayController::class, 'loadMore'])->name('stay.loadMore');

    // Link Route
    Route::get('/link/{public_id?}', [AttributionController::class, 'entry'])->name('link.index');
});

// Dashboard Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', HomeController::class)->name('dashboard');
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

            // NEW (additive): AI translation generator endpoint (gated in PostController::middleware()).
            Route::post('/posts-ai-translate-field', 'aiTranslateField')->name('ai-translate-field');

            // NEW (additive): reverse AI translation endpoint — source language -> English.
            // DEVIATION from the requested snippet: this group already applies the ->name('posts.')
            // prefix (under a parent 'dashboard.' group), so the SHORT name below resolves to the
            // intended full name 'dashboard.posts.ai-translate-to-english'. Using the full name here
            // would double-prefix it. Gated in PostController::middleware().
            Route::post('/posts-ai-translate-to-english', 'aiTranslateToEnglish')->name('ai-translate-to-english');
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
            Route::get('/admin-staff-users', 'index')->name('index');
            Route::get('/admin-staff-users-create', 'create')->name('create');
            Route::post('/admin-staff-users-store', 'store')->name('store');
            Route::get('/admin-staff-users-edit/{id?}', 'edit')->name('edit');
            Route::put('/admin-staff-users-update/{id?}', 'update')->name('update');
            Route::get('/admin-staff-users-view/{id?}', 'show')->name('show');
            Route::delete('/admin-staff-users-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/admin-staff-users-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
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

        // Accommodation Operator Routes
        Route::controller(AccommodationOperatorController::class)->name('accommodation-operators.')->group(function () {

            Route::get('/accommodation-operators', 'index')->name('index');
            Route::get('/accommodation-operators-create', 'create')->name('create');
            Route::post('/accommodation-operators-store', 'store')->name('store');
            Route::get('/accommodation-operators-edit/{id?}', 'edit')->name('edit');
            Route::put('/accommodation-operators-update/{id?}', 'update')->name('update');
            Route::delete('/accommodation-operators-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/accommodation-operators-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Accommodation Distributor Routes
        Route::controller(AccommodationDistributorController::class)->name('accommodation-distributors.')->group(function () {

            Route::get('/accommodation-distributors', 'index')->name('index');
            Route::get('/accommodation-distributors-create', 'create')->name('create');
            Route::post('/accommodation-distributors-store', 'store')->name('store');
            Route::get('/accommodation-distributors-edit/{id?}', 'edit')->name('edit');
            Route::put('/accommodation-distributors-update/{id?}', 'update')->name('update');
            Route::delete('/accommodation-distributors-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/accommodation-distributors-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
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
            Route::put('/smartphones-toggle-sold-out/{id?}', 'toggleSoldOut')->name('toggle-sold-out');
            Route::delete('/smartphones-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/smartphones-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Lodging Product Routes
        Route::controller(LodgingProductController::class)->name('lodging-products.')->group(function () {

            Route::get('/lodging-products', 'index')->name('index');
            Route::get('/lodging-products-create', 'create')->name('create');
            Route::post('/lodging-products-store', 'store')->name('store');
            Route::get('/lodging-products-edit/{id?}', 'edit')->name('edit');
            Route::put('/lodging-products-update/{id?}', 'update')->name('update');
            // Owner-controlled per-property distributor management toggle (mirrors the
            // smartphones toggle-sold-out route naming/style).
            Route::put('/lodging-products-toggle-distributor-management/{id?}', 'toggleAccommodationDistributorManagement')->name('toggle-distributor-management');
            Route::get('/lodging-products-view/{id?}', 'show')->name('show');
            Route::delete('/lodging-products-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/lodging-products-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');

            // Google Location Routes For Lodging Products (delegate to the shared GoogleGeoCoderService)
            Route::post('/lodging-products-google-location-autocomplete', 'googleLocationAutocomplete')->name('google.location.autocomplete');
            Route::post('/lodging-products-google-location-place-details', 'googleLocationPlaceDetails')->name('google.location.placedetails');
        });

        // Lodging Reservation Routes (operator visibility — list + detail). Approve/reject is Stage 2.3.
        Route::controller(LodgingReservationController::class)->name('lodging-reservations.')->group(function () {
            Route::get('/lodging-reservations', 'index')->name('index');
            Route::get('/lodging-reservations-view/{identifier?}', 'show')->name('show');

            // Operator actions (Stage 2.3) — gated by 'Lodging Reservations Edit'.
            Route::post('/lodging-reservations-approve/{identifier?}', 'approve')->name('approve');
            Route::post('/lodging-reservations-reject/{identifier?}', 'reject')->name('reject');
            Route::post('/lodging-reservations-suggest/{identifier?}', 'suggestAlternative')->name('suggest');
            Route::post('/lodging-reservations-note/{identifier?}', 'addNote')->name('note');
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

        // Template Routes
        Route::controller(TemplateController::class)->name('templates.')->group(function () {

            Route::get('/templates', 'index')->name('index');
            Route::get('/templates-create', 'create')->name('create');
            Route::post('/templates-store', 'store')->name('store');
            Route::get('/templates-edit/{id?}', 'edit')->name('edit');
            Route::put('/templates-update/{id?}', 'update')->name('update');
            Route::delete('/templates-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/templates-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');

            // NEW (Phase 2): AI translation generator endpoint (gated in TemplateController::middleware()).
            Route::post('/templates-ai-translate-field', 'aiTranslateField')->name('ai-translate-field');
        });

        // Ad Banner Routes
        Route::controller(AdBannerController::class)->name('ad-banners.')->group(function () {

            Route::get('/ad-banners', 'index')->name('index');
            Route::get('/ad-banners-create', 'create')->name('create');
            Route::post('/ad-banners-store', 'store')->name('store');
            Route::get('/ad-banners-edit/{id?}', 'edit')->name('edit');
            Route::put('/ad-banners-update/{id?}', 'update')->name('update');
            Route::delete('/ad-banners-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/ad-banners-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
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

        Route::resource('/smartphone-country-prices', SmartphoneCountryPriceController::class)->except(['show']);
        Route::delete('/smartphone-country-prices/destroy-by-selection', [SmartphoneCountryPriceController::class, 'destroyBySelection'])->name('smartphone-country-prices.destroybyselection');

        // Inventory Verification Routes
        Route::controller(InventoryVerificationController::class)->name('inventory-verifications.')->middleware(['permission:Inventories Verification'])->group(function () {
            Route::get('/inventory-verifications', 'index')->name('index');
            Route::get('/inventory-verifications-create', 'create')->name('create');
            Route::post('/inventory-verifications-store', 'store')->name('store');
            Route::post('/inventory-verifications-verify', 'verify')->name('verify');
        });

        // Order Routes
        Route::controller(OrderController::class)->name('orders.')->group(function () {

            Route::get('/orders', 'index')->name('index');
            Route::get('/orders-create', 'create')->name('create');
            // Route::post('/orders-store', 'store')->name('store');
            Route::get('/orders-edit/{id?}', 'edit')->name('edit');
            Route::put('/orders-update/{id?}', 'update')->name('update');
            Route::get('/orders-view/{id?}', 'show')->name('show');
            Route::get('/orders-view-by-order_no/{order_no?}', 'showByOrderNo')->name('show.by_order_no');
            Route::post('/order-package-recordings-store', 'packageRecordingStore')->name('packagerecordingstore');
            Route::delete('/orders-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/orders-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            Route::put('/orders-update-cash-collected-status/{id?}', 'updateCashCollectedStatus')->name('updatecashcollectedstatus');
            Route::get('/orders-assign-supplier/{order_id?}', 'assignSupplierIndex')->name('assignsupplier.index');
            Route::post('/orders-assign-supplier', 'assignSupplier')->name('assignsupplier');
            Route::put('/orders-cancel', 'orderCancelation')->name('cancel');
            Route::post('/orders/verify', 'orderSecondaryVerification')->name('verify');
            Route::get('/orders/shipping-label/{id?}', 'shippingLabelsIndex')->name('shipping-label');
        });

        // Order Courier Company Routes
        Route::resource('order-courier-companies', OrderCourierCompanyController::class)
            ->except(['show']);
        Route::put('order-courier-companies/{id}/toggle-status', [OrderCourierCompanyController::class, 'toggleStatus'])
            ->name('order-courier-companies.toggle-status');
        Route::delete('order-courier-companies-destroy-by-selection', [OrderCourierCompanyController::class, 'destroyBySelection'])
            ->name('order-courier-companies.destroyBySelection');

        // Supplier Assigned Order Routes
        Route::controller(SupplierAssignedOrderController::class)->name('supplier-assigned-orders.')->group(function () {
            Route::get('/supplier-assigned-orders', 'index')->name('index');
            Route::get('/supplier-assigned-orders/fulfill/{id?}', 'fulfillOrderIndex')->name('fulfill');
            Route::post('/supplier-assigned-orders/fulfill/{id?}', 'fulfillOrder')->name('fulfill.store');
            Route::post('/supplier-assigned-orders/fulfill/{id}/save-draft', 'saveDraft')->name('fulfill.save-draft');
            Route::post('supplier-assigned-orders/{id}/log', 'addLog')->name('log.store');
        });

        // Order Refund Routes
        Route::controller(OrderRefundController::class)->name('order-refunds.')->group(function () {
            Route::get('/order-refunds', 'index')->name('index');
            Route::get('/order-refunds-edit/{id?}', 'edit')->name('edit');
            Route::put('/order-refunds-update/{id?}', 'update')->name('update');
        });

        // Order Address Change Request Routes
        Route::controller(OrderAddressChangeRequestController::class)->name('order-address-change-requests.')->group(function () {
            Route::get('/order-address-change-requests', 'index')->name('index');
            Route::get('/order-address-change-requests-edit/{id?}', 'edit')->name('edit');
            Route::put('/order-address-change-requests-update/{id?}', 'update')->name('update');
        });

        // Package Recording Routes
        Route::controller(PackageRecordingController::class)->name('package-recordings.')->group(function () {

            Route::get('/package-recordings', 'index')->name('index');
            Route::get('/package-recordings-create', 'create')->name('create');
            Route::post('/package-recordings-store', 'store')->name('store');
            Route::put('/package-recordings-toggle/{id?}', 'toggle')->name('toggle');
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

            // Platform Commission Route Group
            Route::controller(PlatformCommissionController::class)->name('platform-commissions.')->group(function () {
                Route::get('/platform-commissions', 'index')->name('index');
                Route::get('/platform-commissions/{id?}', 'edit')->name('edit');
                Route::put('/platform-commissions/{id?}', 'update')->name('update');
                Route::delete('/platform-commissions/{id?}', 'destroy')->name('destroy');
                Route::delete('/platform-commissions-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            });
        });

        // Accommodation Commissions Route Group (Phase 3 — isolated from the phone commissions above)
        Route::prefix('/accommodation-commissions')->name('accommodation-commissions.')->group(function () {

            // Accommodation Distributor Commission Route Group
            Route::controller(LodgingDistributorCommissionController::class)->name('distributor-commissions.')->group(function () {
                Route::get('/lodging-distributor-commissions', 'index')->name('index');
                Route::get('/lodging-distributor-commissions/{id?}', 'edit')->name('edit');
                Route::put('/lodging-distributor-commissions/{id?}', 'update')->name('update');
                Route::delete('/lodging-distributor-commissions/{id?}', 'destroy')->name('destroy');
                Route::delete('/lodging-distributor-commissions-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            });

            // Accommodation Platform Commission Route Group
            Route::controller(LodgingPlatformCommissionController::class)->name('platform-commissions.')->group(function () {
                Route::get('/lodging-platform-commissions', 'index')->name('index');
                Route::get('/lodging-platform-commissions/{id?}', 'edit')->name('edit');
                Route::put('/lodging-platform-commissions/{id?}', 'update')->name('update');
                Route::delete('/lodging-platform-commissions/{id?}', 'destroy')->name('destroy');
                Route::delete('/lodging-platform-commissions-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            });

            // Accommodation Collaborator Commission Route Group (rows populate in Phase 4)
            Route::controller(LodgingCollaboratorCommissionController::class)->name('collaborator-commissions.')->group(function () {
                Route::get('/lodging-collaborator-commissions', 'index')->name('index');
                Route::get('/lodging-collaborator-commissions/{id?}', 'edit')->name('edit');
                Route::put('/lodging-collaborator-commissions/{id?}', 'update')->name('update');
                Route::delete('/lodging-collaborator-commissions/{id?}', 'destroy')->name('destroy');
                Route::delete('/lodging-collaborator-commissions-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
            });
        });

        // Profile Routes
        Route::controller(ProfileController::class)->group(function () {
            Route::get('/profile', 'index')->name('profile.index');
            Route::put('/profile-update', 'updateProfile')->name('profile.update');
            Route::put('/profile-password-update', 'updatePassword')->name('profile.password.update');
            Route::delete('/profile/account-destroy', 'destroyAccount')->name('profile.account.destroy');
        });

        // System Logs System
        Route::controller(SystemLogsController::class)->name('system-logs.')->prefix('/system-logs')->group(function () {
            Route::get('/', 'index')->name('index');

            Route::get('/email-change-logs', 'emailChangeLogs')->name('email-change-logs.index');
            Route::get('/shipping-address-change-logs', 'shippingAddressChangeLogs')->name('shipping-address-change-logs.index');
            Route::get('/unsettled-account-notification-logs', 'unsettledAccountNotificationLogs')->name('unsettled-account-notification-logs.index');
        });

        // Risk Signal Routes
        Route::controller(RiskSignalController::class)->name('risk-signals.')->group(function () {
            Route::get('/risk-signals', 'index')->name('index');
            Route::put('/risk-signals/{id?}', 'update')->name('update');
        });

        // UnSettled Account Routes
        Route::controller(UnsettledAccountController::class)->name('unsettled-accounts.')->group(function () {
            Route::get('/unsettled-accounts', 'index')->name('index');
            Route::put('/unsettled-accounts/{id?}', 'update')->name('update');
            Route::put('/unsettled-accounts/{id?}/update-note', 'updateNote')->name('update-note');
            Route::post('/unsettled-accounts/{id?}/send-message', 'sendMessage')->name('send-message');
        });

        // Translation System
        Route::prefix('/translation-system')->name('translation-system.')->group(function () {

            Route::get('/translation-system', TranslationSystemController::class)->name('index');

            // Language Routes
            Route::resource('/languages', LanguageController::class)->except(['show']);
            Route::delete('/languages-destroy-by-selection', [LanguageController::class, 'destroyBySelection'])->name('languages.destroybyselection');

            // Translation Key Routes
            Route::resource('/translation-keys', TranslationKeyController::class);
            Route::delete('/translation-keys-destroy-by-selection', [TranslationKeyController::class, 'destroyBySelection'])->name('translation-keys.destroybyselection');

            // Translations Route
            Route::controller(TranslationController::class)->prefix('/translations')->name('translations.')->group(function () {
                Route::get('/translations/lang/{language_code?}', 'index')->name('index');
                Route::put('/translations/{language_code?}', 'saveTranslations')->name('save');
                Route::get('/translations-export/{language:code}', 'exportTranslations')->name('export');
                Route::post('/translations-import', 'importTranslations')->name('import');
            });
        });

        // Data Deletion Request Routes
        Route::controller(DataDeletionRequestController::class)->name('data-deletion-requests.')->group(function () {
            Route::get('/data-deletion-requests', 'index')->name('index');
        });

        // Wholesale Dealer Application Routes (read-only lead review)
        Route::controller(WholesaleDealerApplicationController::class)->name('wholesale-dealer-applications.')->group(function () {
            Route::get('/wholesale-dealer-applications', 'index')->name('index');
            Route::get('/wholesale-dealer-applications/view/{public_id?}', 'show')->name('show');
        });

        // Order Cancelation Requests
        Route::controller(OrderCancelationRequestController::class)->name('order-cancelation-requests.')->group(function () {
            Route::get('/order-cancelations/index', 'index')->name('index');
            Route::get('/order-cancelations/edit/{id?}', 'edit')->name('edit');
            Route::put('/order-cancelations/update/{id?}', 'update')->name('update');
        });

        // Product Link Routes
        Route::resource('/attribution-links', ProductLinkController::class)->except(['show']);
        Route::delete('/attribution-links-deleteBySelection', [ProductLinkController::class, 'destroyBySelection'])->name('attribution-links.destroyBySelection');

        // Internal Product Images Routes
        Route::controller(InternalProductImageController::class)->name('internal-product-images.')->group(function () {
            Route::get('/internal-product-images', 'index')->name('index');
            Route::get('/internal-product-images-create', 'create')->name('create');
            Route::post('/internal-product-images-store', 'store')->name('store');
            Route::post('/internal-product-images-store-folder', 'storeFolder')->name('store-folder');
            Route::delete('/internal-product-images-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/internal-product-images-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Internal Product Videos Routes
        Route::controller(InternalProductVideoController::class)->name('internal-product-videos.')->group(function () {
            Route::get('/internal-product-videos', 'index')->name('index');
            Route::get('/internal-product-videos-create', 'create')->name('create');
            Route::post('/internal-product-videos-store', 'store')->name('store');
            Route::post('/internal-product-videos-store-folder', 'storeFolder')->name('store-folder');
            Route::delete('/internal-product-videos-destroy/{id?}', 'destroy')->name('destroy');
            Route::delete('/internal-product-videos-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
        });

        // Attribution Reward Routes
        Route::prefix('attribution-rewards')->name('attribution-rewards.')->group(function () {
            Route::get('/', [AttributionRewardController::class, 'index'])
                ->name('index');
            Route::put('/{id}', [AttributionRewardController::class, 'update'])
                ->name('update');
        });

        // Setting Routes
        Route::controller(SettingController::class)->as('settings.')
            ->group(function () {
                Route::get('/settings', 'index')->name('index');

                // Prefixed As /settings On Grouped Routes
                Route::prefix('/settings')->group(function () {
                    // General Setting Routess
                    Route::get('/general-settings', 'generalSetting')->name('general.setting');
                    Route::put('/settings/general-settings-update', 'updateGeneralSetting')->name('general.setting.update');

                    Route::get('/unsettled-accounts-notification-settings', 'unsettledAccountsNotificationSetting')->name('unsettled-accounts-notification-settings.index');
                    Route::put('/unsettled-accounts-notification-settings-save', 'saveUnsettledAccountsNotificationSetting')->name('unsettled-accounts-notification-settings.save');

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
                    Route::get('/aws-settings-create', 'awsSettingsCreate')->name('aws-settings.create');
                    Route::post('/aws-settings-store', 'awsSettingsStore')->name('aws-settings.store');
                    Route::get('/aws-settings-edit/{id?}', 'awsSettingsEdit')->name('aws-settings.edit');
                    Route::put('/aws-settings-update/{id?}', 'awsSettingsUpdate')->name('aws-settings.update');
                    Route::put('/aws-settings-toggle-status/{id?}', 'awsSettingsToggleStatus')->name('aws-settings.toggle-status');
                    Route::delete('/aws-settings-destroy/{id?}', 'awsSettingsDestroy')->name('aws-settings.destroy');
                    Route::delete('/aws-settings-destroy-by-selection', 'awsSettingsDestroyBySelection')->name('aws-settings.destroybyselection');

                    // Google Map Setting Routes
                    Route::get('/google-map-settings', 'googleMapSettingsIndex')->name('google-map-settings.index');
                    Route::get('/google-map-settings-create', 'googleMapSettingsCreate')->name('google-map-settings.create');
                    Route::post('/google-map-settings-store', 'googleMapSettingsStore')->name('google-map-settings.store');
                    Route::get('/google-map-settings-edit/{id?}', 'googleMapSettingsEdit')->name('google-map-settings.edit');
                    Route::put('/google-map-settings-update/{id?}', 'googleMapSettingsUpdate')->name('google-map-settings.update');
                    Route::put('/google-map-settings-toggle-status/{id?}', 'googleMapSettingsToggleStatus')->name('google-map-settings.toggle-status');
                    Route::delete('/google-map-settings-destroy/{id?}', 'googleMapSettingsDestroy')->name('google-map-settings.destroy');
                    Route::delete('/google-map-settings-destroy-by-selection', 'googleMapSettingsDestroyBySelection')->name('google-map-settings.destroybyselection');

                    // Meta Setting Routes
                    Route::get('/meta-settings', 'metaSettingsIndex')->name('meta-settings.index');
                    Route::get('/meta-settings-create', 'metaSettingsCreate')->name('meta-settings.create');
                    Route::post('/meta-settings-store', 'metaSettingsStore')->name('meta-settings.store');
                    Route::get('/meta-settings-edit/{id?}', 'metaSettingsEdit')->name('meta-settings.edit');
                    Route::put('/meta-settings-update/{id?}', 'metaSettingsUpdate')->name('meta-settings.update');
                    Route::put('/meta-settings-toggle-status/{id?}', 'metaSettingsToggleStatus')->name('meta-settings.toggle-status');
                    Route::delete('/meta-settings-destroy/{id?}', 'metaSettingsDestroy')->name('meta-settings.destroy');
                    Route::delete('/meta-settings-destroy-by-selection', 'metaSettingsDestroyBySelection')->name('meta-settings.destroybyselection');

                    // NOW Payment COnfig Routes
                    Route::get('/now-payment-settings', 'NOWPaymentSettingsIndex')->name('now-payment-settings.index');
                    Route::get('/now-payment-settings-create', 'NOWPaymentSettingsCreate')->name('now-payment-settings.create');
                    Route::post('/now-payment-settings-store', 'NOWPaymentSettingsStore')->name('now-payment-settings.store');
                    Route::get('/now-payment-settings-edit/{id?}', 'NOWPaymentSettingsEdit')->name('now-payment-settings.edit');
                    Route::put('/now-payment-settings-update/{id?}', 'NOWPaymentSettingsUpdate')->name('now-payment-settings.update');
                    Route::put('/now-payment-settings-toggle-status/{id?}', 'NOWPaymentSettingsToggleStatus')->name('now-payment-settings.toggle-status');
                    Route::delete('/now-payment-settings-destroy/{id?}', 'NOWPaymentSettingsDestroy')->name('now-payment-settings.destroy');
                    Route::delete('/now-payment-settings-destroy-by-selection', 'NOWPaymentSettingsDestroyBySelection')->name('now-payment-settings.destroybyselection');

                    // Return Policy  Routes
                    Route::get('/return-policy-settings', 'returnPolicyIndex')->name('return-policy-settings.index');
                    Route::get('/return-policy-settings-create', 'returnPolicyCreate')->name('return-policy-settings.create');
                    Route::post('/return-policy-settings-store', 'returnPolicyStore')->name('return-policy-settings.store');
                    Route::get('/return-policy-settings-edit/{id?}', 'returnPolicyEdit')->name('return-policy-settings.edit');
                    Route::put('/return-policy-settings-update/{id?}', 'returnPolicyUpdate')->name('return-policy-settings.update');
                    Route::put('/return-policy-settings-toggle-status/{id?}', 'returnPolicyToggleStatus')->name('return-policy-settings.toggle-status');
                    Route::delete('/return-policy-settings-destroy/{id?}', 'returnPolicyDestroy')->name('return-policy-settings.destroy');
                    Route::delete('/return-policy-settings-destroy-by-selection', 'returnPolicyDestroyBySelection')->name('return-policy-settings.destroybyselection');

                    // Shipping Policy Routes
                    Route::get('/shipping-policy-settings', 'shippingPolicyIndex')->name('shipping-policy-settings.index');
                    Route::get('/shipping-policy-settings-create', 'shippingPolicyCreate')->name('shipping-policy-settings.create');
                    Route::post('/shipping-policy-settings-store', 'shippingPolicyStore')->name('shipping-policy-settings.store');
                    Route::get('/shipping-policy-settings-edit/{id?}', 'shippingPolicyEdit')->name('shipping-policy-settings.edit');
                    Route::put('/shipping-policy-settings-update/{id?}', 'shippingPolicyUpdate')->name('shipping-policy-settings.update');
                    Route::put('/shipping-policy-settings-toggle-status/{id?}', 'shippingPolicyToggleStatus')->name('shipping-policy-settings.toggle-status');
                    Route::delete('/shipping-policy-settings-destroy/{id?}', 'shippingPolicyDestroy')->name('shipping-policy-settings.destroy');
                    Route::delete('/shipping-policy-settings-destroy-by-selection', 'shippingPolicyDestroyBySelection')->name('shipping-policy-settings.destroybyselection');

                    // Terms Of Service Routes
                    Route::get('/terms-of-service-settings', 'termsOfServiceIndex')->name('terms-of-service-settings.index');
                    Route::get('/terms-of-service-settings-create', 'termsOfServiceCreate')->name('terms-of-service-settings.create');
                    Route::post('/terms-of-service-settings-store', 'termsOfServiceStore')->name('terms-of-service-settings.store');
                    Route::get('/terms-of-service-settings-edit/{id?}', 'termsOfServiceEdit')->name('terms-of-service-settings.edit');
                    Route::put('/terms-of-service-settings-update/{id?}', 'termsOfServiceUpdate')->name('terms-of-service-settings.update');
                    Route::put('/terms-of-service-settings-toggle-status/{id?}', 'termsOfServiceToggleStatus')->name('terms-of-service-settings.toggle-status');
                    Route::delete('/terms-of-service-settings-destroy/{id?}', 'termsOfServiceDestroy')->name('terms-of-service-settings.destroy');
                    Route::delete('/terms-of-service-settings-destroy-by-selection', 'termsOfServiceDestroyBySelection')->name('terms-of-service-settings.destroybyselection');

                    // Privacy Policy Routes
                    Route::get('/privacy-policy-settings', 'privacyPolicyIndex')->name('privacy-policy-settings.index');
                    Route::get('/privacy-policy-settings-create', 'privacyPolicyCreate')->name('privacy-policy-settings.create');
                    Route::post('/privacy-policy-settings-store', 'privacyPolicyStore')->name('privacy-policy-settings.store');
                    Route::get('/privacy-policy-settings-edit/{id?}', 'privacyPolicyEdit')->name('privacy-policy-settings.edit');
                    Route::put('/privacy-policy-settings-update/{id?}', 'privacyPolicyUpdate')->name('privacy-policy-settings.update');
                    Route::put('/privacy-policy-settings-toggle-status/{id?}', 'privacyPolicyToggleStatus')->name('privacy-policy-settings.toggle-status');
                    Route::delete('/privacy-policy-settings-destroy/{id?}', 'privacyPolicyDestroy')->name('privacy-policy-settings.destroy');
                    Route::delete('/privacy-policy-settings-destroy-by-selection', 'privacyPolicyDestroyBySelection')->name('privacy-policy-settings.destroybyselection');

                    // Courier Company  Routes
                    Route::get('/courier-company-settings', 'courierCompanyIndex')->name('courier-company-settings.index');
                    Route::get('/courier-company-settings-create', 'courierCompanyCreate')->name('courier-company-settings.create');
                    Route::post('/courier-company-settings-store', 'courierCompanyStore')->name('courier-company-settings.store');
                    Route::get('/courier-company-settings-edit/{id?}', 'courierCompanyEdit')->name('courier-company-settings.edit');
                    Route::put('/courier-company-settings-update/{id?}', 'courierCompanyUpdate')->name('courier-company-settings.update');
                    Route::put('/courier-company-settings-toggle-status/{id?}', 'courierCompanyToggleStatus')->name('courier-company-settings.toggle-status');
                    Route::delete('/courier-company-settings-destroy/{id?}', 'courierCompanyDestroy')->name('courier-company-settings.destroy');
                    Route::delete('/courier-company-settings-destroy-by-selection', 'courierCompanyDestroyBySelection')->name('courier-company-settings.destroybyselection');

                    // Condition Routes
                    Route::get('/condition-settings', 'conditionIndex')->name('condition-settings.index');
                    Route::get('/condition-settings-create', 'conditionCreate')->name('condition-settings.create');
                    Route::post('/condition-settings-store', 'conditionStore')->name('condition-settings.store');
                    Route::get('/condition-settings-edit/{id?}', 'conditionEdit')->name('condition-settings.edit');
                    Route::put('/condition-settings-update/{id?}', 'conditionUpdate')->name('condition-settings.update');
                    Route::put('/condition-settings-toggle-status/{id?}', 'conditionToggleStatus')->name('condition-settings.toggle-status');
                    Route::delete('/condition-settings-destroy/{id?}', 'conditionDestroy')->name('condition-settings.destroy');
                    Route::delete('/condition-settings-destroy-by-selection', 'conditionDestroyBySelection')->name('condition-settings.destroybyselection');

                    // Addon Routes
                    Route::get('/addon-settings', 'addonIndex')->name('addon-settings.index');
                    Route::get('/addon-settings-create', 'addonCreate')->name('addon-settings.create');
                    Route::post('/addon-settings-store', 'addonStore')->name('addon-settings.store');
                    Route::get('/addon-settings-edit/{id?}', 'addonEdit')->name('addon-settings.edit');
                    Route::put('/addon-settings-update/{id?}', 'addonUpdate')->name('addon-settings.update');
                    Route::put('/addon-settings-toggle-status/{id?}', 'addonToggleStatus')->name('addon-settings.toggle-status');
                    Route::delete('/addon-settings-destroy/{id?}', 'addonDestroy')->name('addon-settings.destroy');
                    Route::delete('/addon-settings-destroy-by-selection', 'addonDestroyBySelection')->name('addon-settings.destroybyselection');

                    // Price Range Routes
                    Route::controller(PriceRangeController::class)->name('price-ranges.')->group(function () {
                        Route::get('/price-ranges', 'index')->name('index');
                        Route::get('/price-ranges-create', 'create')->name('create');
                        Route::post('/price-ranges-store', 'store')->name('store');
                        Route::get('/price-ranges-edit/{id?}', 'edit')->name('edit');
                        Route::put('/price-ranges-update/{id?}', 'update')->name('update');
                        Route::put('/price-ranges-toggle-status/{id?}', 'toggleStatus')->name('toggle-status');
                        Route::delete('/price-ranges-destroy/{id?}', 'destroy')->name('destroy');
                        Route::delete('/price-ranges-destroy-by-selection', 'destroyBySelection')->name('destroybyselection');
                    });

                    // Dormancy Setting Routes
                    Route::get('/dormancy-settings', 'dormancySettingIndex')->name('dormancy-setting.index');
                    Route::put('/dormancy-settings-save', 'dormancySettingSave')->name('dormancy-setting.save');

                    // Attribution Reward Setting Routes
                    Route::get('/attribution-reward-settings', 'attributionRewardSettingIndex')->name('attribution-reward-setting.index');
                    Route::put('/attribution-reward-settings-save', 'attributionRewardSettingSave')->name('attribution-reward-setting.save');
                });
            });
    });

    // Shipping Invoice View Route
    Route::get('/orders-shipping-invoice/{order_no?}', [OrderController::class, 'shippingInvoice'])->name('orders.shipping-invoice');
});

// Dynamic Manifest JSON Route For PWA
Route::get('/pwa-manifest', function () {

    $general_setting = Cache::get('general_config');

    $name = $general_setting->app_name ?? config('app.name');

    $pwaLogo = $general_setting?->app_pwa_logo ?? null;

    $themeColor = '#FFFFFF';
    $backgroundColor = '#FFFFFF';

    $manifest = [
        'name' => $name,
        'short_name' => $name,
        'description' => $general_setting->app_description ?? 'Shop smarter with Andromeda  your modern global marketplace offering trending products, secure checkout, and fast delivery, all in one simple app.',
        'start_url' => '/',
        'display' => 'standalone',
        'theme_color' => $themeColor,
        'background_color' => $backgroundColor,
        'icons' => [
            [
                'src' => $pwaLogo,
                'sizes' => '192x192',
                'type' => 'image/png',
            ],
            [
                'src' => $pwaLogo,
                'sizes' => '512x512',
                'type' => 'image/png',
            ],
        ],
    ];

    return response($manifest, 200)
        ->header('Content-Type', 'application/manifest+json');
})->name('pwa.manifest');

// Meta Routes
Route::match(['get', 'post'], '/meta/webhook', [MetaController::class, 'webhook'])->withoutMiddleware([
    VerifyCsrfToken::class,
]);

// Device Finger Print
Route::post('/device-fingerprint', DeviceFingerPrintController::class)->name('device-fingerprint.store');

Route::post('/scanner/ai-decode', [OpenAiController::class, 'aiDecode'])
    ->name('scanner.ai-decode');

Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');

// Route::get('/debug-currency', function () {
//     $resolver = app(\App\Services\CurrencyResolverService::class);
//     $displayCurrency = $resolver->resolve();

//     return [
//         'request_ip' => request()->ip(),
//         'pricing_country_cookie' => request()->cookie('pricing_country_id'),
//         'display_currency_cookie' => request()->cookie('display_currency_id'),
//         'resolved_country_id' => \App\Services\IPResolverService::resolveCountryIDFromIP(),
//         'display_currency' => $displayCurrency,
//         'pakistan_currency' => \App\Models\Currency::where('country_id', 132)->first(),
//         'all_currencies' => \App\Models\Currency::with('country')->get()->map(function ($c) {
//             return [
//                 'id' => $c->id,
//                 'name' => $c->name,
//                 'symbol' => $c->symbol,
//                 'country_id' => $c->country_id,
//                 'country_iso' => $c->country?->iso_code,
//                 'exchange_rate' => $c->exchange_rate,
//                 'is_active' => $c->is_active,
//             ];
//         }),
//     ];
// });
require __DIR__.'/auth.php';
