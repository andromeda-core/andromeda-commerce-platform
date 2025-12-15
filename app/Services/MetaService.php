<?php

namespace App\Services;

use App\Models\MetaContact;
use App\Models\MetaSetting;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Str;

class MetaService
{
    private string $app_fb_id;

    private string $app_fb_secret;

    // (
    // For Later usecase
    private string $app_ig_id;

    private string $app_ig_secret;

    // For Later usecase
    // )
    private ?string $fb_short_lived_token = null;

    private ?string $ig_short_lived_token = null;

    public function __construct(private MetaSetting $meta_setting)
    {
        $this->meta_setting = $meta_setting;

        if ($meta_setting->meta_fb_token_type === 'short_lived') {
            $this->fb_short_lived_token = $meta_setting->meta_fb_page_access_token;
        }

        if ($meta_setting->meta_ig_token_type === 'short_lived') {
            $this->ig_short_lived_token = $meta_setting->meta_ig_access_token;
        }

        // Facebook APP Cred Setup
        $this->app_fb_id = $meta_setting?->meta_fb_app_id;
        $this->app_fb_secret = $meta_setting?->meta_fb_app_secret;

        // Instagram APP Cred Setup
        $this->app_ig_id = $meta_setting?->meta_ig_app_id;
        $this->app_ig_secret = $meta_setting?->meta_ig_app_secret;

    }

