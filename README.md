# Pelisflix server with StrapiJS

Repository containing the app used by the Heroku button.

Give it a try!

<a href="https://heroku.com/deploy?template=https://github.com/luisintosh/pelisflix-strapijs">
  <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

Be aware that one of the content type builder won't work due to the writing files restriction on the Heroku servers. If you do want to change content types, you need to follow these steps:

1. Click the button above and deploy your app
2. Clone that repo by using `heroku git:clone -a ` followed by your repo's name
3. Go into the cloned projects' folder using `cd` followed by your repo's name
4. Add the Heroku boilerplate as a remote by running `git remote add boilerplate https://github.com/luisintosh/pelisflix-strapijs`
5. Pull from this new origin by running `git pull boilerplate master`
