<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemplateTranslation extends Model
{
    protected $fillable = [
        'template_id',
        'language_id',
        'field',
        'value',
    ];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class);
    }
}
