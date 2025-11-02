<?php

namespace App\Repositories\Users\Interface;

use Illuminate\Http\Request;

interface IUserRepository
{
    public function getSingleUser(string $id);

    public function updateProfile(Request $request);

    public function updatePassword(Request $request);

    public function destroyAccount(Request $request);

    public function getAllUsers(Request $request);

    public function storeUser(Request $request);

    public function updateUser(Request $request, string $id);

    public function destroyUser(string $id);

    public function destroyUserBySelection(Request $request);

    public function getAllRoles();

    public function getSingleCustomer(string $user_id);
}
