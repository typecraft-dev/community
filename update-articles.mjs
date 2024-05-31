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

const adminApi = new GhostAdminAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_ADMIN_API_KEY,
  version: "v5.0"
});

const contentApi = new GhostContentAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_CONTENT_API_KEY,
  version: "v5"
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

    return diffOutput.split('\n').filter(file => file.startsWith('articles/') && file.endsWith('.md'));
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

async function findPostBySlug(slug) {
  try {
    const posts = await contentApi.posts.browse({ filter: `slug:${slug}` });
    return posts.length ? posts[0] : null;
  } catch (error) {
    console.error('Error finding post by slug:', error);
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

function convertMarkdownToMobiledoc(markdownContent) {
  return JSON.stringify({
    version: '0.3.1',
    markups: [],
    atoms: [],
    cards: [['markdown', { cardName: 'markdown', markdown: markdownContent }]],
    sections: [[10, 0]]
  });
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

    for (const file of files) {
      console.log(`Processing file: ${file}`);
      const slug = path.basename(file, '.md'); // Assuming file names can be used as slugs
      const fileContent = fs.readFileSync(file, 'utf8');
      const { data: frontMatter, content: markdownContent } = matter(fileContent);

      // Ensure the tag #community is always included
      const tags = (frontMatter.tags || []).concat('#community');
      console.log(`Tags for post: ${tags}`);

      const mobiledoc = convertMarkdownToMobiledoc(markdownContent);

      // Validate and format published_at
      let publishedAt = frontMatter.published_at;
      if (publishedAt) {
        publishedAt = DateTime.fromISO(publishedAt).toISO();
        if (!publishedAt) {
          console.warn(`Invalid published_at format for file: ${file}. Using current date-time.`);
          publishedAt = DateTime.now().toISO();
        }
      }

      // Handle featured image URL or upload local image
      let featuredImage = frontMatter.featured_image || '';
      if (featuredImage && !featuredImage.startsWith('http')) {
        const imagePath = path.resolve(path.dirname(file), featuredImage);
        featuredImage = await uploadImage(imagePath);
        console.log(`Uploaded featured image: ${featuredImage}`);
      }

      try {
        // Try to find the post by slug
        let post = await findPostBySlug(slug);
        if (post) {
          console.log(`Post found, updating post with slug: ${slug}`);

          // If post exists, update it
          post = await adminApi.posts.edit({
            id: post.id,
            title: frontMatter.title || post.title,
            tags: tags,
            authors: [{ id: authorData.id }],
            mobiledoc: mobiledoc,
            published_at: publishedAt,
            updated_at: post.updated_at,
            feature_image: featuredImage
          });
          console.log('Post updated:', post);
        } else {
          console.log(`Post not found, creating new post with slug: ${slug}`);
          const newPost = await adminApi.posts.add({
            title: frontMatter.title || slug,
            slug: slug,
            tags: tags,
            authors: [{ id: authorData.id }],
            mobiledoc: mobiledoc,
            published_at: publishedAt,
            feature_image: featuredImage
          });
          console.log('New post created:', newPost);
        }
      } catch (err) {
        console.error('Error updating or creating post:', err);
      }
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

