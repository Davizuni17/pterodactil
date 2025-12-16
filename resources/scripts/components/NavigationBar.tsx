import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import type { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const NavigationContainer = styled.div`
    ${tw`w-full fixed top-0 left-0 z-50 transition-all duration-500`};
    background: rgba(15, 12, 41, 0.15);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent, #302b63, #bc13fe, #302b63, transparent);
        background-size: 200% 100%;
        animation: gradientBorder 4s linear infinite;
    }

    @keyframes gradientBorder {
        0% {
            background-position: 100% 0;
        }
        100% {
            background-position: -100% 0;
        }
    }
`;

const NavInner = styled.div`
    ${tw`mx-auto w-full flex items-center h-[5rem] max-w-[1200px] px-6`};
`;

const RightNavigation = styled.div`
    ${tw`flex h-full items-center justify-center gap-6`};

    & > a,
    & > button,
    & > .navigation-link {
        ${tw`relative flex items-center justify-center w-10 h-10 rounded-xl text-neutral-300 transition-all duration-300 overflow-hidden`};
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);

        &:hover,
        &.active {
            ${tw`text-white`};
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(188, 19, 254, 0.5);
            box-shadow: 0 0 20px rgba(188, 19, 254, 0.3);
            transform: translateY(-2px) scale(1.05);
        }

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: 0.5s;
        }

        &:hover::before {
            left: 100%;
            transition: 0.5s;
        }
    }
`;

const LogoImage = styled.img`
    height: 45px;
    margin-right: 15px;
    filter: drop-shadow(0 0 10px rgba(188, 19, 254, 0.4));
`;

const LogoText = styled.span`
    ${tw`font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500`};
    font-family: 'Orbitron', sans-serif;
    text-shadow: 0 0 20px rgba(188, 19, 254, 0.3);
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <NavigationContainer>
            <SpinnerOverlay visible={isLoggingOut} />
            <NavInner>
                <div id={'logo'} className={'flex-1'}>
                    <Link
                        to={'/'}
                        className={
                            'text-2xl font-header no-underline text-neutral-200 hover:text-white transition-colors duration-150 flex items-center'
                        }
                    >
                        <LogoImage src={'https://i.postimg.cc/hG3JK47F/unnamed-removebg-preview.png'} alt={'Logo'} />
                        <LogoText>{name}</LogoText>
                    </Link>
                </div>
                <RightNavigation>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact activeClassName={'active'}>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'} title={'Admin'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'} activeClassName={'active'}>
                            <span className={'flex items-center justify-center w-8 h-8 rounded-full overflow-hidden'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button type={'button'} onClick={onTriggerLogout} title={'Sign Out'}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </NavInner>
        </NavigationContainer>
    );
};
