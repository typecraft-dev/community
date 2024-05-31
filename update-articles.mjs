import dotenv from 'dotenv';
dotenv.config();

import GhostAdminAPI from '@tryghost/admin-api';
import GhostContentAPI from '@tryghost/content-api';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import fetch from 'node-fetch';
import { DateTime } from 'luxon';
import FormData from 'form-data';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';

const adminApi = new GhostAdminAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_ADMIN_API_KEY,
  version: 'v5.0'
});

const contentApi = new GhostContentAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_CONTENT_API_KEY,
  version: 'v5'
});

async function getChangedFiles() {
  try {
    const repo = process.env.GITHUB_REPOSITORY;
    const sha = process.env.GITHUB_SHA;

    const isShallow = fs.existsSync('.git/shallow');
    if (isShallow) {
      console.log('Repository is shallow, fetching full history...');
      execSync('git fetch --unshallow');
    } else {
      console.log('Repository is not shallow.');
    }

    console.log('Fetching origin/main...');
    execSync('git fetch origin +refs/heads/main:refs/remotes/origin/main');

    const baseSha = execSync(`git rev-parse origin/main~1`).toString().trim();
    console.log(`Base SHA: ${baseSha}`);

    const diffOutput = execSync(`git diff --name-only ${baseSha} ${sha}`).toString().trim();
    console.log(`Changed files: ${diffOutput}`);

    return diffOutput.split('\n').filter(file => file.startsWith('articles/') && file.endsWith('.md') && fs.existsSync(file));
  } catch (error) {
    console.error('Error getting changed files:', error);
    throw error;
  }
}

