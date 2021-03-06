<?php

namespace App\Policies;

use App\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Auth;


class UserPolicy
{
    use HandlesAuthorization;
    
    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        //
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\User  $user
     * @param  \App\User  $model
     * @return mixed
     */
    public function view(User $user, User $model)
    {
        //
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        //
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\User  $user
     * @param  \App\User  $model
     * @return mixed
     */
    public function update(User $user)
    {
        return Auth::check();
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\User  $user
     * @param  \App\User  $model
     * @return mixed
     */
    public function delete(User $user, User $model)
    {
        return $user->id == $model->id;
    }

   
    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\User  $user
     * @param  \App\User  $model
     * @return mixed
     */
    public function restore(User $user, User $model)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\User  $user
     * @param  \App\User  $model
     * @return mixed
     */
    public function forceDelete(User $user, User $model)
    {
        //
    }

    public function verify(User $user)
    {
        // error_log("\n\n\n\nHEEEEERREEEE");
        // if(!Auth::check()){
        //     error_log("\n\n\nNAAAOO taaaa\n\n\n");
        //     return true;
        // }else{
        //     error_log("\n\n\n taaaa\n\n\n");
        //     return false;
        // }
        return true;
    }

    /**
     * Determine whether the user can report the user.
     *
     * @return mixed
     */
    public function report()
    {
        return Auth::check();
    }

     /**
     * Determine whether the admin can delete the model.
     *
     * @param  \App\Admin  $admin
     * @param  \App\Admin  $model
     * @return mixed
     */
    public function adminDel()
    {
        return !Auth::guard('admin')->check();
    }


}
