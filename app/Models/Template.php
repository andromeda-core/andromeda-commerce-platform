<?php

namespace App\Models;

use App\Traits\HasTemplateTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Template extends Model
{
    // Isolated translations stack (NOT HasContentTranslations). Only `content` is
    // translated; `title` is a plain, non-translated admin label.
    use HasTemplateTranslations;

    protected array $templateTranslatableFields = ['content'];

    protected $fillable = [
        'public_id',
        'title',
        'content',
        'slug',
        'status',
    ];

    // Casting
    protected $casts = [
        'status' => 'boolean',
    ];

    // Static Booting
    protected static function booted()
    {
        static::creating(function ($template) {
            if (empty($template->public_id)) {
                $template->public_id = 'tpl_'.Str::uuid();
            }

            // Derive a unique slug from the title (short random suffix avoids unique clashes).
            if (empty($template->slug) && ! empty($template->title)) {
                $template->slug = Str::slug($template->title).'-'.Str::lower(Str::random(6));
            }
        });
    }
}
