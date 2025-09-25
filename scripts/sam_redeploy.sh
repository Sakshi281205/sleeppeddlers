
#!/usr/bin/env bash
set -euo pipefail

# Safe, idempotent teardown and redeploy for a SAM/CloudFormation stack
# - Cancels UPDATE_IN_PROGRESS if stuck and disables termination protection
# - Empties versioned S3 bucket (all versions and delete markers)
# - Deletes the stack and waits
# - Redeploys via `sam deploy` using infra/samconfig.toml defaults (overridable)

# Requirements: awscli v2, sam cli, jq

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRA_DIR="$REPO_ROOT/infra"
SAMCONFIG="$INFRA_DIR/samconfig.toml"

function usage() {
  cat <<EOF
Usage: $(basename "$0") [--stack-name NAME] [--region REGION] [--bucket-name NAME] [--no-redeploy]

Options:
  --stack-name     Override stack name (defaults from infra/samconfig.toml)
  --region         Override AWS region (defaults from infra/samconfig.toml)
  --bucket-name    Override S3 bucket to purge (defaults to BucketName param in samconfig)
  --no-redeploy    Only teardown; skip redeploy

Environment:
  AWS_PROFILE      AWS CLI profile to use (optional)
EOF
}

STACK_NAME=""
REGION=""
BUCKET_NAME=""
REDEPLOY=1

while [[ ${1-} ]]; do
  case "$1" in
    --stack-name) STACK_NAME="$2"; shift 2;;
    --region) REGION="$2"; shift 2;;
    --bucket-name) BUCKET_NAME="$2"; shift 2;;
    --no-redeploy) REDEPLOY=0; shift 1;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1"; usage; exit 1;;
  esac
done

if [[ ! -f "$SAMCONFIG" ]]; then
  echo "samconfig not found at $SAMCONFIG" >&2
  exit 1
fi

# Extract defaults from samconfig.toml using awk/grep (avoid requiring yq for toml)
DEFAULT_STACK_NAME=$(awk -F'=' '/^stack_name/ {gsub(/"| /, "", $2); print $2}' "$SAMCONFIG")
DEFAULT_REGION=$(awk -F'=' '/^region/ {gsub(/"| /, "", $2); print $2}' "$SAMCONFIG")
PARAM_OVERRIDES_LINE=$(awk -F'=' '/^parameter_overrides/ {sub(/^[^=]*= /, ""); print}' "$SAMCONFIG")

# Parse BucketName from the parameter_overrides string, which looks like:
# parameter_overrides = "BucketName=\"xyz\" ApiKeyValue=\"...\" ..."
DEFAULT_BUCKET_NAME=$(echo "$PARAM_OVERRIDES_LINE" | sed -n 's/.*BucketName=\"\([^\"]*\)\".*/\1/p')

STACK_NAME=${STACK_NAME:-$DEFAULT_STACK_NAME}
REGION=${REGION:-$DEFAULT_REGION}
BUCKET_NAME=${BUCKET_NAME:-$DEFAULT_BUCKET_NAME}

if [[ -z "${STACK_NAME}" || -z "${REGION}" ]]; then
  echo "Failed to derive stack name or region. Provide --stack-name and --region." >&2
  exit 1
fi

echo "Stack: $STACK_NAME | Region: $REGION"
if [[ -n "$BUCKET_NAME" ]]; then
  echo "Data bucket: $BUCKET_NAME"
else
  echo "Warning: Could not determine BucketName parameter. Will attempt discovery from stack resources."
fi

AWS="aws --region $REGION"

