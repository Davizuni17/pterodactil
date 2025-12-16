import React, { useState, useEffect } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faMemory, faHdd } from '@fortawesome/free-solid-svg-icons';
import { bytesToString } from '@/lib/formatters';
import tw, { styled } from 'twin.macro';

const Card = styled.div`
    ${tw`p-6 rounded-2xl flex items-center justify-between shadow-lg border border-gray-800/80`};
    ${tw`bg-gray-900/60 backdrop-blur-md transition-transform duration-200 md:hover:scale-105`};
`;

const IconBox = styled.div`
    ${tw`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl shadow-md`};
    ${tw`bg-gradient-to-br from-cyan-400 to-blue-600 ring-1 ring-white/10`};
`;

const InfoBox = styled.div`
    ${tw`flex flex-col`};
`;

const Label = styled.span`
    ${tw`text-gray-400 text-sm font-bold uppercase tracking-wider`};
`;

const Value = styled.span`
    ${tw`text-white text-lg font-mono mt-1`};
`;

const Limit = styled.span`
    ${tw`text-gray-500 text-xs ml-1`};
`;

export default () => {
    const [stats, setStats] = useState({ cpu: 0, memory: 0, disk: 0 });
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const status = ServerContext.useStoreState((state) => state.status.value);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        setStats({
            cpu: values.cpu_absolute,
            memory: values.memory_bytes,
            disk: values.disk_bytes,
        });
    });

    useEffect(() => {
        if (status === 'offline') {
            setStats({ cpu: 0, memory: 0, disk: 0 });
        }
    }, [status]);

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
            <Card>
                <InfoBox>
                    <Label>CPU Usage</Label>
                    <div className='flex items-baseline'>
                        <Value>{stats.cpu.toFixed(2)}%</Value>
                        <Limit>/ {limits.cpu === 0 ? '∞' : limits.cpu}%</Limit>
                    </div>
                </InfoBox>
                <IconBox>
                    <FontAwesomeIcon icon={faMicrochip} />
                </IconBox>
            </Card>
            <Card>
                <InfoBox>
                    <Label>Memory Usage</Label>
                    <div className='flex items-baseline'>
                        <Value>{bytesToString(stats.memory)}</Value>
                        <Limit>/ {limits.memory === 0 ? '∞' : bytesToString(limits.memory * 1024 * 1024)}</Limit>
                    </div>
                </InfoBox>
                <IconBox>
                    <FontAwesomeIcon icon={faMemory} />
                </IconBox>
            </Card>
            <Card>
                <InfoBox>
                    <Label>Disk Usage</Label>
                    <div className='flex items-baseline'>
                        <Value>{bytesToString(stats.disk)}</Value>
                        <Limit>/ {limits.disk === 0 ? '∞' : bytesToString(limits.disk * 1024 * 1024)}</Limit>
                    </div>
                </InfoBox>
                <IconBox>
                    <FontAwesomeIcon icon={faHdd} />
                </IconBox>
            </Card>
        </div>
    );
};
