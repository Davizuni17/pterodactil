@extends('layouts.admin')

@section('title')
    Locations
@endsection

@section('content-header')
    <div class="modern-hero">
        <h1 style="margin:0; font-size: 2.5rem; font-weight: 700;">Locations</h1>
        <p style="margin:5px 0 0; opacity: 0.9;">Manage deployment locations for your nodes.</p>
    </div>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Locations</li>
    </ol>
@endsection

@section('content')
<style>
    .location-card {
        background: var(--card-bg);
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 30px;
        transition: all 0.3s ease;
        border: 1px solid rgba(255,255,255,0.05);
        position: relative;
        display: flex;
        flex-direction: column;
    }

    .location-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        border-color: #667eea;
    }

    .location-header {
        padding: 20px;
        background: rgba(0,0,0,0.2);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .location-title {
        font-size: 1.4rem;
        font-weight: bold;
        color: #fff;
        margin: 0;
        letter-spacing: 1px;
    }

    .location-id {
        font-family: monospace;
        font-size: 0.8rem;
        color: #a0aec0;
        background: rgba(0,0,0,0.3);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .location-body {
        padding: 20px;
        flex-grow: 1;
    }

    .location-desc {
        color: #a0aec0;
        font-size: 0.9rem;
        margin-bottom: 20px;
        height: 40px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .stat-row {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding-top: 15px;
        border-top: 1px solid rgba(255,255,255,0.05);
    }

    .stat-item {
        text-align: center;
        flex: 1;
    }

    .stat-value {
        font-size: 1.2rem;
        font-weight: bold;
        color: #fff;
        display: block;
    }

    .stat-label {
        font-size: 0.75rem;
        color: #a0aec0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .location-footer {
        padding: 15px 20px;
        background: rgba(0,0,0,0.1);
        border-top: 1px solid rgba(255,255,255,0.05);
        text-align: right;
    }

    .create-btn-container {
        margin-bottom: 30px;
        text-align: right;
    }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="create-btn-container">
            <button class="btn btn-success btn-lg" data-toggle="modal" data-target="#newLocationModal">
                <i class="fa fa-plus"></i> Create New Location
            </button>
        </div>
    </div>
</div>

<div class="row">
    @foreach ($locations as $location)
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="location-card">
                <div class="location-header">
                    <h3 class="location-title">{{ $location->short }}</h3>
                    <span class="location-id">ID: {{ $location->id }}</span>
                </div>
                <div class="location-body">
                    <div class="location-desc" title="{{ $location->long }}">
                        {{ $location->long }}
                    </div>
                    <div class="stat-row">
                        <div class="stat-item" style="border-right: 1px solid rgba(255,255,255,0.05);">
                            <span class="stat-value">{{ $location->nodes_count }}</span>
                            <span class="stat-label">Nodes</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{{ $location->servers_count }}</span>
                            <span class="stat-label">Servers</span>
                        </div>
                    </div>
                </div>
                <div class="location-footer">
                    <a href="{{ route('admin.locations.view', $location->id) }}" class="btn btn-primary btn-sm btn-block">Manage Location</a>
                </div>
            </div>
        </div>
    @endforeach
</div>

<div class="modal fade" id="newLocationModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content" style="background: var(--card-bg); color: #fff;">
            <form action="{{ route('admin.locations') }}" method="POST">
                <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="color: #fff; opacity: 0.8;"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Create Location</h4>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-12">
                            <label for="pShortModal" class="form-label">Short Code</label>
                            <input type="text" name="short" id="pShortModal" class="form-control" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff;" />
                            <p class="text-muted small">A short identifier used to distinguish this location from others. Must be between 1 and 60 characters, for example, <code>us.nyc.lvl3</code>.</p>
                        </div>
                        <div class="col-md-12">
                            <label for="pLongModal" class="form-label">Description</label>
                            <textarea name="long" id="pLongModal" class="form-control" rows="4" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff;"></textarea>
                            <p class="text-muted small">A longer description of this location. Must be less than 191 characters.</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success btn-sm">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
