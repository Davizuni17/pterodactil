import React, { useEffect, useMemo, useState } from 'react';
import tw from 'twin.macro';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';

type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

export default () => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const killable = useMemo(() => status === 'stopping', [status]);

    const send = (action: PowerAction | 'kill-confirmed') => {
        if (!instance) return;
        setOpen(false);
        instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div css={tw`rounded-2xl shadow-lg bg-gray-900/60 backdrop-blur-md border border-gray-800/80 overflow-hidden`}>
            <div css={tw`px-4 py-3 border-b border-gray-800/80 bg-gray-900/70`}>
                <p css={tw`text-xs uppercase tracking-widest text-gray-200`}>Server Control</p>
            </div>
            <div css={tw`p-4 space-y-2`}>
                <Dialog.Confirm
                    open={open}
                    hideCloseIcon
                    onClose={() => setOpen(false)}
                    title={'Forcibly Stop Process'}
                    confirm={'Continue'}
                    onConfirmed={() => send('kill-confirmed')}
                >
                    Forcibly stopping a server can lead to data corruption.
                </Dialog.Confirm>

                <Can action={'control.start'}>
                    <Button css={tw`w-full`} disabled={status !== 'offline'} onClick={() => send('start')}>
                        Start
                    </Button>
                </Can>

                <Can action={'control.restart'}>
                    <Button.Text css={tw`w-full`} disabled={!status} onClick={() => send('restart')}>
                        Restart
                    </Button.Text>
                </Can>

                <Can action={'control.stop'}>
                    <Button.Danger
                        css={tw`w-full`}
                        disabled={status === 'offline'}
                        onClick={() => (killable ? setOpen(true) : send('stop'))}
                    >
                        {killable ? 'Kill' : 'Stop'}
                    </Button.Danger>
                </Can>
            </div>
        </div>
    );
};