function stack_exists() {
  if $AWS cloudformation describe-stacks --stack-name "$STACK_NAME" >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

function maybe_disable_termination_protection() {
  set +e
  $AWS cloudformation update-termination-protection \
    --stack-name "$STACK_NAME" --no-enable-termination-protection >/dev/null 2>&1
  set -e
}

function maybe_cancel_update_in_progress() {
  local status
  set +e
  status=$($AWS cloudformation describe-stacks --stack-name "$STACK_NAME" \
    --query 'Stacks[0].StackStatus' --output text 2>/dev/null)
  set -e
  if [[ "$status" == *"UPDATE_IN_PROGRESS"* || "$status" == *"UPDATE_ROLLBACK_IN_PROGRESS"* ]]; then
    echo "Cancelling update in progress: $status"
    $AWS cloudformation cancel-update-stack --stack-name "$STACK_NAME" || true
    echo "Waiting for stack to reach a stable state..."
    # Poll until status not *_IN_PROGRESS
    while : ; do
      sleep 10
      status=$($AWS cloudformation describe-stacks --stack-name "$STACK_NAME" \
        --query 'Stacks[0].StackStatus' --output text)
      if [[ "$status" != *"IN_PROGRESS"* ]]; then
        echo "Stack status: $status"
        break
      fi
      echo "Still in progress: $status"
    done
  fi
}

function discover_bucket_from_stack() {
  $AWS cloudformation describe-stack-resources --stack-name "$STACK_NAME" \
    --query "StackResources[?ResourceType=='AWS::S3::Bucket'].PhysicalResourceId" --output text 2>/dev/null || true
}

function empty_bucket_all_versions() {
  local bucket="$1"
  if [[ -z "$bucket" ]]; then
    echo "No bucket provided to empty."; return 0
  fi
  echo "Emptying bucket (all versions + delete markers): s3://$bucket"
  # Use pagination-safe deletion for versions
  while : ; do
    versions_json=$($AWS s3api list-object-versions --bucket "$bucket" --max-items 1000 || true)
    if [[ -z "$versions_json" || "$versions_json" == "null" ]]; then
      break
    fi
    version_ids=$(echo "$versions_json" | jq -r '.Versions[]? | [.Key, .VersionId] | @tsv')
    delete_markers=$(echo "$versions_json" | jq -r '.DeleteMarkers[]? | [.Key, .VersionId] | @tsv')

    to_delete=()
    while IFS=$'\t' read -r key vid; do
      [[ -z "$key" || -z "$vid" ]] && continue
      to_delete+=("{\"Key\":\"$key\",\"VersionId\":\"$vid\"}")
    done <<< "$version_ids"
    while IFS=$'\t' read -r key vid; do
      [[ -z "$key" || -z "$vid" ]] && continue
      to_delete+=("{\"Key\":\"$key\",\"VersionId\":\"$vid\"}")
    done <<< "$delete_markers"

    if [[ ${#to_delete[@]} -eq 0 ]]; then
      break
    fi

    # Batch delete up to 1000 at a time
    payload="{\"Objects\":[${to_delete[*]}],\"Quiet\":true}"
    echo "$payload" | $AWS s3api delete-objects --bucket "$bucket" --delete file:///dev/stdin >/dev/null || true

    # Continue until no more versions
    remaining=$($AWS s3api list-object-versions --bucket "$bucket" --query 'length(Versions) + length(DeleteMarkers)' --output text || echo 0)
    if [[ "$remaining" == "0" ]]; then
      break
    fi
  done

  # Also ensure any current objects are gone (in case versioning off)
  $AWS s3 rm "s3://$bucket" --recursive || true
}

function delete_stack_and_wait() {
  echo "Deleting stack $STACK_NAME"
  set +e
  $AWS cloudformation delete-stack --stack-name "$STACK_NAME"
  set -e
  echo "Waiting for stack deletion to complete..."
  set +e
  $AWS cloudformation wait stack-delete-complete --stack-name "$STACK_NAME"
  local rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    echo "Stack deletion did not complete successfully." >&2
    # Surface recent events for debugging
    $AWS cloudformation describe-stack-events --stack-name "$STACK_NAME" --max-items 25 || true
    exit $rc
  fi
}

function sam_redeploy() {
  echo "Redeploying with SAM..."
  pushd "$INFRA_DIR" >/dev/null
  sam build
  sam deploy
  popd >/dev/null
}

# Main flow
if stack_exists; then
  echo "Stack exists; preparing teardown..."
  maybe_disable_termination_protection || true
  maybe_cancel_update_in_progress || true

  # Determine bucket if not provided
  if [[ -z "$BUCKET_NAME" ]]; then
    BUCKET_NAME=$(discover_bucket_from_stack | head -n1 || true)
  fi
  if [[ -n "$BUCKET_NAME" ]]; then
    empty_bucket_all_versions "$BUCKET_NAME"
  else
    echo "Warning: Bucket name not found; skipping bucket empty step." >&2
  fi

  delete_stack_and_wait
else
  echo "Stack $STACK_NAME does not exist; skipping teardown."
fi

if [[ $REDEPLOY -eq 1 ]]; then
  sam_redeploy
  echo "Redeploy completed."
else
  echo "Skipping redeploy as requested."
fi

echo "Done."


#!/bin/bash
set -e

# --- IBM watsonx Credentials ---
export IBM_API_KEY="c5DelgicCyGihx2uhO_mMHbd947T8thCryH0gpmJPj7t"
export IBM_PROJECT_ID="6235eeea-a75e-4bf1-9b83-80acd61368ee"
export IBM_INSTANCE_ID="e98d7be2-9d7c-4f45-a167-0831c0fc1580"
export IBM_URL="https://us-south.ml.cloud.ibm.com"

STACK_NAME="sleeppeddlers-stack"
REGION="us-east-1"

sam_redeploy() {
  sam build
  sam deploy \
    --stack-name $STACK_NAME \
    --region $REGION \
    --resolve-s3 \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
      IBMApiKey=$IBM_API_KEY \
      IBMProjectId=$IBM_PROJECT_ID \
      IBMInstanceId=$IBM_INSTANCE_ID \
      IBMUrl=$IBM_URL
}
