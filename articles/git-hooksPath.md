---
title: "Git and Hook Scripts the easy way"
tags: ["Git"] 
author: "alecthegeek"
featured_image: "./resources/git-hookspath/robot.jpeg"
---
<!--
This work is copyright Alec Clews 2014.

It is licensed under a Creative Commons ATTRIBUTION-SHAREALIKE 4.0 INTERNATIONAL license https://creativecommons.org/licenses/by-sa/4.0/ 
-->

## About Hook scripts

> **Git Hooks**
> 
> Like many other Version Control Systems, Git has a way to fire off custom scripts when certain important actions occur.
> There are two groups of these hooks: client-side and server-side.
> Client-side hooks are triggered by operations such as committing and merging,
> while server-side hooks run on network operations such as receiving pushed commits.
> You can use these hooks for all sorts of reasons.
>
> -- <cite>[Pro Git](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) book</cite>

<figure>
<image src="./resources/git-hookspath/sequence.png" alt="UML Sequence diagram showing how Git calls a hook script" style="width:500px;"/>
<figcaption>How a hook script is called during a Git operation</figcaption>
</figure>

In this post we will talk about client side hooks, for example hook scripts that
are executed on the `git commit` and `git push` commands. Consultant the fine manual for information on other hook scripts.

## What Can Hook Scripts Do?

Anything you want! For example:

1. Beautify your content with a tool like [`gofmt`](https://pkg.go.dev/cmd/gofmt), or [`prettier`](https://prettier.io/), to adhere to project guidelines
2. Lint your code and reject the commit if any problems are detected
4. Ensure that the commit message uses the correct template and cites a valid change request as per your project workflow
5. Run unit tests.

## Managing Hook Scripts

Hook scripts are stored in the `.git/hooks` directory, and once hook scripts are set up in a repo they work well.

However, they are not easy to manage across a project with more than one repo clone,
as hook scripts are not versioned objects and do not propagate across git repos during
synchronisation operations (e.g. git push or git pull).

So if a developer clones a repo they have to find a way to add the project's hook scripts into their local workstation.
It is also very difficult for subsequent improvements to the hook scripts to be distributed across the team.

There are various ways to address this. We'll focus on the easy approach using the "hooksPath" config setting.

## The Easy Way

The Git "hooksPath" setting provides a convenient way to manage hook scripts and turns hook scripts into
versioned files.

1. Install current hook scripts to a version controlled directory. e.g.  
 
	```sh
    mkdir .hooks
    cp .git/hooks/* .hooks
    git add .hooks
    git commit -m "Put Git hook scripts under version control"
    ```

3. Set the hooksPath config value. e.g.

	```sh
    git config core.hooksPath "./.hooks"
    ```

4. Update project readme so contributors set the correct
   config value on the workstation

    ```sh
    git clone --config core.hooksPath="./.hooks" . . .
    or
    git config core.hooksPath "./.hooks"
    ```

Now hook script changes are deployed during git pull, git clone etc.,
**and** have a full version control history.

> **core.hooksPath**
> 
> By default Git will look for your hooks in the $GIT_DIR/hooks directory.
> Set this to different path, e.g. /etc/git/hooks, and Git will try to find your hooks in that directory,
> e.g. /etc/git/hooks/pre-receive instead of in $GIT_DIR/hooks/pre-receive.
>
> The path can be either absolute or relative.
> A relative path is taken as relative to the directory where the hooks are run (see the "DESCRIPTION" section of [githooks](https://git-scm.com/docs/githooks))...
>
>  -- <cite>The [Git Documention](https://git-scm.com/docs/git-config#Documentation/git-config.txt-corehooksPath)</cite>

This may be all your project needs to use hook script effectively.

## About Alec

Alec is a neck beard who lives and works on Bunurong Land, Melbourne, Australia. He loves
working with APIs and yak shaving. He learnt vi so long ago he still can't use the fancy
visual mode in Vim.
You can find him online in most places as [alecthegeek](https://alecthegeek.gitlab.io/).
Feel free to reach out on [Mastodon](https://mstdn.social/@alecthegeek).

This article is an extract from a blog post on Hook automation with Lefthook at https://alecthegeek.gitlab.io/ (coming soon)
