@extends('layouts.admin')

@section('title')
    List Users
@endsection

@section('content-header')
    <div class="modern-hero">
        <h1 style="margin:0; font-size: 2.5rem; font-weight: 700;">User Management</h1>
        <p style="margin:5px 0 0; opacity: 0.9;">Manage all registered users on the system.</p>
    </div>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Users</li>
    </ol>
@endsection

@section('content')
<style>
    .user-card {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        border-top: none !important; /* Override default box border */
        background: var(--card-bg);
    }

    .user-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: var(--primary-gradient);
    }

    .user-avatar {
        width: 80px;
        height: 80px;
        border: 3px solid #667eea;
        padding: 3px;
        margin-bottom: 15px;
        transition: transform 0.5s ease;
    }

    .user-card:hover .user-avatar {
        transform: rotate(360deg) scale(1.1);
        border-color: #764ba2;
    }

    .user-name {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 5px;
        color: #fff;
    }

    .user-username {
        color: #a0aec0;
        font-size: 0.9rem;
        margin-bottom: 5px;
    }

    .user-email {
        color: #667eea;
        font-size: 0.85rem;
        margin-bottom: 15px;
    }

    .user-badges {
        margin-bottom: 15px;
    }

    .user-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        background: rgba(0,0,0,0.2);
        padding: 10px;
        border-radius: 10px;
    }

    .stat-item {
        text-align: center;
    }

    .stat-value {
        display: block;
        font-size: 1.2rem;
        font-weight: bold;
        color: #fff;
    }

    .stat-label {
        font-size: 0.75rem;
        color: #a0aec0;
        text-transform: uppercase;
    }

    .btn-manage {
        border-radius: 20px;
        background: var(--secondary-gradient);
        border: none;
        font-weight: bold;
        letter-spacing: 1px;
    }

    .search-box {
        background: var(--card-bg);
        padding: 20px;
        border-radius: 15px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="search-box">
            <form action="{{ route('admin.users') }}" method="GET">
                <div class="input-group input-group-lg">
                    <input type="text" name="filter[email]" class="form-control" value="{{ request()->input('filter.email') }}" placeholder="Search users by email...">
                    <div class="input-group-btn">
                        <button type="submit" class="btn btn-primary"><i class="fa fa-search"></i> Search</button>
                        <a href="{{ route('admin.users.new') }}" class="btn btn-success"><i class="fa fa-plus"></i> Create New</a>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="row">
    @foreach ($users as $user)
        <div class="col-md-4 col-sm-6 col-xs-12">
            <div class="box user-card">
                <div class="box-body text-center">
                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower($user->email)) }}?s=200" class="img-circle user-avatar" />
                    <h3 class="user-name">{{ $user->name_first }} {{ $user->name_last }}</h3>
                    <p class="user-username">{{ $user->username }}</p>
                    <p class="user-email">{{ $user->email }}</p>

                    <div class="user-badges">
                        @if($user->root_admin)
                            <span class="label label-warning" style="background: var(--warning-gradient);">Admin</span>
                        @else
                            <span class="label label-primary" style="background: var(--primary-gradient);">User</span>
                        @endif

                        @if($user->use_totp)
                            <span class="label label-success" style="background: var(--success-gradient);">2FA Enabled</span>
                        @else
                            <span class="label label-danger" style="background: var(--danger-gradient);">No 2FA</span>
                        @endif
                    </div>

                    <div class="user-stats">
                        <div class="stat-item">
                            <span class="stat-value">{{ $user->servers_count }}</span>
                            <span class="stat-label">Servers</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{{ $user->subuser_of_count }}</span>
                            <span class="stat-label">Access</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{{ $user->id }}</span>
                            <span class="stat-label">ID</span>
                        </div>
                    </div>

                    <a href="{{ route('admin.users.view', $user->id) }}" class="btn btn-primary btn-block btn-manage">
                        <i class="fa fa-cog"></i> Manage User
                    </a>
                </div>
            </div>
        </div>
    @endforeach
</div>

<div class="row">
    <div class="col-xs-12 text-center">
        @if($users->hasPages())
            {!! $users->appends(['query' => Request::input('query')])->render() !!}
        @endif
    </div>
</div>
@endsection
