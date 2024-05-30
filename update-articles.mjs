import GhostAdminAPI from '@tryghost/admin-api';
import GhostContentAPI from '@tryghost/content-api';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import matter from 'gray-matter';
import fetch from 'node-fetch';
import { DateTime } from 'luxon';

const adminApi = new GhostAdminAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_ADMIN_API_KEY,
  version: "v3.0"
});

const contentApi = new GhostContentAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_CONTENT_API_KEY,
  version: "v3"
});

async function getChangedFiles() {
  try {
    const repo = process.env.GITHUB_REPOSITORY;
    const sha = process.env.GITHUB_SHA;

    // Check if the repository is shallow
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
      return "Default Author";
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

async function findAuthorByName(name) {
  try {
    const authors = await contentApi.authors.browse({ filter: `name:${name}` });
    return authors.length ? authors[0] : null;
  } catch (error) {
    console.error('Error finding author by name:', error);
    throw error;
  }
}

async function findAuthorByEmail(email) {
  try {
    const authors = await contentApi.authors.browse({ filter: `email:${email}` });
    return authors.length ? authors[0] : null;
  } catch (error) {
    console.error('Error finding author by email:', error);
    throw error;
  }
}

async function getAuthorData(authorName) {
  try {
    let author = await findAuthorByName(authorName);
    if (!author) {
      console.warn(`Author ${authorName} not found. Using fallback author.`);
      author = await findAuthorByEmail('robert@typecraft.dev');
    }
    if (author) {
      return { id: author.id, slug: author.slug, email: author.email };
    } else {
      console.error('Error: Fallback author not found.');
      return null;
    }
  } catch (error) {
    console.error('Error in getAuthorData:', error);
    return null;
  }
}

async function updateOrCreateArticles() {
  try {
    const files = await getChangedFiles();
    console.log(`Files to process: ${files}`);

    const authorName = await getCommitAuthor();
    console.log(`Author name: ${authorName}`);

    const authorData = await getAuthorData(authorName);
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

      const mobiledoc = JSON.stringify({
        version: "0.3.1",
        atoms: [],
        cards: [],
        markups: [],
        sections: [
          [1, "p", [[0, [], 0, markdownContent]]]
        ]
      });

      // Validate and format published_at
      let publishedAt = frontMatter.published_at;
      if (publishedAt) {
        publishedAt = DateTime.fromISO(publishedAt).toISO();
        if (!publishedAt) {
          console.warn(`Invalid published_at format for file: ${file}. Using current date-time.`);
          publishedAt = DateTime.now().toISO();
        }
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
            updated_at: post.updated_at
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
            published_at: publishedAt
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

