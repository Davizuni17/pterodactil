#!/bin/bash

# Pterodactyl Premium Theme Installation Script
# Created by GitHub Copilot

# Set the Pterodactyl directory
PTERODACTYL_DIR="/var/www/pterodactyl"

# Check if the directory exists
if [ ! -d "$PTERODACTYL_DIR" ]; then
    echo "Error: Pterodactyl directory not found at $PTERODACTYL_DIR"
    echo "Please edit the script and set the correct PTERODACTYL_DIR."
    exit 1
fi

cd "$PTERODACTYL_DIR"

echo "Starting theme installation..."

# Backup original files
echo "Backing up original files..."
cp resources/scripts/components/auth/LoginContainer.tsx resources/scripts/components/auth/LoginContainer.tsx.bak
cp resources/scripts/components/auth/LoginFormContainer.tsx resources/scripts/components/auth/LoginFormContainer.tsx.bak

# Write LoginFormContainer.tsx
echo "Writing LoginFormContainer.tsx..."
cat << 'EOF' > resources/scripts/components/auth/LoginFormContainer.tsx
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
EOF

# Write LoginContainer.tsx
echo "Writing LoginContainer.tsx..."
cat << 'EOF' > resources/scripts/components/auth/LoginContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
                console.error(error);

                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('A username or email must be provided.'),
                password: string().required('Please enter your account password.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={'Welcome Back'}>
                    <Field
                        type={'text'}
                        label={'Username or Email'}
                        name={'username'}
                        disabled={isSubmitting}
                        css={tw`bg-white/5 border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg transition-all duration-200`}
                    />
                    <div css={tw`mt-2`}>
                        <Field
                            type={'password'}
                            label={'Password'}
                            name={'password'}
                            disabled={isSubmitting}
                            css={tw`bg-white/5 border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg transition-all duration-200`}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button
                            type={'submit'}
                            size={'xlarge'}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                            css={tw`w-full bg-blue-600 hover:bg-blue-500 border-none shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 rounded-lg font-semibold tracking-wide text-white`}
                        >
                            Sign In
                        </Button>
                    </div>

                    <div css={tw`mt-6 grid grid-cols-2 gap-3`}>
                        <button type="button" css={tw`flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-white transition-all duration-200`}>
                           <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                           <span css={tw`text-sm font-medium`}>Google</span>
                        </button>
                        <button type="button" css={tw`flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-white transition-all duration-200`}>
                           <svg height="20" viewBox="0 0 16 16" version="1.1" width="20" aria-hidden="true" fill="white"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                           <span css={tw`text-sm font-medium`}>GitHub</span>
                        </button>
                    </div>

                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/password'}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            Forgot password?
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
EOF

# Install dependencies if needed (optional, usually already installed)
# echo "Installing dependencies..."
# yarn install

# Build the panel
echo "Building the panel (this may take a few minutes)..."
yarn build:production

echo "Theme installation complete!"
echo "Please clear your browser cache to see the changes."
