import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';
import RawHtmlContentInput from '@/Components/RawHtmlContentInput';
import TranslationsRepeater from '@/Components/TranslationsRepeater';
import { areTranslationsComplete } from '@/Hooks/useTranslationsComplete';
// NEW (Phase 2): reusable, domain-agnostic AI translation generator (sits above the manual repeater).
import AiTranslationRepeater from '@/Components/AiTranslationRepeater';
import AiTranslationPanel from '@/Components/AiTranslationPanel';
import useAiTranslation, { mergeTranslationField, cleanupIncompleteTranslation } from '@/Hooks/useAiTranslation';

export default function create({ languages }) {
    // Create Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        status: true,
        translations: [],
    });

    // Create Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.templates.store'), {
            onSuccess: () => reset(),
        });
    };

    // Frontend guard: disable submit while any open translation block is incomplete.
    const translationsOk = areTranslationsComplete(data.translations, ['content']);

    // NEW (Phase 2): AI translation wiring. Reuses the shared, domain-agnostic AI stack with
    // ZERO changes to it. The AI action is a pure generator; the template save flow still
    // persists via TemplateTranslationService.
    const ai = useAiTranslation();
    const aiSourceFields = { content: data.content };
    const aiEndpoint = 'dashboard.templates.ai-translate-field';
    // Templates translate CONTENT ONLY. The hook default order is Post-specific and the repeater
    // does not forward fieldOrder, so wrap startTranslation to pin fieldOrder ['content'] for the
    // repeater chips without modifying the shared component.
    const aiStartTranslation = (language, sourceFields, endpointRouteName, onInject, options = {}) =>
        ai.startTranslation(language, sourceFields, endpointRouteName, onInject, {
            ...options,
            fieldOrder: ['content'],
        });
    // Whole-object functional setData: setData('translations', fn) stores the fn AS the value and
    // wipes the array, so merge via the whole-object updater instead.
    const aiInject = (languageId, field, value) =>
        setData((prev) => ({
            ...prev,
            translations: mergeTranslationField(prev.translations, languageId, field, value),
        }));
    const aiIncomplete = (languageId, info) =>
        setData((prev) => ({
            ...prev,
            translations: cleanupIncompleteTranslation(prev.translations, { languageId, ...info }),
        }));

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Create Template" />

                <BreadCrumb
                    header={'Create Template'}
                    parent={'Templates'}
                    parent_link={route('dashboard.templates.index')}
                    child={'Create Template'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Templates'}
                                    URL={route('dashboard.templates.index')}
                                    Icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                            />
                                        </svg>
                                    }
                                />
                            </div>

                            <form onSubmit={submit}>
                                <Card
                                    Content={
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Input
                                                    InputName={'Template Title'}
                                                    Error={errors.title}
                                                    Value={data.title}
                                                    Action={(e) => setData('title', e.target.value)}
                                                    Placeholder={'Enter Template Title'}
                                                    Id={'title'}
                                                    Name={'title'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <SelectInput
                                                    InputName={'Status'}
                                                    Id={'status'}
                                                    Name={'status'}
                                                    Error={errors.status}
                                                    Value={data.status ? 1 : 0}
                                                    Required={true}
                                                    Action={(value) => setData('status', Number(value) === 1)}
                                                    items={[
                                                        { id: 1, name: 'Active' },
                                                        { id: 0, name: 'In Active' },
                                                    ]}
                                                    itemKey={'name'}
                                                />
                                            </div>

                                            {/* Raw HTML content (mirrors the Smartphone content textarea exactly). */}
                                            <RawHtmlContentInput
                                                Label={'Content'}
                                                Id={'content'}
                                                Error={errors?.content}
                                                Required={true}
                                                Value={data.content}
                                                Action={(e) => setData('content', e.target.value)}
                                            />

                                            {/* NEW (Phase 2): AI translation generator above the manual repeater. */}
                                            <AiTranslationRepeater
                                                sourceFields={aiSourceFields}
                                                languages={languages}
                                                translations={data.translations}
                                                endpointRouteName={aiEndpoint}
                                                onInject={aiInject}
                                                startTranslation={aiStartTranslation}
                                                jobs={ai.jobs}
                                                onIncomplete={aiIncomplete}
                                            />

                                            <AiTranslationPanel
                                                jobs={ai.jobs}
                                                onCancel={ai.cancel}
                                                onDismiss={ai.dismiss}
                                                onRetry={(languageId) => {
                                                    const lang = languages.find(
                                                        (l) => Number(l.id) === Number(languageId),
                                                    );
                                                    if (!lang) return;
                                                    const list = Array.isArray(data.translations)
                                                        ? data.translations
                                                        : [];
                                                    const previousBlock =
                                                        list.find(
                                                            (b) => String(b?.language_id) === String(languageId),
                                                        ) || null;
                                                    ai.startTranslation(lang, aiSourceFields, aiEndpoint, aiInject, {
                                                        previousBlock,
                                                        onIncomplete: aiIncomplete,
                                                        fieldOrder: ['content'],
                                                    });
                                                }}
                                            />

                                            {/* Manual per-language content translations (isolated template_translations). */}
                                            <TranslationsRepeater
                                                languages={languages}
                                                value={data.translations}
                                                onChange={(next) => setData('translations', next)}
                                                fields={[
                                                    { key: 'content', label: 'Content', type: 'textarea' },
                                                ]}
                                            />

                                            <PrimaryButton
                                                Text={'Create Template'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.title.trim() === '' ||
                                                    data.content.trim() === '' ||
                                                    !translationsOk ||
                                                    ai.isBusy // NEW (Phase 2): lock Save while AI translation runs
                                                }
                                                Spinner={processing}
                                                Icon={
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                        />
                                                    </svg>
                                                }
                                            />
                                        </>
                                    }
                                />
                            </form>
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
