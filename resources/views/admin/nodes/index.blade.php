@extends('layouts.admin')

@section('title')
    List Nodes
@endsection

@section('scripts')
    @parent
    {!! Theme::css('vendor/fontawesome/animation.min.css') !!}
@endsection

@section('content-header')
    <div class="modern-hero">
        <h1 style="margin:0; font-size: 2.5rem; font-weight: 700;">Node Management</h1>
        <p style="margin:5px 0 0; opacity: 0.9;">Monitor and manage your infrastructure nodes.</p>
    </div>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Nodes</li>
    </ol>
@endsection

@section('content')
<style>
    .node-card {
        background: var(--card-bg);
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 30px;
        transition: all 0.3s ease;
        border: 1px solid rgba(255,255,255,0.05);
        position: relative;
    }

    .node-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        border-color: #667eea;
    }

    .node-header {
        padding: 20px;
        background: rgba(0,0,0,0.2);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .node-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #fff;
        margin: 0;
    }

    .node-location {
        font-size: 0.8rem;
        color: #a0aec0;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .node-body {
        padding: 20px;
    }

    .resource-bar {
        background: rgba(255,255,255,0.1);
        height: 6px;
        border-radius: 3px;
        margin-top: 5px;
        margin-bottom: 15px;
        overflow: hidden;
    }

    .resource-fill {
        height: 100%;
        background: var(--primary-gradient);
        border-radius: 3px;
    }

    .node-stat {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 0.9rem;
        color: #cbd5e0;
    }

    .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 5px;
    }

    .status-online { background: #48bb78; box-shadow: 0 0 10px #48bb78; }
    .status-offline { background: #f56565; box-shadow: 0 0 10px #f56565; }

    .node-footer {
        padding: 15px 20px;
        background: rgba(0,0,0,0.1);
        border-top: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
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
            <form action="{{ route('admin.nodes') }}" method="GET">
                <div class="input-group input-group-lg">
                    <input type="text" name="filter[name]" class="form-control" value="{{ request()->input('filter.name') }}" placeholder="Search nodes...">
                    <div class="input-group-btn">
                        <button type="submit" class="btn btn-primary"><i class="fa fa-search"></i> Search</button>
                        <a href="{{ route('admin.nodes.new') }}" class="btn btn-success"><i class="fa fa-plus"></i> Create New</a>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="row">
    @foreach ($nodes as $node)
        <div class="col-md-4 col-sm-6 col-xs-12">
            <div class="node-card">
                <div class="node-header">
                    <div>
                        <h3 class="node-title">
                            <span data-action="ping" data-secret="{{ $node->getDecryptedKey() }}" data-location="{{ $node->scheme }}://{{ $node->fqdn }}:{{ $node->daemonListen }}/api/system">
                                <i class="fa fa-circle text-muted"></i>
                            </span>
                            {{ $node->name }}
                        </h3>
                        <span class="node-location"><i class="fa fa-map-marker"></i> {{ $node->location->short }}</span>
                    </div>
                    <div>
                        @if($node->maintenance_mode)
                            <span class="label label-warning" title="Maintenance Mode"><i class="fa fa-wrench"></i></span>
                        @endif
                        @if($node->public)
                            <span class="label label-success" title="Public"><i class="fa fa-eye"></i></span>
                        @else
                            <span class="label label-default" title="Private"><i class="fa fa-eye-slash"></i></span>
                        @endif
                    </div>
                </div>
                <div class="node-body">
                    <div class="node-stat">
                        <span><i class="fa fa-microchip"></i> Memory</span>
                        <span>{{ $node->memory }} MiB</span>
                    </div>
                    <div class="resource-bar">
                        <div class="resource-fill" style="width: 100%"></div>
                    </div>

                    <div class="node-stat">
                        <span><i class="fa fa-hdd-o"></i> Disk</span>
                        <span>{{ $node->disk }} MiB</span>
                    </div>
                    <div class="resource-bar">
                        <div class="resource-fill" style="width: 100%; background: var(--secondary-gradient);"></div>
                    </div>

                    <div class="row" style="margin-top: 15px;">
                        <div class="col-xs-6 text-center" style="border-right: 1px solid rgba(255,255,255,0.1);">
                            <h4 style="margin:0; font-weight:bold;">{{ $node->servers_count }}</h4>
                            <small style="color:#a0aec0;">Servers</small>
                        </div>
                        <div class="col-xs-6 text-center">
                            <h4 style="margin:0; font-weight:bold;">
                                @if($node->scheme === 'https')
                                    <i class="fa fa-lock text-success"></i>
                                @else
                                    <i class="fa fa-unlock text-danger"></i>
                                @endif
                            </h4>
                            <small style="color:#a0aec0;">SSL</small>
                        </div>
                    </div>
                </div>
                <div class="node-footer">
                    <code style="background: rgba(0,0,0,0.3); border:none;">{{ $node->fqdn }}:{{ $node->daemonListen }}</code>
                    <a href="{{ route('admin.nodes.view', $node->id) }}" class="btn btn-primary btn-sm">Manage</a>
                </div>
            </div>
        </div>
    @endforeach
</div>

<div class="row">
    <div class="col-xs-12 text-center">
        @if($nodes->hasPages())
            {!! $nodes->appends(['query' => Request::input('query')])->render() !!}
        @endif
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    (function pingNodes() {
        $('span[data-action="ping"]').each(function(i, element) {
            $.ajax({
                type: 'GET',
                url: $(element).data('location'),
                headers: {
                    'Authorization': 'Bearer ' + $(element).data('secret'),
                },
                timeout: 5000
            }).done(function (data) {
                $(element).find('i').tooltip({
                    title: 'v' + data.version,
                });
                $(element).find('i').removeClass().addClass('fa fa-circle text-success');
            }).fail(function (error) {
                var errorText = 'Error connecting to node! Check browser console for details.';
                try {
                    errorText = error.responseJSON.errors[0].detail || errorText;
                } catch (ex) {}

                $(element).find('i').removeClass().addClass('fa fa-circle text-danger');
                $(element).find('i').tooltip({ title: errorText });
            });
        });
    })();
    </script>
@endsection
