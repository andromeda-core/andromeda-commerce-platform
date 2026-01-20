<?php

namespace App\Repositories\Collaborators\Repository;

use App\Models\Collaborator;
use App\Models\Role;
use App\Models\User;
use App\Repositories\Collaborators\Interface\ICollaboratorRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Str;

class CollaboratorRepository implements ICollaboratorRepository
{
    public function __construct(
        private Collaborator $collaborator,
        private Role $role,
        private User $user
    ) {}

    public function getAllCollaborators(Request $request)
    {
        $collaborators = $this->collaborator
            ->with(['user'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('type', 'like', '%'.$request->input('search').'%')
                        ->orWhere('bank_account_no', 'like', '%'.$request->input('search').'%')
                        ->orWhereHas('user', function ($subQ) use ($request) {
                            $subQ->where('name', 'like', '%'.$request->input('search').'%')
                                ->orWhere('email', 'like', '%'.$request->input('search').'%')
                                ->orWhere('phone', 'like', '%'.$request->input('search').'%');
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $collaborators;
    }

    public function getSingleCollaborator(string $id)
    {
        $collaborator = $this->collaborator
            ->with(['user', 'user.roles'])
            ->find($id);

        return $collaborator;
    }

    public function storeCollaborator(Request $request)
    {
        $validated_req = $request->validate([
            'type' => ['required', 'string', 'in:Indivisual,Company'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:50', 'confirmed'],
            'phone' => ['required', 'unique:users,phone', 'max:50'],
            'address' => ['required', 'string', 'max:255'],
            'bank_account_no' => ['required', 'string', 'max:255'],
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'iban' => ['required', 'string', 'max:255'],
            'swift_code' => ['required', 'string', 'max:255'],
            'point_accumulation_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ], [
            'type.required' => 'The Collaborator Type Field Is Required.',
            'type.in' => 'The Collaborator Type Must Be Company Or Indivisual.',
        ]);

        if ($validated_req['commission_rate'] == 0) {
            $validated_req['commission_rate'] = null;
        }

        if ($validated_req['point_accumulation_rate'] == 0) {
            $validated_req['point_accumulation_rate'] = null;
        }

        try {

            DB::beginTransaction();

            $user = $this->user->create([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                'password' => bcrypt($validated_req['password']),
                'is_active' => $validated_req['is_active'],
            ]);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Creating New Linked User To Collaborator');
            }
            $referral_code = 'Ref-'.Str::random(12);

            $collaborator = $this->collaborator->create([

                'type' => $validated_req['type'],
                'referral_code' => $referral_code,
                'user_id' => $user->id,
                'address' => $validated_req['address'],
                'bank_account_no' => $validated_req['bank_account_no'],
                'bank_name' => $validated_req['bank_name'],
                'bank_account_name' => $validated_req['bank_account_name'],
                'iban' => $validated_req['iban'],
                'swift_code' => $validated_req['swift_code'],
                'point_accumulation_rate' => $validated_req['point_accumulation_rate'],
                'commission_rate' => $validated_req['commission_rate'] ?? null,
            ]);

            if (empty($collaborator)) {
                throw new Exception('Something Went Wrong While Creating New Collaborator');
            }

            $role = $this->role->where('name', 'Collaborator')->first();
            if (empty($role)) {
                throw new Exception('Something Went Wrong While Creating New Collaborator Please Create "Collaborator" Role First');
            }

            $user->syncRoles($role->name);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Collaborator Created Successfully',
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCollaborator(Request $request, string $id)
    {

        $collaborator = $this->getSingleCollaborator($id);

        if (empty($collaborator)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Collaborator',
            ];
        }

        $user = $this->user->find($collaborator->user_id);

        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Linked User To Collaborator',
            ];
        }

        $validated_req = $request->validate([
            'type' => ['required', 'string', 'in:Indivisual,Company'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            ...(
                $request->filled('password')
                ||
                $request->filled('password_confirmation')
                ? ['password' => ['required', 'string', 'min:8', 'max:50', 'confirmed']]
                :
                []
            ),
            'phone' => ['required', 'max:50', 'unique:users,phone,'.$user->id],
            'address' => ['required', 'string', 'max:255'],
            'bank_account_no' => ['required', 'string', 'max:255'],
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'iban' => ['required', 'string', 'max:255'],
            'swift_code' => ['required', 'string', 'max:255'],
            'point_accumulation_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ], [
            'type.required' => 'The Collaborator Type Field Is Required.',
            'type.in' => 'The Collaborator Type Must Be Company Or Indivisual.',
        ]);

        if ($validated_req['commission_rate'] == 0) {
            $validated_req['commission_rate'] = null;
        }

        if ($validated_req['point_accumulation_rate'] == 0) {
            $validated_req['point_accumulation_rate'] = null;
        }

        try {

            DB::beginTransaction();
            $user_updated = $user->update([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                ...(! empty($validated_req['password']) ? ['password' => $validated_req['password']] : []),
                'is_active' => $validated_req['is_active'],
            ]);

            if (! $user_updated) {
                throw new Exception('Something Went Wrong While Updating Linked User To Collaborator');
            }

            $collaborator_updated = $collaborator->update([
                'type' => $validated_req['type'],
                'address' => $validated_req['address'],
                'bank_account_no' => $validated_req['bank_account_no'],
                'bank_name' => $validated_req['bank_name'],
                'bank_account_name' => $validated_req['bank_account_name'],
                'iban' => $validated_req['iban'],
                'swift_code' => $validated_req['swift_code'],
                'point_accumulation_rate' => $validated_req['point_accumulation_rate'],
                'commission_rate' => $validated_req['commission_rate'] ?? null,

            ]);

            if (! $collaborator_updated) {
                throw new Exception('Something Went Wrong While Updating Collaborator');
            }

            $role = $this->role->where('name', 'Collaborator')->first();
            if (empty($role)) {
                throw new Exception('Something Went Wrong While Creating New Collaborator Please Create "Collaborator" Role First');
            }

            $user->syncRoles($role->name);
            DB::commit();

            return [
                'status' => true,
                'message' => 'Collaborator Updated Successfully',
            ];

        } catch (Exception  $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCollaborator(string $id)
    {
        try {
            DB::beginTransaction();
            $collaborator = $this->getSingleCollaborator($id);

            if (empty($collaborator)) {
                throw new Exception('Something Went Wrong While Deleting Collaborator');
            }

            $user = $this->user->find($collaborator->user_id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Deleting Linked User To Collaborator');
            }

            $collaborator_deleted = $collaborator->delete();

            if (! $collaborator_deleted) {
                throw new Exception('Something Went Wrong While Deleting Collaborator');
            }

            $user_deleted = $user->delete();

            if (! $user_deleted) {
                throw new Exception('Something Went Wrong While Deleting Linked User To Collaborator');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Collaborator Deleted Successfully',
            ];

        } catch (Exception  $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCollaboratorBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting Collaborator');
            }

            $collaborators = $this->collaborator->whereIn('id', $ids)->get();

            foreach ($collaborators as $collaborator) {
                $response = $this->destroyCollaborator($collaborator->id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Collaborators Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
