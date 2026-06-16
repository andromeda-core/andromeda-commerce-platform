import { router } from '@inertiajs/react';

export default function goBackOrHome() {
    const urlBefore = window.location.href;

    const onPop = () => {
        window.removeEventListener('popstate', onPop);
        if (window.location.href === urlBefore) {
            window.history.back();
        }
    };

    window.addEventListener('popstate', onPop);
    window.history.back();

    window.setTimeout(() => {
        if (window.location.href === urlBefore) {
            window.removeEventListener('popstate', onPop);
            router.visit(route('home'));
        }
    }, 350);
}
