<?php

namespace App\Repositories\Posts\Interface;

use Illuminate\Http\Request;

interface IPostRepository
{
    public function getAllPosts(Request $request);

    public function getSinglePostBySlug(string $slug, Request $request);

    public function getSinglePostById(string $id);

    public function storePost(Request $request);

    public function updatePost(Request $request, string $slug);

    public function destroyPost(string $id);

    public function destroyPostBySelection(Request $request);

    public function autoCompleteLocations(Request $request);

    public function placeDetails(string $placeId);

    public function toggleBookmark(Request $request);

    // Fetching Posts For Website
    public function getPostsForWebsite(Request $request);

    public function getInfinityScrollablePostsForWebsite(Request $request);

    public function getGoogleMapSettings();

    public function getRelatedPosts(Request $request, ?string $slug);

    public function getHashtagPosts(Request $request, ?string $hashtag);
}
