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
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.GITHUB_SHA;

  // Fetch the full history to ensure we have the previous commit
  execSync('git fetch --unshallow');
  execSync('git fetch origin +refs/heads/main:refs/remotes/origin/main');

  const baseSha = execSync(`git rev-parse origin/main~1`).toString().trim();

  const diffOutput = execSync(`git diff --name-only ${baseSha} ${sha}`).toString().trim();
  return diffOutput.split('\n').filter(file => file.startsWith('articles/') && file.endsWith('.md'));
}

async function getCommitAuthor() {
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.GITHUB_SHA;

  const response = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`);
  const commitData = await response.json();
  return commitData.commit.author.name;
}

async function updateOrCreateArticles() {
  const files = await getChangedFiles();
  const authorName = await getCommitAuthor();

  for (const file of files) {
    const postId = path.basename(file, '.md'); // Assuming file names are post IDs
    const fileContent = fs.readFileSync(file, 'utf8');
    const { data: frontMatter, content: markdownContent } = matter(fileContent);

    // Ensure the tag #community is always included
    const tags = (frontMatter.tags || []).concat('community');

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
}

updateOrCreateArticles().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

