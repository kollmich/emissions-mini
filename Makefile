.PHONY: aws-assets aws-htmljs

# github:
# 	rm -rf docs
# 	cp -r dist/ docs
# 	git add -A
# 	git commit -m "update dev version"
# 	git push

# archive:
# 	zip -r archive.zip dev
# 	git add -A
# 	git commit -m "archive"
# 	git push

# client: 
# 	npm run depudding
	
#aws-html:
#	aws s3 sync . s3://michalkollar.com

#list folder items	
#	aws s3 ls s3://michalkollar.com

#create a folder
# aws s3api put-object --bucket michalkollar.com --key 2019/September/wiki-death-tolls/test.txt --body text.txt

aws-assets:
	aws s3 sync dev s3://trendspotting.site/2020/March/emissions-mini --delete --cache-control 'max-age=31536000' --exclude 'index.html' --exclude 'bundle.js'

aws-htmljs:
	aws s3 cp dev/index.html s3://trendspotting.site/2020/March/emissions-mini/index.html
	aws s3 cp dev/bundle.js s3://trendspotting.site/2020/March/emissions-mini/bundle.js

# aws-cache:
# 	aws cloudfront create-invalidation --distribution-id E13X38CRR4E04D --paths '/year/month/name*'	

go: aws-assets aws-htmljs

# pudding: aws-assets aws-htmljs aws-cache archive

