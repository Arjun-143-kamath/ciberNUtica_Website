'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-sm leading-7 text-neutral-300 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="mt-8 text-2xl font-bold leading-tight text-white first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-7 border-b border-neutral-800 pb-2 text-xl font-bold leading-tight text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-6 text-lg font-bold leading-tight text-white">{children}</h3>,
          h4: ({ children }) => <h4 className="mt-5 text-base font-bold text-white">{children}</h4>,
          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-6 marker:text-[#FCEE09]">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6 marker:text-[#FCEE09]">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-[#FCEE09]/60 pl-4 text-neutral-400">{children}</blockquote>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#FCEE09] underline underline-offset-4 hover:text-white">{children}</a>,
          pre: ({ children }) => <pre className="max-w-full overflow-x-auto border border-neutral-800 bg-neutral-950 p-4 text-xs leading-6 text-neutral-200 [&_code]:bg-transparent [&_code]:px-0 [&_code]:py-0 [&_code]:text-neutral-200">{children}</pre>,
          code: ({ className, children }) => <code className={`${className ?? ''} rounded font-mono ${className ? 'text-xs' : 'bg-neutral-900 px-1.5 py-0.5 text-[0.9em] text-[#FCEE09]'}`}>{children}</code>,
          hr: () => <hr className="border-neutral-800" />,
          table: ({ children }) => <table className="w-full border-collapse text-left text-xs">{children}</table>,
          th: ({ children }) => <th className="border border-neutral-800 bg-neutral-900 px-3 py-2 font-bold text-[#FCEE09]">{children}</th>,
          td: ({ children }) => <td className="border border-neutral-800 px-3 py-2">{children}</td>,
          img: ({ src, alt }) => <img src={src} alt={alt ?? ''} loading="lazy" className="h-auto max-w-full border border-neutral-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
