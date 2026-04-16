<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCourierCompany extends Model
{
    protected $fillable = ['name', 'address', 'postal_code', 'phone', 'is_active'];


    //    Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d H:i:s') : null;
    }
}
