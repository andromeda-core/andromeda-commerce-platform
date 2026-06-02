<?php

namespace App\Providers;

use App\Models\AwsSetting;
use App\Models\Country;
use App\Models\Currency;
use App\Models\GeneralSetting;
use App\Models\GoogleMapSetting;
use App\Models\MetaSetting;
use App\Models\NowPayment;
use App\Models\PriceRange;
use App\Models\SmtpSetting;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Model::automaticallyEagerLoadRelationships();

        if (app()->environment('local')) {
            Model::shouldBeStrict();
            // Not Needed Yet
            // URL::forceRootUrl(config('app.url'));
            URL::forceScheme('http');
        } else {
            URL::forceScheme('https');
        }

        try {
            DB::connection()->getPdo();

            if (Schema::hasTable('general_settings')) {

                $general_setting = Cache::rememberForever('general_config', fn() => GeneralSetting::first() ?? null);

                if (! empty($general_setting)) {
                    Config::set('app.name', $general_setting?->app_name);
                }
            }

            if (Schema::hasTable('smtp_settings')) {
                $smtp = Cache::rememberForever('smtp_config', fn() => SmtpSetting::first() ?? null);

                if (! empty($smtp)) {
                    Config::set([
                        'mail.default' => $smtp->smtp_mailer,
                        'mail.mailers.smtp.scheme' => $smtp->smtp_scheme,
                        'mail.mailers.smtp.host' => $smtp?->smtp_host,
                        'mail.mailers.smtp.port' => $smtp?->smtp_port,
                        'mail.mailers.smtp.username' => $smtp?->smtp_username,
                        'mail.mailers.smtp.password' => $smtp?->smtp_password,
                        'mail.from.address' => $smtp?->smtp_mail_from_address,
                        'mail.from.name' => Cache::get('general_config')?->app_name ?? config('app.name'),
                    ]);
                }
            }

            if (Schema::hasTable('currencies')) {
                Cache::rememberForever('currency', fn() => Currency::where('is_active', true)->first() ?? null);
            }

            if (Schema::hasTable('aws_settings')) {
                $aws_setting = Cache::rememberForever('aws_setting', fn() => AwsSetting::where('is_active', true)->first() ?? null);

                if (! empty($aws_setting)) {
                    Config::set([
                        'filesystems.disks.s3.key' => $aws_setting?->aws_access_key_id,
                        'filesystems.disks.s3.secret' => $aws_setting?->aws_secret_access_key,
                        'filesystems.disks.s3.region' => $aws_setting?->aws_region,
                        'filesystems.disks.s3.bucket' => $aws_setting?->aws_bucket,
                        'filesystems.disks.s3.url' => $aws_setting?->aws_url,
                        'services.ses.key' => $aws_setting?->aws_access_key_id,
                        'services.ses.secret' => $aws_setting?->aws_secret_access_key,
                        'services.ses.region' => $aws_setting?->aws_region,
                    ]);
                }
            }

            if (Schema::hasTable('google_map_settings')) {
                $google_map_setting = Cache::rememberForever('google_map_setting', fn() => GoogleMapSetting::where('is_active', true)->first() ?? null);

                if (! empty($google_map_setting)) {
                    Config::set([
                        'services.google_maps_api_key' => $google_map_setting?->google_map_api_key,
                    ]);
                }
            }

            if (Schema::hasTable('now_payments')) {
                $now_payment_setting = Cache::rememberForever('now_payment_setting', fn() => NowPayment::where('is_active', true)->first() ?? null);

                if (! empty($now_payment_setting)) {
                    Config::set([
                        'services.now_payments.api_key' => $now_payment_setting?->now_payment_api_key,
                        'services.now_payments.public_key' => $now_payment_setting?->now_payment_public_key,
                        'services.now_payments.base_url' => $now_payment_setting?->now_payment_baseurl,
                    ]);
                }
            }

            if (Schema::hasTable('meta_settings')) {
                Cache::rememberForever('meta_setting', fn() => MetaSetting::where('is_active', true)->first() ?? null);
            }

            if (Schema::hasTable('countries')) {
                Cache::rememberForever('countries', fn() => Country::where('is_active', true)->get());
            }

            if (Schema::hasTable('dormancy_settings')) {
                Cache::rememberForever('dormancy_setting', fn() => DB::table('dormancy_settings')->first());
            }
        } catch (Exception $e) {
            info($e->getMessage());
        }

        Gate::before(function ($user) {
            return $user->roles()->pluck('name')->implode('') === 'Admin' ? true : false;
        });
    }
}
