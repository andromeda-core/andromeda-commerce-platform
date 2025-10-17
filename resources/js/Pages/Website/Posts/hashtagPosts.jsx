import GlobalSearch from '@/Components/GlobalSearch';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router } from '@inertiajs/react';
import React from 'react';

const hashtagPosts = ({ posts, next_page_url, hashtag, google_map_api_key }) => {
    return (
        <MainLayout>
            <Head title="HashTag" />

            <GlobalSearch
                google_map_api_key={google_map_api_key}
                additional_filters={false}
                hashtagPage={true}
                hashtag={hashtag}
            />
        </MainLayout>
    );
};

export default hashtagPosts;
