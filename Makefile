YEAR := $(shell date +%Y)

define COPYRIGHT
/*
 * Copyright (c) $(YEAR), lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */
endef
export COPYRIGHT

FILES := $(shell find . -type f \( -name "*.ts" -o -name "*.js" \) \
	! -path "./node_modules/*" \
	! -path "./dist/*" \
	! -path "./build/*")

.PHONY: all help check-copyright add-copyright lint lint-check

help:
	@echo "======================================================================"
	@echo "Available make targets:"
	@echo "======================================================================"
	@echo ""
	@echo "  make all              Run tests, lint verification, and copyright checks"
	@echo "  make help             Show this help message"
	@echo ""
	@echo "Linting:"
	@echo "  make lint             Fix linting issues in API code"
	@echo "  make lint-check       Check for linting issues without fixing"
	@echo ""
	@echo "Copyright Management:"
	@echo "  make check-copyright  Verify all source files have copyright headers"
	@echo "  make add-copyright    Add copyright headers to files missing them"
	@echo ""
	@echo "======================================================================"

all: test lint-check check-copyright
	@echo "✅ All checks passed!"

add-copyright:
	@echo "Adding copyright statements to files..."
	@find . -type f \( -name "*.ts" -o -name "*.js" \) \
		! -path "./node_modules/*" \
		! -path "./*/node_modules/*" \
		! -path "./dist/*" \
		! -path "./*/dist/*" \
		! -path "./build/*" \
		! -path "./*/build/*" \
		! -path "./coverage/*" \
		! -path "./.next/*" | while read file; do \
		if ! grep -q "Copyright (c)" "$$file"; then \
			echo "Updating $$file"; \
			{ \
				printf "%s\n\n" "$$COPYRIGHT"; \
				cat "$$file"; \
			} > "$$file.tmp" && mv "$$file.tmp" "$$file"; \
		fi; \
	done
	@echo "✅ Done adding copyright statements."

check-copyright:
	@bash ./check-license.sh

lint:
	@echo "Fixing linting issues..."
	@pnpm lint:fix
	@echo "✅ Linting complete!"

lint-check:
	@echo "Checking for linting issues..."
	@pnpm lint:check || (echo "❌ Linting issues found!"; exit 1)
