const puppeteer = require('puppeteer');

function reddit_url (subreddit) {
    return `https://old.reddit.com/r/${subreddit}`;
}

if (process.argv.length < 3 ){
    console.log("Usage: ./scraping.js subreddit [subreddit2] [...]\nMore than one argument is required");
    process.exit(0);
} 

(async () => {
    const browser = await puppeteer.launch(/*{headless:false}*/);
    const page = await browser.newPage();

    let allPosts = [];

    for (let i = 3; i <= process.argv.length; i++){
        await page.goto(reddit_url(process.argv[i-1]), {waitUntil: "networkidle0"});

        let response = await page.$("div[id = 'classy-error']"); 
        
        if (response != null) {
            console.log(`${process.argv[i-1]} is not a valid subreddit`);
            process.exit(1);
        }
        
        let private = await page.$eval("span[class = 'hover pagename redditname']", subName => subName.innerHTML); 
        
        if (private.includes(": private")){
            console.log(`${process.argv[i-1]} is a private subreddit`);
            process.exit(1);
        }
        
        let posts = await page.$$("div[id *= 'thing_t3']");

        for( postNum in posts){
            let title = await posts[postNum].$eval("a[class *= 'title may-blank']", post => post.innerHTML);
            let url = await posts[postNum].$eval("a[class *= 'title may-blank']", post => post.getAttribute("href"));
            let upvotes = await posts[postNum].$eval("div[class *= 'score unvoted']", post => post.innerHTML);
            if (upvotes == "•"){
                upvotes = "unknown";
            }
            let comments = await posts[postNum].$eval("a[class *= 'bylink comment']", post => post.innerHTML.split(' ')[0]);
            if (comments == "comment"){
                comments = 0;
            }
            allPosts.push({
                title,
                url,
                upvotes,
                comments
            })
        }
    }
    console.log(allPosts);
    console.log(allPosts.length);
    await browser.close();
  })();