<?php

namespace App\Services;

use Http;
use Illuminate\Http\Request;

class GoogleGeoCoderService
{
    public string $apiKey;

    public function __construct(

    ) {
        $this->apiKey = config('services.google_maps_api_key') ?? '';
        if ($this->apiKey == '') {
            session()->flash('error', 'Google Maps API Key is not set Please Configure Your Google Map Api Key');
        }
    }

    public function getLocationNameFromLatLng(string $lat, string $lng)
    {

        $response = Http::get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', [
            'location' => "$lat,$lng",
            'radius' => 50,
            'key' => $this->apiKey,
        ]);

        if ($response->failed()) {
            return ['status' => false, 'message' => 'Something went wrong While Fetching Address'];
        }

        $data = $response->json();

        if (empty($data['results'])) {
            return ['status' => false, 'message' => 'No nearby places found.'];
        }

        $placeId = $data['results'][0]['place_id'] ?? null;

        $details = Http::get('https://maps.googleapis.com/maps/api/place/details/json', [
            'place_id' => $placeId,
            'key' => $this->apiKey,
        ]);

        if ($details->failed()) {
            return ['status' => false, 'message' => 'Something went wrong While Fetching Address'];
        }

        $detailed_data = $details->json();

        return [
            'status' => true,
            'place_name' => $detailed_data['result']['name'] ?? null,
            'formated_address' => $detailed_data['result']['formatted_address'] ?? null,
        ];
    }

    public function autoCompleteLocations(Request $request)
    {

        $url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input={$request->get('search')}&key={$this->apiKey}";
        $response = Http::get($url);

        if ($response->failed()) {
            return ['status' => false, 'message' => 'Something went wrong While Fetching Address'];
        }

        $data = $response->json();

        return ['status' => true, 'data' => $data];
    }

    public function placeDetails(string $placeId)
    {

        $response = Http::get('https://maps.googleapis.com/maps/api/place/details/json', [
            'place_id' => $placeId,
            'key' => $this->apiKey,
        ]);

        if ($response->failed()) {
            return ['status' => false, 'message' => 'Something went wrong While Fetching Place'];
        }

        $data = $response->json();

        $locationName = $data['result']['name'] ?? null;
        $formattedAddress = $data['result']['formatted_address'] ?? null;
        $lat = $data['result']['geometry']['location']['lat'] ?? null;
        $lng = $data['result']['geometry']['location']['lng'] ?? null;

        return [
            'status' => true,
            'data' => [
                'lat' => $lat,
                'lng' => $lng,
                'place_name' => $locationName,
                'formatted_address' => $formattedAddress,
            ],
        ];
    }
}
