This is an application template for Cloud operations front end application using NEXT.JS and the RAC Design System. The template has been constructed with the assumption that the UI will be hosted along side the API in an Azure Application Service protected by Easy Auth.

The template was bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), then modified to include the RAC Design System and Easy Auth. The template includes the basic structure of one of our UI applications and is configured for both jest unit tests and playwright end to end tests. The template provides samples of actual tests to get developers using them.

## Getting Started

Clone the template repository and the repository where you will place the rewrite code to your local development machine. Copy the contents of the template repository \nextjs-template to the rewrite repository.

In the package.json file of the rewrite repository, update the name to reflect the new application and in the `src/app/layout.tsx` file update the title and description for the metadata.

A Clone powershell - CloneNextJS.ps1 - script has been created at the repository root to allow you to simply clone the template to a new or existing folder.  Note this is not a git clone, but a copy / rename of the template for starting a new application.  If the output folder exists, then you will be prompted if you want all the existing content to be removed from the folder.  Selecting yes will delete all existing files in the folder, excluding the .git file.  This will allow you to copy the template to an existing git repo folder on your machine and allow that to be tracked.  Posable use case is when rewriting the angular apps and you want to replace the existing angular app with the new template to start re-development.  The script takes a number of parameters:

- applicationName This is a mandatory string parameter and is used to crete the folder, name the application in the package.json file, Add the name into the layout metadata that displays on the Html tab. There is some transformation that occurs with this parameter.  The display on the tab will match exactly, the folder name and application name in the package.json file will be all lowercase and have the spaces switched with hyphens.  As an example -applicationName "CARS Cash Settlement" would create the folder cars-cash-settlement and name the application cars-cash-settlement.  If you are replacing the existing files with the template look to match this to the existing repo name as an example End of Day Banking would be -applicationName "EndOfDay Banking" to match endofday-banking.  Note you can edit this in the files after clone if you want ot need to.
- outputPath This is a mandatory string parameter and determines the output location of the clone process. This will be the folder where the a folder will be created / overridden by the transformed applicationName parameter. E.g. specifying outputPath "c:\Work\github\apps" and applicationName "Cars Cash Settlement" would result in either the folder c:\Work\github\apps\cars-cash-settlement being created with the cloned template as content, or if th folder exists and you select yes to overwrite, the existing content will be deleted (excluding the .git file) and the template as content.
- applicationDescription This mandatory parameter will replace the application description in the layout.tsx file metadata.
- workingDirectory This is an optional parameter and is used to set the working directory in the yaml files.  The default is "." and would normally be the correct value.  Only use this if the app uses a different folder where the NextJS app resides in a subfolder of the repository.  Set this to the name of the subfolder.

## Prerequisites

