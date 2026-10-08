# Agent instructions

## Manually validating pull requests

GitHub Actions validation workflows in this repository do not start automatically when a pull request opens or receives a commit. Run each required workflow against the pull request's latest commit before merging. A new commit requires fresh successful checks. GitHub only allows `workflow_dispatch` for a workflow present on the default branch, so a PR that first adds dispatch support cannot run that workflow on GitHub until this change is merged. Local validation is useful during this bootstrap period, but does not count as a required GitHub check.

- **GitHub UI:** After this change is merged to the default branch, open **Actions**, select the workflow, choose **Run workflow**, select the pull request branch, provide any required inputs, and start the run.
- **GitHub CLI:** Once the dispatch-enabled workflow is present on the default branch, agents can run it on a pull request branch:

  ```sh
  gh workflow run <workflow-file> --ref <pr-branch> --repo anyshift-io/anyshift-graph-sdk -f name=value
  ```

Replace `<workflow-file>` and `<pr-branch>` with the workflow path and current PR branch. Add `-f name=value` for each required workflow input. For pull requests from forks, pass `-f pr_number=<number>`; the workflow checks out the base repository's pull request head ref. Confirm every required status has passed on the current PR head before merging.
