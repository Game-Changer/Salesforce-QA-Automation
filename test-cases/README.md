# Test Cases

Manual test case documents produced by the **Test Case Writer** sub-agent (or humans) — one markdown file per user story.

## Rules

- **One file per story:** `<story-id>-<slug>.md` (e.g. `US-001-salesforce-login.md`), based on [TEMPLATE.md](TEMPLATE.md)
- **IDs:** `TC-<AREA>-NNN` (e.g. `TC-LOGIN-001`). Sequences continue across files in the same area — never reuse or renumber an existing ID
- **Coverage matrix is mandatory:** every acceptance criterion maps to at least one test case
- **Types:** every case is `Positive`, `Negative`, `Edge`, or `Permission`
- **Automation column:** every case is either `Candidate (@Tag)` — using the tag vocabulary from [../AgentInstructions.md](../AgentInstructions.md) — or `Manual-only (<reason>)`
- **Gherkin-friendly steps:** write actions so they translate directly to Given/When/Then — the QA Automation Writer (Phase 3) lifts Candidates into Cucumber scenarios
- **Local-first:** agents write these files locally only; a human reviews and pushes

## Lifecycle

```
User story (draft) → Test Case Writer → test-cases/<story>.md   (this folder)
                                              │ human review
                                              ▼
                     QA Automation Writer → features/<story>.feature   (Phase 3)
```

## Index

| Story | File | Area | Cases |
|---|---|---|---|
| US-001 — Salesforce login via custom domain | [US-001-salesforce-login.md](US-001-salesforce-login.md) | LOGIN | 6 |
