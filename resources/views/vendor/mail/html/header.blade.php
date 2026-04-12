@props(['url'])
@php
    $general_setting = \Illuminate\Support\Facades\Cache::get('general_config');

@endphp
<tr>
    <td class="header">
        <a href="{{ $url }}" style="display: inline-block;">
            @if (!empty($general_setting?->app_main_logo_light))
                <img crossorigin="" src="{{ $general_setting->app_favicon }}" class="logo"
                    alt="{{ $general_setting->app_name ?? config('app.name') }}">
            @else
                {{ $slot }}
            @endif
        </a>
    </td>
</tr>
