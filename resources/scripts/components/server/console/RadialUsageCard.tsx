import React from 'react';
import tw from 'twin.macro';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default ({
    title,
    percent,
    label,
    accent,
}: {
    title: string;
    percent: number;
    label: React.ReactNode;
    accent: 'purple' | 'cyan';
}) => {
    const p = Number.isFinite(percent) ? clamp(percent, 0, 100) : 0;

    const size = 108;
    const center = size / 2;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (p / 100) * circumference;

    const accentClass = accent === 'cyan' ? 'text-cyan-400' : 'text-purple-400';

    return (
        <div css={tw`rounded-2xl shadow-lg bg-gray-900/60 backdrop-blur-md border border-gray-800/80 overflow-hidden`}>
            <div css={tw`px-4 py-3 border-b border-gray-800/80 bg-gray-900/70`}>
                <p css={tw`text-xs uppercase tracking-widest text-gray-200`}>{title}</p>
            </div>

            <div css={tw`p-4 flex items-center justify-between gap-4`}>
                <div css={tw`flex items-center justify-center`}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill={'none'}
                            stroke={'currentColor'}
                            strokeWidth={10}
                            className={'text-gray-800/80'}
                        />
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill={'none'}
                            stroke={'currentColor'}
                            strokeWidth={10}
                            strokeLinecap={'round'}
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            transform={`rotate(-90 ${center} ${center})`}
                            className={accentClass}
                        />
                        <text
                            x={center}
                            y={center - 2}
                            textAnchor={'middle'}
                            dominantBaseline={'middle'}
                            className={'fill-current text-gray-100'}
                            fontSize={18}
                            fontWeight={700}
                        >
                            {p.toFixed(1)}%
                        </text>
                        <text
                            x={center}
                            y={center + 18}
                            textAnchor={'middle'}
                            dominantBaseline={'middle'}
                            className={'fill-current text-gray-400'}
                            fontSize={10}
                            letterSpacing={1.2}
                        >
                            usage
                        </text>
                    </svg>
                </div>

                <div css={tw`flex-1 min-w-0`}>
                    <div css={tw`text-sm text-gray-100 font-semibold`}>{label}</div>
                    <div css={tw`mt-1 text-xs uppercase tracking-widest text-gray-400`}>Live</div>
                </div>
            </div>
        </div>
    );
};
