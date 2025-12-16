import React, { useCallback, useEffect, useRef } from 'react';
import Icon from '@/components/elements/Icon';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

export default ({ title, copyOnClick, icon, color, className, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });
    const elementRef = useRef<HTMLDivElement | null>(null);
    const fitRef = ref as unknown as
        | ((el: HTMLDivElement | null) => void)
        | React.MutableRefObject<HTMLDivElement | null>
        | null
        | undefined;

    const setRef = useCallback(
        (el: HTMLDivElement | null) => {
            elementRef.current = el;

            if (typeof fitRef === 'function') {
                fitRef(el);
            } else if (fitRef && typeof fitRef === 'object' && 'current' in fitRef) {
                fitRef.current = el;
            }
        },
        [fitRef]
    );

    useEffect(() => {
        if (!elementRef.current) return;
        elementRef.current.style.fontSize = `${fontSize}px`;
    }, [fontSize]);

    return (
        <CopyOnClick text={copyOnClick}>
            <div className={classNames(styles.stat_block, className)}>
                <div className={classNames(styles.status_bar, color || 'bg-gray-800')} />
                <div className={classNames(styles.icon, color || 'bg-gray-800')}>
                    <Icon
                        icon={icon}
                        className={classNames({
                            'text-gray-100': !color || color === 'bg-gray-800',
                            'text-gray-50': color && color !== 'bg-gray-800',
                        })}
                    />
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'font-header leading-tight text-xs md:text-sm text-gray-200'}>{title}</p>
                    <div ref={setRef} className={'h-[1.75rem] w-full font-semibold text-gray-50 truncate'}>
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
