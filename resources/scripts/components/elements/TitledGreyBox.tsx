import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div
        css={tw`rounded-2xl shadow-lg bg-gray-900/60 backdrop-blur-md border border-gray-800/80`}
        className={className}
    >
        <div css={tw`bg-gray-900/70 rounded-t-2xl p-3 border-b border-gray-800/80`}>
            {typeof title === 'string' ? (
                <p css={tw`text-xs uppercase tracking-widest text-gray-200`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-gray-300`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-4`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
