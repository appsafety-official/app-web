"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 mb-4 font-mono text-2xl font-bold text-stone-900 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 font-mono text-xl font-bold text-stone-900">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 font-mono text-lg font-bold text-stone-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-5 mb-2 font-mono text-base font-bold text-stone-900">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-relaxed text-stone-700">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-1 pl-6 text-stone-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-1 pl-6 text-stone-700">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-stone-900 underline underline-offset-4 hover:bg-yellow-500"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-stone-900 bg-stone-50 px-4 py-2 font-mono text-stone-700">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => (
            <code
              className={`rounded-none border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[13px] text-stone-900 ${
                className ?? ""
              }`}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-none border border-stone-900 bg-stone-900 p-4 font-mono text-sm text-stone-100">
              {children}
            </pre>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt ?? ""}
              className="my-6 w-full rounded-none border border-stone-900"
            />
          ),
          hr: () => <hr className="my-8 border-t border-stone-300" />,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-none border border-stone-900">
              <table className="w-full border-collapse text-sm text-stone-700">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-stone-900 bg-stone-50 px-3 py-2 text-left font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-stone-100 px-3 py-2 last:border-b-0">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
