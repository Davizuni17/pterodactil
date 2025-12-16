import React from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { ServerContext } from '@/state/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTerminal,
    faFolderOpen,
    faDatabase,
    faCalendarAlt,
    faUsers,
    faArchive,
    faNetworkWired,
    faPlay,
    faCogs,
    faEye,
    faExternalLinkAlt,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import routes from '@/routers/routes';
import Can from '@/components/elements/Can';
import PowerButtons from '@/components/server/console/PowerButtons';
import tw, { styled } from 'twin.macro';
import { useStoreState } from 'easy-peasy';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const SidebarContainer = styled.div<{ $open: boolean }>`
    ${tw`w-64 flex-shrink-0 flex flex-col h-full bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out z-50`};
    ${tw`bg-gray-900/90`};
    backdrop-filter: blur(10px);

    ${tw`fixed inset-y-0 left-0 md:relative md:translate-x-0`};
    transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(-100%)')};
`;

const Overlay = styled.div<{ $open: boolean }>`
    ${tw`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300`};
    opacity: ${({ $open }) => ($open ? '1' : '0')};
    pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
    backdrop-filter: blur(2px);
`;

const ServerHeader = styled.div`
    ${tw`p-6 flex flex-col items-center border-b border-gray-800 relative`};
`;

const CloseButton = styled.button`
    ${tw`absolute top-2 right-2 text-gray-400 hover:text-white md:hidden p-2`};
    ${tw`rounded-lg hover:bg-white/10 transition-colors`};
`;

const ServerIcon = styled.div`
    ${tw`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-white shadow-lg bg-gradient-to-br from-purple-600 to-gray-900 border border-purple-500/20`};
`;

const ServerName = styled.h2`
    ${tw`text-lg font-bold text-white text-center mb-1`};
`;

const ServerStatus = styled.div`
    ${tw`text-xs text-gray-400 flex items-center gap-2`};
`;

const NavItem = styled(NavLink)`
    ${tw`flex items-center px-6 py-3 text-gray-400 transition-all duration-200 border-l-4 border-transparent hover:bg-gray-800 hover:text-white`};

    &.active {
        ${tw`bg-gray-800 text-purple-300 border-purple-500`};
    }

    svg {
        ${tw`mr-3 w-5`};
    }
`;

const CategoryTitle = styled.div`
    ${tw`px-6 py-2 mt-4 text-xs font-bold text-gray-500 uppercase tracking-wider`};
`;

const PowerControlContainer = styled.div`
    ${tw`px-6 py-4 border-b border-gray-800`};
`;

const iconMap: { [key: string]: any } = {
    Console: faTerminal,
    Files: faFolderOpen,
    Databases: faDatabase,
    Schedules: faCalendarAlt,
    Users: faUsers,
    Backups: faArchive,
    Network: faNetworkWired,
    Startup: faPlay,
    Settings: faCogs,
    Activity: faEye,
};

export default ({ open, onClose }: SidebarProps) => {
    const match = useRouteMatch<{ id: string }>();
    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const name = ServerContext.useStoreState((state) => state.server.data?.name);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data?.allocations.find((allocation) => allocation.isDefault);
        return match ? `${match.alias || match.ip}:${match.port}` : 'n/a';
    });

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    if (!id) return null;

    return (
        <>
            <Overlay $open={open} onClick={onClose} />
            <SidebarContainer $open={open}>
                <ServerHeader>
                    <CloseButton onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </CloseButton>
                    <ServerIcon>{name?.charAt(0).toUpperCase()}</ServerIcon>
                    <ServerName>{name}</ServerName>
                    <div className='text-xs text-gray-500 mb-2 font-mono'>{allocation}</div>
                    <ServerStatus>
                        <span
                            className={`w-2 h-2 rounded-full ${
                                status === 'running'
                                    ? 'bg-green-500'
                                    : status === 'offline'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                            }`}
                        ></span>
                        {status}
                    </ServerStatus>
                </ServerHeader>

                <PowerControlContainer>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'flex justify-between space-x-2'} />
                    </Can>
                </PowerControlContainer>

                <div className='flex-1 overflow-y-auto py-4'>
                    <CategoryTitle>General</CategoryTitle>
                    {routes.server
                        .filter((route) => !!route.name)
                        .map((route) => {
                            const Icon = iconMap[route.name!] || faTerminal;
                            return route.permission ? (
                                <Can key={route.path} action={route.permission} matchAny>
                                    <NavItem to={to(route.path, true)} exact={route.exact} onClick={onClose}>
                                        <FontAwesomeIcon icon={Icon} />
                                        {route.name}
                                    </NavItem>
                                </Can>
                            ) : (
                                <NavItem
                                    key={route.path}
                                    to={to(route.path, true)}
                                    exact={route.exact}
                                    onClick={onClose}
                                >
                                    <FontAwesomeIcon icon={Icon} />
                                    {route.name}
                                </NavItem>
                            );
                        })}

                    {rootAdmin && (
                        <a
                            href={`/admin/servers/view/${serverId}`}
                            target={'_blank'}
                            rel='noreferrer'
                            className='flex items-center px-6 py-3 text-gray-400 transition-all duration-200 border-l-4 border-transparent hover:bg-gray-800 hover:text-white'
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} className='mr-3 w-5' />
                            Admin View
                        </a>
                    )}
                </div>
            </SidebarContainer>
        </>
    );
};
