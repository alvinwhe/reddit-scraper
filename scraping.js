const puppeteer = require('puppeteer');
const { nextPage } = require('./functions');
const functions = require('./functions');

if (process.argv.length < 3 || (process.argv[2] == "-n" && process.argv.length < 5)){
    console.log("Usage: ./scraping.js [-n numberPosts] subreddit [subreddit2] [...]\n" +
                "-n number of posts you want to scrape per subreddit, defaulted to 50" 
                );
    process.exit(0);
} 

let inputs;
let reqNumPosts;

if (process.argv[2] == "-n"){
    inputs = process.argv.slice(4,process.argv.length);
    reqNumPosts = process.argv[3];
} else {
    inputs = process.argv.slice(2,process.argv.length);
    reqNumPosts = 50;
}

let allPosts = [];

(async () => {
    const browser = await puppeteer.launch(/*{headless:false}*/);
    const page = await browser.newPage();

    for (let i = 0; i < inputs.length; i++){
        await page.goto(functions.reddit_url(inputs[i]), {waitUntil: "networkidle0"});

        let response = await page.$("div[id = 'classy-error']"); 
        
        if (response != null) {
            console.log(`${inputs[i]} is not a valid subreddit`);
            continue;
        }
        
        let private = await page.$eval("span[class = 'hover pagename redditname']", subName => subName.innerHTML); 
        
        if (private.includes(": private")){
            console.log(`${inputs[i]} is a private subreddit`);
            continue;
        }
        
        let posts = await page.$$("div[id *= 'thing_t3']");
        let countPosts = [];

        while (countPosts.length < reqNumPosts){ 
            for( postNum in posts){
                if(await posts[postNum].evaluate(post => post.getAttribute("data-promoted"),posts[postNum]) == "true"){
                    console.log("found ad, skipping");
                    continue;
                }
                let title = await posts[postNum].$eval("a[class *= 'title may-blank']", post => post.innerHTML);
                let url = await posts[postNum].$eval("a[class *= 'title may-blank']", post => post.getAttribute("href"));
                let upvotes = await posts[postNum].$eval("div[class *= 'score unvoted']", post => post.innerHTML);
                if (upvotes == "•"){
                    upvotes = "unknown";
                }
                let comments = await posts[postNum].$eval("a[class *= 'bylink comment']", post => post.innerHTML.split(' ')[0]);
                if (comments == "comment"){
                    comments = "0";
                }

                let subreddit = inputs[i];
                countPosts.push({
                    subreddit,
                    title,
                    url,
                    upvotes,
                    comments
                })
                console.log("pushed to count");
            }
            if (countPosts.length >= reqNumPosts){
                break;
            }
            posts = await nextPage(page);
        }

        countPosts = countPosts.slice(0,reqNumPosts);
        allPosts = allPosts.concat(countPosts);
    }
    console.log(allPosts);
    console.log(allPosts.length);
    await browser.close();
  })();

const express = require('express')
const app = express()
const port = 9000

app.get('/', (req, res) => {
  res.send(allPosts);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})