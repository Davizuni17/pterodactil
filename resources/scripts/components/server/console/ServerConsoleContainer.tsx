import React, { memo, useEffect, useMemo, useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import { Alert } from '@/components/elements/alert';
import tw, { styled } from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer } from '@fortawesome/free-solid-svg-icons';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { SocketEvent } from '@/components/server/events';
import { bytesToString } from '@/lib/formatters';
import ServerInfoCard from '@/components/server/console/ServerInfoCard';
import ServerControlCard from '@/components/server/console/ServerControlCard';
import RadialUsageCard from '@/components/server/console/RadialUsageCard';
import StatGraphs from '@/components/server/console/StatGraphs';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const NodeBanner = styled.div`
    ${tw`w-full pl-16 pr-32 md:pl-6 md:pr-32 py-3 mb-6 rounded-2xl text-white flex items-center shadow-lg border border-purple-500/10`};
    ${tw`bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-blue-600/30 backdrop-blur-md`};
`;

const ServerConsoleContainer = () => {
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const status = ServerContext.useStoreState((state) => state.status.value);

    const [live, setLive] = useState<{ cpu_absolute: number; memory_bytes: number }>({
        cpu_absolute: 0,
        memory_bytes: 0,
    });

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }

        setLive({
            cpu_absolute: values.cpu_absolute ?? 0,
            memory_bytes: values.memory_bytes ?? 0,
        });
    });

    useEffect(() => {
        if (status === 'offline') {
            setLive({ cpu_absolute: 0, memory_bytes: 0 });
        }
    }, [status]);

    const memPercent = useMemo(() => {
        if (!limits?.memory || limits.memory === 0) return 0;
        const usedMiB = live.memory_bytes / 1024 / 1024;
        return (usedMiB / limits.memory) * 100;
    }, [live.memory_bytes, limits?.memory]);

    const memLabel = useMemo(() => {
        const used = bytesToString(live.memory_bytes);
        const limit = !limits?.memory || limits.memory === 0 ? '∞' : bytesToString(limits.memory * 1024 * 1024);
        return (
            <span>
                {used} <span css={tw`text-gray-400 text-xs`}>/ {limit}</span>
            </span>
        );
    }, [live.memory_bytes, limits?.memory]);

    const cpuLabel = useMemo(() => {
        const limit = !limits?.cpu || limits.cpu === 0 ? '∞' : `${limits.cpu}%`;
        return (
            <span>
                {live.cpu_absolute.toFixed(2)}% <span css={tw`text-gray-400 text-xs`}>/ {limit}</span>
            </span>
        );
    }, [live.cpu_absolute, limits?.cpu]);

    return (
        <ServerContentBlock title={'Console'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </Alert>
            )}

            <NodeBanner>
                <FontAwesomeIcon icon={faServer} className={'mr-3 text-lg sm:text-xl'} />
                <span className={'font-semibold text-xs sm:text-sm'}>NODE: {node}</span>
                <span className={'ml-auto text-xs sm:text-sm text-white/70'}>High Performance Node</span>
            </NodeBanner>

            <div className={'grid grid-cols-4 gap-2 sm:gap-4 mb-4'}>
                <div className={'flex col-span-4'}>
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </div>
            </div>

            <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'}>
                <Spinner.Suspense>
                    <ServerInfoCard />
                </Spinner.Suspense>
                <Spinner.Suspense>
                    <ServerControlCard />
                </Spinner.Suspense>
                <RadialUsageCard title={'CPU usage'} percent={live.cpu_absolute} label={cpuLabel} accent={'purple'} />
                <RadialUsageCard title={'RAM usage'} percent={memPercent} label={memLabel} accent={'cyan'} />
            </div>

            <div className={'grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>

            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
