<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class ModelName extends Model
{
    protected $fillable = ['name', 'is_active'];

    protected $appends = ['added_at'];

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function smartphones(): HasMany
    {
        return $this->hasMany(Smartphone::class, 'model_name_id', 'id');
    }

    // Static Booting
    protected static function booted()
    {
        static::updated(function ($model) {
            if ($model->isDirty('name')) {
                $model->smartphones()->update([
                    'model_searchable_name' => $model->name,
                ]);
            }

        });

        static::saving(function () {
            Cache::tags(['feed'])->flush();
        });

        static::deleted(function () {
            Cache::tags(['feed'])->flush();
        });
    }
}
