import { usePage } from '@inertiajs/react';

export default function can(permissions) {
    const { auth } = usePage().props;

    if (!Array.isArray(permissions)) {
        permissions = [permissions];
    }

    return permissions.some((p) => auth.user.permissions.includes(p)) || auth.user.role === 'Admin';
}
