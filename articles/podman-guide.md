---
title: "A step by step guide for podman"
tags: ["javascript", "docker", "podman"] 
author: "array.cx"
featured_image: "https://i.imgur.com/U6wtkcb.png"
---

# Intro

Ever heard of docker? I'm sure you have, today we will look at the newest kid on the block, Podman.

Podman is rootless and modern Docker made by RedHat; it's 100% FOSS and can run basically anywhere with a Linux kernel.

Today we will take a look at how you can spin up your first pod and get started with Podman

# Dependencies

Okay, first things first, let's install the dependencies, head over to [podman.io](https://podman.io) and install both the Desktop client, it is recommended to install the CLI aswell as it is very useful if you need quick access to podman

Additionally you will need a *somewhat* recent version of NodeJS (any works really, just don't use something that the cavemen made), you can install it via your package manager, or on their official site: [nodejs.org](https://nodejs.org/)

# Setting up a project

Just to save time we will make a simple javascript api that will return a "🔥" emoji whenever we send a request to the /podman path.

Let's go ahead and set up a project, open up your terminal of choice and run these commands, we are just creating a NodeJS project with ExpressJS so we can create our API

1. `$ mkdir podman-on-fire`

2. `$ cd podman-on-fire/`

3. `$ npm init -y`

4. `$ npm i express`

Alright, let's open it up in our editor of choice and create a **index.js** file in the root of the folder.

Inside this file we will add the following code

``` javascript
// import the ExpressJS library
const Express = require('express');

// intialize the api
const api = Express();

// define a /podman endpoint
api.get("/podman", (req, res) => {
    // return a "🔥" emoji
    res.send("🔥");
});

// tell the API to listen on the port 8080
api.listen(8080, () => {
    // print to make sure we are listening
    console.log('Listening on port 8080!');
})
```

Alright, now let's test, run `$ node .` in the folder, if you open up your browser and go to [localhost:8080/podman](http://localhost:8080/podman) it should return a 🔥 emoji.

# Writing a Containerfile

Okay, so what is a Containerfile, well it's a Dockerfile, it's as simple as that, if you want to name the Containerfile a Dockerfile podman will not care and will compile it either way.

Containerfiles are simple, to put it very simple they are a list of instructions of what the compiler should do to make an image that you want, let's make a new file in the root directory of our project named Containerfile and write the following code into it

``` Dockerfile
# This tells podman that we want to build on top the nodejs image
FROM node:20-alpine

# Let's make a file for the API to be hosted in, by default you will be put into the / directory of the pod filesystem
RUN mkdir /podman-on-fire

# Now we want to change the working directory to our folder so we can run the api from it
# IT SHOULD BE NOTED, this does NOT change the folder the compiler is in, this folder will only be used as the working directory once the pod is ran
WORKDIR /podman-on-fire

# Let's grab out package.json file so we can install all the dependencies our project may have
COPY package.json /podman-on-fire

# Install the dependencies as per usual
RUN npm i

# Now we can copy the rest of the files
COPY . /podman-on-fire 

# For our api to work, we need to expose a port to the outside, by default you cannot connect to the pod from the outside
EXPOSE 8080

# Now all thats left is to setup the start command for the pod, this will not be ran by the compiler
CMD ["node", "."]
```

If you want to do something with Containerfiles/Dockerfiles that was not mentioned here, you can find the documentation [here](https://docs.docker.com/reference/dockerfile/), I'm going to move on from this topic so we can get our hands dirty with pods.



# Building an image

***Fun fact**: you can compile any Dockerfile using podman even if it was written for Docker, it does not matter they are compatible both ways.*

**1. Let's check if podman is running, go into the default page in the desktop client, it should look like this**

![image](https://i.imgur.com/bKKAfXI.png)

If there isn't a 🟢 RUNNING text under the title please follow the installer and setup a podman machine

---

**2. Navigate to the 4th icon from the top and click "Build"**

![image](https://i.imgur.com/LBHyrIu.png)

---

**3. Fill in the Containerfile path, the context directory will autofill, this is the path to the Containerfile we just wrote**

![image](https://i.imgur.com/UeH9fU8.png)

---
**4. Click build :3**

---

# Using our newly created image

Let's go back into the 4th navbar icon from the top, you will see our newly made podman-on-fire API image, running it is very simple, you can do so by creating a pod.

---

**1. Click the ▶️ icon**

![image](https://i.imgur.com/p2Wn9ZT.png)

---

**2. Name the container**

Should be noted that you cannot use spaces and only use the base english alphabet + numbers

***Optional:** you can change the outside port of the container by changing this number, essentially by changing this number the API will still listen on port 8080, but from the outside it will be forwarded from another port.*

![image](https://i.imgur.com/DIgOyzr.png)

---

**3. Start the container**

Click the big purple button at the bottom named "Start Container"

---

If all went well you can now navigate to localhost:[port you chose, default is 8080]/podman, if you see a 🔥 emoji you've successfully deployed a container.

# Pods

Pods are isolated groups of containers and other pods, there can be 1 or more pods in each one, you have to create this pod in order to deploy it using kubernetes.

### How to create one


1. Navigate into the 4rd icon from the top in the navbar of the Desktop client.

2. Select it like this

![image](https://i.imgur.com/zpL1x2g.png)

*Note: you may select as many containers as you wish, i'm just making an example here with our single container*

3. Click "Create Pod" on the top part of the window

![image](https://i.imgur.com/0z1tDza.png)

4. Name it however you want and do not change any of the other settings

5. Click "Create Pod" on the bottom right of your screen

You may notice that our pod is now running, again you can access it on the same address as before, this time though you can deploy this

---