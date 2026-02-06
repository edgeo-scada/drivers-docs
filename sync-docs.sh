#!/usr/bin/env bash
#
# sync-docs.sh - Sync documentation from individual driver repositories
#                into the centralized Docusaurus docs site.
#
# Usage:
#   ./sync-docs.sh              # Sync all drivers
#   ./sync-docs.sh modbus-tcp   # Sync a single driver
#   ./sync-docs.sh --dry-run    # Preview what would be synced
#
# Driver repos are expected at: DRIVERS_ROOT/{driver}/
# Docs are synced into:         docs/docs/{docs_dir}/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRIVERS_ROOT="${DRIVERS_ROOT:-$(dirname "$SCRIPT_DIR")}"
DOCS_TARGET="$SCRIPT_DIR/docs"
DRY_RUN=false
SINGLE_DRIVER=""

# Driver mapping: repo_name:docs_dir:source_docs_subdir
# repo_name     = directory name under DRIVERS_ROOT
# docs_dir      = directory name under docs/docs/
# source_subdir = subdirectory in the driver repo containing .md docs (empty = repo root)
DRIVERS=(
    "bacnet:bacnet:docs"
    "modbus-tcp:modbus:docs"
    "mqtt:mqtt:docs"
    "opcua:opcua:docs"
    "s7:s7:docs"
    "snmp:snmp:docs"
)

usage() {
    echo "Usage: $0 [OPTIONS] [DRIVER]"
    echo ""
    echo "Sync driver documentation into the Docusaurus docs site."
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be synced without making changes"
    echo "  --help       Show this help message"
    echo ""
    echo "Arguments:"
    echo "  DRIVER       Sync only this driver (e.g. modbus-tcp, bacnet, mqtt)"
    echo ""
    echo "Environment:"
    echo "  DRIVERS_ROOT  Root directory containing driver repos (default: parent of docs/)"
    echo ""
    echo "Drivers: bacnet, modbus-tcp, mqtt, opcua, s7, snmp"
}

log_info() {
    echo "[INFO]  $*"
}

log_warn() {
    echo "[WARN]  $*" >&2
}

log_ok() {
    echo "[OK]    $*"
}

log_skip() {
    echo "[SKIP]  $*"
}

log_dry() {
    echo "[DRY]   $*"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        -*)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
        *)
            SINGLE_DRIVER="$1"
            shift
            ;;
    esac
done

sync_driver() {
    local repo_name="$1"
    local docs_dir="$2"
    local source_subdir="$3"

    local source_path="$DRIVERS_ROOT/$repo_name"
    local target_path="$DOCS_TARGET/$docs_dir"

    # Check if driver repo exists
    if [[ ! -d "$source_path" ]]; then
        log_warn "$repo_name: repo not found at $source_path"
        return 1
    fi

    # Determine source docs directory
    # Structure: {driver}/docs/{docs_dir}/ (e.g. bacnet/docs/bacnet/)
    local docs_source=""
    if [[ -n "$source_subdir" && -d "$source_path/$source_subdir/$docs_dir" ]]; then
        docs_source="$source_path/$source_subdir/$docs_dir"
    elif [[ -d "$source_path/docs/$docs_dir" ]]; then
        docs_source="$source_path/docs/$docs_dir"
    elif [[ -n "$source_subdir" && -d "$source_path/$source_subdir" ]]; then
        docs_source="$source_path/$source_subdir"
    fi

    # Ensure target exists
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$target_path"
    fi

    local synced=0

    # Sync docs subdirectory if it exists
    if [[ -n "$docs_source" ]]; then
        local md_files
        md_files=$(find "$docs_source" -name "*.md" -o -name "*.mdx" 2>/dev/null | sort)

        if [[ -n "$md_files" ]]; then
            while IFS= read -r src_file; do
                local rel_path="${src_file#"$docs_source"/}"
                local dest_file="$target_path/$rel_path"
                local dest_dir
                dest_dir=$(dirname "$dest_file")

                if [[ "$DRY_RUN" == true ]]; then
                    log_dry "$repo_name: $rel_path -> docs/$docs_dir/$rel_path"
                else
                    mkdir -p "$dest_dir"
                    cp "$src_file" "$dest_file"
                fi
                synced=$((synced + 1))
            done <<< "$md_files"
        fi
    fi

    if [[ $synced -eq 0 ]]; then
        log_skip "$repo_name: no docs found to sync"
    else
        log_ok "$repo_name: synced $synced file(s) -> docs/$docs_dir/"
    fi
}

# Header
echo "========================================="
echo " Edgeo Drivers - Documentation Sync"
echo "========================================="
echo ""
echo "Drivers root: $DRIVERS_ROOT"
echo "Docs target:  $DOCS_TARGET"
if [[ "$DRY_RUN" == true ]]; then
    echo "Mode:         DRY RUN"
fi
echo ""

total=0
errors=0

for entry in "${DRIVERS[@]}"; do
    IFS=':' read -r repo_name docs_dir source_subdir <<< "$entry"

    # If a single driver was specified, skip others
    if [[ -n "$SINGLE_DRIVER" && "$SINGLE_DRIVER" != "$repo_name" ]]; then
        continue
    fi

    if sync_driver "$repo_name" "$docs_dir" "$source_subdir"; then
        total=$((total + 1))
    else
        errors=$((errors + 1))
    fi
done

echo ""
echo "-----------------------------------------"
echo "Done: $total driver(s) synced, $errors error(s)"

if [[ $errors -gt 0 ]]; then
    exit 1
fi
