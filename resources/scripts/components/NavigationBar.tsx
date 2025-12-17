import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt, faBars, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import type { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Avatar from '@/components/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

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

const MenuButton = styled.button`
    ${tw`relative flex items-center justify-center px-6 py-2 rounded-xl text-neutral-300 transition-all duration-300 overflow-hidden gap-3`};
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

const MenuDropdown = styled(motion.div)`
    ${tw`absolute top-[5.5rem] right-6 w-72 rounded-2xl p-4 flex flex-col gap-2 z-50`};
    background: rgba(15, 12, 41, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

    .menu-item {
        ${tw`flex items-center gap-4 px-4 py-3 rounded-xl text-gray-300 transition-all duration-200`};
        &:hover {
            ${tw`bg-white/10 text-white translate-x-1`};
        }
        
        &.active {
            ${tw`bg-purple-500/20 text-purple-300 border border-purple-500/30`};
        }
    }

    /* Override SearchContainer styles */
    .navigation-link {
        ${tw`w-full h-auto flex items-center gap-4 px-4 py-3 rounded-xl text-gray-300 transition-all duration-200 bg-transparent border-0 shadow-none`};
        &:hover {
            ${tw`bg-white/10 text-white translate-x-1 transform-none`};
        }
        &::before { display: none; }
        
        svg { margin: 0; width: 1.25rem; }
        &::after {
            content: 'Search';
            font-weight: 500;
        }
    }
`;

export default () => {
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const username = useStoreState((state: ApplicationStore) => state.user.data!.username);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

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
                        <LogoText>Hostra</LogoText>
                    </Link>
                </div>
                
                <MenuButton onClick={() => setMenuOpen(!menuOpen)} className={menuOpen ? 'active' : ''}>
                    <span className="font-bold tracking-wider text-sm">MENU</span>
                    <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
                </MenuButton>
            </NavInner>

            <AnimatePresence>
                {menuOpen && (
                    <MenuDropdown
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-4 py-2 mb-2 border-b border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/50 flex-shrink-0 flex items-center justify-center bg-gray-800">
                                <Avatar.User />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Signed in as</div>
                                <div className="font-bold text-white truncate">
                                    {username}
                                </div>
                            </div>
                        </div>

                        <SearchContainer />

                        <NavLink to={'/'} exact className="menu-item" activeClassName="active" onClick={() => setMenuOpen(false)}>
                            <FontAwesomeIcon icon={faLayerGroup} className="w-5" />
                            <span>Dashboard</span>
                        </NavLink>

                        {rootAdmin && (
                            <a href={'/admin'} className="menu-item" onClick={() => setMenuOpen(false)}>
                                <FontAwesomeIcon icon={faCogs} className="w-5" />
                                <span>Admin Control</span>
                            </a>
                        )}

                        <NavLink to={'/account'} className="menu-item" activeClassName="active" onClick={() => setMenuOpen(false)}>
                            <FontAwesomeIcon icon={faUser} className="w-5" />
                            <span>Account Settings</span>
                        </NavLink>

                        <button type={'button'} onClick={onTriggerLogout} className="menu-item text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full text-left">
                            <FontAwesomeIcon icon={faSignOutAlt} className="w-5" />
                            <span>Sign Out</span>
                        </button>
                    </MenuDropdown>
                )}
            </AnimatePresence>
        </NavigationContainer>
    );
};
