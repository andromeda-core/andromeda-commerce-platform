<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Mail\CollaboratorApplicationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CollaboratorApplicationController extends Controller
{
    // Fixed recipient for all collaborator applications (same domain, deliverable).
    private const RECIPIENT = 'verification@andromeda.blue';

    public function __construct(private Trans $trans) {}

    public function index()
    {
        return Inertia::render('Website/CollaboratorApplication/index');
    }

    public function store(Request $request)
    {
        // Honeypot: bots fill the hidden "website" field. Silently accept and drop.
        if (! blank($request->input('website'))) {
            return response()->json([
                'status' => true,
                'message' => $this->trans->get('Thank you. Your application has been submitted successfully.'),
            ], 200);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'preferred_contact_method' => ['required', 'string', 'max:255'],
            'messenger_id' => ['nullable', 'string', 'max:255'],
            'languages' => ['required', 'string', 'max:255'],
            'applicant_type' => ['required', 'string', 'max:255'],
            'currently_promotes_products' => ['required', 'string', 'max:255'],
            'facebook_url' => ['nullable', 'string', 'max:500', 'url', $this->socialUrlRule(['facebook.com', 'fb.com', 'm.facebook.com', 'fb.watch'], 'Please enter a valid Facebook URL.')],
            'instagram_url' => ['nullable', 'string', 'max:500', 'url', $this->socialUrlRule(['instagram.com', 'instagr.am'], 'Please enter a valid Instagram URL.')],
            'tiktok_url' => ['nullable', 'string', 'max:500', 'url', $this->socialUrlRule(['tiktok.com', 'vm.tiktok.com'], 'Please enter a valid TikTok URL.')],
            'youtube_url' => ['nullable', 'string', 'max:500', 'url', $this->socialUrlRule(['youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com'], 'Please enter a valid YouTube URL.')],
            'community_channel' => ['nullable', 'string', 'max:500'],
            'audience_size' => ['required', 'string', 'max:255'],
            'main_audience_region' => ['required', 'string', 'max:255'],
            'audience_interests' => ['nullable', 'string', 'max:500'],
            'posts_per_week' => ['required', 'string', 'max:255'],
            'videos_per_month' => ['nullable', 'string', 'max:255'],
            'estimated_monthly_reach' => ['required', 'string', 'max:255'],
            'estimated_monthly_sales' => ['nullable', 'string', 'max:255'],
            'activities' => ['required', 'array', 'min:1'],
            'activities.*' => ['string', 'max:255'],
            'product_categories' => ['required', 'array', 'min:1'],
            'product_categories.*' => ['string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:5000'],
            'why_collaborator' => ['required', 'string', 'max:5000'],
            'promotion_plan' => ['required', 'string', 'max:5000'],
            'additional_message' => ['nullable', 'string', 'max:5000'],
            'agreement_admin_review' => ['accepted'],
            'agreement_truthful_info' => ['accepted'],
            'agreement_contact' => ['accepted'],
        ]);

        if ($validator->fails()) {
            // Social-domain failures surface their own translated message; everything
            // else falls back to the generic required-fields message.
            $socialFields = ['facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url'];
            $firstKey = array_key_first($validator->errors()->toArray());

            $message = in_array($firstKey, $socialFields, true)
                ? $validator->errors()->first($firstKey)
                : $this->trans->get('Please complete all required fields before submitting.');

            return response()->json([
                'status' => false,
                'message' => $message,
            ], 422);
        }

        $data = $validator->validated();

        // Context fields for the admin email (not user-editable).
        $data['language'] = app()->getLocale();
        $data['submitted_from'] = 'collaborator_application_form_v1';
        $data['page_url'] = url()->previous();
        $data['user_agent'] = (string) $request->userAgent();

        try {
            Mail::to(self::RECIPIENT)->send(new CollaboratorApplicationMail($data));
        } catch (\Throwable $e) {
            Log::error('Collaborator application email failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => false,
                'message' => $this->trans->get('Submission failed. Please try again or contact the platform administrator.'),
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => $this->trans->get('Thank you. Your application has been submitted successfully.'),
        ], 200);
    }

    /**
     * Build a validation closure that ensures an (optional) URL belongs to one of
     * the allowed social-platform domains. Empty values pass (field is optional).
     * The $message is passed through Trans so it stays translatable.
     */
    private function socialUrlRule(array $allowedDomains, string $message): \Closure
    {
        return function (string $attribute, $value, \Closure $fail) use ($allowedDomains, $message) {
            if (blank($value)) {
                return; // optional field
            }

            if (! $this->urlHostMatchesAllowed((string) $value, $allowedDomains)) {
                $fail($this->trans->get($message));
            }
        };
    }

    /**
     * True when the URL's host equals an allowed domain or is a subdomain of one.
     * "youtube.com" and "www.youtube.com" pass for ["youtube.com"], but
     * "youtube.com.evil.com" does not.
     */
    private function urlHostMatchesAllowed(string $url, array $allowedDomains): bool
    {
        $host = parse_url($url, PHP_URL_HOST);

        if (empty($host)) {
            return false;
        }

        $host = strtolower($host);

        foreach ($allowedDomains as $domain) {
            $domain = strtolower($domain);
            if ($host === $domain || str_ends_with($host, '.' . $domain)) {
                return true;
            }
        }

        return false;
    }
}
