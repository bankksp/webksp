import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const md = `<span style="font-weight: 300;"> โรงเรียนกาฬสินธุ์

นับเป็นเกียรติยศอันสูงสุด

โรงเรียนกาฬสินธุ์ปัญญานุกูล </span>`;

const md2 = `
<span style="font-weight: 300;"> 
โรงเรียนกาฬสินธุ์
</span>
`;

const el = React.createElement(ReactMarkdown, {
  rehypePlugins: [rehypeRaw],
  children: md
});

console.log('--- TEST 1 ---');
console.log(renderToString(el));

const el2 = React.createElement(ReactMarkdown, {
  rehypePlugins: [rehypeRaw],
  children: md2
});

console.log('--- TEST 2 ---');
console.log(renderToString(el2));
