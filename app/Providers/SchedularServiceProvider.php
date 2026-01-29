<?php

namespace App\Providers;

use App\Console\Commands\CheckRewardPointExpiry;
use App\Console\Commands\ClearPreviousOrderPackageRecordings;
use App\Console\Commands\DestroyDeactiveAccounts;
use App\Console\Commands\ExpireOldEmailChangeRequests;
use App\Console\Commands\MarkUserAsDormant;
use App\Console\Commands\MetaPageTokenRefresh;
use App\Console\Commands\NOWPaymentAutoMarkingOrderFailedIfNotPaid;
use App\Console\Commands\NOWPaymentInvoiceStatusCheck;
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
        $schedule->command(NOWPaymentInvoiceStatusCheck::class)->everyMinute();
        $schedule->command(NOWPaymentAutoMarkingOrderFailedIfNotPaid::class)->everyFiveMinutes();
        $schedule->command(MetaPageTokenRefresh::class)->daily();
        $schedule->command(MarkUserAsDormant::class)->daily();
        $schedule->command(DestroyDeactiveAccounts::class)->daily();
        $schedule->command(ExpireOldEmailChangeRequests::class)->everySecond();
    }
}
