This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Creating a New Release - Deployment Instructions
Follow these steps to create a new release and deploy it to the appropriate environment:

### Step 1: Create a New Release Tag
1. Go to [the release page](https://github.com/awell-health/hosted-pages/releases).
2. Create a new release tag for your project. This tag will serve as the starting point for the deployment process.
### Step 2: Trigger Staging Release
3. After creating the release tag, the staging release will automatically be triggered.
4. To monitor the progress, check the deployment pipeline in [the actions page](https://github.com/awell-health/hosted-pages/actions).
### Step 3: Deploy to Sandbox
5. To deploy the release to the sandbox environment, access [Sandbox deployment](https://github.com/awell-health/hosted-pages/actions/workflows/sandbox-deployment.yml) in actions.
6. Select 'Run Workflow' from the options available.
7. Set the branch to `staging` if it's a regular release or `main` if it's a hotfix release.
### Step 4: Deploy to Production
8. To deploy the release to the production environment, access [Production deployment](https://github.com/awell-health/hosted-pages/actions/workflows/production-deployment.yml) in actions.
9. Select 'Run Workflow' from the options available.
10. Set the branch to `staging` for a regular release or `main` for a hotfix release.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


