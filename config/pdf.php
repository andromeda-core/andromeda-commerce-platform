<?php

return [
    'mode' => 'utf-8',
    'format' => 'A4',
    'default_font_size' => '12',
    'default_font' => 'notosanskr',

    'margin_left' => 10,
    'margin_right' => 10,
    'margin_top' => 10,
    'margin_bottom' => 10,
    'margin_header' => 0,
    'margin_footer' => 0,
    'orientation' => 'P',

    'font_path' => public_path('fonts/'),
    'font_data' => [
        'notosanskr' => [
            'R' => 'NotoSansKR-Regular.ttf',
            'B' => 'NotoSansKR-Bold.ttf',
            'useOTL' => 0xFF,
            'useKashida' => 75,
        ],
        'notosanssc' => [
            'R' => 'NotoSansSC-Regular.ttf',
            'useOTL' => 0xFF,
        ],
        'notosansjp' => [
            'R' => 'NotoSansJP-Regular.ttf',
            'useOTL' => 0xFF,
        ],
        'notosansmongolian' => [
            'R' => 'NotoSansMongolian-Regular.ttf',
            'useOTL' => 0xFF,
        ],
    ],

    //  Enabled autoScriptToLang for automatic font switching
    'autoScriptToLang' => true,
    'autoLangToFont' => true,
];
