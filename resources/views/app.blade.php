@php
    $general_setting = Illuminate\Support\Facades\Cache::get('general_config');
    $default_favicon = asset('assets/images/Logo/512512.png');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <link rel="manifest" href="{{ route('pwa.manifest') }}">
    <meta name="theme-color" content="#f1f5f9">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>
    <link rel="shortcut icon"
        href="{{ !empty($genral_setting->app_favicon) ? $general_setting->app_favicon : $default_favicon }}"
        type="image/x-icon">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="antialiased">
    @inertia
</body>

</html>
