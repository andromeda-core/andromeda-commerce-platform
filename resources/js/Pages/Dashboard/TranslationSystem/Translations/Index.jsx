import { useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Input from '@/Components/Input';
import Textarea from '@/Components/Textarea';
import axios from 'axios';

const Index = ({ selected_language_code, translations, translation_keys }) => {
    // Create a map of translation_key_id -> translation value for quick lookup
    const translationMap = useMemo(() => {
        const map = {};
        translations.forEach(trans => {
            map[trans.translation_key_id] = trans.value || '';
        });
        return map;
    }, [translations]);

    // Initialize state with existing translations
    const [translationValues, setTranslationValues] = useState(translationMap);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);


    // Export Translation CSV LOGIC
    const [isExporting, setIsExporting] = useState(false);
    const exportTranslations = () => {
        setIsExporting(true);
        window.location.href = route('dashboard.translation-system.translations.export', selected_language_code);
        setTimeout(() => {
            setIsExporting(false);
        }, 500);
    }



    // Import Logic
    const [isImporting, setIsImporting] = useState(false);


    // Filter translation keys based on search
    const filteredKeys = useMemo(() => {
        if (!searchQuery.trim()) return translation_keys;
        const query = searchQuery.toLowerCase();
        return translation_keys.filter(key =>
            key.key.toLowerCase().includes(query)
        );
    }, [translation_keys, searchQuery]);

    // Handle translation input change
    const handleTranslationChange = (keyId, value) => {
        setTranslationValues(prev => {
            const updated = { ...prev };

            updated[keyId] = value;

            return updated;
        });
        setHasChanges(true);
    };


    // Handle save
    const handleSave = () => {

        const translationsData = [];
        const deletedTranslationsData = [];

        Object.entries(translationValues).forEach(([keyId, value]) => {
            const trimmedValue = value.trim();

            if (trimmedValue === '') {
                // Deleted translation
                deletedTranslationsData.push({
                    translation_key_id: parseInt(keyId),
                });
            } else {
                // Normal translation
                translationsData.push({
                    translation_key_id: parseInt(keyId),
                    value: trimmedValue,
                });
            }
        });


        setIsSaving(true);
        router.put(route('dashboard.translation-system.translations.save'), {
            language_code: selected_language_code,
            translations: translationsData,
            deletedTranslationsData: deletedTranslationsData,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setHasChanges(false);
                setIsSaving(false);
            },
            onError: () => {
                setIsSaving(false);
            }
        });
    };

    // Calculate statistics
    const totalKeys = translation_keys.length;
    const translatedCount = translation_keys.filter(
        key => translationValues[key.id]?.trim()
    ).length;
    const progress = totalKeys > 0 ? (translatedCount / totalKeys) * 100 : 0;





    return (
        <>
            <AuthenticatedLayout>
                <Head title={`Translations - ${selected_language_code.toUpperCase()}`} />
                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">

                                <PrimaryButton
                                    Action={exportTranslations}
                                    Disabled={isExporting}
                                    Text={"Export Translations CSV"}
                                    Type={'button'}
                                    Spinner={isExporting}
                                    CustomClass={"w-[300px]"}
                                    Id={'translation_export'}
                                    Icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>

                                    }
                                />

                                <PrimaryButton
                                    Action={() => {
                                        document.getElementById('import_file').click();

                                    }}
                                    Disabled={isImporting}
                                    Text={"Import Translations"}
                                    Type={'button'}
                                    Spinner={isImporting}
                                    CustomClass={"w-[300px]"}
                                    Id={'translation_import'}
                                    Icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                        </svg>
                                    }
                                />

                                <input
                                    type="file"
                                    accept=".xlsx,.csv"
                                    id='import_file'
                                    className='hidden'
                                    disabled={isImporting}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setIsImporting(true);
                                        router.post(
                                            route('dashboard.translation-system.translations.import'),
                                            {
                                                import_file: file,
                                                language_code: selected_language_code,

                                            },
                                            {
                                                forceFormData: true,

                                                onSuccess: (page) => {
                                                    if (page?.props?.flash?.success) {
                                                        window.location.reload();
                                                    }
                                                },
                                                onFinish: () => {
                                                    setIsImporting(false);
                                                    e.target.value = null;
                                                },
                                            }
                                        );
                                    }}
                                />

                                <LinkButton
                                    Text={'Back To Languages'}
                                    URL={route('dashboard.translation-system.languages.index')}
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



                                <PrimaryButton
                                    Action={handleSave}
                                    Disabled={isSaving || !hasChanges}
                                    Text={"Save Translations"}
                                    Type={'button'}
                                    Spinner={isSaving}
                                    CustomClass={"w-[300px]"}
                                    Id={'translation_save'}
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
                                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                            />
                                        </svg>
                                    }
                                />



                            </div>


                            <div className="px-3">


                                {/* Header Section */}
                                <div className="mb-8">
                                    <div className="flex flex-wrap items-center justify-between mb-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white/80">
                                                Translation Management
                                            </h1>
                                            <p className="mt-1 text-gray-600 dark:text-white/80">
                                                Language: <span className="font-semibold text-gray-900 dark:text-white/80">{selected_language_code.toUpperCase()}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-md shadow-sm dark:border-gray-800 dark:bg-zinc-950/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-white/80">
                                                Translation Progress
                                            </span>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-white/80">
                                                {translatedCount} / {totalKeys} ({progress.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 text-gray-700 dark:text-white/80 rounded-full h-2.5">
                                            <div
                                                className={` ${progress < 25 ? 'bg-red-600' : (progress < 50 ? 'bg-purple-600' : (progress < 75 ? 'bg-yellow-600' : 'bg-blue-600'))} ${progress === 100 ? 'bg-green-600' : ''} h-2.5 rounded-full transition-all duration-300`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="mb-6">

                                    <Input
                                        Placeholder={"Search translation keys.."}
                                        Type={"text"}
                                        Value={searchQuery}
                                        Action={(e) => setSearchQuery(e.target.value)}
                                        CustomClass={"mt-4"}
                                        ClassName={"!h-[60px]"}
                                    />
                                </div>

                                {/* Translations List */}
                                <Card
                                    Content={
                                        <>
                                            {/* Table Header */}
                                            <div className="grid grid-cols-2 gap-4 px-6 py-4 font-semibold text-gray-700 border-b border-gray-200 dark:text-white/80 dark:border-gray-800 dark:bg-zinc-900 bg-gray-50">
                                                <div>Translation Key</div>
                                                <div>Translation Value</div>
                                            </div>

                                            {/* Translation Rows */}
                                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                                {filteredKeys.length > 0 ? (
                                                    filteredKeys.map((key) => (
                                                        <div
                                                            key={key.id}
                                                            className="grid grid-cols-2 gap-4 px-6 py-4 transition-colors hover:bg-gray-50 dark:text-white/80 dark:hover:bg-zinc-900"
                                                        >
                                                            {/* Key Column */}
                                                            <div className="flex items-center">
                                                                <div className="flex-1 max-w-2xl overflow-x-auto overflow-y-auto max-h-40 overscroll-none">
                                                                    <code className="block px-3 py-3 font-mono text-sm text-gray-900 break-all whitespace-pre-wrap bg-gray-100 rounded dark:text-white/80 dark:bg-gray-800">
                                                                        {key.key}
                                                                    </code>
                                                                </div>
                                                            </div>

                                                            {/* Translation Input Column */}
                                                            <Textarea
                                                                Value={translationValues[key.id] || ''}
                                                                Action={(e) => handleTranslationChange(key.id, e.target.value)}
                                                                Placeholder={`Enter translation for "${key.key}"`}
                                                                Rows={1}


                                                            />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-6 py-12 text-center text-gray-500">
                                                        {searchQuery ? 'No translation keys match your search.' : 'No translation keys available.'}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    }
                                />

                                {/* Footer Info */}
                                {hasChanges && (
                                    <div className="p-4 mt-6 border border-yellow-200 rounded-lg bg-yellow-50 dark:border-gray-800 dark:bg-zinc-900/30">
                                        <p className="text-sm text-white/80">
                                            <span className="font-semibold">Unsaved changes detected.</span> Make sure to save your translations before leaving this page.
                                        </p>
                                    </div>
                                )}

                            </div>

                        </>
                    }
                />




            </AuthenticatedLayout>
        </>
    );
};

export default Index;
