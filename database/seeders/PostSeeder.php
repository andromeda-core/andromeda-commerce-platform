<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = collect();
        for ($i = 0; $i < 3000; $i++) {

            $posts->push([
                'title' => 'adssdadsasdajkhgasdhgdsaksadgh',
                'content' => '<p>adssdadsadsasad</p>',
                'tag' => null,
                'post_type' => 'Review',
                'status' => '1',
                'floor_id' => '1',
                'latitude' => null,
                'longitude' => null,
                'location_name' => null,
                'user_id' => 1,
                'slug' => 'adssdadsasdajkhgasdhgdsaksadgh-1764438218-212-9382de08-7db2-4087-835c-3f745fd0ec89'.uniqid(),
                'images' => json_encode([
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Images/1764438221692b30cd12ba6-qahNDgGwq2.webp',
                        'name' => 'post-image-'.uniqid().'.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Images/1764438221692b30cd12ba6-qahNDgGwq2.webp',
                        'name' => 'post-image-'.uniqid().'.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Images/1764438221692b30cd12ba6-qahNDgGwq2.webp',
                        'name' => 'post-image-'.uniqid().'.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Images/1764438221692b30cd12ba6-qahNDgGwq2.webp',
                        'name' => 'post-image-'.uniqid().'.webp',
                    ],
                ]),

                'videos' => json_encode([
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                    [
                        'url' => 'https://cdn.andromeda.blue/Posts/Videos/17642624756928824b3f84a-KnfzBNjuxu.mp4',
                        'name' => '17642624756928824b3f84a-KnfzBNjuxu.mp4'.uniqid(),
                        'thumbnail_url' => 'https://cdn.andromeda.blue/Posts/Videos/Thumbnails/1764262600692882c835a74-IMdD9ALZOp.webp',
                    ],
                ]),
            ]);
        }

        if ($posts->count() > 0) {
            Post::insert($posts->toArray());
        }
    }
}
