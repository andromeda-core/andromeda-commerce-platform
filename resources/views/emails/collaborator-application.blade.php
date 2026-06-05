@php
    $order = [
        'language' => 'Language',
        'full_name' => 'Full Name',
        'email' => 'Email',
        'country' => 'Country',
        'city' => 'City',
        'phone' => 'Phone Number',
        'preferred_contact_method' => 'Preferred Contact Method',
        'messenger_id' => 'WhatsApp / Telegram / Other Contact ID',
        'languages' => 'Languages You Can Use',
        'applicant_type' => 'Applicant Type',
        'currently_promotes_products' => 'Currently Promotes Products',
        'facebook_url' => 'Facebook URL',
        'instagram_url' => 'Instagram URL',
        'tiktok_url' => 'TikTok URL',
        'youtube_url' => 'YouTube URL',
        'community_channel' => 'Telegram / WhatsApp Group or Channel',
        'audience_size' => 'Audience Size',
        'main_audience_region' => 'Main Audience Country / Region',
        'audience_interests' => 'Audience Interests',
        'posts_per_week' => 'Promotional Posts Per Week',
        'videos_per_month' => 'Short Videos / Reels Per Month',
        'estimated_monthly_reach' => 'Potential Buyers Reached Per Month',
        'estimated_monthly_sales' => 'Estimated Monthly Sales Potential',
        'activities' => 'Activities',
        'product_categories' => 'Product Categories',
        'experience' => 'Experience',
        'why_collaborator' => 'Why Collaborator',
        'promotion_plan' => 'Promotion Plan',
        'additional_message' => 'Additional Message',
        'agreement_admin_review' => 'Agreement: Admin Review',
        'agreement_truthful_info' => 'Agreement: Truthful Information',
        'agreement_contact' => 'Agreement: Contact Consent',
        'page_url' => 'Page URL',
        'user_agent' => 'User Agent',
    ];
@endphp
<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
    <h2>New Collaborator Application</h2>
    <p>A new collaborator application was submitted from the platform collaborator application page.</p>
    <table style="border-collapse:collapse;width:100%;max-width:900px;">
        @foreach ($order as $key => $label)
            @php
                $raw = $data[$key] ?? null;
                if (is_array($raw)) { $raw = implode(', ', $raw); }
                if (is_bool($raw)) { $raw = $raw ? 'Agreed' : ''; }
            @endphp
            @if (! blank($raw))
                <tr>
                    <th style="text-align:left;padding:8px;border:1px solid #ddd;background:#f7f7f7;vertical-align:top;">{{ $label }}</th>
                    <td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap;">{{ $raw }}</td>
                </tr>
            @endif
        @endforeach
    </table>
</div>
