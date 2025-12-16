import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled, { keyframes } from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { motion } from 'framer-motion';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const gradient = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const Wrapper = styled.div`
    ${tw`min-h-screen flex flex-col items-center justify-center w-full overflow-hidden relative`};
    background: radial-gradient(circle at 50% -20%, #2d3748, #1a202c, #000000);

    &::before {
        content: '';
        ${tw`absolute inset-0`};
        background:
            radial-gradient(circle at 0% 0%, rgba(66, 153, 225, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(159, 122, 234, 0.15) 0%, transparent 50%);
    }
`;

const Container = styled(motion.div)`
    ${tw`w-full max-w-[420px] mx-auto px-4 relative z-10`};
`;

const GlassCard = styled.div`
    ${tw`bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-10 shadow-2xl`};
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Wrapper>
        <Container
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div css={tw`flex justify-center mb-10`}>
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <motion.img
                        src={'https://i.postimg.cc/hG3JK47F/unnamed-removebg-preview.png'}
                        css={tw`h-24 w-auto drop-shadow-2xl filter brightness-110`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                </motion.div>
            </div>

            <GlassCard>
                {title && <h2 css={tw`text-3xl font-bold text-center text-white mb-8 tracking-tight`}>{title}</h2>}
                <FlashMessageRender css={tw`mb-6`} />
                <Form {...props} ref={ref}>
                    <div css={tw`flex flex-col gap-4`}>
                        {props.children}
                    </div>
                </Form>
            </GlassCard>

            <p css={tw`text-center text-neutral-500 text-xs mt-8 font-medium tracking-wide opacity-60 hover:opacity-100 transition-opacity duration-300`}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <a
                    rel={'noopener nofollow noreferrer'}
                    href={'https://pterodactyl.io'}
                    target={'_blank'}
                    css={tw`no-underline text-neutral-400 hover:text-white transition-colors`}
                >
                    Pterodactyl Software
                </a>
            </p>
        </Container>
    </Wrapper>
));
