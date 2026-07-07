import WebInput from '@/Components/WebInput';
import WebSelectInput from '@/Components/WebSelectInput';
import WebTextArea from '@/Components/WebTextArea';
import Spinner from '@/Components/Spinner';
import Toast from '@/Components/Toast';
import { useLanguageStore } from '@/Hooks/useLanguageStore';
import { useTranslation } from '@/Hooks/useTranslation';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import goBackOrHome from '@/Helpers/backNavigationHelper';
import { trackPixelEvent } from '@/Helpers/metaPixel';
// Canonical English option values. Display labels are translated with t(),
// but the value submitted to the server (and shown in the admin email) stays English.
const OPTIONS = {
    preferred_contact_method: ['Email', 'WhatsApp', 'Telegram', 'Phone Call', 'Other'],
    applicant_type: [
        'Influencer',
        'Reseller',
        'Community Manager',
        'Offline Seller',
        'Content Creator',
        'Referral Partner',
        'Other',
    ],
    currently_promotes_products: ['Yes', 'No', 'Sometimes'],
    audience_size: [
        'Under 1,000',
        '1,000 - 5,000',
        '5,000 - 10,000',
        '10,000 - 50,000',
        '50,000 - 100,000',
        '100,000+',
    ],
    posts_per_week: ['1', '2 - 3', '4 - 6', '7+'],
    videos_per_month: ['0', '1 - 2', '3 - 5', '6 - 10', '10+'],
    estimated_monthly_reach: ['Under 100', '100 - 500', '500 - 1,000', '1,000 - 5,000', '5,000+'],
    estimated_monthly_sales: [
        '1 - 2 products',
        '3 - 5 products',
        '6 - 10 products',
        '10+ products',
        'Not sure yet',
    ],
    activities: [
        'Social media posts',
        'Short videos / reels',
        'Live streaming',
        'Community sharing',
        'Offline referrals',
        'Direct customer introduction',
        'Other',
    ],
    // product_categories: [
    //     'iPhone',
    //     'Samsung / Android Phones',
    //     'Smartphones',
    //     'Consumer Electronics',
    //     'Luxury / Premium Goods',
    //     'Other',
    // ],

    product_categories: [
    'iPhone / Apple Devices',
    'Samsung / Android Phones',
    'Mobile Accessories',
    'Consumer Electronics',
    'Luxury / Premium Goods',
    'Hotels / Stays',
    'Travel Packages / Tours',
    'Local Experiences / Activities',
    'K-Beauty / Lifestyle Products',
    'All Categories',
    'Other',
],
};

const REQUIRED_TEXT_FIELDS = [
    'full_name',
    'email',
    'country',
    'city',
    'phone',
    'preferred_contact_method',
    'languages',
    'applicant_type',
    'currently_promotes_products',
    'audience_size',
    'main_audience_region',
    'posts_per_week',
    'estimated_monthly_reach',
    'why_collaborator',
    'promotion_plan',
];

// Allowed host domains per social field. Host must equal one of these or be a
// subdomain of one. Mirrors the backend rule so wrong-platform links are caught
// before submit; the backend remains the source of truth.
const SOCIAL_URL_DOMAINS = {
    facebook_url: ['facebook.com', 'fb.com', 'm.facebook.com', 'fb.watch'],
    instagram_url: ['instagram.com', 'instagr.am'],
    tiktok_url: ['tiktok.com', 'vm.tiktok.com'],
    youtube_url: ['youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com'],
};

const SOCIAL_URL_MESSAGE = {
    facebook_url: 'Please enter a valid Facebook URL.',
    instagram_url: 'Please enter a valid Instagram URL.',
    tiktok_url: 'Please enter a valid TikTok URL.',
    youtube_url: 'Please enter a valid YouTube URL.',
};

// Empty passes (optional). Returns true when the value is a URL whose host
// equals an allowed domain or is a subdomain of one.
const isAllowedSocialUrl = (value, allowedDomains) => {
    if (!value || !value.trim()) return true;

    let host;
    try {
        host = new URL(value.trim()).hostname.toLowerCase();
    } catch {
        return false; // not a parseable URL
    }

    return allowedDomains.some(
        (domain) => host === domain || host.endsWith('.' + domain),
    );
};

