import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';

interface CodeExample {
  title: string;
  description: string;
  language: string;
  code: string;
  output?: string;
}

export const CodeExampleCard: React.FC<{ example: CodeExample }> = ({ example }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(example.code);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{example.title}</CardTitle>
        <CardDescription>{example.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code className={`language-${example.language}`}>
              {example.code}
            </code>
          </pre>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        {example.output && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-1">Output:</h4>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {example.output}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
