@php
    $general_setting = Illuminate\Support\Facades\Cache::get('general_config');

    $default_favicon = asset('assets/images/Logo/Favicon.png');

    $app_description =
        $general_setting->app_description ??
        'Shop smarter with Andromeda  your modern global marketplace offering trending products, secure checkout, and fast delivery, all in one simple app.';

    $app_keywords =
        'Andromeda, andromeda, andro me da, online shopping, buy smartphones, buy laptops, buy iPads, electronics store, tech store, gadgets online, modern marketplace, global marketplace, e-commerce platform, online store, product feed, social shopping, shopping app, buy electronics online, trending products, secure checkout, fast delivery, smartphone deals, laptop deals, iPad deals, tech marketplace, electronics marketplace, shop online, online retail, digital store, tech products, consumer electronics, mobile phones, tablets, computers, gaming laptops, MacBook, iPhone, Samsung, Android phones, product reviews, shopping feed, explore products, filter products, location-based shopping, product discovery, social commerce, shopping community, modern shopping experience, secure online shopping, trusted marketplace, best deals online, electronic gadgets, tech accessories, buy tech online, shop smartphones, shop laptops, shop tablets';

    $app_name = config('app.name', 'Andromeda');
    $app_url = url()->current();

    $default_logo = asset('assets/images/Logo/256b.png');
    $app_logo = $general_setting->app_main_logo_light ?? $default_logo;

    $aws_url = config('filesystems.disks.s3.url');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="manifest" href="{{ route('pwa.manifest') }}">
    <meta name="theme-color" content="#f1f5f9">
    <meta charset="utf-8">
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <link rel="preconnect" href="{{ $aws_url }}" />
    <link rel="dns-prefetch" href="{{ $aws_url }}" />

    <title inertia>{{ $app_name }}</title>
    <link rel="shortcut icon"
        href="{{ !empty($general_setting->app_favicon) ? $general_setting->app_favicon : $default_favicon }}"
        type="image/x-icon">

    <link rel="apple-touch-icon"
        href="{{ !empty($general_setting->app_favicon) ? $general_setting->app_favicon : $default_favicon }}">


    {{-- Primary Meta Tags (important for SEO) --}}
    <meta name="title" content="{{ $app_name }}">
    <meta name="description" content="{{ $app_description }}">
    <meta name="keywords" content="{{ $app_keywords }}">
    <meta name="author" content="{{ $app_name }}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{{ $app_url }}">



    {{-- Open Graph (for Facebook, WhatsApp, LinkedIn) --}}
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ $app_url }}">
    <meta property="og:title" content="{{ $app_name }}">
    <meta property="og:description" content="{{ $app_description }}">
    <meta property="og:image" content="{{ $app_logo }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="{{ $app_name }}">
    <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">

    {{-- Twitter Card  --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{{ $app_url }}">
    <meta name="twitter:title" content="{{ $app_name }}">
    <meta name="twitter:description" content="{{ $app_description }}">
    <meta name="twitter:image" content="{{ $app_logo }}">

    {{--  WhatsApp / Telegram  --}}
    <meta property="og:image:alt" content="{{ $app_name }} Preview">




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
