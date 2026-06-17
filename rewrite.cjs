const fs = require('fs');

const homePath = 'src/pages/Home.tsx';
let homeContent = fs.readFileSync(homePath, 'utf8');
if (!homeContent.includes("import { createExcerpt }")) {
  homeContent = homeContent.replace("import { getYoutubeId } from '../lib/utils';", "import { getYoutubeId } from '../lib/utils';\nimport { createExcerpt } from '../lib/excerpt';");
}
homeContent = homeContent.replace(/<p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">\s*\{item.content\}\s*<\/p>/g, '<p className=\"text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed\">\n                      {createExcerpt(item.content, 120)}\n                    </p>');
fs.writeFileSync(homePath, homeContent);

const postsPath = 'src/pages/Posts.tsx';
let postsContent = fs.readFileSync(postsPath, 'utf8');
if (!postsContent.includes("import { createExcerpt }")) {
  postsContent = postsContent.replace("import { getPosts, getSchoolInfo, trackVisit } from '../services/dataService';", "import { getPosts, getSchoolInfo, trackVisit } from '../services/dataService';\nimport { createExcerpt } from '../lib/excerpt';");
}
postsContent = postsContent.replace(/<p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">\s*\{post\.content\}\s*<\/p>/g, '<p className=\"text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-1\">\n                      {createExcerpt(post.content, 120)}\n                    </p>');
fs.writeFileSync(postsPath, postsContent);
