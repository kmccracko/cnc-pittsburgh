echo "Processing deploy.sh"
# Set EB BUCKET as env variable
EB_BUCKET=elasticbeanstalk-us-east-2-746994831809
# Set the default region for aws cli
aws configure set default.region us-east-2
# Log in to ECR
eval $(aws ecr get-login --no-include-email --region us-east-2)
# Build docker image based on our production Dockerfile
docker build -t 746994831809/cncpgh .
# tag the image with the GitHub SHA
docker tag 746994831809/cncpgh:latest 746994831809.dkr.ecr.us-east-2.amazonaws.com/cncpgh:$GITHUB_SHA
# Push built image to ECS
docker push 746994831809.dkr.ecr.us-east-2.amazonaws.com/cncpgh:$GITHUB_SHA
# Use the linux sed command to replace the text '<VERSION>' in our Dockerrun file with the GitHub SHA key
sed -i='' "s/<VERSION>/$GITHUB_SHA/" Dockerrun.aws.json
# Zip up our codebase, along with modified Dockerrun
zip -r cncpgh-prod-deploy.zip Dockerrun.aws.json
# Upload zip file to s3 bucket
aws s3 cp cncpgh-prod-deploy.zip s3://$EB_BUCKET/cncpgh-prod-deploy.zip
# Create a new application version with new Dockerrun
aws elasticbeanstalk create-application-version --application-name cncpgh --version-label $GITHUB_SHA --source-bundle S3Bucket=$EB_BUCKET,S3Key=cncpgh-prod-deploy.zip
# Update environment to use new version number
aws elasticbeanstalk update-environment --environment-name Cncpgh-prod --version-label $GITHUB_SHA