async function getCommitAuthor() {
  try {
    const repo = process.env.GITHUB_REPOSITORY;
    const sha = process.env.GITHUB_SHA;

    console.log(`Fetching commit data for SHA: ${sha}...`);
    const response = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`);
    const commitData = await response.json();

    if (!commitData || !commitData.commit || !commitData.commit.author || !commitData.commit.author.name) {
      console.warn(`Warning: Commit data is missing required author information for SHA: ${sha}. Using default author.`);
      return "robert@typecraft.dev";
    }

    return commitData.commit.author.name;
  } catch (error) {
    console.error('Error getting commit author:', error);
    throw error;
  }
}

async function findPostById(postId) {
    try {
        console.log(`Attempting to find post with ID: ${postId}`);
        const post = await adminApi.posts.read({ id: postId });
        console.log(`Post found by ID: ${JSON.stringify(post, null, 2)}`);
        return post;
    } catch (error) {
        if (error.response) {
            // API responded with a status code outside the range of 2xx
            console.error(`Error response data: ${JSON.stringify(error.response.data, null, 2)}`);
            console.error(`Error response status: ${error.response.status}`);
            console.error(`Error response headers: ${JSON.stringify(error.response.headers, null, 2)}`);
            if (error.response.status === 404) {
                console.log(`Post not found for ID: ${postId}`);
                return null;
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
        }
        throw error;
    }
}

async function getAuthorByEmail(email) {
  try {
    console.log(`Fetching author by email: ${email}`);
    const members = await adminApi.members.browse({ filter: `email:${email}`, limit: 1 });
    return members.length ? members[0] : null;
  } catch (error) {
    console.error('Error fetching author by email:', error);
    throw error;
  }
}

async function getAuthorData() {
  const defaultAuthorEmail = 'robert@typecraft.dev';
  try {
    const commitAuthorEmail = await getCommitAuthor();
    let author = await getAuthorByEmail(commitAuthorEmail);
    if (!author) {
      console.warn(`Author with email ${commitAuthorEmail} not found. Using fallback author.`);
      author = await getAuthorByEmail(defaultAuthorEmail);
    }
    if (author) {
      return { id: author.id };
    } else {
      console.error('Error: Fallback author not found.');
      return null;
    }
  } catch (error) {
    console.error('Error in getAuthorData:', error);
    return null;
  }
}

async function uploadImage(imagePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));

  const response = await fetch(`${process.env.GHOST_API_URL}/ghost/api/v5/admin/images/upload/`, {
    method: 'POST',
    headers: {
      Authorization: `Ghost ${process.env.GHOST_ADMIN_API_KEY}`,
    },
    body: formData,
  });

  const result = await response.json();
  return result.images[0].url;
}

function processCustomMarkdown(markdownContent) {
  // Replace callouts
  const calloutRegex = /::: callout([\s\S]*?):::/g;
  markdownContent = markdownContent.replace(calloutRegex, '<div class="callout">$1</div>');

  // Replace image captions
  const captionRegex = /!\[(.*?)\]\((.*?)\)\s*\*(.*?)\*/g;
  markdownContent = markdownContent.replace(captionRegex, '<figure><img src="$2" alt="$1"><figcaption>$3</figcaption></figure>');

  return markdownContent;
}

async function processMarkdownImages(markdownContent, markdownFilePath) {
  const processedContent = processCustomMarkdown(markdownContent);
  const dom = new JSDOM();
  const document = dom.window.document;
  const htmlContent = marked(processedContent);
  const parser = new dom.window.DOMParser();
  const parsedHtml = parser.parseFromString(htmlContent, 'text/html');
  const images = parsedHtml.querySelectorAll('img');
  
  for (const img of images) {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http')) {
      const imagePath = path.resolve(path.dirname(markdownFilePath), src);
      const uploadedImageUrl = await uploadImage(imagePath);
      img.setAttribute('src', uploadedImageUrl);
    }
  }

  return parsedHtml.body.innerHTML;
}

function convertHtmlToMobiledoc(htmlContent) {
  return JSON.stringify({
    version: '0.3.1',
    markups: [],
    atoms: [],
    cards: [['html', { cardName: 'html', html: htmlContent }]],
    sections: [[10, 0]]
  });
}

async function updateOrCreateArticles() {
  try {
    const files = await getChangedFiles();
    console.log(`Files to process: ${files}`);

    const authorData = await getAuthorData();
    if (!authorData) {
      console.error('Error: No valid author data found. Skipping post update/creation.');
      return;
    }
    console.log(`Author data: ${JSON.stringify(authorData)}`);

    let filesToCommit = [];
    for (const file of files) {
      console.log(`Processing file: ${file}`);
      const filePath = path.resolve(file);
      const slug = path.basename(file, '.md'); // Assuming file names can be used as slugs
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontMatter, content: markdownContent } = matter(fileContent);

      // Ensure the tag #community is always included
      const tags = (frontMatter.tags || []).concat('#community');
      console.log(`Tags for post: ${tags}`);

      // Process Markdown content for images and convert to HTML
      const htmlContent = await processMarkdownImages(markdownContent, file);
      const mobiledoc = convertHtmlToMobiledoc(htmlContent);

      // Handle featured image URL or upload local image
      let featuredImage = frontMatter.featured_image || '';
      if (featuredImage && !featuredImage.startsWith('http')) {
        const imagePath = path.resolve(path.dirname(file), featuredImage);
        featuredImage = await uploadImage(imagePath);
        console.log(`Uploaded featured image: ${featuredImage}`);
      }

      // Find existing post by postId or slug
      let post = null;
      if (frontMatter.postId) {
        post = await findPostById(frontMatter.postId);
      }

      if (post) {
        console.log(`Post found, updating post with ID: ${post.id}`);
        // If post exists, update it
        await adminApi.posts.edit({
          id: post.id,
          title: frontMatter.title || post.title,
          tags: tags,
          authors: [{ id: authorData.id }],
          mobiledoc: mobiledoc,
          feature_image: featuredImage
        });
        console.log('Post updated:', post);
      } else {
        console.log(`Post not found, creating new post with slug: ${slug}`);
        // If post does not exist, create it
        const newPost = await adminApi.posts.add({
          title: frontMatter.title || slug,
          slug: slug,
          tags: tags,
          authors: [{ id: authorData.id }],
          mobiledoc: mobiledoc,
          feature_image: featuredImage
        });
        console.log('New post created:', newPost);
        // Update markdown file with postId
        frontMatter.postId = newPost.id;
        const updatedContent = matter.stringify({ content: markdownContent, data: frontMatter });
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`Updated markdown file with postId: ${newPost.id}`);
        filesToCommit.push(file);
      }
    }

    // Commit and push changes if there are any updated files
    if (filesToCommit.length > 0) {
      execSync('git config --global user.name "github-actions[bot]"');
      execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
      execSync('git add articles/*.md');
      execSync('git commit -m "Update markdown files with postId"');
      execSync('git push');
      console.log('Changes committed and pushed to the repository.');
    }
  } catch (error) {
    console.error('Error in updateOrCreateArticles:', error);
    throw error;
  }
}

updateOrCreateArticles().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

