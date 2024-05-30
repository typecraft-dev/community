import GhostAdminAPI from '@tryghost/admin-api';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import matter from 'gray-matter';
import fetch from 'node-fetch';

const api = new GhostAdminAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_ADMIN_API_KEY,
  version: "v3.0"
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

async function updateOrCreateArticles() {
  try {
    const files = await getChangedFiles();
    console.log(`Files to process: ${files}`);

    const authorName = await getCommitAuthor();
    console.log(`Author name: ${authorName}`);

    for (const file of files) {
      console.log(`Processing file: ${file}`);
      const postId = path.basename(file, '.md'); // Assuming file names are post IDs
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

      try {
        // Try to read the post
        let post = await api.posts.read({ id: postId });
        console.log(`Post found, updating post with ID: ${postId}`);

        // If post exists, update it
        post = await api.posts.edit({
          id: post.id,
          title: frontMatter.title || post.title,
          tags: tags,
          authors: [{ name: frontMatter.author || authorName }],
          mobiledoc: mobiledoc,
          updated_at: post.updated_at
        });
        console.log('Post updated:', post);
      } catch (err) {
        // If post does not exist, create it
        if (err.response && err.response.status === 404) {
          console.log(`Post not found, creating new post with ID: ${postId}`);
          const newPost = await api.posts.add({
            id: postId,
            title: frontMatter.title,
            tags: tags,
            authors: [{ name: frontMatter.author || authorName }],
            mobiledoc: mobiledoc,
            published_at: frontMatter.published_at
          });
          console.log('New post created:', newPost);
        } else {
          console.error('Error updating or creating post:', err);
        }
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

