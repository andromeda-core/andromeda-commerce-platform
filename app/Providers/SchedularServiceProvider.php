<?php

namespace App\Providers;

use App\Console\Commands\AutoMarkingOrderExpiredIfNotPaid;
use App\Console\Commands\AutoRejectRefundsMissingTracking;
use App\Console\Commands\CheckRewardPointExpiry;
use App\Console\Commands\ClearPreviousOrderPackageRecordings;
use App\Console\Commands\ConfirmPurchaseOrders;
use App\Console\Commands\DestroyDeactiveAccounts;
use App\Console\Commands\DestroyLast24HoursActionLogs;
use App\Console\Commands\DetectUnSettledAccounts;
use App\Console\Commands\ExpireLodgingReservations;
use App\Console\Commands\ExpireOldEmailChangeRequests;
use App\Console\Commands\LodgingReservationPaymentStatusCheck;
use App\Console\Commands\MarkExpireOldAccountRiskSignal;
use App\Console\Commands\MarkingOrdersAsDeliveryConfirmedAfterSevenDays;
use App\Console\Commands\MarkUserAsDormant;
use App\Console\Commands\MetaPageTokenRefresh;
use App\Console\Commands\NOWPaymentInvoiceStatusCheck;
use App\Console\Commands\SendUnsettledAccountNotifications;
use App\Console\Commands\SyncExchangeRates;
use App\Console\Commands\WarmSitemapCache;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

class SchedularServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(Schedule $schedule): void
    {
        $schedule->command(CheckRewardPointExpiry::class)->daily();
        $schedule->command(ClearPreviousOrderPackageRecordings::class)->daily();
        $schedule->command(NOWPaymentInvoiceStatusCheck::class)->everyMinute()->withoutOverlapping();
        $schedule->command(AutoMarkingOrderExpiredIfNotPaid::class)->everyFiveMinutes()->withoutOverlapping();

        // Lodging (Stage 2.4) — isolated from the order crons above.
        $schedule->command(LodgingReservationPaymentStatusCheck::class)->everyMinute()->withoutOverlapping();
        $schedule->command(ExpireLodgingReservations::class)->everyFiveMinutes()->withoutOverlapping();
        $schedule->command(MetaPageTokenRefresh::class)->daily();
        $schedule->command(MarkUserAsDormant::class)->daily();
        $schedule->command(DestroyDeactiveAccounts::class)->daily();
        $schedule->command(ExpireOldEmailChangeRequests::class)->everyTenMinutes()->withoutOverlapping();
        $schedule->command(DestroyLast24HoursActionLogs::class)->everyTwoHours()->withoutOverlapping();
        $schedule->command(MarkExpireOldAccountRiskSignal::class)->everyFifteenMinutes()->withoutOverlapping();
        $schedule->command(DetectUnSettledAccounts::class)->everyFifteenMinutes()->withoutOverlapping(10);
        $schedule->command(SendUnsettledAccountNotifications::class)->everyTenMinutes()->withoutOverlapping(5);
        $schedule->command(MarkingOrdersAsDeliveryConfirmedAfterSevenDays::class)->everyFifteenMinutes();
        $schedule->command(ConfirmPurchaseOrders::class)->everyFifteenMinutes();
        $schedule->command(WarmSitemapCache::class)->daily();
        $schedule->command(AutoRejectRefundsMissingTracking::class)->everyFifteenMinutes()->withoutOverlapping();
        $schedule->command(SyncExchangeRates::class)->everySixHours()->withoutOverlapping();
    }
}
