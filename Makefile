COURSES := pmath347 pmath352 pmath367 pmath450
PDFS := $(addprefix assets/,$(addsuffix .pdf,$(COURSES)))
DEPS := $(addprefix .deps/,$(addsuffix .mk,$(COURSES)))

pmath347_SOURCE := /Users/matthew4.tch/uw/fall-2025/pmath347/notes.typ
pmath352_SOURCE := /Users/matthew4.tch/uw/s26/pmath352/notes.typ
pmath367_SOURCE := /Users/matthew4.tch/uw/fall-2025/pmath367/notes.typ
pmath450_SOURCE := /Users/matthew4.tch/uw/s26/pmath450/notes.typ

.PHONY: notes notes-force publish-notes

notes: $(DEPS) $(PDFS)

define COURSE_RULE
assets/$(1).pdf: $$($(1)_SOURCE)
	@mkdir -p .deps
	typst compile $$< $$@ --deps .deps/$(1).mk --deps-format make

.deps/$(1).mk: $$($(1)_SOURCE)
	@mkdir -p .deps
	typst compile $$< assets/$(1).pdf --deps $$@ --deps-format make
endef

$(foreach course,$(COURSES),$(eval $(call COURSE_RULE,$(course))))

notes-force:
	@$(MAKE) --always-make notes

publish-notes: notes
	@./scripts/publish-notes.sh $(PDFS)

-include $(DEPS)
