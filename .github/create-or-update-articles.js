const GhostAdminAPI = require('@tryghost/admin-api');
const { execSync } = require('child_process');

const api = new GhostAdminAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_ADMIN_API_KEY,
  version: "v3"
});

async function getChangedFiles() {
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.GITHUB_SHA;
  const baseSha = execSync(`git rev-parse origin/main~1`).toString().trim();

  const diffOutput = execSync(`git diff --name-only ${baseSha} ${sha}`).toString().trim();
  return diffOutput.split('\n').filter(file => file.endsWith('.md'));
}

async function updateOrCreateArticles() {
  const files = await getChangedFiles();

  for (const file of files) {
    const postId = file.replace('.md', ''); // Assuming file names are post IDs
    const fileContent = execSync(`cat ${file}`).toString();

    try {
      // Try to read the post
      let post = await api.posts.read({id: postId});
      // If post exists, update it
      post = await api.posts.edit({
        id: post.id,
        mobiledoc: JSON.stringify({
          version: "0.3.1",
          atoms: [],
          cards: [],
          markups: [],
          sections: [
            [1, "p", [[0, [], 0, fileContent]]]
          ]
        }),
        updated_at: post.updated_at
      });
      console.log('Post updated:', post);
    } catch (err) {
      // If post does not exist, create it
      if (err.response && err.response.status === 404) {
        const newPost = await api.posts.add({
          title: `New Article from ${file}`,
          mobiledoc: JSON.stringify({
            version: "0.3.1",
            atoms: [],
            cards: [],
            markups: [],
            sections: [
              [1, "p", [[0, [], 0, fileContent]]]
            ]
          })
        });
        console.log('New post created:', newPost);
      } else {
        console.error('Error updating or creating post:', err);
      }
    }
  }
}

updateOrCreateArticles();

