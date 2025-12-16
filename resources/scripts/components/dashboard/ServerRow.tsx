import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import styled from 'styled-components/macro';

const ServerCard = styled(GreyRowBox)<{ $status: ServerPowerState | undefined; $img: string }>`
    ${tw`flex flex-col relative w-full mb-4 overflow-hidden transition-all duration-300`};
    height: 220px;
    background-color: rgba(26, 32, 44, 0.9);
    background-image: linear-gradient(rgba(26, 32, 44, 0.85), rgba(26, 32, 44, 0.95)), url(${(props) => props.$img});
    background-size: cover;
    background-position: center;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
    padding: 0;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
        border-color: #667eea;
    }
`;

const CardHeader = styled.div`
    ${tw`flex items-center justify-between px-4 py-3 border-b border-white/5`};
`;

const CardBody = styled.div`
    ${tw`flex-1 px-4 py-3 flex flex-col justify-between`};
`;

const IpAddress = styled.div`
    ${tw`text-xs text-neutral-400 font-mono mb-2 flex items-center`};
`;

const StatsGrid = styled.div`
    ${tw`grid grid-cols-3 gap-2`};
`;

const StatItem = styled.div`
    ${tw`flex flex-col`};
`;

const StatLabel = styled.span`
    ${tw`text-[10px] uppercase tracking-wider text-neutral-500`};
`;

const StatValue = styled.span`
    ${tw`text-sm font-bold text-neutral-200`};
`;

const ManageButton = styled(Link)`
    ${tw`mx-4 mb-4 py-2 rounded bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-bold uppercase tracking-wide text-center transition-colors duration-200 border border-white/10`};
    &:hover {
        ${tw`text-white border-white/20`};
    }
`;

const StatusBadge = styled.span<{ $status: string | undefined }>`
    ${tw`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide`};
    ${({ $status }) =>
        !$status || $status === 'offline'
            ? tw`bg-red-500/20 text-red-400`
            : $status === 'running'
            ? tw`bg-green-500/20 text-green-400`
            : tw`bg-yellow-500/20 text-yellow-400`};
`;

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unl.';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unl.';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + '%' : 'Unl.';

    // Determine background image based on docker image (simple heuristic)
    const getBgImage = () => {
        const img = server.dockerImage.toLowerCase();
        if (img.includes('java') || img.includes('minecraft'))
            return 'https://i.postimg.cc/hG3JK47F/unnamed-removebg-preview.png'; // Placeholder for Java
        if (img.includes('python')) return 'https://i.postimg.cc/hG3JK47F/unnamed-removebg-preview.png'; // Placeholder for Python
        if (img.includes('node') || img.includes('js'))
            return 'https://i.postimg.cc/hG3JK47F/unnamed-removebg-preview.png'; // Placeholder for JS
        return 'https://i.postimg.cc/hG3JK47F/unnamed-removebg-preview.png'; // Default User Logo
    };

    return (
        <ServerCard as={'div'} className={className} $status={stats?.status} $img={getBgImage()}>
            <CardHeader>
                <div css={tw`flex items-center overflow-hidden`}>
                    <h3 css={tw`text-sm font-bold text-white truncate mr-2`}>{server.name}</h3>
                </div>
                <StatusBadge $status={stats?.status}>
                    {!stats || isSuspended ? (server.status === 'suspended' ? 'Suspended' : 'Offline') : stats.status}
                </StatusBadge>
            </CardHeader>

            <CardBody>
                <IpAddress>
                    <FontAwesomeIcon icon={faEthernet} css={tw`mr-2 text-neutral-500`} />
                    {server.allocations
                        .filter((alloc) => alloc.isDefault)
                        .map((allocation) => (
                            <span key={allocation.ip + allocation.port.toString()}>
                                {allocation.alias || ip(allocation.ip)}:{allocation.port}
                            </span>
                        ))}
                </IpAddress>

                <StatsGrid>
                    <StatItem>
                        <StatLabel>CPU</StatLabel>
                        <StatValue>{stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '-'}</StatValue>
                        <span css={tw`text-[10px] text-neutral-600`}>/ {cpuLimit}</span>
                    </StatItem>
                    <StatItem>
                        <StatLabel>RAM</StatLabel>
                        <StatValue>{stats ? bytesToString(stats.memoryUsageInBytes) : '-'}</StatValue>
                        <span css={tw`text-[10px] text-neutral-600`}>/ {memoryLimit}</span>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Disk</StatLabel>
                        <StatValue>{stats ? bytesToString(stats.diskUsageInBytes) : '-'}</StatValue>
                        <span css={tw`text-[10px] text-neutral-600`}>/ {diskLimit}</span>
                    </StatItem>
                </StatsGrid>
            </CardBody>

            <ManageButton to={`/server/${server.id}`}>Manage Server</ManageButton>
        </ServerCard>
    );
};
