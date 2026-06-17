import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const md = `
<span class="test"> line 1

line 2 </span>
`;

const md2 = `
<span style="font-weight: 300;"> line 1 </span>
`;

const el = React.createElement(ReactMarkdown, {
  rehypePlugins: [rehypeRaw],
  children: md2
});

console.log(renderToString(el));
