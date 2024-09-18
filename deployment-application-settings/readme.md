# Instructions for deployment-application-settings

The objective here is to create a static file where you can store your application settings for each RAC environment that will be used during the build process to compile your code with the environment variables set for that environment.

You should have one file per deployment environment. This will match the environment for release for the application.

By convention we have 4 environments in Cloud operations, DEV, SIT, UAT and PRD. You should thus have 4 files here that will form the basis of the final .env files used in building the application. The files should be called :

- .env.dev
- .env.sit
- .env.uat
- .env.prd

The files should not contain any secrets only open environment settings like URL's etc.

When the pipeline is built, these files will be used to create the .env file that will be used to build the application. The script that does this will allow you to pass in the secretInput which will be a comma separated list of setting names and secret names.

These should be in the format of settingName1=secretName1,settingName2=secretName2 etc. with the settingName matching the settings name in the application and the secretName matching the secretName in the key vault you also pass into the script.

An example may be something like this:

NEXT_PUBLIC_API_KEY=AddressSearchSubscriptionKey-AutoQuotes,NEXT_PUBLIC_API_RESOURCE_ID=AddressManagementADApplicationId-DEV

The script will copy and rename the file from deployment-application-settings to .env and then append the settings with the secret values from the key vault to this file.

This will securely pass the correct settings and secrets to the build to create a set of build artifacts for the release to a specific environment.
