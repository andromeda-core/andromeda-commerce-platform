import { Node, mergeAttributes, PasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import ProductCardView from './ProductCardView';

const ProductCardNodeView = ({ node }) => {
    return (
        <NodeViewWrapper
            as="div"
            data-type="product-card"
            data-public-id={node.attrs.publicId || ''}
            data-slug={node.attrs.slug || ''}
            contentEditable={false}
        >
            <ProductCardView
                publicId={node.attrs.publicId}
                slug={node.attrs.slug}
            />
        </NodeViewWrapper>
    );
};

export const ProductCardNode = Node.create({
    name: 'productCard',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            publicId: {
                default: null,
                parseHTML: el => el.getAttribute('data-public-id'),
                renderHTML: attrs => attrs.publicId ? { 'data-public-id': attrs.publicId } : {},
            },
            slug: {
                default: null,
                parseHTML: el => el.getAttribute('data-slug'),
                renderHTML: attrs => attrs.slug ? { 'data-slug': attrs.slug } : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="product-card"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'product-card' })];
    },

    addPasteRules() {
        return [
            new PasteRule({
                find: (text) => {
                    const appUrl = (typeof route === 'function' && route().t?.url)
                        || window.location.origin;

                    let host;
                    try {
                        host = new URL(appUrl).host;
                    } catch {
                        return [];
                    }

                    const escapedHost = host.replace(/\./g, '\\.');

                    // Match: https?://{host}/product/{prd_uuid}/{optional-slug}
                    const pattern = new RegExp(
                        `https?:\\/\\/${escapedHost}\\/product\\/(prd_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\\/([a-z0-9-]+))?`,
                        'gi'
                    );

                    const matches = [];
                    let match;
                    while ((match = pattern.exec(text)) !== null) {
                        matches.push({
                            index: match.index,
                            text: match[0],
                            data: {
                                publicId: match[1],
                                slug: match[2] || null,
                            },
                        });
                    }
                    return matches;
                },
                handler: ({ state, range, match, commands }) => {
                    const { publicId, slug } = match.data;
                    commands.insertContentAt(range, {
                        type: 'productCard',
                        attrs: { publicId, slug },
                    });
                },
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ProductCardNodeView);
    },
});

export default ProductCardNode;
