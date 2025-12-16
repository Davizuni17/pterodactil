import React, { useEffect, useMemo, useState } from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faHdd, faMemory, faWifi } from '@fortawesome/free-solid-svg-icons';
import { bytesToString, ip } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import UptimeDuration from '@/components/server/UptimeDuration';

type Stats = {
    memory_bytes: number;
    disk_bytes: number;
    uptime: number;
};

const Row = ({ icon, label, value, mono }: { icon: any; label: string; value: React.ReactNode; mono?: boolean }) => (
    <div css={tw`flex items-start justify-between gap-3`}>
        <div css={tw`flex items-center gap-2 text-gray-300`}>
            <span
                css={tw`w-7 h-7 rounded-lg bg-gray-800/70 border border-gray-700/60 flex items-center justify-center`}
            >
                <FontAwesomeIcon icon={icon} css={tw`text-xs text-gray-200`} />
            </span>
            <span css={tw`text-xs uppercase tracking-widest text-gray-400`}>{label}</span>
        </div>
        <div css={[tw`text-sm text-gray-100 truncate`, mono && tw`font-mono text-xs sm:text-sm`]}>{value}</div>
    </div>
);

export default () => {
    const [stats, setStats] = useState<Stats>({ memory_bytes: 0, disk_bytes: 0, uptime: 0 });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((a) => a.isDefault);
        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    useEffect(() => {
        if (!connected || !instance) return;
        instance.send(SocketRequest.SEND_STATS);
    }, [connected, instance]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory_bytes: values.memory_bytes ?? 0,
            disk_bytes: values.disk_bytes ?? 0,
            uptime: values.uptime ?? 0,
        });
    });

    const textLimits = useMemo(
        () => ({
            memory: limits?.memory ? bytesToString(limits.memory * 1024 * 1024) : null,
            disk: limits?.disk ? bytesToString(limits.disk * 1024 * 1024) : null,
        }),
        [limits]
    );

    return (
        <div css={tw`rounded-2xl shadow-lg bg-gray-900/60 backdrop-blur-md border border-gray-800/80 overflow-hidden`}>
            <div css={tw`px-4 py-3 border-b border-gray-800/80 bg-gray-900/70`}>
                <p css={tw`text-xs uppercase tracking-widest text-gray-200`}>Server Information</p>
            </div>
            <div css={tw`p-4 space-y-3`}>
                <Row icon={faWifi} label={'Address'} value={allocation} mono />
                <Row
                    icon={faClock}
                    label={'Uptime'}
                    value={
                        status === 'offline' || status === null ? (
                            <span css={tw`text-gray-400`}>Offline</span>
                        ) : stats.uptime > 0 ? (
                            <UptimeDuration uptime={stats.uptime / 1000} />
                        ) : (
                            <span css={tw`text-gray-400`}>—</span>
                        )
                    }
                />
                <Row
                    icon={faMemory}
                    label={'Memory'}
                    value={
                        status === 'offline' ? (
                            <span css={tw`text-gray-400`}>Offline</span>
                        ) : (
                            <span>
                                {bytesToString(stats.memory_bytes)}
                                <span css={tw`text-[11px] text-gray-400 ml-1`}>/ {textLimits.memory || '∞'}</span>
                            </span>
                        )
                    }
                />
                <Row
                    icon={faHdd}
                    label={'Disk'}
                    value={
                        status === 'offline' ? (
                            <span css={tw`text-gray-400`}>Offline</span>
                        ) : (
                            <span>
                                {bytesToString(stats.disk_bytes)}
                                <span css={tw`text-[11px] text-gray-400 ml-1`}>/ {textLimits.disk || '∞'}</span>
                            </span>
                        )
                    }
                />
            </div>
        </div>
    );
};