As the template uses the design system packages from the design system feed, you will need to have access to the feed. The feed is a private feed and you will need to have the appropriate permissions to access the feed. You will also need to add a .npmrc file to your profile on the hard drive eg: C:\Users\Colema0k\.npmrc configured with access to the repository. See [Connect To Feed](https://dev.azure.com/racwa/Digital/_artifacts/feed/racwa-design-feed/connect) to follow instructions for NPM ( I use the PAT token)

## Available Scripts

Scripts to perform various tasks are available in the package.json file. The scripts are:

```bash
### These scripts are documented using NPN but equivalent yarn and pnpm commands should work with the scripts.

npx next dev - Run the application in development mode locally. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
npx next build - Build the application for deployment
npx next start - Start the application in production mode
npm run test - Run the jest unit tests
npm run test:e2e - Run the playwright end to end tests
npm run test:ci - Run the jest unit tests and output the coverage report
npm run format - Format the code using prettier
```

**NOTE:** The `test:e2e` script requires the application to be running in development mode. The script will launch the UI for playwright for you to review the tests.

## Working with code

You are now able to create the application code by creating new components and tests and adding the components to the Main component (This is the starting point for the templates layout.).

**NOTE:** State management can be done in the parent or child component depending on where the state is displayed and used. For instance if the child component is a form, the state should be managed in the child component. If the state is used in multiple components, the state should be managed in the parent component.

The design system uses MUI for components and has specific RAC styling for MUI components. You can use Either MUI or RAC components in the application.

**NOTE:** The design system is a work in progress and will be updated as new components are added to the design system. There is currently no reference in the template to the RACi specific components developed for SPARK applications.

The template uses Easy Auth for authentication. The template has been configured to use the Easy Auth token to authenticate the user. Fetching the token and user details are managed in the auth.service. The api.service is used to perform get and post requests to the backend API and is configured to use the values from the auth.service to authenticate with the backend api.

**NOTE:** The Easy auth / auth.service and api.service are a work in progress and will be updated as required. They are covered by tests but may need additional work to resolve issues found when deployed and used in an Easy Auth scenario. In that case you should resolve the issues using your rewrite code then update the template to match.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

As next JS uses React, you can learn more about React at the following resources:

- [React Documentation](https://react.dev/learn) - learn about React features and API.

Details on the RAC Design System can be found at the following resources:

- [RAC Design System - Developer](https://rac.design/363e96942/p/08802e-im-a-developer) - learn about the RAC Design System features and API.
- [MUI](https://mui.com/material-ui/getting-started/) - learn MUI features and API.

## Pipelines

The template contains both GitHib Actions and Azure DevOps pipelines:

- GitHub Actions,

  - Named buildpipeline.yaml and is located in the .github/workflows folder. The pipeline calls the reusable pipeline in the template root and the pipeline will:
  - build,
  - test
  - and upload Codacy Coverage reports to Codacy.

- Azure Devops
  - Named buld.vsts-ci.yml and ins located in the pipelines folder of the nextjs-template.
  - The purpose of the pipeline is to create the build artifacts for the application to allow a combined deployment pipeline for the UI and the API. The reasons for this are the artifacts are sourced from different repositories and have a combined final step of performing a slot swap. Note the UI and API are deployed to the same App Service on azure with the API being in a virtual directory of the web application (e.g AppUrl/api).
  - The pipeline will:
    - checkout the application
    - install Node
    - install the dependencies
    - run the jest unit tests
    - upload the test report to DevOps
    - upload the coverage report to DevOps
    - for the 4 environments (dev, sit, uat, prd)
      - build the .env file for the environment including fetching any secrets from the key vault
      - build the release for the environment
      - publish the artifacts for that environment

## Environment Variables

Next.js uses environment variables to configure the application. Environment variables are stored in the .env or .env.local file of the application. The .env.local file is not checked into the repository and is used to store the local development environment variables (typically secrets for running locally). The .env.local file should be added to the .gitignore file to prevent it being checked into the repository.

The .env file is checked into the repository and is used to store the non secret environment variables for the application. The apps are set to run as a SPA i.e. there are no server components. This is configured as export in the next.config.mjs file. This could be changed to a later date to use all of the JEXT.JS functionality.

The result is the .env file variables are compiled directly into the application with separate builds for each environment. Each environment requires its own .env file to produce artifacts for each environment.

As the .env file is checked into the repository, the .env file should not contain any secrets. Secrets should be stored in the Azure Key Vault and fetched at build time. The pipeline will fetch the secrets from the key vault and build the .env file for the environment. The file `./pipelines/create-environment-files-from-input.ps1` is used to build the environment specific file and fetch the secrets and add them to the .env file for each environment build.

To prepare for the build you need to add the non secret variables to the `.env{env}` file in the `/deployment-application-settings` folder. Secrets need to be added to a key vault that the ADO service principal has read / list permissions to. The app settings that contain secrets should be specified as a comma separated list in the variable in the pipeline `{env}AppSettingsNameSecretsPairs` e.g. DevAppSettingsNameSecretsPairs. The format for each setting that is a secret is "SettingName=SecretName". The pipeline copy and rename (will overwrite the existing .env file) the `.env.{env}' file from the `/deployment-application-settings' folder to `.env` in the application folder, then fetch the secrets from the key vault and add them to the .env file for the environment.

Environment variables need to have the prefix NEXT_PUBLIC_ to be available in the browser. Application code should reference the variables as `process.env.{variableName}`. e.g. process.env.NEXT_PUBLIC_API_URL. This applies to secret and non secret variables. During local development non secret variables can be placed into the .env file as it does not matter if they are committed. Secret environment variables should be placed in the .env.local file and the .env.local file should be added to the .gitignore file.

When the application is run locally the load order for variables is .env then .env.local. See [NextJS Environment variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables) for additional details on environment variables.

## Testing

The template has configured 2 types of tests:

- Jest unit tests
- Playwright end to end tests.

### Jest

The jest tests are configured to run in the pipeline and the pipeline will fail if the tests fail. The jest tests are run in the pipeline using npm run test:ce. This will run the tests and output a test coverage file. You can install the Jest Extension to VS Code to make running the tests simpler.

### Playwright

Playwright tests are run using test:e2e commands. The npm run test command will run the jest unit tests and the npm run test:e2e command will run the playwright end to end tests. Note the playwright tests require the application to be running in development mode. The script will launch the UI for playwright for you to review the tests. Once deployed you should be able to run the playwright tests against the deployed code you can specify the base URL in the playwrite.config.ts file.

### Future State

The template is a work in progress and could at a later stage include Storybook tests.

## Deployment

Currently template does not contain deployment steps. These would need to be reviewed as part of the initial releases of the application.

## Warning

The application / template is untested as yet under easy auth conditions. The auth.service and api.service have test coverage to verify the code but has not been deployed and tested end to end as an application.
