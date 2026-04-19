import * as React from "react";
import { CodeBlock } from "components/home/CodeBlock";
import { CopyButton } from "components/ui/CopyButton";
import { getStrictContext } from "utils/strictContext";
import { Code2 } from "lucide-react";

const [CodeProvider, useCode] = getStrictContext("CodeContext");

function Code({ className = "", code, ...props }) {
  return (
    <CodeProvider value={{ code }}>
      <div className={`code-wrapper ${className}`} {...props} />
    </CodeProvider>
  );
}

function CodeHeader({ className = "", children, icon: Icon, copyButton = false, ...props }) {
  const { code } = useCode();

  return (
    <div className={`code-header ${className}`} {...props}>
      {Icon && <Icon style={{ width: '1rem', height: '1rem' }} />}
      {children}
      {copyButton && (
        <CopyButton
          content={code}
          size="xs"
          variant="ghost"
          style={{ marginLeft: 'auto', width: 'auto', height: 'auto', padding: '0.5rem', marginRight: '-0.5rem' }}
        />
      )}
    </div>
  );
}

function CodeBlockWrapper({ className = "", ...props }) {
  const { code } = useCode();
  const scrollRef = React.useRef(null);

  return (
    <CodeBlock
      ref={scrollRef}
      theme="dark"
      scrollContainerRef={scrollRef}
      className={className}
      code={code}
      {...props}
    />
  );
}

export const CodeDemo = ({ duration, delay, writing, cursor }) => {
  return (
    <Code
      key={`${duration}-${delay}-${writing}-${cursor}`}
      style={{ width: '100%', maxWidth: '27.5rem', height: '30rem', border: 'none' }}
      code={`import { useState, useEffect } from "react";

const useFetch = (url, options) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error('HTTP error! status: response.status');
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]); // Re-run effect if URL or options change

  return { data, loading, error };
};

export default useFetch;'
`}
    >
      <CodeHeader icon={Code2} copyButton>
        use-fetch.jsx
      </CodeHeader>

      <CodeBlockWrapper
        cursor={cursor}
        lang="jsx"
        writing={writing}
        duration={duration}
        delay={delay}
      />
    </Code>
  );
};
