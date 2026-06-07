import React from 'react';
import Input from '@/Components/Input';
import SelectInput from '@/Components/SelectInput';
import TipTapEditor from '@/Components/TipTapEditor';
import PrimaryButton from '@/Components/PrimaryButton';

/**
 * Reusable, config-driven translations repeater.
 *
 * Props:
 *  - value       : the `translations` array from useForm
 *  - onChange    : (nextArray) => void  (push changes back to useForm)
 *  - languages   : [{ id, name, code }]
 *  - fields      : [{ key, label, type }]  where type is
 *                  'text' | 'textarea' | 'richtext' | 'keyvalue'
 *
 * Emitted shape (matches ContentTranslationService):
 *  [{ language_id: 2, fields: { title: '...', product_details: [{title,value}] } }]
 *
 * State lives entirely in the form via props. No localStorage/sessionStorage.
 */
export default function TranslationsRepeater({ value, onChange, languages = [], fields = [] }) {
    const blocks = Array.isArray(value) ? value : [];

    // language ids already chosen in OTHER blocks (so we can hide duplicates)
    const usedLanguageIds = (exceptIndex) =>
        blocks
            .filter((_, i) => i !== exceptIndex)
            .map((b) => b?.language_id)
            .filter((id) => id !== '' && id !== null && id !== undefined)
            .map(String);

    const availableLanguages = (index) => {
        const used = usedLanguageIds(index);
        return (languages || []).filter((l) => !used.includes(String(l.id)));
    };

    const addBlock = () => {
        const newFields = {};
        fields.forEach((f) => {
            if (f.type === 'keyvalue') newFields[f.key] = [];
        });
        onChange([...blocks, { language_id: '', fields: newFields }]);
    };

    const removeBlock = (index) => {
        onChange(blocks.filter((_, i) => i !== index));
    };

    const setLanguage = (index, langId) => {
        onChange(blocks.map((b, i) => (i === index ? { ...b, language_id: langId } : b)));
    };

    const setFieldValue = (index, key, val) => {
        onChange(
            blocks.map((b, i) =>
                i === index ? { ...b, fields: { ...(b.fields || {}), [key]: val } } : b,
            ),
        );
    };

    // ----- key/value (product_details style) nested repeater helpers -----
    const getRows = (index, key) => {
        const rows = blocks[index]?.fields?.[key];
        return Array.isArray(rows) ? rows : [];
    };

    const addKvRow = (index, key) => {
        setFieldValue(index, key, [...getRows(index, key), { title: '', value: '' }]);
    };

    const removeKvRow = (index, key, rowIdx) => {
        setFieldValue(
            index,
            key,
            getRows(index, key).filter((_, i) => i !== rowIdx),
        );
    };

    const setKvRow = (index, key, rowIdx, subKey, val) => {
        setFieldValue(
            index,
            key,
            getRows(index, key).map((r, i) => (i === rowIdx ? { ...r, [subKey]: val } : r)),
        );
    };

    // matches the smartphone English content textarea styling
    const textareaClass =
        'w-full resize-y rounded-lg border bg-white p-4 font-mono text-sm leading-relaxed text-gray-800 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-900 focus:outline-none dark:border-gray-600 dark:bg-deepcharcoal dark:text-white';

    const plusIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );

    const trashIcon = (
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
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
        </svg>
    );

    return (
        <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                        Translations
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Optional. Add manual translations per language. Empty fields fall back to
                        the default content.
                    </p>
                </div>

                <PrimaryButton
                    Text={'Add Translation'}
                    Type={'button'}
                    Id={'add_translation'}
                    CustomClass={'w-[220px]'}
                    Action={addBlock}
                    Icon={plusIcon}
                />
            </div>

            {blocks.length === 0 && (
                <p className="mt-4 rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    No translations added yet.
                </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-5">
                {blocks.map((block, index) => {
                    const blockKey =
                        block?.language_id !== '' && block?.language_id != null
                            ? `lang-${block.language_id}`
                            : `new-${index}`;

                    return (
                        <div
                            key={blockKey}
                            className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-deepcharcoal/40"
                        >
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div className="w-full max-w-xs">
                                    <SelectInput
                                        InputName={'Language'}
                                        Id={`translation_language_${index}`}
                                        Name={`translation_language_${index}`}
                                        items={availableLanguages(index)}
                                        itemKey={'name'}
                                        Value={block?.language_id ?? ''}
                                        Required={false}
                                        Action={(val) => setLanguage(index, val)}
                                    />
                                </div>

                                <PrimaryButton
                                    Text={'Remove'}
                                    Type={'button'}
                                    Id={`remove_translation_${index}`}
                                    CustomClass={'w-[130px] bg-red-500 hover:bg-red-600'}
                                    Action={() => removeBlock(index)}
                                    Icon={trashIcon}
                                />
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4">
                                {fields.map((f) => {
                                    const fieldId = `translation_${index}_${f.key}`;
                                    const fieldVal = block?.fields?.[f.key];

                                    if (f.type === 'richtext') {
                                        return (
                                            <TipTapEditor
                                                key={f.key}
                                                Label={f.label}
                                                Id={fieldId}
                                                Value={typeof fieldVal === 'string' ? fieldVal : ''}
                                                Action={(html) =>
                                                    setFieldValue(
                                                        index,
                                                        f.key,
                                                        html === '<p></p>' ? '' : html,
                                                    )
                                                }
                                            />
                                        );
                                    }

                                    if (f.type === 'textarea') {
                                        return (
                                            <div key={f.key} className="my-2">
                                                <label
                                                    htmlFor={fieldId}
                                                    className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
                                                >
                                                    {f.label}
                                                </label>
                                                <textarea
                                                    id={fieldId}
                                                    name={fieldId}
                                                    rows={12}
                                                    value={typeof fieldVal === 'string' ? fieldVal : ''}
                                                    onChange={(e) =>
                                                        setFieldValue(index, f.key, e.target.value)
                                                    }
                                                    placeholder={`Enter ${f.label}`}
                                                    className={textareaClass}
                                                />
                                            </div>
                                        );
                                    }

                                    if (f.type === 'keyvalue') {
                                        const rows = getRows(index, f.key);
                                        return (
                                            <div key={f.key} className="my-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <label className="block text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                        {f.label}
                                                    </label>
                                                    <PrimaryButton
                                                        Text={'Add Row'}
                                                        Type={'button'}
                                                        Id={`add_row_${index}_${f.key}`}
                                                        CustomClass={'w-[150px]'}
                                                        Action={() => addKvRow(index, f.key)}
                                                        Icon={plusIcon}
                                                    />
                                                </div>

                                                {rows.length > 0 && (
                                                    <div className="mt-3 overflow-x-auto scrollbar-thin dark:scrollbar-track-slate-900 dark:scrollbar-thumb-slate-700">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr>
                                                                    <th className="border p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-400">
                                                                        Title
                                                                    </th>
                                                                    <th className="border p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-400">
                                                                        Value
                                                                    </th>
                                                                    <th className="border p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-400">
                                                                        Action
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {rows.map((row, rowIdx) => (
                                                                    <tr key={rowIdx}>
                                                                        <td className="border p-2 dark:border-gray-700">
                                                                            <Input
                                                                                InputName={'Title'}
                                                                                Id={`${fieldId}_${rowIdx}_title`}
                                                                                Name={`${fieldId}_${rowIdx}_title`}
                                                                                Type={'text'}
                                                                                Value={row?.title ?? ''}
                                                                                Placeholder={'Enter Title'}
                                                                                Action={(e) =>
                                                                                    setKvRow(
                                                                                        index,
                                                                                        f.key,
                                                                                        rowIdx,
                                                                                        'title',
                                                                                        e.target.value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="border p-2 dark:border-gray-700">
                                                                            <Input
                                                                                InputName={'Value'}
                                                                                Id={`${fieldId}_${rowIdx}_value`}
                                                                                Name={`${fieldId}_${rowIdx}_value`}
                                                                                Type={'text'}
                                                                                Value={row?.value ?? ''}
                                                                                Placeholder={'Enter Value'}
                                                                                Action={(e) =>
                                                                                    setKvRow(
                                                                                        index,
                                                                                        f.key,
                                                                                        rowIdx,
                                                                                        'value',
                                                                                        e.target.value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="border p-2 dark:border-gray-700">
                                                                            <div className="flex items-center justify-center">
                                                                                <PrimaryButton
                                                                                    Type={'button'}
                                                                                    Id={`${fieldId}_${rowIdx}_delete`}
                                                                                    Action={() =>
                                                                                        removeKvRow(
                                                                                            index,
                                                                                            f.key,
                                                                                            rowIdx,
                                                                                        )
                                                                                    }
                                                                                    CustomClass={
                                                                                        'w-[50px] bg-red-500 hover:bg-red-600'
                                                                                    }
                                                                                    Icon={trashIcon}
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // default: plain text input
                                    return (
                                        <Input
                                            key={f.key}
                                            InputName={f.label}
                                            Id={fieldId}
                                            Name={fieldId}
                                            Type={'text'}
                                            Value={typeof fieldVal === 'string' ? fieldVal : ''}
                                            Placeholder={`Enter ${f.label}`}
                                            Action={(e) => setFieldValue(index, f.key, e.target.value)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
