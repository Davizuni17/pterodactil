import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';

import ServerSidebar from '@/components/server/ServerSidebar';

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();

    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const serverName = ServerContext.useStoreState((state) => state.server.data?.name);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            {/* Desktop Navigation */}
            <div className='hidden md:block'>
                <NavigationBar />
            </div>

            {/* Mobile Top Bar - Always visible */}
            <div className='md:hidden fixed top-0 left-0 right-0 h-14 z-40 px-3'>
                <div className='h-full flex items-center justify-between rounded-b-2xl bg-gradient-to-r from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-md border-b border-x border-gray-800 shadow-lg'>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className='ml-1 w-10 h-10 flex items-center justify-center text-gray-100 bg-purple-500/20 rounded-xl border border-purple-400/20 hover:bg-purple-500/30 hover:border-purple-400/30 transition-all'
                        title='Open Menu'
                        aria-label='Open Menu'
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>

                    <div className='flex-1 px-3'>
                        <div className='mx-auto max-w-[220px] text-center'>
                            <div className='text-gray-100 font-semibold text-sm truncate'>{serverName || 'Server'}</div>
                            <div className='text-gray-400 text-2xs uppercase tracking-wider truncate'>Server</div>
                        </div>
                    </div>

                    {/* Right spacer to keep title centered */}
                    <div className='mr-1 w-10 h-10' />
                </div>
            </div>

            {!uuid || !id ? (
                error ? (
                    <ServerError message={error} />
                ) : (
                    <Spinner size={'large'} centered />
                )
            ) : (
                <div className='flex flex-row h-screen md:h-[calc(100vh-64px)] md:mt-0 mt-14 overflow-hidden relative bg-gradient-to-b from-gray-900 to-gray-800'>
                    <ServerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <div className='flex-1 overflow-y-auto bg-transparent flex flex-col relative'>
                        <div className='flex-1'>
                            <InstallListener />
                            <TransferListener />
                            <WebsocketHandler />
                            {inConflictState &&
                            (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                                <ConflictStateRenderer />
                            ) : (
                                <ErrorBoundary>
                                    <TransitionRouter>
                                        <Switch location={location}>
                                            {routes.server.map(({ path, permission, component: Component }) => (
                                                <PermissionRoute
                                                    key={path}
                                                    permission={permission}
                                                    path={to(path)}
                                                    exact
                                                >
                                                    <Spinner.Suspense>
                                                        <Component />
                                                    </Spinner.Suspense>
                                                </PermissionRoute>
                                            ))}
                                            <Route path={'*'} component={NotFound} />
                                        </Switch>
                                    </TransitionRouter>
                                </ErrorBoundary>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};