    // Facebook
    public function getFacebookLongLivedToken()
    {

        try {
            if ($this->fb_short_lived_token === null || $this->meta_setting->meta_fb_token_type === 'long_lived') {
                return 'Token Already Exchanged';
            }

            // Exchanging Short To Long Lived Token
            $longPageToken = $this->getLongLivedPageToken($this->fb_short_lived_token, $this->app_fb_id, $this->app_fb_secret);

            // Check Expiry Of Long Token
            $expiry = $this->getLongLivedTokenExpiry($longPageToken, $this->app_fb_id, $this->app_fb_secret);
            $expiry_date = \Carbon\Carbon::createFromTimestamp($expiry);

            $page_id = $this->verifyFacebookPage($longPageToken);

            $this->meta_setting->updateQuietly([
                'meta_fb_page_access_token' => $longPageToken,
                'meta_fb_token_type' => 'long_lived',
                'meta_fb_token_expires_at' => $expiry_date,
                'meta_fb_page_id' => $page_id,
            ]);
            Cache::forget('meta_setting');
        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function refreshFacebookPageToken()
    {
        try {
            $expiry_date = \Carbon\Carbon::parse($this->meta_setting->meta_fb_token_expires_at);
            $now = \Carbon\Carbon::now();
            $long_lived_token = $this->meta_setting->meta_fb_page_access_token;
            if ($expiry_date->isPast() || floor($now->diffInRealDays($expiry_date, false)) <= 5) {
                $token = $this->getLongLivedPageToken($long_lived_token, $this->app_fb_id, $this->app_fb_secret);

                $this->meta_setting->updateQuietly([
                    'meta_fb_page_access_token' => $token,
                    'meta_fb_token_type' => 'long_lived',
                    'meta_fb_token_expires_at' => \Carbon\Carbon::createFromTimestamp($this->getLongLivedTokenExpiry($token, $this->app_fb_id, $this->app_fb_secret)),
                ]);

                return true;
            } else {
                return false;
            }
        } catch (Exception $e) {
            Log::error('Failed to refresh FB token', ['error' => $e->getMessage()]);

            return false;
        }
    }

    // Instagram
    public function getInstagramAccountAndMarkAsTokenTypeLongLived()
    {

        try {
            if ($this->ig_short_lived_token === null || $this->meta_setting->meta_ig_token_type === 'long_lived') {
                return 'Token Already Exchanged';
            }

            $account_id = $this->verifyInstagramAccount($this->ig_short_lived_token);
            if (empty($account_id)) {
                return 'Instagram Account Not Verified';
            }

            $account_bussiness_id = $this->getInstagramBusinessAccountIdFromPage($this->meta_setting->meta_fb_page_id, $this->meta_setting->meta_fb_page_access_token);

            if (empty($account_bussiness_id)) {
                return 'Instagram Business Account Not Found';
            }

            $expiry_date = now()->addDays(60);

            $this->meta_setting->updateQuietly([
                'meta_ig_access_token' => $this->ig_short_lived_token,
                'meta_ig_token_type' => 'long_lived',
                'meta_ig_token_expires_at' => $expiry_date,
                'meta_ig_account_id' => $account_id,
                'meta_ig_bussiness_account_id' => $account_bussiness_id,
            ]);

            Cache::forget('meta_setting');
        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function refreshInstagramUserToken()
    {
        try {
            $expiry_date = \Carbon\Carbon::parse($this->meta_setting->meta_ig_token_expires_at);
            $now = \Carbon\Carbon::now();
            $long_lived_token = $this->meta_setting->meta_ig_access_token;
            if ($expiry_date->isPast() || floor($now->diffInRealDays($expiry_date, false)) <= 5) {
                $data = $this->getInstagramRefreshToken($long_lived_token);
                $this->meta_setting->updateQuietly([
                    'meta_ig_access_token' => $data['access_token'],
                    'meta_ig_token_type' => 'long_lived',
                    'meta_ig_token_expires_at' => now()->addSeconds($data['expires_in']),
                ]);

                return true;
            } else {
                return false;
            }
        } catch (Exception $e) {
            Log::error('Failed to refresh FB token', ['error' => $e->getMessage()]);

            return false;
        }
    }

    // WebHook Event Method
    public function webHookEvent(Request $request)
    {

        // info('WEBHOOK HIT');

        if ($request->isMethod('get')) {
            $mode = $request->get('hub_mode');
            $token = $request->get('hub_verify_token');
            $challenge = $request->get('hub_challenge');

            if ($mode === 'subscribe' && $token === $this->meta_setting->meta_verify_token) {
                return response($challenge, 200);
            }

            return response('Forbidden', 403);
        }

        $payload = $request->getContent();

        // Basic parsing example (ref extraction)
        $data = json_decode($payload, true);

        $entry_id = $data['entry'][0]['id'] ?? null;
        $allowed_ids = [
            $this->meta_setting->meta_fb_page_id,
            $this->meta_setting->meta_ig_bussiness_account_id,
        ];
        // Checking If Its Allowed Or Not Means Checking The Request If Coming From Meta Than Accpeted Otherwise Rejected
        if (! in_array($entry_id, $allowed_ids)) {
            return response('Forbidden', 403);
        }

        // info('PAYLOAD DATA: '.json_encode($data));
        $platform = $data['object'] ?? 'unknown';
        $summary = [];

        // verify signature
        if ($platform === 'page') {
            // Facebook → STRICT verify
            if (! $this->verifyWebhookSignature($request, $this->meta_setting)) {
                Log::warning('FB Invalid Signature');

                return response('Invalid signature', 403);
            }
        } elseif ($platform === 'instagram') {
            // Instagram → DO NOT BLOCK
            // Log::info('Instagram webhook received (signature skipped)');
        } else {
            info('Invalid Signature');

            return response('Invalid signature', 403);
        }

        if (! empty($data['entry']) && is_array($data['entry'])) {
            foreach ($data['entry'] as $entry) {
                if (! empty($entry['messaging'])) {

                    // Checking If Its System generated Message Or Admin it Self messaged
                    if (isset($entry['messaging'][0]['message']['is_echo']) && $entry['messaging'][0]['message']['is_echo'] == true) {
                        continue;
                    }

                    foreach ($entry['messaging'] as $m) {
                        $summary[] = [
                            'platform' => $platform === 'page' ? 'facebook' : $platform,
                            'sender' => $m['sender']['id'] ?? null,
                            'ref' => $m['referral']['ref'] ?? null,
                            'message' => $m['message']['text'] ?? null,
                        ];
                    }
                }
                if (! empty($entry['changes'])) {
                    foreach ($entry['changes'] as $c) {
                        $val = $c['value'];

                        $summary[] = [
                            'platform' => $platform,
                            'sender' => $val['sender']['id'] ?? null,
                            'ref' => $val['referral']['ref'] ?? null,
                            'message' => $m['message']['text'] ?? null,
                        ];
                    }
                }
            }
        }

        $summary_first_array = reset($summary);
        if (! blank($summary_first_array)) {
            $raw_ref = $summary_first_array['ref'] ?? null;
            $platform_user_id = $summary_first_array['sender'] ?? null;
            $platform = $summary_first_array['platform'] ?? null;
            $message = $summary_first_array['message'] ?? null;
            $contact = MetaContact::where('platform_user_id', $platform_user_id)->where('platform', $platform)->first();

            // Ref Logic: If Not Already Exists and Ref Comes
            if (! empty($raw_ref)) {
                $user_id = Str::replaceFirst('user_id=', '', $raw_ref);

                $user_already_exists = MetaContact::where('platform_user_id', $platform_user_id)->where('platform', $platform)->first();
                if (! empty($user_already_exists)) {
                    // info('User Already Exists');

                    return response('EVENT_RECEIVED', 200);
                }

                $user = User::find($user_id);
                if (empty($user)) {
                    // info('User Not Found');

                    return response('Forbidden', 403);
                }

                MetaContact::create([
                    'platform_user_id' => $platform_user_id,
                    'user_id' => $user_id,
                    'platform' => $platform,
                    'raw_summary' => $summary_first_array,
                ]);

                // info('User Created');

            }

            //  Email Logic: If Not Already Exists and Ref also Not Exists
            if (! empty($message)) {
                $app_name = Cache::get('general_config')?->app_name ?? 'Unknown';
                $internal_id = $this->meta_setting->meta_fb_page_id;
                $token = $this->meta_setting->meta_fb_page_access_token;
                $cache_key_share_email = 'meta_waiting_for_email_'.$platform.'_'.$platform_user_id;

                if (empty($contact)) {
                    // New Contact Asking For Email
                    if (! Cache::has($cache_key_share_email)) {

                        // info('New user, asking for email');

                        $auto_reply_message =
                            'Welcome to '.$app_name.'. Please enter a valid email address that belongs to your account.';

                        $this->sendMessage($platform, $token, $internal_id, $platform_user_id, $auto_reply_message);

                        // mark that we are waiting for email (1 hour)
                        Cache::put($cache_key_share_email, true, now()->addMinutes(60));

                        return response('EVENT_RECEIVED', 200);
                    }

                    if (filter_var(trim($message), FILTER_VALIDATE_EMAIL)) {
                        info('Valid email received: '.$message);

                        $email = strtolower(trim($message));
                        $user = User::where('email', $email)->first();
                        // info('User '.$user);
                        if (empty($user)) {
                            $auto_reply_message = 'Your Account Does Not Exist At '.$app_name.' Please Create Your Account First '.route('login');
                            $this->sendMessage($platform, $token, $internal_id, $platform_user_id, $auto_reply_message);

                            return response('EVENT_RECEIVED', 200);
                        }

                        if (! $user->hasRole('Customer')) {
                            $auto_reply_message = 'Only Customers can use this service';
                            $this->sendMessage($platform, $token, $internal_id, $platform_user_id, $auto_reply_message);

                            return response('EVENT_RECEIVED', 200);
                        }
                        $user->metaContacts()->firstOrCreate([
                            'platform_user_id' => $platform_user_id,
                            'platform' => $platform,
                        ], [
                            'raw_summary' => $summary_first_array,
                        ]);

                        $auto_reply_message = "Hi, {$user->name} Your {$platform} Account Has Been Linked With ".$app_name;
                        $this->sendMessage($platform, $token, $internal_id, $platform_user_id, $auto_reply_message);
                        Cache::forget($cache_key_share_email);

                        return response('EVENT_RECEIVED', 200);
                    } else {
                        $auto_reply_message = 'Please Enter a Valid Email Address That Belongs to Your Account At '.$app_name;
                        $this->sendMessage($platform, $token, $internal_id, $platform_user_id, $auto_reply_message);

                        return response('EVENT_RECEIVED', 200);
                    }
                }
            }

        }

        return response('EVENT_RECEIVED', 200);
    }

    // Message Send To User
    public function sendMessageViaMeta($platform, $token, $internal_id, $receiver_id, $message)
    {
        $response = $this->sendMessage($platform, $token, $internal_id, $receiver_id, $message);

        if (empty($response)) {
            return false;
        }

        // Log::info('Send Message Response '.json_encode($response));

        return true;

    }

    // Global Methods
    protected function getLongLivedPageToken($token, $app_id, $app_secret)
    {
        $response = Http::get('https://graph.facebook.com/v24.0/oauth/access_token', [
            'grant_type' => 'fb_exchange_token',
            'client_id' => $app_id,
            'client_secret' => $app_secret,
            'fb_exchange_token' => $token,
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to exchange short-lived token: '.$response->body());
        }

        $data = $response->json();
        // Log::info('LongLived Page Token '.json_encode($data));

        return $data['access_token'];
    }

    protected function getLongLivedTokenExpiry($token, $app_id, $app_secret)
    {
        $response = Http::get('https://graph.facebook.com/debug_token', [
            'input_token' => $token,
            'access_token' => $app_id.'|'.$app_secret,
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to exchange short-lived token: '.$response->body());
        }

        $data = $response->json();

        return $data['data']['data_access_expires_at'];

    }

    protected function verifyInstagramAccount($token)
    {
        try {
            $response = Http::get('https://graph.instagram.com/me', [
                'fields' => 'id,username,account_type,media_count',
                'access_token' => $token,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                // Log::info('Instagram token verified', [
                //     'username' => $data['username'] ?? 'unknown',
                //     'account_type' => $data['account_type'] ?? 'unknown',
                //     'id' => $data['id'] ?? 'unknown',
                // ]);

                return $data['id'] ?? null;
            }

            // Log::error('Instagram token verification failed', [
            //     'status' => $response->status(),
            //     'body' => $response->body(),
            // ]);

            return null;

        } catch (\Exception $e) {
            // Log::error('Instagram API error during verification', [
            //     'error' => $e->getMessage(),
            // ]);

            return null;
        }
    }

    protected function getInstagramBusinessAccountIdFromPage($page_id, $page_access_token)
    {
        $response = Http::get(
            "https://graph.facebook.com/v24.0/{$page_id}",
            [
                'fields' => 'instagram_business_account',
                'access_token' => $page_access_token,
            ]
        );

        if (! $response->successful()) {
            return null;
        }

        return data_get($response->json(), 'instagram_business_account.id');
    }

    protected function verifyFacebookPage($token)
    {
        try {
            $response = Http::get('https://graph.facebook.com/me', [
                'fields' => 'id,name',
                'access_token' => $token,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return $data['id'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Facebook API error during verification', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    protected function getInstagramRefreshToken($token)
    {
        $response = Http::get('https://graph.instagram.com/refresh_access_token', [
            'grant_type' => 'ig_refresh_token',
            'access_token' => $token,
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to Refresh token: '.$response->body());
        }

        $data = $response->json();

        return [
            'access_token' => $data['access_token'],
            'expires_in' => $data['expires_in'],
        ];
    }

    protected function verifyWebhookSignature(Request $request, $meta_setting): bool
    {
        $appSecret = $meta_setting->meta_fb_app_secret;
        if (! $appSecret) {
            Log::warning('FB_APP_SECRET not set');

            return false;
        }

        $sig256 = $request->header('X-Hub-Signature-256');
        $sig = $sig256 ?: $request->header('X-Hub-Signature');

        if (! $sig) {
            Log::warning('Missing X-Hub-Signature header');

            return false;
        }

        if (strpos($sig, '=') !== false) {
            [$algo, $hash] = explode('=', $sig, 2);
        } else {
            $algo = 'sha1';
            $hash = $sig;
        }
        $supported = ['sha1', 'sha256'];
        if (! in_array($algo, $supported)) {
            Log::warning('Unsupported signature algo: '.$algo);

            return false;
        }

        $payload = file_get_contents('php://input');

        $computed = hash_hmac($algo, $payload, $appSecret);

        // info('COMPUTED: '.$computed);
        // info('HASH '.$hash);

        return hash_equals($computed, $hash);
    }

    protected function sendMessage($platform, $token, $internal_id, $receiver_id, $message)
    {
        try {

            $payload = [

                'recipient' => [
                    'id' => $receiver_id,
                ],
                'message' => [
                    'text' => $message,
                ],

                'access_token' => $token,
            ];

            if ($platform === 'facebook') {
                $payload['messaging_type'] = 'RESPONSE';
            }

            $response = Http::post('https://graph.facebook.com/v24.0/'.$internal_id.'/messages', $payload);

            if ($response->failed()) {
                Log::info('Failed to send message: '.$response->body());
                throw new Exception($response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            Log::info('Failed to send message: '.$e->getMessage());

            return null;
        }
    }
}
