import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = "" }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={`markdown-content ${className}`}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          
          return !inline && language ? (
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              PreTag="div"
              {...props}
              wrapLines={true}
              wrapLongLines={true}
              customStyle={{
                margin: "1em 0",
                borderRadius: "6px",
                fontSize: "0.85rem",
                backgroundColor: "var(--code-bg)",
              }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={`inline-code ${className || ""}`} {...props}>
              {children}
            </code>
          );
        },
        // Enhance other elements as needed
        a: ({ node, ...props }) => <a className="text-primary underline" {...props} target="_blank" rel="noopener noreferrer" />,
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
        li: ({ node, ...props }) => <li className="my-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 py-1 my-2 italic"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-auto my-4">
            <table className="min-w-full divide-y divide-border" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-muted/50" {...props} />,
        th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-medium" {...props} />,
        td: ({ node, ...props }) => <td className="px-4 py-2 border-t" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4 border-t border-border" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
