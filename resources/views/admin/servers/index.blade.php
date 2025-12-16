@extends('layouts.admin')

@section('title')
    List Servers
@endsection

@section('content-header')
    <div class="modern-hero">
        <h1 style="margin:0; font-size: 2.5rem; font-weight: 700;">Server Management</h1>
        <p style="margin:5px 0 0; opacity: 0.9;">View and manage all servers on the panel.</p>
    </div>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Servers</li>
    </ol>
@endsection

@section('content')
<style>
    .server-card {
        background: var(--card-bg);
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 30px;
        transition: all 0.3s ease;
        border: 1px solid rgba(255,255,255,0.05);
        position: relative;
    }

    .server-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        border-color: #667eea;
    }

    .server-header {
        padding: 20px;
        background: rgba(0,0,0,0.2);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .server-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #fff;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
    }

    .server-uuid {
        font-family: monospace;
        font-size: 0.8rem;
        color: #a0aec0;
        background: rgba(0,0,0,0.3);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .server-body {
        padding: 20px;
    }

    .server-info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 0.9rem;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        padding-bottom: 5px;
    }

    .server-info-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .info-label {
        color: #a0aec0;
    }

    .info-value {
        color: #fff;
        font-weight: 500;
    }

    .info-value a {
        color: #667eea;
        text-decoration: none;
        transition: color 0.2s;
    }

    .info-value a:hover {
        color: #764ba2;
    }

    .server-footer {
        padding: 15px 20px;
        background: rgba(0,0,0,0.1);
        border-top: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .status-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: bold;
        text-transform: uppercase;
    }

    .status-active { background: rgba(72, 187, 120, 0.2); color: #48bb78; }
    .status-suspended { background: rgba(245, 101, 101, 0.2); color: #f56565; }
    .status-installing { background: rgba(237, 137, 54, 0.2); color: #ed8936; }

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
            <form action="{{ route('admin.servers') }}" method="GET">
                <div class="input-group input-group-lg">
                    <input type="text" name="filter[*]" class="form-control" value="{{ request()->input()['filter']['*'] ?? '' }}" placeholder="Search servers...">
                    <div class="input-group-btn">
                        <button type="submit" class="btn btn-primary"><i class="fa fa-search"></i> Search</button>
                        <a href="{{ route('admin.servers.new') }}" class="btn btn-success"><i class="fa fa-plus"></i> Create New</a>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="row">
    @foreach ($servers as $server)
        <div class="col-md-4 col-sm-6 col-xs-12">
            <div class="server-card">
                <div class="server-header">
                    <h3 class="server-title" title="{{ $server->name }}">{{ $server->name }}</h3>
                    <span class="server-uuid">{{ $server->uuidShort }}</span>
                </div>
                <div class="server-body">
                    <div class="server-info-row">
                        <span class="info-label"><i class="fa fa-user"></i> Owner</span>
                        <span class="info-value">
                            <a href="{{ route('admin.users.view', $server->user->id) }}">{{ $server->user->username }}</a>
                        </span>
                    </div>
                    <div class="server-info-row">
                        <span class="info-label"><i class="fa fa-server"></i> Node</span>
                        <span class="info-value">
                            <a href="{{ route('admin.nodes.view', $server->node->id) }}">{{ $server->node->name }}</a>
                        </span>
                    </div>
                    <div class="server-info-row">
                        <span class="info-label"><i class="fa fa-plug"></i> Connection</span>
                        <span class="info-value">
                            @if($server->allocation)
                                {{ $server->allocation->alias }}:{{ $server->allocation->port }}
                            @else
                                <span class="text-muted">No Allocation</span>
                            @endif
                        </span>
                    </div>
                    <div class="server-info-row">
                        <span class="info-label"><i class="fa fa-info-circle"></i> Status</span>
                        <span class="info-value">
                            @if($server->isSuspended())
                                <span class="status-badge status-suspended">Suspended</span>
                            @elseif(!$server->isInstalled())
                                <span class="status-badge status-installing">Installing</span>
                            @else
                                <span class="status-badge status-active">Active</span>
                            @endif
                        </span>
                    </div>
                </div>
                <div class="server-footer">
                    <small class="text-muted">ID: {{ $server->id }}</small>
                    <a href="{{ route('admin.servers.view', $server->id) }}" class="btn btn-primary btn-sm">Manage</a>
                </div>
            </div>
        </div>
    @endforeach
</div>

<div class="row">
    <div class="col-xs-12 text-center">
        @if($servers->hasPages())
            {!! $servers->appends(['filter' => Request::input('filter')])->render() !!}
        @endif
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $('.console-popout').on('click', function (event) {
            event.preventDefault();
            window.open($(this).attr('href'), 'Pterodactyl Console', 'width=800,height=400');
        });
    </script>
@endsection
