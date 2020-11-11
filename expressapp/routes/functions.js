module.exports = {
    reddit_url: function(subreddit) {
        return `https://old.reddit.com/r/${subreddit}`;
    },

    nextPage: async function(page) {
        console.log("attempting to go to next page");
        await Promise.all([
            page.waitForNavigation({waitUntil: "networkidle0"}),
            page.click("span[class = 'next-button']")
        ]);

        return await page.$$("div[id *= 'thing_t3']");
    }
}