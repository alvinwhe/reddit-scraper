var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log("Received GET request at /")
    const puppeteer = require('puppeteer');
    const functions = require('../../functions');

    let inputs = ["manga"];

    /* how many update posts we want to scrape at a time */
    let reqNumPosts = 50;

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
                        /* skip any ad elements since they are identified as posts */
                        continue;
                    }
                    let title = await posts[postNum].$eval("a[class *= 'title may-blank']", post => post.innerHTML);
                    if(title.indexOf("[DISC]")== "-1"){
                        /* all chapters will have [DISC] in the name */
                        continue;
                    }
                    title = title.replace("[DISC]", "");
                    let url = await posts[postNum].$eval("a[class *= 'title may-blank']", post => post.getAttribute("href"));
                    if (url.indexOf('/r/manga') != "-1"){
                        url = "www.reddit.com" + url;
                    }
                    let upvotes = await posts[postNum].$eval("div[class *= 'score unvoted']", post => post.innerHTML);
                    if (upvotes == "•"){
                        let commentLink = await posts[postNum].$eval("a[class *= 'bylink comment']", post => post.getAttribute("href"));
                        let tmptab = await browser.newPage();
                        await tmptab.goto(commentLink,{waitUntil: "networkidle0"});
                        upvotes = await tmptab.$eval("span[class = 'number']", post => post.innerHTML);
                        await tmptab.close();
                    }

                    let thumbnail;
                    try{
                        thumbnail = await posts[postNum].$eval("a[class *= 'thumbnail invisible'] > img", post => post.getAttribute("src"));
                    } catch {
                        thumbnail = await posts[postNum].$eval("a[class *= 'thumbnail invisible']", post => window.getComputedStyle(post).getPropertyValue('background-image'));
                        thumbnail = thumbnail.slice(5,-2);
                    }
                    let time = await posts[postNum].$eval("p[class*='tagline'] > time", post => post.innerHTML);
                    countPosts.push({
                        title,
                        url, 
                        thumbnail,
                        upvotes,
                        time
                    })
                    console.log("pushed to count");
                }
                if (countPosts.length >= reqNumPosts){
                    break;
                }
                posts = await functions.nextPage(page);
            }

            countPosts = countPosts.slice(0,reqNumPosts);
            allPosts = allPosts.concat(countPosts);
        }
        await browser.close();
        res.send(allPosts);
    })();
});

module.exports = router;