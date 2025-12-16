@extends('layouts.admin')

@section('title')
    Administration
@endsection

@section('content-header')
@endsection

@section('content')
<style>
    :root {
        --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --secondary-gradient: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        --warning-gradient: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
        --danger-gradient: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
        --card-bg: rgba(255, 255, 255, 0.1);
        --glass-border: 1px solid rgba(255, 255, 255, 0.18);
    }

    .content-wrapper {
        background: #1a202c !important;
        color: #fff;
    }

    .modern-hero {
        background: var(--primary-gradient);
        border-radius: 20px;
        padding: 40px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        position: relative;
        overflow: hidden;
        animation: slideDown 0.8s ease-out;
    }

    .modern-hero::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
        animation: rotate 20s linear infinite;
    }

    .hero-content {
        position: relative;
        z-index: 1;
    }

    .hero-title {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .hero-subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
    }

    .status-card {
        background: #2d3748;
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        border: 1px solid #4a5568;
        position: relative;
        overflow: hidden;
    }

    .status-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        border-color: #667eea;
    }

    .status-icon {
        font-size: 2.5rem;
        margin-bottom: 15px;
        background: -webkit-linear-gradient(#eee, #333);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .action-btn {
        display: block;
        padding: 20px;
        border-radius: 15px;
        color: white !important;
        text-decoration: none !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        border: none;
        text-align: center;
        margin-bottom: 20px;
    }

    .action-btn i {
        font-size: 2rem;
        display: block;
        margin-bottom: 10px;
        transition: transform 0.3s ease;
    }

    .action-btn:hover i {
        transform: scale(1.2) rotate(5deg);
    }

    .action-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }

    .btn-discord { background: #7289da; background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%); }
    .btn-docs { background: #2ecc71; background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); }
    .btn-github { background: #333; background: linear-gradient(135deg, #333 0%, #000 100%); }
    .btn-support { background: #e74c3c; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }

    @keyframes slideDown {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .version-badge {
        background: rgba(255,255,255,0.2);
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        display: inline-block;
        margin-top: 10px;
    }
</style>

<div class="modern-hero">
    <div class="hero-content">
        <h1 class="hero-title">Welcome Back, Admin!</h1>
        <p class="hero-subtitle">Your Pterodactyl panel is running smoothly.</p>
        <div class="version-badge">
            <i class="fa fa-code-fork"></i> Version {{ config('app.version') }}
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="status-card">
            <div class="row">
                <div class="col-md-8">
                    <h3 style="margin-top: 0; color: #fff;">System Status</h3>
                    @if ($version->isLatestPanel())
                        <p class="text-success" style="font-size: 1.2rem; font-weight: bold;">
                            <i class="fa fa-check-circle"></i> You are running the latest version!
                        </p>
                        <p style="color: #a0aec0;">Your system is up-to-date and secure.</p>
                    @else
                        <p class="text-danger" style="font-size: 1.2rem; font-weight: bold;">
                            <i class="fa fa-exclamation-triangle"></i> Update Available
                        </p>
                        <p style="color: #a0aec0;">
                            New version <a href="https://github.com/Pterodactyl/Panel/releases/v{{ $version->getPanel() }}" target="_blank" style="color: #667eea; text-decoration: underline;">{{ $version->getPanel() }}</a> is available.
                        </p>
                    @endif
                </div>
                <div class="col-md-4 text-right hidden-xs">
                    <i class="fa fa-server" style="font-size: 5rem; color: rgba(255,255,255,0.1);"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-xs-6 col-md-3">
        <a href="{{ $version->getDiscord() }}" class="action-btn btn-discord">
            <i class="fa fa-life-ring"></i>
            <span>Get Help</span>
        </a>
    </div>
    <div class="col-xs-6 col-md-3">
        <a href="https://pterodactyl.io" class="action-btn btn-docs">
            <i class="fa fa-book"></i>
            <span>Documentation</span>
        </a>
    </div>
    <div class="col-xs-6 col-md-3">
        <a href="https://github.com/pterodactyl/panel" class="action-btn btn-github">
            <i class="fa fa-github"></i>
            <span>GitHub</span>
        </a>
    </div>
    <div class="col-xs-6 col-md-3">
        <a href="{{ $version->getDonations() }}" class="action-btn btn-support">
            <i class="fa fa-heart"></i>
            <span>Support Us</span>
        </a>
    </div>
</div>
@endsection
