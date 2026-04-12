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
        ],
    ],
];
