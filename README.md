<a><img src='https://i.imgur.com/LyHic3i.gif'/></a>
<p align="center">
  <a href="####"><img src="http://readme-typing-svg.herokuapp.com?color=cyan&center=true&vCenter=true&multiline=false&lines=`🔰𝗥𝗮𝗵𝗮𝘁_𝗕𝗼𝘁🔰`" alt="">
</p>
    <a><img       
src='https://i.imgur.com/LyHic3i.gif'/></a>

-------

<img src='https://i.imgur.com/7VGnvSx.jpeg'/>

_______
### <br>   ❖ DEPLOY_WORKFLOWS ❖
```
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
    # Step to check out the repository code
    - uses: actions/checkout@v2

    # Step to set up the specified Node.js version
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}

    # Step to install dependencies
    - name: Install dependencies
      run: npm install

    # Step to run the bot with the correct port
    - name: Start the bot
      env:
        PORT: 8080
      run: npm start
```

___
## ⚙️Installation⚙️

### 1. Repository Clone Karein

```bash
https://github.com/Boss-Rahat/Xrahat_Mirai-BOtt.git
```

### 2. Dependencies Installed

```bash
npm install
```

### 3. Facebook Appstate Add Do it

- Paste your Facebook account's ```appstate.json``` file in the root folder.

- Ensure that the file is valid and updated.

### 4. Run the Bot

```bash
node Xrahat.js
```

---
###  🔰𝗥𝗮𝗵𝗮𝘁_𝗕𝗼𝘁🔰
❖ ***`বট রান দিতে সমস্যা হলে ফেসবুকে যোগাযোগ করো
❖👇নিচে আইডির লিঙ্ক আছে👇❖`** ❖

----------
## Facebook ID:👉 <a href="https://www.facebook.com/share/14N3ACfd4fM/">Link</a>

<p align="center">
  <a href="#"><img src="http://readme-typing-svg.herokuapp.com?color=cyan&center=true&vCenter=true&multiline=false&lines=`🔰𝗥𝗮𝗵𝗮𝘁_𝗕𝗼𝘁🔰`" alt="">
</p>

## License

This project is licensed under the GNU General Public License v3.0 or later - see the [COPYING](./COPYING) file for details.




[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
> ⚠️ This is a modified version. See License section below for usage rights.

---
### 💬 Thanks for visiting!

Made by ***Rahat Islam***
### 👇👋*original fork*👋👇
<p align="center">
  <a href="https://github.com/Boss-Rahat/Xrahat_Mirai-BOtt.git" target="_blank">
    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="120" alt="Fork on GitHub" style="border-radius: 50%;">
 </a>
</p>
