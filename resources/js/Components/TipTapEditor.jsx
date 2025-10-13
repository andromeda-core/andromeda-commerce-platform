// TipTapEditor.jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';

const FontSizeTextStyle = TextStyle.extend({
    addAttributes() {
        return {
            fontSize: {
                default: null,
                parseHTML: (element) => element.style.fontSize,
                renderHTML: (attributes) => {
                    if (!attributes.fontSize) return {};
                    return { style: `font-size: ${attributes.fontSize}` };
                },
            },
        };
    },
});

const CustomBold = Bold.extend({
    renderHTML({ HTMLAttributes }) {
        const { style, ...rest } = HTMLAttributes;
        const newStyle = 'font-weight: bold;' + (style ? ' ' + style : '');
        return ['span', { ...rest, style: newStyle.trim() }, 0];
    },
});

export default function TipTapEditor({ Label, Id, Action, Value, Required = false, Error }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: false,
                italic: false,
                underline: false,
                strike: false,
                link: false,
                textStyle: false,
                marks: {
                    bold: false,
                    italic: false,
                    underline: false,
                    strike: false,
                    link: false,
                },
            }),
            CustomBold,
            Italic,
            Strike,
            TextStyle,
            FontFamily,
            Color,
            Highlight,
            Underline,
            Link.configure({ openOnClick: false, autolink: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: Value ?? '',
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert focus:outline-none max-w-none',
            },
            transformPastedHTML(html) {
                return html.replace(/ style="[^"]*color:[^";]+;?[^"]*"/g, '');
            },
        },
        onUpdate({ editor }) {
            Action(editor.getHTML());
        },
    });

    if (!editor) return null;

    const buttonClass = (isActive) =>
        `w-10 rounded-md border px-2 py-1 dark:border-gray-600 dark:bg-deepcharcoal dark:text-black ${
            isActive ? 'bg-indigo-100 dark:bg-white  font-bold' : 'bg-white dark:text-white'
        }`;

    return (
        <div className="my-4">
            {Label && (
                <label
                    htmlFor={Id}
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {Label}{' '}
                    {Required ? <span className="text-red-500 dark:text-white"> *</span> : ''}
                </label>
            )}

            <div className="rounded-lg p-2 shadow-2xl dark:bg-deepcharcoal">
                {/* Toolbar */}
                <div className="m-1 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={buttonClass(editor.isActive('bold'))}
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={buttonClass(editor.isActive('italic'))}
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={buttonClass(editor.isActive('underline'))}
                    >
                        U
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={buttonClass(editor.isActive('strike'))}
                    >
                        S
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={buttonClass(editor.isActive('highlight'))}
                    >
                        H
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (editor.isActive('link')) {
                                editor.chain().focus().unsetLink().run();
                            } else {
                                const url = prompt('Enter URL');
                                if (url) {
                                    editor.chain().focus().setLink({ href: url }).run();
                                }
                            }
                        }}
                        className={buttonClass(editor.isActive('link'))}
                    >
                        🔗
                    </button>
                </div>

                {/* Editor */}
                <div
                    className="max-h-[500px] min-h-[200px] cursor-text resize-y overflow-auto rounded-lg border bg-white p-4 shadow-sm scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-900 dark:border-gray-600 dark:bg-deepcharcoal dark:text-white"
                    onClick={() => editor.chain().focus().run()}
                >
                    <EditorContent editor={editor} className="h-auto" id={Id} />
                </div>
            </div>
            <div className="h-5">
                {Error && <p className="mt-1.2 ml-1 text-red-500 dark:text-white">{Error}</p>}
            </div>
        </div>
    );
}
