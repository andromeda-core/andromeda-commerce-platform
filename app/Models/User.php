<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Notifications\CustomResetPasswordNotification;
use App\Notifications\CustomVerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'is_agreed_to_terms',
        'language_id',
        'is_email_verification_sent',
        'language_locale',
        'profile',
        'last_activity_at',
        'is_dormant',
        'dormant_at',
        'deactivated_at',
        'suspended_at',
        'under_dispute_at',
        'under_investigation_at',
        'status',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['avatar', 'added_at', 'points'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    public function getPointsAttribute()
    {
        return $this->reward_points()->sum('points');
    }

    public function getAvatarAttribute()
    {
        $name = $this->name;

        $parts = explode(' ', trim($name));

        $first = isset($parts[0]) ? mb_strtoupper(mb_substr($parts[0], 0, 1)) : '';
        $last = isset($parts[1]) ? mb_strtoupper(mb_substr(end($parts), 0, 1)) : '';

        return $first.$last;
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPasswordNotification($token));
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmailNotification);
    }

    // RelationShips
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'user_id', 'id');
    }

    public function bookMarkedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'bookmarks', 'user_id', 'post_id')
            ->withTimestamps();
    }

    public function supplier(): HasOne
    {
        return $this->hasOne(Supplier::class, 'user_id', 'id');
    }

    public function collaborator(): HasOne
    {
        return $this->hasOne(Collaborator::class, 'user_id', 'id');
    }

    public function distributor(): HasOne
    {
        return $this->hasOne(Distributor::class, 'user_id', 'id');
    }

    public function reward_points(): HasMany
    {
        return $this->hasMany(RewardPoint::class, 'user_id', 'id');
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class, 'user_id', 'id');
    }

    public function supplierCommissionUsers(): HasMany
    {
        return $this->hasMany(SupplierCommission::class, 'user_id', 'id');
    }

    public function collaboratorCommissionUsers(): HasMany
    {
        return $this->hasMany(CollaboratorCommission::class, 'user_id', 'id');
    }

    public function metaContacts(): HasMany
    {
        return $this->hasMany(MetaContact::class, 'user_id', 'id');
    }

    public function emailChangeLogs(): HasMany
    {
        return $this->hasMany(EmailChangeLog::class, 'user_id', 'id');
    }

    public function emailChangeRequests(): HasMany
    {
        return $this->hasMany(EmailChangeRequest::class, 'user_id', 'id');
    }

    public function shippingAddressChangeLogs(): HasMany
    {
        return $this->hasMany(ShippingAddressChangeLog::class, 'user_id', 'id');
    }
}