const createInitialState = () => ({
    full_name: '',
    email: '',
    country: '',
    city: '',
    phone: '',
    preferred_contact_method: '',
    messenger_id: '',
    languages: '',
    applicant_type: '',
    currently_promotes_products: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    community_channel: '',
    audience_size: '',
    main_audience_region: '',
    audience_interests: '',
    posts_per_week: '',
    videos_per_month: '',
    estimated_monthly_reach: '',
    estimated_monthly_sales: '',
    activities: [],
    product_categories: [],
    experience: '',
    why_collaborator: '',
    promotion_plan: '',
    additional_message: '',
    agreement_admin_review: false,
    agreement_truthful_info: false,
    agreement_contact: false,
    // Honeypot: must stay empty for real users.
    website: '',
});

const index = () => {
    const { __, loading: translationLoading } = useTranslation();
    const t = (key) => (translationLoading ? key : __(key));

    const activeLanguageLocale = useLanguageStore((state) => state.activeLanguageLocale);
    const isRtl = ['ar', 'ur'].includes(activeLanguageLocale);

    const [form, setForm] = useState(createInitialState());
    const [processing, setProcessing] = useState(false);
    const [inlineError, setInlineError] = useState(null);

    // Toast feedback (same component/pattern as the Checkout page).
    const [successMessage, setSuccessMessage] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessMessage(true);
    };

    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorMessage(true);
    };

    const setData = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const toggleArrayValue = (key, value) =>
        setForm((prev) => {
            const current = prev[key];
            return {
                ...prev,
                [key]: current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value],
            };
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setInlineError(null);

        const missingText = REQUIRED_TEXT_FIELDS.some((field) => !String(form[field] ?? '').trim());
        const missingArrays = form.activities.length === 0 || form.product_categories.length === 0;
        const missingAgreements =
            !form.agreement_admin_review ||
            !form.agreement_truthful_info ||
            !form.agreement_contact;

        if (missingText || missingArrays || missingAgreements) {
            const message = t('Please complete all required fields before submitting.');
            setInlineError(message);
            showError(message);
            return;
        }

        // Optional social URLs: when present, each must belong to its own platform.
        for (const field of ['facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url']) {
            if (!isAllowedSocialUrl(form[field], SOCIAL_URL_DOMAINS[field])) {
                const message = t(SOCIAL_URL_MESSAGE[field]);
                setInlineError(message);
                showError(message);
                return;
            }
        }

        setProcessing(true);
        try {
            const response = await axios.post(
                route('website.collaborator-application.store'),
                form,
            );

            if (response?.data?.status) {
                trackPixelEvent('Lead');
                showSuccess(
                    response.data.message ||
                        t('Thank you. Your application has been submitted successfully.'),
                );
                setForm(createInitialState());
            } else {
                showError(
                    response?.data?.message ||
                        t(
                            'Submission failed. Please try again or contact the platform administrator.',
                        ),
                );
            }
        } catch (err) {
            showError(
                err?.response?.data?.message ||
                    t('Submission failed. Please try again or contact the platform administrator.'),
            );
        } finally {
            setProcessing(false);
        }
    };

    // ---- render helpers (plain functions, NOT inner components, so inputs are
    // not remounted on every keystroke; they reuse the platform's Web* components) ----

    const renderTextField = ({
        field,
        label,
        type = 'text',
        required = false,
        placeholder = '',
    }) => (
        <WebInput
            Id={field}
            Name={field}
            Type={type}
            InputName={t(label)}
            Placeholder={placeholder ? t(placeholder) : ''}
            Value={form[field]}
            Required={required}
            Action={(e) => setData(field, e.target.value)}
            ClassName={'dark:bg-surface-1-dark'}
        />
    );

    const renderSelectField = ({ field, label, required = false }) => (
        <WebSelectInput
            key={`${field}-${translationLoading ? 'l' : 'r'}-${activeLanguageLocale}`}
            Id={field}
            Name={field}
            InputName={t(label)}
            Required={required}
            items={OPTIONS[field].map((option) => ({ id: option, name: t(option) }))}
            itemKey={'name'}
            Value={form[field]}
            customPlaceHolder={true}
            Placeholder={t(label)}
            Action={(value) => setData(field, value ?? '')}
        />
    );

    const renderTextareaField = ({ field, label, required = false, placeholder = '' }) => (
        <WebTextArea
            Id={field}
            Name={field}
            InputName={t(label)}
            Placeholder={placeholder ? t(placeholder) : ''}
            Rows={5}
            Value={form[field]}
            Required={required}
            Action={(e) => setData(field, e.target.value)}
            ClassName={'dark:bg-surface-1-dark'}
        />
    );

    const renderCheckboxGroup = ({ field, label }) => (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark">
                {t(label)}
                <span className="font-bold"> *</span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {OPTIONS[field].map((option) => (
                    <label
                        key={option}
                        className="flex items-center gap-2 text-sm cursor-pointer text-main-text-light dark:text-main-text-dark"
                    >
                        <input
                            type="checkbox"
                            checked={form[field].includes(option)}
                            onChange={() => toggleArrayValue(field, option)}
                            className="w-4 h-4 rounded border-surface-3-light accent-main-text-light focus:ring-0 dark:border-surface-3-dark dark:accent-main-text-dark"
                        />
                        <span>{t(option)}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderAgreement = ({ field, text }) => (
        <label className="flex items-start gap-3 cursor-pointer">
            <input
                type="checkbox"
                checked={!!form[field]}
                onChange={(e) => setData(field, e.target.checked)}
                className="mt-1 border-gray-300 rounded cursor-pointer size-4 shrink-0 text-main-text-light focus:ring-0 dark:border-gray-600"
            />
            <span className="text-sm leading-relaxed text-main-text-light dark:text-main-text-dark">
                {t(text)}
                <span className="font-bold">&nbsp;*</span>
            </span>
        </label>
    );

    const renderSection = ({ title, description, children }) => (
        <section className="px-4 py-5 mb-5 rounded-md bg-surface-1-light dark:bg-surface-1-dark sm:px-6">
            <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                {t(title)}
            </h2>
            <p className="mt-1 mb-4 text-sm text-sub-text-light dark:text-sub-text-dark">
                {t(description)}
            </p>
            <div className="space-y-2">{children}</div>
        </section>
    );




    return (
        <MainLayout>
            <Head title={__('Collaborator Application', true)} />

            {(showSuccessMessage || showErrorMessage) && (
                <Toast
                    flash={{
                        ...(showErrorMessage
                            ? { error: errorMessage }
                            : { success: successMessage }),
                    }}
                    onClosed={(type) => {
                        if (type === 'error') {
                            setErrorMessage(null);
                            setShowErrorMessage(false);
                        }
                        if (type === 'success') {
                            setSuccessMessage(null);
                            setShowSuccessMessage(false);
                        }
                    }}
                />
            )}

            <div className="sm:px-6 lg:px-8">
                <div className="pb-24 mx-auto sm:max-w-4xl lg:mt-6 lg:max-w-7xl">
                    {/* Header */}
                    <div className="relative px-6 mx-auto my-2 sm:max-w-3xl lg:max-w-4xl">
                        <button
                            onClick={goBackOrHome}
                            className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-main-text-light dark:text-main-text-dark lg:hidden"
                        >
                            <ChevronLeft />
                        </button>

                        <p className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                            {t('Collaborator Program')}
                        </p>

                        <h1 className="mt-1 text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {t('Collaborator Application')}
                        </h1>

                        <p className="max-w-2xl mt-2 text-sm text-sub-text-light dark:text-sub-text-dark">
                            {t(
                                'Apply to become an official collaborator. Approved collaborators may receive a collaborator code and may earn platform points and commission when eligible customers purchase using that code.',
                            )}
                        </p>
                    </div>

                    <div className="px-6 mx-auto mt-6 sm:max-w-3xl lg:max-w-4xl">
                        <form onSubmit={handleSubmit} dir={isRtl ? 'rtl' : 'ltr'} noValidate>
                            {/* Honeypot: visually hidden, must stay empty for real users. */}
                            <input
                                type="text"
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                                value={form.website}
                                onChange={(e) => setData('website', e.target.value)}
                                style={{
                                    position: 'absolute',
                                    left: '-9999px',
                                    width: '1px',
                                    height: '1px',
                                    overflow: 'hidden',
                                }}
                            />

                            {/* Section 1 */}
                            {renderSection({
                                title: '1. Applicant Information',
                                description: 'Basic contact and location information.',
                                children: (
                                    <>
                                        {renderTextField({
                                            field: 'full_name',
                                            label: 'Full Name',
                                            required: true,
                                        })}
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {renderTextField({
                                                field: 'email',
                                                label: 'Email',
                                                type: 'email',
                                                required: true,
                                            })}
                                            {renderTextField({
                                                field: 'phone',
                                                label: 'Phone Number',
                                                required: true,
                                            })}
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {renderTextField({
                                                field: 'country',
                                                label: 'Country',
                                                required: true,
                                                placeholder: 'Example: United States',
                                            })}
                                            {renderTextField({
                                                field: 'city',
                                                label: 'City',
                                                required: true,
                                                placeholder: 'Example: New York',
                                            })}
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {renderSelectField({
                                                field: 'preferred_contact_method',
                                                label: 'Preferred Contact Method',
                                                required: true,
                                            })}
                                            {renderTextField({
                                                field: 'messenger_id',
                                                label: 'WhatsApp / Telegram / Other Contact ID',
                                                placeholder: 'Example: Telegram @username',
                                            })}
                                        </div>
                                        {renderTextField({
                                            field: 'languages',
                                            label: 'Languages You Can Use',
                                            required: true,
                                            placeholder: 'Example: English, Spanish',
                                        })}
                                    </>
                                ),
                            })}

                            {/* Section 2 */}
                            {renderSection({
                                title: '2. Applicant Type',
                                description: 'Tell us what kind of collaborator you are.',
                                children: (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {renderSelectField({
                                            field: 'applicant_type',
                                            label: 'Which best describes you?',
                                            required: true,
                                        })}
                                        {renderSelectField({
                                            field: 'currently_promotes_products',
                                            label: 'Do you currently sell or promote products online?',
                                            required: true,
                                        })}
                                    </div>
                                ),
                            })}

                            {/* Section 3 */}
                            {renderSection({
                                title: '3. Social Media / Audience',
                                description:
                                    'Share your audience and social channels if available.',
                                children: (
                                    <>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {renderTextField({
                                                field: 'facebook_url',
                                                label: 'Facebook Profile or Page URL',
                                                type: 'url',
                                                placeholder: 'https://facebook.com/...',
                                            })}
                                            {renderTextField({
                                                field: 'instagram_url',
                                                label: 'Instagram URL',
                                                type: 'url',
                                                placeholder: 'https://instagram.com/...',
                                            })}
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {renderTextField({
                                                field: 'tiktok_url',
                                                label: 'TikTok URL',
                                                type: 'url',
                                                placeholder: 'https://tiktok.com/@...',
                                            })}
                                            {renderTextField({
                                                field: 'youtube_url',
                                                label: 'YouTube URL',
                                                type: 'url',
                                                placeholder: 'https://youtube.com/...',
                                            })}
                                        </div>
                                        {renderTextField({
                                            field: 'community_channel',
                                            label: 'Telegram / WhatsApp Group or Channel',
                                            placeholder: 'Group/channel link or name',
                                        })}
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {renderSelectField({
                                                field: 'audience_size',
                                                label: 'Total Followers / Audience Size',
                                                required: true,
                                            })}
                                            {renderTextField({
                                                field: 'main_audience_region',
                                                label: 'Main Audience Country / Region',
                                                required: true,
                                                placeholder:
                                                    'Example: United States, North America',
                                            })}
                                        </div>
                                        {renderTextField({
                                            field: 'audience_interests',
                                            label: 'Audience Interests',
                                            placeholder:
                                                'Example: iPhone, smartphones, gadgets, shopping',
                                        })}
                                    </>
                                ),
                            })}

                            {/* Section 4 */}
                            {renderSection({
                                title: '4. Promotion Capacity',
                                description: 'Tell us how actively you can promote products.',
                                children: (
                                    <>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {renderSelectField({
                                                field: 'posts_per_week',
                                                label: 'Promotional posts per week',
                                                required: true,
                                            })}
                                            {renderSelectField({
                                                field: 'videos_per_month',
                                                label: 'Short videos / reels per month',
                                            })}
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {renderSelectField({
                                                field: 'estimated_monthly_reach',
                                                label: 'Potential buyers reached per month',
                                                required: true,
                                            })}
                                            {renderSelectField({
                                                field: 'estimated_monthly_sales',
                                                label: 'Estimated monthly sales potential',
                                            })}
                                        </div>
                                        {renderCheckboxGroup({
                                            field: 'activities',
                                            label: 'Which activities can you do?',
                                        })}
                                        {renderCheckboxGroup({
                                            field: 'product_categories',
                                            label: 'Product categories you are interested in promoting',
                                        })}
                                    </>
                                ),
                            })}

                            {/* Section 5 */}
                            {renderSection({
                                title: '5. Experience and Introduction',
                                description: 'Introduce yourself and your promotion plan.',
                                children: (
                                    <>
                                        {renderTextareaField({
                                            field: 'experience',
                                            label: 'Previous sales, marketing, or influencer experience',
                                            placeholder: 'Tell us about your past experience.',
                                        })}
                                        {renderTextareaField({
                                            field: 'why_collaborator',
                                            label: 'Why do you want to become a collaborator?',
                                            required: true,
                                            placeholder:
                                                'Introduce yourself and explain why you would be a good collaborator.',
                                        })}
                                        {renderTextareaField({
                                            field: 'promotion_plan',
                                            label: 'How do you plan to promote our products?',
                                            required: true,
                                            placeholder:
                                                'Describe what activities you can do and how often.',
                                        })}
                                        {renderTextareaField({
                                            field: 'additional_message',
                                            label: 'Additional message',
                                            placeholder: 'Anything else you want us to know?',
                                        })}
                                    </>
                                ),
                            })}

                            {/* Section 6 */}
                            {renderSection({
                                title: '6. Agreement',
                                description: 'Please confirm before submitting.',
                                children: (
                                    <div className="space-y-3">
                                        {renderAgreement({
                                            field: 'agreement_admin_review',
                                            text: 'I understand that submitting this form does not guarantee approval, and the platform admin will review my application.',
                                        })}
                                        {renderAgreement({
                                            field: 'agreement_truthful_info',
                                            text: 'I confirm that the information I provided is truthful and accurate.',
                                        })}
                                        {renderAgreement({
                                            field: 'agreement_contact',
                                            text: 'I agree that the platform may contact me regarding this collaborator application.',
                                        })}
                                    </div>
                                ),
                            })}

                            {inlineError && (
                                <p className="mb-3 text-sm text-red-500">{inlineError}</p>
                            )}

                            {/* Submit */}
                            <div className="flex flex-col items-end gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-main-text-light font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 sm:w-[220px] ${processing && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                >
                                    {processing && <Spinner customSize={'size-5'} />}
                                    {processing ? t('Submitting...') : t('Submit Application')}
                                </button>

                                <p className="max-w-2xl text-xs text-sub-text-light dark:text-sub-text-dark">
                                    {t(
                                        'Your application will be reviewed by the platform administrator. Approved collaborators may receive a collaborator account, collaborator code, and related point / commission terms.',
                                    )}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default index;
