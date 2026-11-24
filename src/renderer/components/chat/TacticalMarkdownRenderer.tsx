import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { soundFx } from '../common/AudioSynthesizer';

interface Props {
  content: string;
}

export const TacticalMarkdownRenderer: React.FC<Props> = ({ content }) => {
  // Split into code blocks and normal prose
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="selectable-text" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Code block
          const firstLineBreak = part.indexOf('\n');
          let lang = 'code';
          let code = '';

          if (firstLineBreak !== -1) {
            lang = part.slice(3, firstLineBreak).trim() || 'code';
            code = part.slice(firstLineBreak + 1, -3);
          } else {
            code = part.slice(3, -3);
          }

          return <CodeBlock key={index} language={lang} code={code} />;
        }

        // Prose with inline formatting
        return <ProseBlock key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '6px 0',
        borderRadius: '4px',
        border: '1px solid rgba(0, 243, 255, 0.25)',
        backgroundColor: 'rgba(3, 7, 12, 0.9)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 10px',
          backgroundColor: 'rgba(0, 243, 255, 0.08)',
          borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: '#00f3ff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={11} />
          <span>{language.toUpperCase()}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            color: copied ? '#00ffaa' : '#7cb0c7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {copied ? <Check size={11} color="#00ffaa" /> : <Copy size={11} />}
          <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
        </button>
      </div>

      <pre
        style={{
          margin: 0,
          padding: '10px 12px',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: '1.45',
          color: '#d4f1f9',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

const ProseBlock: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: '4px' }} />;
        }

        // Bullet list item
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const content = isBullet ? trimmed.replace(/^(•|-|\*)\s*/, '') : line;

        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: isBullet ? '6px' : '0',
              paddingLeft: isBullet ? '12px' : '0',
            }}
          >
            {isBullet && (
              <span style={{ color: '#00f3ff', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>▹</span>
            )}
            <span style={{ flex: 1, whiteSpace: 'pre-wrap' }}>
              {renderInlineFormatting(content)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex tokenizing **bold** and `code`
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#ffffff', fontWeight: 700 }}>
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            padding: '1px 5px',
            borderRadius: '3px',
            backgroundColor: 'rgba(0, 243, 255, 0.1)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            color: '#00f3ff',
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
