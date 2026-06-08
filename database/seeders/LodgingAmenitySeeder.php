<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LodgingAmenitySeeder extends Seeder
{
    public function run(): void
    {
        // [name => category]. category buckets: general | room | parking | accessibility
        $amenities = [
            'Free Wi-Fi' => 'general',
            'Parking' => 'parking',
            'Free parking' => 'parking',
            'EV charging' => 'parking',
            'Elevator' => 'general',
            'Air conditioning' => 'room',
            'Heating' => 'room',
            'TV' => 'room',
            'Refrigerator' => 'room',
            'Microwave' => 'room',
            'Coffee machine' => 'room',
            'Kitchen' => 'room',
            'Washing machine' => 'general',
            'Dryer' => 'general',
            'Hair dryer' => 'room',
            'Towels' => 'room',
            'Bedding' => 'room',
            'Swimming pool' => 'general',
            'Jacuzzi' => 'room',
            'Bathtub' => 'room',
            'BBQ' => 'general',
            'Fitness center' => 'general',
            'Breakfast' => 'general',
            'Beachfront' => 'general',
            'Mountain view' => 'general',
            'Waterfront' => 'general',
            'Accessibility' => 'accessibility',
            'Step-free entrance' => 'accessibility',
            'Contactless check-in' => 'general',
            'Front desk' => 'general',
            'Host-meet check-in' => 'general',
        ];

        $rows = [];
        foreach ($amenities as $name => $category) {
            $rows[] = [
                'name' => $name,
                'icon' => null,
                'category' => $category,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Idempotent: unique `name` means re-running skips existing amenities.
        DB::table('lodging_amenities')->insertOrIgnore($rows);
    }
}
