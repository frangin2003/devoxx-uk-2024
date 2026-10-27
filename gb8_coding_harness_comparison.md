---
title: "gb8: Coding Harness Feature Atlas and Implementation Roadmap"
document_id: gb8-harness-atlas
document_version: 1.0.0
schema_version: 1
created: 2026-10-26
last_researched: 2026-10-26
timezone: Europe/London
language: en-GB
owner: Charles-Philippe Bernard
products: [claude-code, codex, opencode, amp, github-copilot, antigravity]
gb8_audit_status: not_audited
research_method: official_documentation_and_release_notes
hands_on_benchmark: not_performed
update_policy: update_this_document_preserve_feature_ids
---

# gb8: Coding Harness Feature Atlas and Implementation Roadmap

**Research snapshot: 26 October 2026.** This is a product and engineering reference for extending gb8, and a content specification for a future comparison website. It compares **128 capabilities across 16 categories** for Claude Code, Codex, OpenCode, Amp, GitHub Copilot and Google Antigravity.

The document separates **documented support**, **conditional availability**, **unknown evidence**, **editorial judgments** and **proposed gb8 work**. No hands-on reliability, coding-quality, latency or cost benchmark was run for this document. A native feature can be badly implemented; an extension can be excellent. Presence alone is not a quality ranking.

## 1. Decisions at a glance

**Overall editorial winner: Claude Code**, for a balanced, highly configurable coding workflow: instruction handling, worker profiles, skills, hooks, context management and runtime observability. The scoring rubric later in this document makes that preference explicit. It does **not** establish that Claude Code solves more tasks than every competitor.

**Best architectural reference for a provider-neutral gb8: OpenCode.** Study its provider model, session service, embedded host, extension system and API boundaries. Its breadth makes it valuable engineering material even where other products have a stronger end-user workflow. [^OC08] [^OC12] [^OC15]

**Best reference for embedding and execution control: Codex.** Study App Server, typed lifecycle events, explicit execution profiles, worker controls and worktree handoff. Do not confuse the open CLI/runtime with its proprietary cloud and IDE components. [^CX02] [^CX03] [^CX09] [^CX13]

**Best reference for persistent agent operations and human collaboration: Amp.** Threads, orbs, schedules, routing and multiplayer form a coherent work system. Task workers and independent orb agents have different communication and isolation semantics. [^AM02] [^AM05] [^AM06] [^AM07]

**Best reference for GitHub-native delivery and editor distribution: GitHub Copilot.** Treat CLI, app, IDE agents, cloud agent and code review as distinct surfaces. Fleet, customizations, browser tools and memory have advanced beyond the old autocomplete-only view. [^GH00] [^GH04] [^GH06] [^GH07] [^GH12]

**Best reference for visual verification and reviewable artifacts: Antigravity.** Its current App/CLI/SDK generation includes subagents, hooks, schedules and remote control as well as the browser/artifact experience. Some advanced orchestration and approval features remain preview or plan-specific. [^AG00] [^AG01] [^AG04] [^AG05]

**gb8 strategy:** combine these references around a small reliable engine. Prioritize correct tool execution, evidence, cancellation, costs, context continuity and bounded delegation before reproducing every visible product feature. Do not build six separate architectures to imitate six brands.

## 2. Scope, versions and evidence rules

### 2.1 Product baselines

| Product | Release/documentation baseline inspected | Included surfaces | Important qualification |
|---|---|---|---|
| Claude Code | v2.1.311 surfaced as latest during research | CLI, supported IDE integrations, desktop, remote and cloud where specified | Rolling features and account/provider gating can differ; an installed stable channel may lag. [^CCREL] |
| Codex | CLI 0.164.0, released 23 October 2026; current official Codex docs | CLI, SDK/App Server, IDE, desktop and Codex Cloud where specified | Shared ChatGPT documentation also covers Work and other products; those are not automatically attributed to Codex CLI. [^CXREL] [^CX13] |
| OpenCode | v2.1.4, released 23 October 2026; **v2** documentation | TUI/minimal CLI, desktop/web, shared service, API and embedded SDK | Do not copy v1 configuration names into v2. Background compaction and some transports/APIs are experimental. [^OCREL] |
| Amp | Current hosted documentation and current CLI documentation | Local CLI, runners, orbs, web, native clients and plugins | A single current public CLI build number was not independently pinned. Hosted feature availability is the baseline; this is a version-verification gap. [^AM00] [^AM10] |
| GitHub Copilot | CLI 1.0.103, released 22 October 2026; rolling docs | CLI, Copilot app, IDE agent experiences, GitHub/cloud agent and review | The CLI version does not version the cloud product or every IDE. Native VS Code tools are identified as IDE-specific. [^GHREL] |
| Antigravity | App v2.26.0, released 22 October 2026; current App/CLI/SDK docs | App, CLI, standalone IDE, editor extensions, SDK and Remote Control | App, CLI, SDK and IDE have separate release tracks. Do not present v2.26.0 as the version of all components. Rollout can take days. [^AGREL] |

“Latest” here means the most recent release/documentation surfaced and checked in this research snapshot, not a guarantee about the user’s installation or every account’s rollout. Individual features are evaluated against the current docs, not audited against pinned source code or installed binaries. Release notes identify the baseline; they do not prove every feature in the rolling documentation is in every binary.

### 2.2 Status legend

| Symbol | Meaning | How to interpret it |
|---|---|---|
| **Y** | Yes | Documented first-party support on the stated surface; it may need setup or credentials. Does not mean enabled everywhere by default. |
| **N** | No within the defined scope | A documented incompatibility, removal or architecture excludes this exact capability. It is not a claim that nobody could build a wrapper. |
| **D** | It depends | Support needs a particular client, model, plan, preview, integration, deployment or custom implementation. Read the condition. |
| **U** | Unverified | The inspected sources do not establish support or absence. This is deliberately separate from N and from confirmed conditional support. |
| **?** | gb8 not audited | Current implementation has not been inspected. Never infer missing functionality from this marker. |

The requested Y/N/“it depends” comparison is retained, with U added to avoid inventing negative claims. In a three-state-only website, render U as **“It depends — not verified”**, retain its unknown evidence state internally, and never count it as a supported feature or an absent one.

### 2.3 Winner rules

Each feature identifies the **best documented implementation reference for gb8**, with a reason. This is an editorial choice about discoverability, control, integration and usefulness, not a statistically measured winner. Ties are allowed. **No verified winner** is the honest result where no product has enough evidence. Do not force a unique winner by guessing.

Select winners using these questions:

1. Is the mechanism explicitly supported and inspectable?
2. Is it first-party or does the user need to assemble it?
3. Are permissions, lifecycle, errors and limitations documented?
4. Does the workflow solve a concrete gb8 problem?
5. Is availability stable enough to use as a reference, or does a preview qualifier materially weaken the choice?

Unknowns lower confidence; they are **not zero scores**. More documentation can make a feature easier to assess without proving a better implementation. Security and governance winners are not certifications.

### 2.4 Boundaries that must not be collapsed

- **Harness vs model:** provider support and orchestration belong here; the model’s reasoning strength is a separate evaluation.
- **Local executor vs local inference:** reading local files does not mean prompts never leave the machine.
- **Background process vs durable job:** a daemon surviving UI disconnection does not establish crash recovery.
- **Resume vs replay:** restoring a transcript does not safely repeat an external write.
- **Subagent vs independent agent:** context, messaging, permissions and working-copy isolation can differ.
- **Permission rule vs sandbox:** application checks and OS restrictions protect different execution paths.
- **MCP client vs MCP server:** connecting tools does not mean the full coding agent is available as an MCP server.
- **Runtime hooks vs prose:** instructions may influence behavior; a policy hook can enforce a decision only within its actual scope and failure semantics.
- **Hosted execution vs remote control:** a phone can control a local machine without the job being hosted or able to survive laptop sleep.
- **Product-family support vs client parity:** Y in one IDE does not make the same feature Y in the CLI.

### 2.5 gb8 baseline

No current gb8 repository, release manifest or authoritative feature inventory was supplied or located for this task. Every gb8 implementation status is therefore **not audited**. Earlier conversation descriptions are useful design context, not proof of current code. The roadmap is a set of candidates to validate, not an assertion that gb8 lacks all these capabilities.

When a gb8 audit is available, record its repository, commit, branch, build, platform, provider configuration and enabled flags. Map each feature to code, tests and a reproducible demo before changing its status to implemented. Do not merge g3po UI capabilities and gb8 engine capabilities unless their integration is verified.

## 3. Overall ranking and the rubric

These are **subjective documentation-based fit ratings**, not benchmark percentages. Each category receives 1–5 points for breadth, first-party integration, inspectability and usefulness in the defined coding workflow. Conditional/preview support and uncertainty are considered qualitatively; the ratings are not a sum of binary Y cells.

| Rating | Interpretation |
|---|---|
| 1 | Very limited documented fit |
| 2 | Basic or largely external implementation |
| 3 | Credible but material limitations or evidence gaps |
| 4 | Strong documented workflow with meaningful conditions |
| 5 | Especially strong reference in this category |

Weights reflect a **serious coding agent used to build and evolve gb8**, with context, tools, orchestration and cost control valued more than voice/video or branding. The rating matrix is deliberately published so future reviewers can disagree or change the weights.

| Category | Weight | Claude Code | Codex | OpenCode | Amp | Copilot | Antigravity |
|---|---:|---:|---:|---:|---:|---:|---:|
| Surfaces and deployment | 4 | 4 | 4 | 4 | 4 | 5 | 5 |
| Models, providers and routing | 8 | 3 | 4 | 5 | 5 | 4 | 4 |
| Instructions, memory and context | 10 | 5 | 4 | 4 | 4 | 4 | 4 |
| Tools and execution | 10 | 5 | 5 | 4 | 4 | 4 | 4 |
| Planning and task control | 6 | 5 | 4 | 4 | 4 | 4 | 5 |
| Multi-agent orchestration | 10 | 5 | 4 | 3 | 4 | 4 | 5 |
| Durability, schedules and events | 8 | 4 | 4 | 3 | 5 | 4 | 4 |
| Skills, plugins, MCP and hooks | 8 | 5 | 4 | 5 | 5 | 4 | 4 |
| Browser, visual work and artifacts | 5 | 4 | 4 | 3 | 4 | 4 | 5 |
| Permissions, sandboxing and trust | 8 | 4 | 5 | 3 | 3 | 4 | 4 |
| Git, review and delivery | 6 | 4 | 5 | 4 | 5 | 5 | 4 |
| Enterprise and governance | 3 | 4 | 4 | 3 | 4 | 5 | 4 |
| Observability, budgets and efficiency | 5 | 5 | 4 | 3 | 5 | 4 | 4 |
| SDKs, protocols and embedding | 5 | 4 | 5 | 5 | 4 | 5 | 4 |
| Interaction, collaboration and supervision | 2 | 4 | 4 | 4 | 5 | 4 | 5 |
| Verification, recovery and evaluation | 2 | 4 | 4 | 3 | 3 | 4 | 3 |

**Formula:** editorial fit points = sum(category weight × category rating / 5). Weights total 100. These numbers express the stated preference model; they are not measured accuracy, quality or security scores.

| Editorial rank | Harness | Fit points / 100 |
|---|---|---:|
| 1 | Claude Code | 88.2 |
| 2 | Codex | 85.8 |
| 3 | Amp | 85.4 |
| 4 | Antigravity | 85.0 |
| 5 | GitHub Copilot | 83.6 |
| 6 | OpenCode | 76.0 |

**Interpretation:** Claude Code wins this particular rubric. Codex, Amp and Antigravity are close enough that a different set of priorities can change the decision. The decimal places come from weighted arithmetic, not evaluation precision. OpenCode’s lower balanced-product rating does not establish weaker coding ability; it remains the preferred provider-neutral architecture reference. There is no empirical universal winner in this document.

### 3.1 Category reasoning

- **Surfaces and deployment: GitHub Copilot, Antigravity.** Copilot and Antigravity offer broad editor coverage; OpenCode and Codex expose reusable open runtime components.
- **Models, providers and routing: OpenCode, Amp.** OpenCode leads provider-neutral configuration; Amp leads opinionated routing across model roles and funding sources.
- **Instructions, memory and context: Claude Code.** Claude Code is a strong instruction/memory reference; OpenCode offers unusually explicit compaction controls; Copilot validates repository memories.
- **Tools and execution: Claude Code, Codex.** Basic execution is widely shared. The real differentiators are bounded output, reliable background work and enforceable tool contracts.
- **Planning and task control: Claude Code, Antigravity.** Plan support is common; executable scope controls and reviewable artifacts matter more than the label.
- **Multi-agent orchestration: Claude Code, Antigravity.** Claude Code and Antigravity document rich agent controls. Amp separates lightweight Task workers from independent communicating threads.
- **Durability, schedules and events: Amp.** Amp is the clearest reference for persistent thread scheduling. Session timers, process persistence and durable jobs must remain separate concepts.
- **Skills, plugins, MCP and hooks: Claude Code, OpenCode, Amp.** All six extend beyond prompting. Claude Code has a broad packaged workflow system; OpenCode and Amp are strong code-extension references.
- **Browser, visual work and artifacts: Antigravity.** Antigravity is the most distinctive visual-verification reference. Copilot has current built-in VS Code browser tools, not only Playwright MCP.
- **Permissions, sandboxing and trust: Codex.** Codex is the strongest default reference for explicit execution boundaries; compare shell, file, MCP and hook coverage separately.
- **Git, review and delivery: Codex, Amp, GitHub Copilot.** Copilot is strongest for native GitHub delivery; Codex for worktree handoff and review; Amp for a persistent thread-to-ship workflow.
- **Enterprise and governance: GitHub Copilot.** Governance scores are documentation-based, not security certification. Plan, region, deployment and contract can change every result here.
- **Observability, budgets and efficiency: Claude Code, Amp.** Claude Code leads detailed local cost/cache telemetry; Amp connects cost to threads and infrastructure. Real efficiency requires same-task measurements.
- **SDKs, protocols and embedding: Codex, OpenCode, GitHub Copilot.** Codex has a rich client protocol; OpenCode supports direct in-process hosting; Copilot offers a broad SDK language surface.
- **Interaction, collaboration and supervision: Amp, Antigravity.** Amp leads shared human work inside an agent thread; Antigravity leads visual artifact supervision. These are different from parallel agents.
- **Verification, recovery and evaluation: Claude Code, Codex, GitHub Copilot.** No documentation-based feature matrix proves coding quality. Build a separate evaluation layer and verify recovery semantics on gb8 workloads.

## 4. Mega comparison matrix

CC = Claude Code; CX = Codex; OC = OpenCode; AM = Amp; GH = GitHub Copilot; AG = Antigravity. Every ID links to its detailed record. **All six?** is Yes only where all six are documented Y in this definition. “Not established” can mean conditional or unknown support; it does not mean six products were tested and one failed. All gb8 states are **? / not audited**.

| ID / Feature | CC | CX | OC | AM | GH | AG | All six? | Reference winner | gb8 priority |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|---|---|
| [F001 — Interactive terminal agent](#f001) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F002 — IDE integration](#f002) | Y | Y | D | D | Y | Y | Not established | GitHub Copilot | ? · P2 |
| [F003 — Desktop workspace](#f003) | Y | Y | Y | Y | Y | Y | Yes | Antigravity | ? · P2 |
| [F004 — Web access to running work](#f004) | D | D | D | Y | D | D | Not established | Amp | ? · P2 |
| [F005 — Phone and tablet supervision](#f005) | D | D | D | Y | D | D | Not established | Amp | ? · P3 |
| [F006 — Native Windows terminal operation](#f006) | Y | Y | Y | D | Y | Y | Not established | Tie — Codex / Copilot / Antigravity | ? · P1 |
| [F007 — Vendor-hosted execution](#f007) | D | Y | U | Y | D | U | Not established | Amp | ? · P2 |
| [F008 — Open runtime source](#f008) | N | Y | Y | N | N | U | No in this scope | OpenCode | ? · P1 |
| [F009 — Multiple model families](#f009) | N | D | Y | Y | Y | Y | No in this scope | OpenCode | ? · P0 |
| [F010 — Custom enterprise gateway](#f010) | D | D | Y | Y | D | D | Not established | OpenCode | ? · P0 |
| [F011 — Local or offline model inference](#f011) | N | D | D | D | D | D | No in this scope | OpenCode | ? · P2 |
| [F012 — Model and effort selection](#f012) | Y | Y | Y | Y | D | D | Not established | Tie — Claude Code / Codex / OpenCode | ? · P0 |
| [F013 — Independent worker model selection](#f013) | Y | Y | Y | D | D | D | Not established | Claude Code | ? · P0 |
| [F014 — Automatic role-based routing](#f014) | D | U | D | Y | D | D | Not established | Amp | ? · P1 |
| [F015 — Reuse existing model subscriptions](#f015) | D | D | D | D | D | D | Not established | Amp | ? · P2 |
| [F016 — Provider diagnostics and capability discovery](#f016) | D | D | Y | Y | D | D | Not established | Amp | ? · P0 |
| [F017 — Repository instructions](#f017) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F018 — Directory-scoped instructions](#f018) | Y | Y | Y | D | D | Y | Not established | Claude Code | ? · P0 |
| [F019 — Automatic durable memory](#f019) | Y | D | U | D | D | D | Not established | Claude Code | ? · P1 |
| [F020 — Memory validation against current code](#f020) | U | U | U | U | Y | U | Not established | GitHub Copilot | ? · P1 |
| [F021 — Automatic context compaction](#f021) | Y | Y | Y | Y | Y | Y | Yes | OpenCode | ? · P0 |
| [F022 — Context retention tuning](#f022) | D | Y | Y | U | U | U | Not established | OpenCode | ? · P1 |
| [F023 — Fork conversation without overwriting it](#f023) | Y | D | Y | D | U | U | Not established | Claude Code | ? · P1 |
| [F024 — Cross-session retrieval](#f024) | D | D | D | Y | D | D | Not established | Amp | ? · P1 |
| [F025 — Read, search and edit repository files](#f025) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F026 — Shell and project test execution](#f026) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F027 — Persistent interactive terminal](#f027) | D | Y | Y | D | D | D | Not established | OpenCode | ? · P1 |
| [F028 — Background process tracking](#f028) | Y | Y | Y | Y | D | Y | Not established | Claude Code | ? · P0 |
| [F029 — Bounded tool output](#f029) | Y | D | Y | D | D | D | Not established | OpenCode | ? · P0 |
| [F030 — Programmatic tool composition](#f030) | D | D | D | Y | D | D | Not established | OpenCode / Amp | ? · P1 |
| [F031 — Web search and document fetch](#f031) | Y | D | D | Y | D | D | Not established | Claude Code | ? · P1 |
| [F032 — Custom tool registration](#f032) | D | D | Y | Y | Y | Y | Not established | OpenCode / Amp | ? · P0 |
| [F033 — Dedicated planning workflow](#f033) | Y | Y | Y | D | Y | Y | Not established | Claude Code / Antigravity | ? · P0 |
| [F034 — Enforced read-only planning](#f034) | D | D | D | D | D | D | Not established | Codex | ? · P0 |
| [F035 — Clarifying questions before implementation](#f035) | Y | Y | Y | Y | Y | Y | Yes | Antigravity | ? · P1 |
| [F036 — Visible task decomposition](#f036) | Y | Y | D | Y | Y | Y | Not established | Antigravity | ? · P1 |
| [F037 — Dependency-aware delegation](#f037) | D | D | D | D | Y | D | Not established | GitHub Copilot | ? · P1 |
| [F038 — Steering during execution](#f038) | Y | Y | Y | Y | Y | Y | Yes | Amp | ? · P0 |
| [F039 — Queue follow-up work](#f039) | D | D | Y | Y | D | D | Not established | Amp | ? · P1 |
| [F040 — Autonomous goal continuation](#f040) | D | D | D | D | D | D | Not established | Claude Code / Antigravity | ? · P1 |
| [F041 — Parallel isolated-context workers](#f041) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F042 — Reusable worker personas](#f042) | Y | Y | Y | D | Y | Y | Not established | Claude Code | ? · P0 |
| [F043 — Per-worker tool restrictions](#f043) | Y | D | Y | D | Y | Y | Not established | Claude Code | ? · P0 |
| [F044 — Peer-to-peer agent messaging](#f044) | D | D | U | D | U | Y | Not established | Antigravity | ? · P1 |
| [F045 — Nested delegation](#f045) | D | D | N | D | U | Y | No in this scope | Antigravity | ? · P1 |
| [F046 — Inspect and steer an individual worker](#f046) | D | D | D | D | D | Y | Not established | Antigravity | ? · P1 |
| [F047 — Worker workspace isolation](#f047) | D | D | D | D | D | Y | Not established | Antigravity | ? · P0 |
| [F048 — Coordinated agent teams](#f048) | D | D | D | D | Y | D | Not established | Claude Code / Antigravity | ? · P2 |
| [F049 — Resume saved conversation](#f049) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F050 — Background execution after UI closes](#f050) | D | D | D | Y | D | D | Not established | Amp | ? · P1 |
| [F051 — Execution while laptop sleeps](#f051) | D | Y | D | Y | D | D | Not established | Amp / Codex | ? · P2 |
| [F052 — Conversation-scoped timer](#f052) | Y | D | D | Y | D | D | Not established | Antigravity | ? · P1 |
| [F053 — Recurring scheduled task](#f053) | D | D | D | Y | Y | D | Not established | Amp | ? · P1 |
| [F054 — Webhook-triggered work](#f054) | D | D | D | Y | Y | D | Not established | Amp / GitHub Copilot | ? · P1 |
| [F055 — Event-driven process monitoring](#f055) | Y | D | D | D | D | D | Not established | Claude Code | ? · P1 |
| [F056 — Durable retry and duplicate-action protection](#f056) | D | U | D | D | U | U | Not established | No proven overall winner | ? · P0 |
| [F057 — SKILL.md procedures](#f057) | Y | Y | Y | Y | Y | Y | Yes | Claude Code | ? · P0 |
| [F058 — Reusable commands and prompt presets](#f058) | Y | Y | Y | Y | D | Y | Not established | Claude Code | ? · P1 |
| [F059 — MCP tool connectivity](#f059) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F060 — MCP authentication and interactive forms](#f060) | D | D | D | D | D | D | Not established | OpenCode | ? · P1 |
| [F061 — Pre-tool policy hooks](#f061) | Y | Y | D | Y | Y | Y | Not established | Claude Code / Amp | ? · P0 |
| [F062 — Post-tool and stop hooks](#f062) | Y | Y | D | Y | Y | Y | Not established | Claude Code | ? · P1 |
| [F063 — Code-based runtime plugins](#f063) | Y | D | Y | Y | D | D | Not established | OpenCode / Amp | ? · P1 |
| [F064 — Central distribution of customizations](#f064) | Y | D | D | Y | Y | D | Not established | Claude Code / GitHub Copilot | ? · P2 |
| [F065 — Interactive browser automation](#f065) | D | D | D | D | D | D | Not established | Antigravity | ? · P1 |
| [F066 — Reuse a signed-in browser session](#f066) | Y | D | D | D | D | D | Not established | Claude Code / GitHub Copilot | ? · P2 |
| [F067 — Isolated browser profile](#f067) | D | D | D | D | Y | Y | Not established | Antigravity / GitHub Copilot | ? · P1 |
| [F068 — Visual screenshots in verification](#f068) | Y | D | D | D | Y | Y | Not established | Antigravity | ? · P1 |
| [F069 — Browser action recordings](#f069) | D | U | D | U | U | Y | Not established | Antigravity | ? · P2 |
| [F070 — Interactive plan and walkthrough artifacts](#f070) | D | D | D | D | D | Y | Not established | Antigravity | ? · P1 |
| [F071 — Generate or edit visual assets](#f071) | D | D | D | Y | D | Y | Not established | Amp / Antigravity | ? · P3 |
| [F072 — Element-level visual feedback](#f072) | D | U | D | D | Y | D | Not established | GitHub Copilot | ? · P2 |
| [F073 — Tool-level allow, ask and deny](#f073) | Y | Y | Y | D | Y | Y | Not established | Codex / Antigravity | ? · P0 |
| [F074 — OS-enforced local shell sandbox](#f074) | D | Y | U | D | D | D | Not established | Codex | ? · P0 |
| [F075 — Filesystem scope controls](#f075) | D | Y | Y | D | Y | Y | Not established | Codex | ? · P0 |
| [F076 — Network domain restrictions](#f076) | D | Y | D | D | D | D | Not established | Codex | ? · P0 |
| [F077 — Automatic review of approvals](#f077) | D | Y | D | D | D | D | Not established | Codex | ? · P1 |
| [F078 — Untrusted project admission](#f078) | Y | D | D | D | D | D | Not established | Claude Code | ? · P0 |
| [F079 — Sandbox coverage beyond shell](#f079) | D | D | D | D | D | D | Not established | No universal winner | ? · P0 |
| [F080 — No human prompts during configured unattended run](#f080) | D | Y | D | D | D | D | Not established | Codex | ? · P0 |
| [F081 — Inspect diffs and local changes](#f081) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F082 — Create commits and pull requests](#f082) | D | D | D | Y | Y | D | Not established | GitHub Copilot | ? · P1 |
| [F083 — Automatic pull-request review](#f083) | D | Y | D | D | Y | D | Not established | GitHub Copilot / Codex | ? · P2 |
| [F084 — Git worktree lifecycle](#f084) | D | Y | Y | D | D | Y | Not established | Codex | ? · P0 |
| [F085 — Move work between foreground and background checkout](#f085) | D | Y | D | Y | D | D | Not established | Codex | ? · P1 |
| [F086 — Undo conversation and code together](#f086) | D | D | Y | U | U | D | Not established | OpenCode | ? · P1 |
| [F087 — Multi-repository task context](#f087) | D | D | D | Y | D | Y | Not established | Amp | ? · P2 |
| [F088 — Shipping review with human approval](#f088) | D | D | D | Y | Y | D | Not established | Amp | ? · P1 |
| [F089 — Centrally managed configuration](#f089) | Y | Y | D | Y | Y | D | Not established | GitHub Copilot / Codex | ? · P1 |
| [F090 — Organization model restrictions](#f090) | D | D | D | Y | Y | D | Not established | Amp / GitHub Copilot | ? · P1 |
| [F091 — Enterprise SSO and identity federation](#f091) | D | D | D | D | D | Y | Not established | Antigravity | ? · P2 |
| [F092 — Enterprise audit and activity visibility](#f092) | D | D | U | D | D | D | Not established | Claude Code / GitHub Copilot | ? · P1 |
| [F093 — Data residency and regional routing](#f093) | D | D | D | D | D | D | Not established | No universal winner | ? · P1 |
| [F094 — Governed extension distribution](#f094) | D | Y | D | Y | Y | D | Not established | Codex / GitHub Copilot | ? · P1 |
| [F095 — Team cost attribution](#f095) | D | D | D | Y | D | D | Not established | Amp | ? · P1 |
| [F096 — Self-hosting the complete control plane](#f096) | D | D | Y | D | N | D | No in this scope | OpenCode | ? · P2 |
| [F097 — Per-session usage display](#f097) | Y | Y | Y | Y | Y | Y | Yes | Claude Code / Amp | ? · P0 |
| [F098 — Cache hit and miss visibility](#f098) | Y | D | U | D | D | U | Not established | Claude Code | ? · P0 |
| [F099 — Hard per-run spending ceiling](#f099) | D | U | U | D | D | D | Not established | Claude Code | ? · P0 |
| [F100 — Token and step budgets](#f100) | D | D | D | D | D | D | Not established | Claude Code | ? · P0 |
| [F101 — Structured execution event stream](#f101) | D | Y | Y | D | D | D | Not established | Codex | ? · P0 |
| [F102 — OpenTelemetry export](#f102) | Y | D | U | D | D | D | Not established | Claude Code | ? · P1 |
| [F103 — Infrastructure cost visibility](#f103) | D | D | D | Y | D | D | Not established | Amp | ? · P1 |
| [F104 — Quality-adjusted cost comparison](#f104) | D | D | D | D | D | D | Not established | No vendor winner established | ? · P0 |
| [F105 — Official programmable agent SDK](#f105) | Y | Y | Y | D | Y | Y | Not established | Codex / OpenCode | ? · P1 |
| [F106 — Multiple SDK languages](#f106) | Y | Y | D | D | Y | D | Not established | GitHub Copilot | ? · P2 |
| [F107 — Bidirectional custom-client protocol](#f107) | D | Y | D | D | Y | D | Not established | Codex | ? · P0 |
| [F108 — Headless command for CI](#f108) | Y | Y | Y | Y | Y | Y | Yes | Codex | ? · P0 |
| [F109 — Typed event and result schemas](#f109) | D | Y | Y | D | Y | D | Not established | Codex | ? · P0 |
| [F110 — ACP editor protocol](#f110) | U | U | Y | U | Y | U | Not established | OpenCode / GitHub Copilot | ? · P2 |
| [F111 — Direct in-process runtime embedding](#f111) | D | N | Y | N | N | D | No in this scope | OpenCode | ? · P2 |
| [F112 — Expose the agent as an MCP server](#f112) | U | N | D | D | D | D | No in this scope | No verified native winner | ? · P3 |
| [F113 — Concurrent human collaboration in one agent thread](#f113) | U | U | U | Y | D | U | Not established | Amp | ? · P3 |
| [F114 — Shareable session evidence](#f114) | D | D | D | Y | Y | D | Not established | Amp | ? · P1 |
| [F115 — Global activity dashboard](#f115) | Y | Y | D | Y | Y | Y | Not established | Amp | ? · P1 |
| [F116 — Human questions without blocking text composition](#f116) | D | D | D | D | D | Y | Not established | Antigravity | ? · P2 |
| [F117 — Notifications when work needs attention](#f117) | D | D | D | Y | D | Y | Not established | Amp / Antigravity | ? · P1 |
| [F118 — Search, label and organize previous work](#f118) | D | D | D | Y | D | Y | Not established | Amp | ? · P2 |
| [F119 — Artifact comments steer implementation](#f119) | D | D | D | D | D | Y | Not established | Antigravity | ? · P1 |
| [F120 — Voice or video collaboration around agent work](#f120) | D | D | D | Y | U | D | Not established | Amp | ? · P3 |
| [F121 — Run existing tests after edits](#f121) | Y | Y | Y | Y | Y | Y | Yes | Tie — all six | ? · P0 |
| [F122 — Independent review worker](#f122) | Y | D | Y | Y | Y | Y | Not established | Claude Code / GitHub Copilot | ? · P1 |
| [F123 — Tie evidence to the final revision](#f123) | D | D | D | D | D | D | Not established | GitHub Copilot | ? · P0 |
| [F124 — Useful partial result on interruption](#f124) | D | D | D | D | D | D | Not established | Claude Code / Codex | ? · P0 |
| [F125 — Recover from context overflow](#f125) | D | D | Y | D | D | D | Not established | OpenCode | ? · P0 |
| [F126 — Recover from network interruption](#f126) | D | D | D | D | D | D | Not established | No tested reliability winner | ? · P0 |
| [F127 — Deterministic replay of an entire agent run](#f127) | U | U | U | U | U | U | Not established | No verified winner | ? · P2 |
| [F128 — Comparable harness benchmark with current flagship models](#f128) | U | U | U | U | U | U | Not established | No verified winner | ? · P0 |

## 5. Detailed feature records

Each record supplies the feature definition, qualified support for all six products, a reference winner and a concrete gb8 target. Targets are proposed acceptance requirements, not competitor claims or verified gb8 gaps. Citation identifiers resolve in the source registry.

## 5.1. Surfaces and deployment

Copilot and Antigravity offer broad editor coverage; OpenCode and Codex expose reusable open runtime components.

<a id="f001"></a>

### F001 — Interactive terminal agent

**Definition:** A first-party conversational terminal interface that reads, edits and executes within a project.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Terminal CLI | [^CC00] |
| Codex | **Y** | Terminal CLI | [^CX00] |
| OpenCode | **Y** | Full and minimal TUI | [^OC12] |
| Amp | **Y** | Local, orb or runner CLI | [^AM10] |
| GitHub Copilot | **Y** | Terminal CLI | [^GH00] |
| Antigravity | **Y** | Antigravity CLI | [^AG00] |

**Reference winner:** Tie — all six. Terminal access is baseline capability; no measured interaction-speed winner is established.

**gb8:** not audited · **P0** candidate. **Acceptance target:** One command opens a repository session; Ctrl-C cancels work without discarding the transcript.

<a id="f002"></a>

### F002 — IDE integration

**Definition:** A supported editor experience with project context, changes and agent interaction.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | VS Code and JetBrains | [^CC00] |
| Codex | **Y** | IDE extension | [^CX00] |
| OpenCode | **D** | ACP or editor integration | [^OC16] |
| Amp | **D** | Terminal embedding; dedicated current extension unverified | [^AM10] |
| GitHub Copilot | **Y** | Broad IDE integrations | [^GH10] |
| Antigravity | **Y** | IDE and multiple extensions | [^AG00] |

**Reference winner:** GitHub Copilot. Best reference for broad editor distribution; parity of individual agent features still varies by editor.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Expose an editor adapter that supplies selection, diagnostics and active files; preserve one underlying session model.

<a id="f003"></a>

### F003 — Desktop workspace

**Definition:** A first-party desktop surface for supervising coding sessions beyond a terminal.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Desktop surface | [^CC00] |
| Codex | **Y** | Desktop surface | [^CX09] |
| OpenCode | **Y** | Desktop application | [^OC00] |
| Amp | **Y** | macOS application | [^AM00] |
| GitHub Copilot | **Y** | Copilot app | [^GH04] |
| Antigravity | **Y** | Antigravity App | [^AG00] |

**Reference winner:** Antigravity. Strong reference for integrated agent supervision and artifact review; this is a UX judgment, not an adoption claim.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Keep projects, agent activity, evidence and diffs visible together; support multiple sessions without duplicating execution state.

<a id="f004"></a>

### F004 — Web access to running work

**Definition:** Browser-based inspection and interaction with an agent session.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Remote Control or cloud | [^CC14] |
| Codex | **D** | Cloud or connected host | [^CX10] |
| OpenCode | **D** | Self-hosted web and pairing | [^OC12] |
| Amp | **Y** | Thread URLs across clients | [^AM08] |
| GitHub Copilot | **D** | GitHub or remote CLI | [^GH04] |
| Antigravity | **D** | Remote Control dashboard | [^AG08] |

**Reference winner:** Amp. Threads are designed as cross-client work objects with a consistent URL and explicit execution location.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Give sessions stable URLs; reconnect from a browser and show whether execution is local, remote or hosted.

<a id="f005"></a>

### F005 — Phone and tablet supervision

**Definition:** Starting, steering or reviewing coding work from a mobile device.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Mobile Remote Control | [^CC14] |
| Codex | **D** | Mobile connected-host or cloud | [^CX09] |
| OpenCode | **D** | Browser access; native mobile unverified | [^OC12] |
| Amp | **Y** | iOS and Android clients | [^AM00] |
| GitHub Copilot | **D** | GitHub/remote surfaces; exact mobile coverage varies | [^GH04] |
| Antigravity | **D** | Mobile browser/PWA Remote Control | [^AG08] |

**Reference winner:** Amp. Documented mobile clients and shared threads provide the clearest mobile-to-agent continuity.

**gb8:** not audited · **P3** candidate. **Acceptance target:** Support responsive read, steer, approval and stop actions; never imply the repository is running on the phone.

<a id="f006"></a>

### F006 — Native Windows terminal operation

**Definition:** Running the agent locally on Windows without making WSL mandatory.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Native Windows; sandbox differs | [^CC06] |
| Codex | **Y** | Windows client | [^CX00] |
| OpenCode | **Y** | Windows distributions | [^OCREL] |
| Amp | **D** | WSL documented | [^AM10] |
| GitHub Copilot | **Y** | PowerShell supported | [^GH00] |
| Antigravity | **Y** | Windows supported | [^AG00] |

**Reference winner:** Tie — Codex / Copilot / Antigravity. Windows support alone does not establish equivalent sandboxing, terminal or path behavior.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Exercise PowerShell, Unicode paths and cancellation on Windows; capability-detect missing isolation instead of silently weakening it.

<a id="f007"></a>

### F007 — Vendor-hosted execution

**Definition:** A supported remote execution environment that continues independently of the user laptop.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Cloud surface | [^CC00] |
| Codex | **Y** | Codex Cloud | [^CX10] |
| OpenCode | **U** | Comparable managed cloud execution not established | Not established; related scope: [^OC00] |
| Amp | **Y** | Amp-hosted orbs | [^AM00] |
| GitHub Copilot | **D** | Cloud agent or preview sandbox | [^GH04] [^GH08] |
| Antigravity | **U** | Remote Control alone is not hosted compute | Not established; related scope: [^AG08] |

**Reference winner:** Amp. Orbs make the environment an explicit per-thread product object; Codex is also a strong implementation reference.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Separate controller and executor; suspend, resume and inspect remote environments while the local UI is closed.

<a id="f008"></a>

### F008 — Open runtime source

**Definition:** Source access permitting inspection and modification of the coding runtime, distinct from SDK wrappers.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **N** | Full runtime proprietary | [^CC00] |
| Codex | **Y** | CLI and App Server open | [^CX13] |
| OpenCode | **Y** | Open-source runtime | [^OC00] |
| Amp | **N** | Hosted runtime proprietary | [^AM10] |
| GitHub Copilot | **N** | SDK source does not expose full runtime | [^GH11] |
| Antigravity | **U** | Full App/CLI runtime source not established | Not established; related scope: [^AG00] |

**Reference winner:** OpenCode. Most suitable reference for owning and extending a provider-neutral runtime; Codex is also inspectable.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Document which gb8 components are owned, embedded or external; isolate provider-specific code behind adapters.

## 5.2. Models, providers and routing

OpenCode leads provider-neutral configuration; Amp leads opinionated routing across model roles and funding sources.

<a id="f009"></a>

### F009 — Multiple model families

**Definition:** Officially supporting model families from more than one lab without an unsupported proxy hack.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **N** | Claude family focus | [^CC16] |
| Codex | **D** | Compatible custom providers; Responses requirements | [^CX06] |
| OpenCode | **Y** | Provider-neutral catalog | [^OC08] |
| Amp | **Y** | Multiple providers and modes | [^AM04] |
| GitHub Copilot | **Y** | Multiple labs by client | [^GH05] |
| Antigravity | **Y** | Gemini and Claude catalog | [^AG06] |

**Reference winner:** OpenCode. Broad provider architecture makes it the cleanest general-purpose reference; model quality remains independent.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Run the same fixture suite through two labs; retain capabilities, usage and errors in a normalized provider contract.

<a id="f010"></a>

### F010 — Custom enterprise gateway

**Definition:** Pointing inference at a controlled endpoint with explicit authentication and protocol compatibility.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Compatible Claude gateway | [^CC16] |
| Codex | **D** | Responses-compatible provider | [^CX06] |
| OpenCode | **Y** | Custom endpoint and headers | [^OC08] |
| Amp | **Y** | Custom URL and gateway connections | [^AM04] |
| GitHub Copilot | **D** | SDK BYOK path | [^GH11] |
| Antigravity | **D** | SDK compatible endpoint | [^AG12] |

**Reference winner:** OpenCode. Explicit provider packages, endpoint configuration and overrides support the broadest integration surface.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Support the approved gateway without exposing credentials to prompts; validate tool calling, streaming and cancellation before enabling it.

<a id="f011"></a>

### F011 — Local or offline model inference

**Definition:** The model itself can run locally; local file execution alone does not qualify.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **N** | No official local-model product path established | [^CC16] |
| Codex | **D** | Ollama/LM Studio provider capabilities | [^CX06] |
| OpenCode | **D** | Compatible local provider | [^OC08] |
| Amp | **D** | Gateway/local endpoint compatibility must be checked | [^AM04] |
| GitHub Copilot | **D** | SDK BYOK plus compatible local service | [^GH11] |
| Antigravity | **D** | SDK local model execution | [^AG12] |

**Reference winner:** OpenCode. Best general runtime reference; Antigravity has a specific documented SDK-only local inference route.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Provide a fully offline profile with local inference, no remote discovery and explicit disabled cloud tools.

<a id="f012"></a>

### F012 — Model and effort selection

**Definition:** Choosing the reasoning model and supported effort for a session or task.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Model aliases and effort | [^CC16] |
| Codex | **Y** | Model and effort configuration | [^CX06] |
| OpenCode | **Y** | Models and variants | [^OC02] |
| Amp | **Y** | Low/medium/high/ultra modes | [^AM02] |
| GitHub Copilot | **D** | Supported model/client combination | [^GH05] |
| Antigravity | **D** | Model tiers and plan restrictions | [^AG06] |

**Reference winner:** Tie — Claude Code / Codex / OpenCode. All expose meaningful choices; the best interface depends on whether the user wants model IDs or task-oriented presets.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Expose fast, standard and deep presets, show the resolved model and allow an exact model override.

<a id="f013"></a>

### F013 — Independent worker model selection

**Definition:** Assigning a cheaper or specialized model to a worker without changing the main agent model.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Custom subagent model | [^CC02] |
| Codex | **Y** | Custom agent model | [^CX01] |
| OpenCode | **Y** | Per-agent model | [^OC01] |
| Amp | **D** | Custom plugin agent; Task normally inherits | [^AM02] |
| GitHub Copilot | **D** | Agent profile/model surface support | [^GH02] [^GH05] |
| Antigravity | **D** | Custom worker model tier | [^AG01] |

**Reference winner:** Claude Code. Explicit worker profiles make cost-aware delegation straightforward; avoid assuming every provider exposes the same models.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Record parent and worker model choices separately; a cheaper worker cannot inherit unsupported tools or elevated permissions.

<a id="f014"></a>

### F014 — Automatic role-based routing

**Definition:** The product selects different models for distinct roles or task modes.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Opus-plan and worker configuration | [^CC16] |
| Codex | **U** | General automatic cost router not established | Not established; related scope: [^CX06] |
| OpenCode | **D** | Configured agents; universal router unverified | [^OC01] |
| Amp | **Y** | Main, support and specialist routing | [^AM02] |
| GitHub Copilot | **D** | Auto selection is client/policy dependent | [^GH05] |
| Antigravity | **D** | Reasoning and specialist models | [^AG06] |

**Reference winner:** Amp. Its documented product design explicitly separates main work, specialist work and supporting model jobs.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Route at session start and worker creation using task class, uncertainty and context cost; log every routing reason.

<a id="f015"></a>

### F015 — Reuse existing model subscriptions

**Definition:** A documented path to fund usage through an existing supported subscription.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Claude subscriptions | [^CC16] |
| Codex | **D** | ChatGPT sign-in | [^CX00] |
| OpenCode | **D** | ChatGPT and Copilot connections | [^OC08] |
| Amp | **D** | Multiple supported subscription connections | [^AM04] |
| GitHub Copilot | **D** | Copilot subscription | [^GH00] |
| Antigravity | **D** | Google AI plan entitlement | [^AG06] |

**Reference winner:** Amp. Broadest documented funding connections; account, organization and model entitlements still govern access.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Treat subscription access as an explicit authorized adapter; show limits and never silently switch to paid API usage.

<a id="f016"></a>

### F016 — Provider diagnostics and capability discovery

**Definition:** Determining which connection actually serves a model and what it supports.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Alias/provider configuration | [^CC16] |
| Codex | **D** | Model catalogs and provider settings | [^CX06] |
| OpenCode | **Y** | Catalog plus provider configuration | [^OC08] |
| Amp | **Y** | Check Access and routing inspection | [^AM04] |
| GitHub Copilot | **D** | Supported-model client matrix | [^GH05] |
| Antigravity | **D** | Plan-based catalog | [^AG06] |

**Reference winner:** Amp. Connection testing and visible routing precedence are particularly useful when several accounts can fund the same model.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Add a diagnostic that reports endpoint class, model, context, tools, streaming and a redacted request trace.

## 5.3. Instructions, memory and context

Claude Code is a strong instruction/memory reference; OpenCode offers unusually explicit compaction controls; Copilot validates repository memories.

<a id="f017"></a>

### F017 — Repository instructions

**Definition:** Loading durable repository guidance rather than requiring it in every prompt.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | CLAUDE.md or supported AGENTS.md | [^CC01] |
| Codex | **Y** | AGENTS.md hierarchy | [^CX14] |
| OpenCode | **Y** | AGENTS.md | [^OC07] |
| Amp | **Y** | AGENTS.md integration | [^AM00] |
| GitHub Copilot | **Y** | Instructions and agent files | [^GH01] |
| Antigravity | **Y** | AGENTS.md/GEMINI.md and rules | [^AG13] |

**Reference winner:** Tie — all six. File-based instructions are baseline; precedence and activation must be compared separately.

**gb8:** not audited · **P0** candidate. **Acceptance target:** List the exact instruction files used for a turn, with scope, hash and load order.

<a id="f018"></a>

### F018 — Directory-scoped instructions

**Definition:** Activating narrower guidance when working within particular parts of a repository.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Path and directory rules | [^CC01] |
| Codex | **Y** | Nested instructions | [^CX14] |
| OpenCode | **Y** | Discovery during exploration | [^OC07] |
| Amp | **D** | AGENTS.md behavior; exact precedence recheck | [^AM00] |
| GitHub Copilot | **D** | Instruction type and surface | [^GH01] |
| Antigravity | **Y** | Scoped rule discovery | [^AG13] |

**Reference winner:** Claude Code. Combines directory guidance with modular path-specific rules and documented inspection behavior.

**gb8:** not audited · **P0** candidate. **Acceptance target:** A nested service instruction applies to that service; unrelated instructions stay unloaded and precedence is explainable.

<a id="f019"></a>

### F019 — Automatic durable memory

**Definition:** The agent extracts useful facts or preferences across sessions, beyond ordinary transcript history.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Auto memory | [^CC01] |
| Codex | **D** | Local memories opt-in | [^CX07] |
| OpenCode | **U** | Equivalent automatic memory not verified | Not established; related scope: [^OC07] |
| Amp | **D** | Thread retrieval, not equivalent auto memory | [^AM08] |
| GitHub Copilot | **D** | Copilot Memory preview | [^GH07] |
| Antigravity | **D** | Learn/rules workflow; automatic memory unverified | [^AG00] |

**Reference winner:** Claude Code. Auto memory is a first-class workflow; Copilot is a strong reference for citation-backed repository facts.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Store facts with provenance, confidence and scope; users can inspect/delete them and exclude sensitive sessions.

<a id="f020"></a>

### F020 — Memory validation against current code

**Definition:** Checking that a stored repository fact is still supported before using it.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **U** | Uniform revalidation guarantee not established | Not established; related scope: [^CC01] |
| Codex | **U** | Uniform branch revalidation not established | Not established; related scope: [^CX07] |
| OpenCode | **U** | No verified automatic memory substrate | Not established; related scope: [^OC07] |
| Amp | **U** | Thread retrieval is not branch validation | Not established; related scope: [^AM08] |
| GitHub Copilot | **Y** | Citation checks against current branch | [^GH07] |
| Antigravity | **U** | Uniform automatic validation not established | Not established; related scope: [^AG13] |

**Reference winner:** GitHub Copilot. The documented memory design validates supporting code citations before applying repository facts.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Invalidate a fact when its supporting symbol or file changes; show stale facts separately and never silently apply them.

<a id="f021"></a>

### F021 — Automatic context compaction

**Definition:** Summarizing conversation history so a session can continue near its input limit.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Automatic compaction | [^CC07] |
| Codex | **Y** | Configurable compaction | [^CX06] |
| OpenCode | **Y** | Automatic and manual summaries | [^OC04] |
| Amp | **Y** | Main and worker compaction | [^AM02] |
| GitHub Copilot | **Y** | Automatic context management | [^GH00] |
| Antigravity | **Y** | Compact command and long-session support | [^AGREL] |

**Reference winner:** OpenCode. Best reference for transparent recent-context retention and explicit summary configuration, not proven best summary quality.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Compact without losing the goal, decisions, permissions, outstanding work or evidence pointers; regression-test resumed tasks.

<a id="f022"></a>

### F022 — Context retention tuning

**Definition:** Configuring the compaction threshold and how much recent content remains exact.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Model/compact window configuration | [^CC16] |
| Codex | **Y** | Threshold and scope settings | [^CX06] |
| OpenCode | **Y** | Recent-token and buffer controls | [^OC04] |
| Amp | **U** | Equivalent public tuning knobs not verified | Not established; related scope: [^AM08] |
| GitHub Copilot | **U** | Equivalent granular knobs not verified | Not established; related scope: [^GH00] |
| Antigravity | **U** | Equivalent granular knobs not verified | Not established; related scope: [^AG13] |

**Reference winner:** OpenCode. Explicit keep/buffer settings make the tradeoff inspectable and adjustable.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Provide token budgets for instructions, recent turns, tool output and reserved completion space; explain why compaction triggered.

<a id="f023"></a>

### F023 — Fork conversation without overwriting it

**Definition:** Branching the interaction so an alternative approach preserves its starting transcript.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Branch/fork session | [^CC07] |
| Codex | **D** | Thread fork via App Server | [^CX02] |
| OpenCode | **Y** | Fork API | [^OC14] |
| Amp | **D** | Handoff/new thread; exact fork semantics recheck | [^AM08] |
| GitHub Copilot | **U** | Cross-surface equivalent not established | Not established; related scope: [^GH04] |
| Antigravity | **U** | Exact fork semantics not established | Not established; related scope: [^AG13] |

**Reference winner:** Claude Code. User-facing branch/fork workflows distinguish alternative exploration from resuming the same session.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Fork at a specific event; preserve parent lineage, selected context and a separate execution workspace.

<a id="f024"></a>

### F024 — Cross-session retrieval

**Definition:** Finding and reading relevant work from an earlier session.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Session resume and persistent notes | [^CC07] |
| Codex | **D** | Local memories/session history | [^CX07] |
| OpenCode | **D** | Session list/export API | [^OC14] |
| Amp | **Y** | Search and Read Thread | [^AM08] |
| GitHub Copilot | **D** | Synced session history | [^GH04] |
| Antigravity | **D** | Conversation search | [^AGREL] |

**Reference winner:** Amp. Explicit thread referencing and search make prior work a usable source rather than only a sidebar archive.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Retrieve prior decisions with session/event citations, respecting project access and preventing stale output from becoming an instruction.

## 5.4. Tools and execution

Basic execution is widely shared. The real differentiators are bounded output, reliable background work and enforceable tool contracts.

<a id="f025"></a>

### F025 — Read, search and edit repository files

**Definition:** Using structured file inspection and modification rather than answering only with suggested code.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Structured file tools | [^CC15] |
| Codex | **Y** | Repository editing | [^CX00] |
| OpenCode | **Y** | Read/glob/grep/edit/patch | [^OC11] |
| Amp | **Y** | Code inspection and editing | [^AM01] |
| GitHub Copilot | **Y** | Local and cloud editing | [^GH00] |
| Antigravity | **Y** | Structured file tools | [^AG02] |

**Reference winner:** Tie — all six. No defensible quality ranking follows from the presence of file tools alone.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Edits report exact paths and diffs, detect stale content and fail without changing files when the precondition is wrong.

<a id="f026"></a>

### F026 — Shell and project test execution

**Definition:** Running the repository’s own build and test commands.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Bash/PowerShell | [^CC15] |
| Codex | **Y** | Local tools and commands | [^CX00] |
| OpenCode | **Y** | Host shell | [^OC11] |
| Amp | **Y** | Tools and shell commands | [^AM01] |
| GitHub Copilot | **Y** | Shell execution | [^GH00] |
| Antigravity | **Y** | Run-command tools | [^AG02] |

**Reference winner:** Tie — all six. All can invoke tests; success depends on environment setup and whether the agent actually verifies relevant behavior.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Capture command, cwd, exit code and bounded output; distinguish failure, cancellation and timeout.

<a id="f027"></a>

### F027 — Persistent interactive terminal

**Definition:** Keeping a PTY alive for interactive programs and sending subsequent input.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Shell/background tool behavior | [^CC15] |
| Codex | **Y** | Background terminal controls | [^CX06] |
| OpenCode | **Y** | PTY APIs | [^OC14] |
| Amp | **D** | Thread terminal/runner support | [^AM08] |
| GitHub Copilot | **D** | CLI shell and sandbox surface | [^GH00] |
| Antigravity | **D** | Terminal/background execution | [^AG02] |

**Reference winner:** OpenCode. Explicit PTY and persistent-terminal APIs are useful references for custom interfaces.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Allocate a PTY with a stable ID; support input, resize, cancellation and reconnect without replaying shell commands.

<a id="f028"></a>

### F028 — Background process tracking

**Definition:** Tracking a long-running command without blocking the whole conversation.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Background tools and Monitor | [^CC15] |
| Codex | **Y** | Background terminal handling | [^CX06] |
| OpenCode | **Y** | Running-shell APIs | [^OC14] |
| Amp | **Y** | Orb terminal and background workflows | [^AM08] |
| GitHub Copilot | **D** | Client-specific background sessions | [^GH00] |
| Antigravity | **Y** | Background tasks | [^AG01] |

**Reference winner:** Claude Code. Documented command lifecycles, Monitor and session scheduling offer several distinct background mechanisms.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Return a process handle immediately; stream output, retain final status and clean up children after cancellation.

<a id="f029"></a>

### F029 — Bounded tool output

**Definition:** Capping or paging noisy results to protect the main context.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Tool-specific output limits | [^CC15] |
| Codex | **D** | Tool/runtime behavior | [^CX00] |
| OpenCode | **Y** | Paged reads and search caps | [^OC11] |
| Amp | **D** | Worker summaries | [^AM02] |
| GitHub Copilot | **D** | Task-agent summaries | [^GH02] |
| Antigravity | **D** | Tools expose bounded file reads | [^AG02] |

**Reference winner:** OpenCode. Concrete per-tool paging and size limits make context protection easy to reason about.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Persist full logs outside the model context and return a summary, truncation marker and fetchable ranges.

<a id="f030"></a>

### F030 — Programmatic tool composition

**Definition:** Calling several tools through code rather than placing every intermediate result into model context.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Hooks/mods and SDK tools | [^CC05] [^CC13] |
| Codex | **D** | App Server/host integration | [^CX02] |
| OpenCode | **D** | Code Mode and MCP configuration | [^OC09] |
| Amp | **Y** | Plugin direct tool calls | [^AM03] |
| GitHub Copilot | **D** | SDK custom tools | [^GH11] |
| Antigravity | **D** | SDK tools | [^AG11] |

**Reference winner:** OpenCode / Amp. Useful implementation references for composed execution; no common token-efficiency benchmark is claimed.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Run typed tool calls with shared cancellation and permissions; only selected results return to the main model.

<a id="f031"></a>

### F031 — Web search and document fetch

**Definition:** Retrieving public documentation from within the coding workflow.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | WebSearch/WebFetch | [^CC15] |
| Codex | **D** | Provider and tool availability | [^CX06] |
| OpenCode | **D** | Search provider configuration | [^OC00] |
| Amp | **Y** | Web tools | [^AM01] |
| GitHub Copilot | **D** | Surface/tool availability | [^GH00] |
| Antigravity | **D** | Browser and tool availability | [^AG03] |

**Reference winner:** Claude Code. First-party search and fetch are clearly distinct tools; provider and organization restrictions still matter.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Return source URLs and retrieval time; sanitize tool results and keep fetched instructions lower-trust than user instructions.

<a id="f032"></a>

### F032 — Custom tool registration

**Definition:** Adding a new typed capability implemented by the application or an extension.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | SDK/MCP/mod integration | [^CC13] [^CC10] |
| Codex | **D** | SDK/App Server or MCP | [^CX02] [^CX12] |
| OpenCode | **Y** | Plugins and embedded host | [^OC15] |
| Amp | **Y** | Plugin registerTool | [^AM03] |
| GitHub Copilot | **Y** | SDK custom runtime tools | [^GH11] |
| Antigravity | **Y** | SDK custom tools | [^AG11] |

**Reference winner:** OpenCode / Amp. Both expose extensible runtime surfaces suitable for gb8-style tools and interfaces.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Validate input/output schemas, authorization, timeouts and event telemetry for every custom tool before exposing it to a model.

## 5.5. Planning and task control

Plan support is common; executable scope controls and reviewable artifacts matter more than the label.

<a id="f033"></a>

### F033 — Dedicated planning workflow

**Definition:** A first-party mode or explicit workflow for exploring and proposing changes before implementation.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Plan workflow | [^CC02] |
| Codex | **Y** | Planning in CLI | [^CX00] |
| OpenCode | **Y** | Built-in Plan agent | [^OC01] |
| Amp | **D** | Planning role or plugin mode | [^AM02] |
| GitHub Copilot | **Y** | Structured plan mode | [^GH00] |
| Antigravity | **Y** | Planning artifacts | [^AG04] |

**Reference winner:** Claude Code / Antigravity. Claude provides a focused planning workflow; Antigravity makes plans prominent review objects.

**gb8:** not audited · **P0** candidate. **Acceptance target:** A plan lists scope, assumptions, dependencies, verification and risks; implementation starts from the approved revision.

<a id="f034"></a>

### F034 — Enforced read-only planning

**Definition:** Planning prevents ordinary project edits at the tool layer rather than merely requesting restraint.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Plan permissions/tool restrictions | [^CC02] |
| Codex | **D** | Read-only sandbox profile | [^CX03] |
| OpenCode | **D** | Plan rules; shell still policy-controlled | [^OC01] |
| Amp | **D** | Read-only role/configuration | [^AM02] |
| GitHub Copilot | **D** | Plan/client permission behavior | [^GH00] |
| Antigravity | **D** | Planning plus configured permission policy | [^AG05] |

**Reference winner:** Codex. An explicit execution boundary is a stronger foundation than a natural-language promise; verify the chosen profile.

**gb8:** not audited · **P0** candidate. **Acceptance target:** During planning, an attempted source edit is blocked even when a tool command tries to perform it indirectly.

<a id="f035"></a>

### F035 — Clarifying questions before implementation

**Definition:** A supported interaction that gathers requirements while preserving ongoing task context.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Interactive agent questions | [^CC15] |
| Codex | **Y** | Client/agent questions | [^CX02] |
| OpenCode | **Y** | Question/form interaction | [^OC14] |
| Amp | **Y** | Plugin and conversation inputs | [^AM03] |
| GitHub Copilot | **Y** | Plan mode clarifications | [^GH00] |
| Antigravity | **Y** | Interactive plan feedback | [^AG04] |

**Reference winner:** Antigravity. Reviewable plans plus inline feedback provide a useful requirements-to-implementation loop.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Present answerable questions with defaults, persist decisions and keep independent work moving while a blocking question waits.

<a id="f036"></a>

### F036 — Visible task decomposition

**Definition:** Showing subtasks and progress instead of a single opaque long-running response.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Task/agent tools | [^CC03] |
| Codex | **Y** | Plan events | [^CX05] |
| OpenCode | **D** | Agent todo/tool support | [^OC11] |
| Amp | **Y** | Thread and worker activity | [^AM08] |
| GitHub Copilot | **Y** | Fleet task decomposition | [^GH06] |
| Antigravity | **Y** | Task groups and artifacts | [^AG00] |

**Reference winner:** Antigravity. Good reference for visual supervision across task groups and high-level deliverables.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Represent queued, running, blocked, verifying and complete states; every completion links to evidence.

<a id="f037"></a>

### F037 — Dependency-aware delegation

**Definition:** Orchestrating tasks according to dependencies rather than launching every task at once.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Agent team shared tasks | [^CC03] |
| Codex | **D** | Orchestrator/custom workflow | [^CX01] |
| OpenCode | **D** | Custom agent orchestration | [^OC01] |
| Amp | **D** | Cross-thread orchestration | [^AM05] |
| GitHub Copilot | **Y** | Fleet manages dependencies | [^GH06] |
| Antigravity | **D** | Teamwork preview | [^AG01] |

**Reference winner:** GitHub Copilot. Fleet explicitly documents decomposition and dependency handling as part of the agent workflow.

**gb8:** not audited · **P1** candidate. **Acceptance target:** A task runs only after prerequisites succeed; failures propagate to dependants and explain which work remains runnable.

<a id="f038"></a>

### F038 — Steering during execution

**Definition:** Delivering revised instructions while an agent is still working.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Session/fork steering | [^CC02] [^CC14] |
| Codex | **Y** | Active-turn steering | [^CX00] |
| OpenCode | **Y** | Session inbox API | [^OC14] |
| Amp | **Y** | Steering at next step | [^AM08] |
| GitHub Copilot | **Y** | Conversation steering | [^GH00] |
| Antigravity | **Y** | Parent and user steering | [^AG01] |

**Reference winner:** Amp. The distinction between steering now and queueing after completion is especially clear.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Apply steering at safe boundaries, acknowledge when applied and preserve both original objective and revisions.

<a id="f039"></a>

### F039 — Queue follow-up work

**Definition:** Submitting a later instruction without interrupting the current task.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Background/session dispatch | [^CC07] |
| Codex | **D** | Client/session handling | [^CX02] |
| OpenCode | **Y** | Session inbox operations | [^OC14] |
| Amp | **Y** | Explicit queue shortcut | [^AM08] |
| GitHub Copilot | **D** | Surface-dependent session queue | [^GH00] |
| Antigravity | **D** | Composer queue support | [^AGREL] |

**Reference winner:** Amp. Explicit steering-versus-queueing controls reduce accidental redirection during long tasks.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Queue items have IDs, order, cancellation and edit controls; each begins only after its predecessor completes.

<a id="f040"></a>

### F040 — Autonomous goal continuation

**Definition:** A supported mode that keeps working toward a goal across multiple steps or turns.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Loop/stop hooks and workflows | [^CC12] [^CC05] |
| Codex | **D** | Tasks/automation; no universal completion guarantee | [^CX15] |
| OpenCode | **D** | Plugin/controller loop | [^OC03] |
| Amp | **D** | agent.end continuation plugin | [^AM03] |
| GitHub Copilot | **D** | Autopilot/fleet workflow | [^GH06] |
| Antigravity | **D** | Goal command and teamwork | [^AG00] [^AG01] |

**Reference winner:** Claude Code / Antigravity. Useful goal-oriented references; indefinite loops are not evidence of reliable completion.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Continue only against explicit completion criteria, enforce budgets and stop with a reason when progress stalls.

## 5.6. Multi-agent orchestration

Claude Code and Antigravity document rich agent controls. Amp separates lightweight Task workers from independent communicating threads.

<a id="f041"></a>

### F041 — Parallel isolated-context workers

**Definition:** Launching several workers with separate model contexts and collecting their results.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Custom and built-in workers | [^CC02] [^CC03] |
| Codex | **Y** | Parallel subagents | [^CX01] |
| OpenCode | **Y** | General/explore subagents | [^OC01] |
| Amp | **Y** | Task subagents | [^AM02] [^AM05] |
| GitHub Copilot | **Y** | Subagents and fleet | [^GH02] [^GH06] |
| Antigravity | **Y** | Concurrent subagents | [^AG01] |

**Reference winner:** Tie — all six. Every product has a documented worker mechanism; capabilities differ materially beyond this baseline.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Workers receive scoped briefs, return bounded results and leave the parent context free of raw intermediate output.

<a id="f042"></a>

### F042 — Reusable worker personas

**Definition:** Persisting role instructions, allowed tools and model preferences.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Markdown subagent definitions | [^CC02] [^CC03] |
| Codex | **Y** | Custom Codex agents | [^CX01] |
| OpenCode | **Y** | Markdown/JSONC agents | [^OC01] |
| Amp | **D** | Plugin-defined agents | [^AM02] [^AM05] |
| GitHub Copilot | **Y** | Agent profiles across scopes | [^GH02] [^GH06] |
| Antigravity | **Y** | Markdown and transient definitions | [^AG01] |

**Reference winner:** Claude Code. Rich worker configuration and lifecycle documentation make it a strong reference for reusable specialist roles.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Version worker definitions; show resolved prompt, model, tools and permission profile before dispatch.

<a id="f043"></a>

### F043 — Per-worker tool restrictions

**Definition:** Restricting worker capabilities separately from the main agent’s tools.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Tool allow/deny fields | [^CC02] [^CC03] |
| Codex | **D** | Custom agent configuration/inheritance | [^CX01] |
| OpenCode | **Y** | Agent permission rules | [^OC01] |
| Amp | **D** | Custom plugin agent; Task inherits | [^AM02] [^AM05] |
| GitHub Copilot | **Y** | Agent tool profiles | [^GH02] [^GH06] |
| Antigravity | **Y** | tools and MCP scopes | [^AG01] |

**Reference winner:** Claude Code. Dedicated worker capability controls are explicit and detailed; policy enforcement must remain outside model discretion.

**gb8:** not audited · **P0** candidate. **Acceptance target:** A read-only investigator cannot write through an alternate tool; requests requiring broader access return to the controller.

<a id="f044"></a>

### F044 — Peer-to-peer agent messaging

**Definition:** Workers or independent agents can exchange messages directly instead of only returning to their parent.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Named workers/teams | [^CC02] [^CC03] |
| Codex | **D** | Agent tool/runtime capability must verify | [^CX01] |
| OpenCode | **U** | Native peer messaging not established | Not established; related scope: [^OC01] |
| Amp | **D** | Orb agents yes; Task workers no | [^AM02] [^AM05] |
| GitHub Copilot | **U** | Fleet peer messaging not established | Not established; related scope: [^GH02] [^GH06] |
| Antigravity | **Y** | Parent/peer/subagent messages | [^AG01] |

**Reference winner:** Antigravity. Explicit routing, idle-agent wakeup and transcript access make the communication model concrete.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Persist sender, recipient and correlation IDs; authorized messages wake idle agents and never inherit the sender’s permissions.

<a id="f045"></a>

### F045 — Nested delegation

**Definition:** A worker can itself delegate additional work, subject to limits.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Configured nested subagents | [^CC02] [^CC03] |
| Codex | **D** | Runtime/custom agent limits | [^CX01] |
| OpenCode | **N** | Built-in General cannot spawn subagents | [^OC01] |
| Amp | **D** | Separate orb workflows; Task recursion unverified | [^AM02] [^AM05] |
| GitHub Copilot | **U** | Nested delegation limit not established | Not established; related scope: [^GH02] [^GH06] |
| Antigravity | **Y** | Documented depth limit | [^AG01] |

**Reference winner:** Antigravity. The nesting model has an explicit resource boundary; more nesting is not automatically better.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Enforce maximum depth, children per agent and shared spend budgets; reject runaway recursion with an actionable error.

<a id="f046"></a>

### F046 — Inspect and steer an individual worker

**Definition:** Opening a worker’s progress and sending an instruction without replacing the main task.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Worker/fork panel controls | [^CC02] [^CC03] |
| Codex | **D** | CLI/app worker controls | [^CX01] |
| OpenCode | **D** | Subagent session/API inspection | [^OC14] |
| Amp | **D** | Orb thread yes; Task direct steering no | [^AM02] [^AM05] |
| GitHub Copilot | **D** | Surface-specific subagent inspection | [^GH02] [^GH06] |
| Antigravity | **Y** | Agent panel and messages | [^AG01] |

**Reference winner:** Antigravity. The documented lifecycle exposes running, idle and killed states plus direct control.

**gb8:** not audited · **P1** candidate. **Acceptance target:** A user can inspect, stop or follow up with one worker; the parent receives the resulting state change.

<a id="f047"></a>

### F047 — Worker workspace isolation

**Definition:** Giving workers separate working copies to prevent simultaneous edits colliding.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Worktree isolation configuration | [^CC02] [^CC03] |
| Codex | **D** | Worktrees and custom orchestration | [^CX09] |
| OpenCode | **D** | Worktree API; worker wiring custom | [^OC14] |
| Amp | **D** | Independent orbs; Task workspace differs | [^AM02] [^AM05] |
| GitHub Copilot | **D** | Cloud/working tree surface | [^GH08] |
| Antigravity | **Y** | Inherit/branch/share choices | [^AG01] |

**Reference winner:** Antigravity. Workspace topology is an explicit dispatch choice rather than an incidental implementation detail.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Default write workers to isolated worktrees; integrate patches only after conflict detection and verification.

<a id="f048"></a>

### F048 — Coordinated agent teams

**Definition:** A first-party team workflow with shared supervision and coordination beyond independent tool calls.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Experimental Agent Teams | [^CC02] [^CC03] |
| Codex | **D** | Subagent orchestration; team-board parity unverified | [^CX01] |
| OpenCode | **D** | Custom orchestration; no team equivalence proven | [^OC01] |
| Amp | **D** | Independent communicating orb threads | [^AM02] [^AM05] |
| GitHub Copilot | **Y** | Fleet orchestrator | [^GH02] [^GH06] |
| Antigravity | **D** | Teamwork preview | [^AG01] |

**Reference winner:** Claude Code / Antigravity. Rich team concepts are documented, but both advanced team surfaces require maturity qualifiers.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Build shared tasks, ownership, dependencies and integration status before adding free-form agent chatrooms.

## 5.7. Durability, schedules and events

Amp is the clearest reference for persistent thread scheduling. Session timers, process persistence and durable jobs must remain separate concepts.

<a id="f049"></a>

### F049 — Resume saved conversation

**Definition:** Continuing a recorded session after closing and reopening its interface.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Transcript resume | [^CC07] [^CC12] |
| Codex | **Y** | Saved threads | [^CX12] |
| OpenCode | **Y** | Session persistence/service | [^OC12] [^OC14] |
| Amp | **Y** | Continue thread | [^AM06] [^AM08] |
| GitHub Copilot | **Y** | Sessions and synced history | [^GH04] |
| Antigravity | **Y** | Resume command | [^AG00] |

**Reference winner:** Tie — all six. Resuming a conversation is common; it does not prove that a crashed external action is safe to retry.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Restore messages, work state and pending obligations; mark interrupted tool calls without automatically replaying side effects.

<a id="f050"></a>

### F050 — Background execution after UI closes

**Definition:** The execution process can remain alive when the front-end disconnects.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Background session/runtime must stay running | [^CC07] [^CC12] |
| Codex | **D** | Cloud or surviving executor | [^CX10] [^CX15] |
| OpenCode | **D** | Shared background server | [^OC12] [^OC14] |
| Amp | **Y** | Orbs or runners | [^AM06] [^AM08] |
| GitHub Copilot | **D** | Cloud execution | [^GH04] |
| Antigravity | **D** | Host daemon/sidecar must remain running | [^AG08] |

**Reference winner:** Amp. Execution location and persistent thread lifecycle are central product concepts.

**gb8:** not audited · **P1** candidate. **Acceptance target:** UI disconnection does not cancel the job; reconnect retrieves a monotonically ordered event history and current process handles.

<a id="f051"></a>

### F051 — Execution while laptop sleeps

**Definition:** Task execution continues when the user’s laptop is asleep or off.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Hosted/cloud only | [^CC00] |
| Codex | **Y** | Cloud tasks | [^CX10] [^CX15] |
| OpenCode | **D** | Remote server deployment required | [^OC12] [^OC14] |
| Amp | **Y** | Hosted or remote orbs | [^AM06] [^AM08] |
| GitHub Copilot | **D** | Hosted cloud agent/sandbox | [^GH04] |
| Antigravity | **D** | Remote always-on host; local sleeps stop work | [^AG08] |

**Reference winner:** Amp / Codex. Both document hosted execution explicitly; remote control alone cannot provide this capability.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Choose a remote executor before promising unattended work; show host availability and heartbeat separately from UI connectivity.

<a id="f052"></a>

### F052 — Conversation-scoped timer

**Definition:** Wake the current session once after a delay without holding a blocking shell sleep.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Scheduled prompts | [^CC07] [^CC12] |
| Codex | **D** | App scheduler; CLI no scheduling UI | [^CX10] [^CX15] |
| OpenCode | **D** | Controller or plugin timer | [^OC12] [^OC14] |
| Amp | **Y** | One-shot thread schedule | [^AM06] [^AM08] |
| GitHub Copilot | **D** | Automation surface | [^GH04] |
| Antigravity | **D** | Schedule command | [^AG07] [^AG14] |

**Reference winner:** Antigravity. Timer conditions and conversation wakeups are explicitly modeled in the schedule tool.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Create/cancel a durable timer ID; deliver once to the intended session and record scheduled, fired or cancelled status.

<a id="f053"></a>

### F053 — Recurring scheduled task

**Definition:** A first-party repeating task workflow rather than an externally supplied cron command.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Loop sessions and expiry | [^CC07] [^CC12] |
| Codex | **D** | Desktop/cloud scheduling | [^CX10] [^CX15] |
| OpenCode | **D** | Extension/controller required | [^OC12] [^OC14] |
| Amp | **Y** | Persistent thread schedule | [^AM06] [^AM08] |
| GitHub Copilot | **Y** | GitHub automations | [^GH04] |
| Antigravity | **D** | Cron or persistent sidecar | [^AG07] [^AG14] |

**Reference winner:** Amp. Schedules are attached to continuing threads and have visible next-run and pause controls.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Persist recurrence, timezone, next run, prompt version and budget; allow pause, resume, deletion and missed-run policy.

<a id="f054"></a>

### F054 — Webhook-triggered work

**Definition:** Receiving a service event that wakes an agent without a manual prompt.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | MCP channel or external integration | [^CC10] |
| Codex | **D** | Supported app events/CI adapter | [^CX10] [^CX15] |
| OpenCode | **D** | Plugin/server adapter | [^OC12] [^OC14] |
| Amp | **Y** | Managed-orb webhook plugins | [^AM06] [^AM08] |
| GitHub Copilot | **Y** | Repository event automations | [^GH04] |
| Antigravity | **D** | Sidecar/SDK integration | [^AG07] [^AG14] |

**Reference winner:** Amp / GitHub Copilot. Amp documents a webhook delivery mechanism; Copilot tightly connects repository events to agent jobs.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Verify signatures, deduplicate event IDs and separate event receipt from authorized execution of resulting actions.

<a id="f055"></a>

### F055 — Event-driven process monitoring

**Definition:** A changing log or process state wakes the agent without repeatedly asking the model to poll.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Monitor/plugin notifications | [^CC15] |
| Codex | **D** | External event/controller integration | [^CX10] [^CX15] |
| OpenCode | **D** | Plugin plus background service | [^OC12] [^OC14] |
| Amp | **D** | Orb/event plugin | [^AM06] [^AM08] |
| GitHub Copilot | **D** | Repo events or extension | [^GH04] |
| Antigravity | **D** | Sidecar/background events | [^AG07] [^AG14] |

**Reference winner:** Claude Code. Monitor provides a concrete reference for efficient event-driven watches within a coding session.

**gb8:** not audited · **P1** candidate. **Acceptance target:** A bounded watcher emits only meaningful transitions; idle watches make no model calls and have explicit expiry.

<a id="f056"></a>

### F056 — Durable retry and duplicate-action protection

**Definition:** Retrying a failed job without accidentally repeating a commit, deployment or external write.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Resume does not replay unfinished tools | [^CC07] [^CC12] |
| Codex | **U** | End-to-end action idempotency not guaranteed | Not established; related scope: [^CX10] [^CX15] |
| OpenCode | **D** | Some API requests accept IDs | [^OC04] |
| Amp | **D** | Webhook delivery semantics; application dedupe | [^AM06] [^AM08] |
| GitHub Copilot | **U** | All-action idempotency not guaranteed | Not established; related scope: [^GH04] |
| Antigravity | **U** | All-action idempotency not guaranteed | Not established; related scope: [^AG07] [^AG14] |

**Reference winner:** No proven overall winner. Different products document pieces of recovery; none inspected establishes exactly-once semantics for arbitrary side effects.

**Boundary:** Do not display ordinary session resume as crash-safe transactional execution.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Use idempotency keys and an action ledger; after uncertain completion, reconcile remote state before retrying.

## 5.8. Skills, plugins, MCP and hooks

All six extend beyond prompting. Claude Code has a broad packaged workflow system; OpenCode and Amp are strong code-extension references.

<a id="f057"></a>

### F057 — SKILL.md procedures

**Definition:** Loading reusable task-specific instructions with supporting resources on demand.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Native skills | [^CC04] [^CC05] [^CC09] [^CC10] |
| Codex | **Y** | Skills ecosystem | [^CX13] |
| OpenCode | **Y** | Native and compatible directories | [^OC03] [^OC09] [^OC10] |
| Amp | **Y** | Plugin-bundled skills | [^AM03] |
| GitHub Copilot | **Y** | Supported by several surfaces | [^GH01] [^GH03] |
| Antigravity | **Y** | Native agent skills | [^AG02] [^AG09] |

**Reference winner:** Claude Code. A detailed skill lifecycle, command integration and invocation controls make it a strong reference implementation.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Load descriptions first, full instructions only when selected; preserve relative resources and record the skill version used.

<a id="f058"></a>

### F058 — Reusable commands and prompt presets

**Definition:** Explicitly invoking a saved workflow without pasting a long prompt.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Skills become commands | [^CC04] [^CC05] [^CC09] [^CC10] |
| Codex | **Y** | Numbered presets | [^CXREL] |
| OpenCode | **Y** | Custom commands | [^OC00] |
| Amp | **Y** | Plugin commands | [^AM03] |
| GitHub Copilot | **D** | Prompt/agent surface support | [^GH01] [^GH03] |
| Antigravity | **Y** | Slash commands and workflows | [^AG00] |

**Reference winner:** Claude Code. Commands and skills share a coherent discovery and packaging model.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Give commands typed arguments, a preview and stable names; invoking a workflow never grants it extra permissions implicitly.

<a id="f059"></a>

### F059 — MCP tool connectivity

**Definition:** Connecting external tool servers through the Model Context Protocol.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Native MCP client | [^CC04] [^CC05] [^CC09] [^CC10] |
| Codex | **Y** | MCP and plugins | [^CX04] [^CX08] |
| OpenCode | **Y** | Local/remote MCP | [^OC03] [^OC09] [^OC10] |
| Amp | **Y** | MCP tools via plugins | [^AM03] |
| GitHub Copilot | **Y** | MCP integration | [^GH01] [^GH03] |
| Antigravity | **Y** | MCP integration | [^AG00] |

**Reference winner:** Tie — all six. Protocol presence alone does not determine authentication quality, tool discovery cost or policy enforcement.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Support stdio and authenticated remote transports; handle reconnect, capabilities, cancellations and per-tool policy checks.

<a id="f060"></a>

### F060 — MCP authentication and interactive forms

**Definition:** Handling authenticated remote servers and tool requests that need structured user input.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Server/transport and elicitation behavior | [^CC04] [^CC05] [^CC09] [^CC10] |
| Codex | **D** | MCP/server/client support | [^CX06] |
| OpenCode | **D** | OAuth and new elicitation forms | [^OC09] [^OCREL] |
| Amp | **D** | Server and UI integration | [^AM03] |
| GitHub Copilot | **D** | SDK form elicitation | [^GH11] |
| Antigravity | **D** | Server/client capabilities | [^AG02] [^AG09] |

**Reference winner:** OpenCode. Recent release notes explicitly cover structured elicitation across desktop and web; still test each server.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Round-trip a form and OAuth renewal without leaking secrets or deadlocking the tool call; preserve the pending request on reconnect.

<a id="f061"></a>

### F061 — Pre-tool policy hooks

**Definition:** Running deterministic code before a tool to allow, deny or otherwise gate it.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | PreToolUse handlers | [^CC04] [^CC05] [^CC09] [^CC10] |
| Codex | **Y** | PreToolUse handlers | [^CX04] [^CX08] |
| OpenCode | **D** | Plugin policy mechanism | [^OC03] [^OC05] |
| Amp | **Y** | tool.call decision plugin | [^AM03] |
| GitHub Copilot | **Y** | preToolUse handlers | [^GH01] [^GH03] |
| Antigravity | **Y** | PreToolUse hooks | [^AG02] [^AG09] |

**Reference winner:** Claude Code / Amp. Both document rich lifecycle interception; exact failure behavior matters more than event-count marketing.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Policies execute outside the model; a critical policy error fails closed and records the reason without exposing credentials.

<a id="f062"></a>

### F062 — Post-tool and stop hooks

**Definition:** Reacting to results or checking whether work should really finish.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Results/Stop and agent hooks | [^CC04] [^CC05] [^CC09] [^CC10] |
| Codex | **Y** | PostToolUse/Stop events | [^CX04] [^CX08] |
| OpenCode | **D** | Plugin lifecycle events | [^OC03] [^OC09] [^OC10] |
| Amp | **Y** | tool.result and agent.end | [^AM03] |
| GitHub Copilot | **Y** | Post-tool and agent-stop | [^GH01] [^GH03] |
| Antigravity | **Y** | PostToolUse and Stop | [^AG02] [^AG09] |

**Reference winner:** Claude Code. Broad event coverage supports validation and cleanup without making every rule part of the prompt.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Post-edit checks update task evidence; stop hooks have bounded retries and cannot create an infinite self-prompt loop.

<a id="f063"></a>

### F063 — Code-based runtime plugins

**Definition:** Loading executable extensions that add behavior beyond static prompt files.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Mods and plugins | [^CC04] [^CC05] [^CC09] [^CC10] |
| Codex | **D** | Plugins/hooks; runtime API varies | [^CX04] [^CX08] |
| OpenCode | **Y** | Versioned JS/TS plugins | [^OC03] [^OC09] [^OC10] |
| Amp | **Y** | JS/TS tools, events and UI | [^AM03] |
| GitHub Copilot | **D** | Extensions plus packaged customizations | [^GH01] [^GH03] |
| Antigravity | **D** | Plugins, hooks and SDK | [^AG02] [^AG09] |

**Reference winner:** OpenCode / Amp. Strongest references for developers who want to shape the runtime and its interaction surface.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Version plugins, validate manifests, isolate permissions and expose load errors, resource use and a disable switch.

<a id="f064"></a>

### F064 — Central distribution of customizations

**Definition:** Publishing shared skills, agents and policies to a team with a managed update path.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Plugin marketplaces/settings | [^CC04] [^CC05] [^CC09] [^CC10] |
| Codex | **D** | Plugin and managed configuration | [^CX04] [^CX13] |
| OpenCode | **D** | Packages/HTTP skill catalogs | [^OC03] [^OC09] [^OC10] |
| Amp | **Y** | Workspace plugin repositories | [^AM03] |
| GitHub Copilot | **Y** | Organization/enterprise agents | [^GH02] |
| Antigravity | **D** | Marketplace and rules | [^AG00] |

**Reference winner:** Claude Code / GitHub Copilot. Claude provides packaged workflow distribution; Copilot adds explicit organization and enterprise profile scopes.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Pin reviewed versions, support rollback and show whether a customization is personal, repository or centrally managed.

## 5.9. Browser, visual work and artifacts

Antigravity is the most distinctive visual-verification reference. Copilot has current built-in VS Code browser tools, not only Playwright MCP.

<a id="f065"></a>

### F065 — Interactive browser automation

**Definition:** The agent can navigate, click and type in a browser as part of a coding task.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Browser extension connection | [^CC19] |
| Codex | **D** | Browser-capable client/tools | [^CX06] |
| OpenCode | **D** | MCP or custom browser integration | [^OC09] |
| Amp | **D** | Orb browser/tools; deployment-specific | [^AM01] |
| GitHub Copilot | **D** | Built-in VS Code browser tools | [^GH12] |
| Antigravity | **D** | IDE/browser subagent | [^AG03] [^AG04] |

**Reference winner:** Antigravity. Browser actions, screenshots and recordings are designed as part of the verification experience.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Build a scoped browser adapter with navigation, accessibility inspection, input and cancellation; preserve auditable action logs.

<a id="f066"></a>

### F066 — Reuse a signed-in browser session

**Definition:** Using an existing authorized browser state instead of requiring a fresh unauthenticated browser.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Shared extension login state | [^CC19] |
| Codex | **D** | Browser/profile configuration | [^CX06] |
| OpenCode | **D** | Integration supplied | [^OC11] |
| Amp | **D** | Browser/profile configuration | [^AM01] |
| GitHub Copilot | **D** | Explicitly shared VS Code tab | [^GH12] |
| Antigravity | **D** | Separate profile; existing personal state not automatic | [^AG03] [^AG04] |

**Reference winner:** Claude Code / GitHub Copilot. Claude connects to an existing browser; Copilot explicitly distinguishes shared tabs from isolated agent pages.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Make account/profile access explicit and revocable; show which session is shared and never copy credentials into the model context.

<a id="f067"></a>

### F067 — Isolated browser profile

**Definition:** Keeping agent web activity separate from unrelated personal browser cookies and tabs.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Separate browser/profile setup | [^CC19] |
| Codex | **D** | Browser environment configuration | [^CX06] |
| OpenCode | **D** | Browser integration configuration | [^OC11] |
| Amp | **D** | Orb environment | [^AM01] |
| GitHub Copilot | **Y** | Agent-opened VS Code pages isolated | [^GH12] |
| Antigravity | **Y** | Separate Chrome profile | [^AG03] [^AG04] |

**Reference winner:** Antigravity / GitHub Copilot. Both document browser-session isolation as a user-visible concept.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Default automated tests to an ephemeral profile; require an explicit action to grant a persistent authenticated profile.

<a id="f068"></a>

### F068 — Visual screenshots in verification

**Definition:** Capturing rendered results so the agent can inspect appearance and layout.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Browser screenshots | [^CC19] |
| Codex | **D** | Client/tool/model support | [^CX06] |
| OpenCode | **D** | Browser integration/model support | [^OC11] |
| Amp | **D** | Browser plus image tools | [^AM01] |
| GitHub Copilot | **Y** | Built-in screenshot tool | [^GH12] |
| Antigravity | **Y** | Browser screenshot artifacts | [^AG03] [^AG04] |

**Reference winner:** Antigravity. Visual evidence is integrated into reviewable deliverables rather than being only a detached image file.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Attach viewport, URL, timestamp and commit to screenshots; compare the changed UI at agreed viewport sizes.

<a id="f069"></a>

### F069 — Browser action recordings

**Definition:** Saving a reviewable recording of the agent’s interaction with the application.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Demo GIF/browser extension | [^CC19] |
| Codex | **U** | Equivalent first-party recording workflow unverified | Not established; related scope: [^CX06] |
| OpenCode | **D** | External recording tool | [^OC11] |
| Amp | **U** | Equivalent built-in recording workflow unverified | Not established; related scope: [^AM01] |
| GitHub Copilot | **U** | Equivalent recording artifact unverified | Not established; related scope: [^GH12] |
| Antigravity | **Y** | Browser recording artifacts | [^AG03] [^AG04] |

**Reference winner:** Antigravity. Recording and playback are explicitly documented parts of its artifact workflow.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Capture only the relevant application flow, redact sensitive input and link recording steps to acceptance criteria.

<a id="f070"></a>

### F070 — Interactive plan and walkthrough artifacts

**Definition:** Structured review objects that communicate plans and results beyond ordinary chat text.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Plans and plugin UI | [^CC09] |
| Codex | **D** | Client/plugin artifacts | [^CX06] |
| OpenCode | **D** | Custom client/plugin UI | [^OC13] |
| Amp | **D** | Thread panels/plugins | [^AM03] |
| GitHub Copilot | **D** | IDE and cloud result surfaces | [^GH04] |
| Antigravity | **Y** | Rich plans and walkthroughs | [^AG03] [^AG04] |

**Reference winner:** Antigravity. Strongest reference for asynchronous review of what was planned, changed and demonstrated.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Create versioned plan, execution and verification artifacts with comments anchored to a specific revision.

<a id="f071"></a>

### F071 — Generate or edit visual assets

**Definition:** Using an integrated image-generation capability while implementing a UI.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | External MCP/plugin tool | [^CC10] |
| Codex | **D** | Client/image tool availability | [^CX06] |
| OpenCode | **D** | External provider/plugin | [^OC03] |
| Amp | **Y** | Painter tool | [^AM01] |
| GitHub Copilot | **D** | External tool/extension | [^GH12] |
| Antigravity | **Y** | Generative image model | [^AG06] |

**Reference winner:** Amp / Antigravity. Both document dedicated image-generation paths; keep generated assets separate from exact technical diagrams.

**gb8:** not audited · **P3** candidate. **Acceptance target:** Route image requests through a dedicated tool, retain prompt/provenance and write assets into the project with predictable paths.

<a id="f072"></a>

### F072 — Element-level visual feedback

**Definition:** Pointing at a rendered element and attaching a specific change request to the agent.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Browser/plugin workflow | [^CC19] |
| Codex | **U** | Consistent coding-client workflow unverified | Not established; related scope: [^CX06] |
| OpenCode | **D** | Custom UI/browser integration | [^OC13] |
| Amp | **D** | Portal/plugin UI | [^AM01] |
| GitHub Copilot | **Y** | VS Code element comments | [^GH12] |
| Antigravity | **D** | Artifact feedback; element parity varies | [^AG03] [^AG04] |

**Reference winner:** GitHub Copilot. Current VS Code tools explicitly support attaching elements, CSS, screenshots and element comments.

**gb8:** not audited · **P2** candidate. **Acceptance target:** A selected element includes locator, relevant styles and screenshot crop; the agent can re-identify it after making changes.

## 5.10. Permissions, sandboxing and trust

Codex is the strongest default reference for explicit execution boundaries; compare shell, file, MCP and hook coverage separately.

<a id="f073"></a>

### F073 — Tool-level allow, ask and deny

**Definition:** A deterministic policy decides whether an operation may proceed or needs approval.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Permission rules | [^CC15] |
| Codex | **Y** | Approval and execution policy | [^CX03] [^CX06] |
| OpenCode | **Y** | Ordered permission rules | [^OC05] |
| Amp | **D** | Policy plugin; tools run freely by default | [^AM01] [^AM03] |
| GitHub Copilot | **Y** | Tool permissions and hooks | [^GH03] |
| Antigravity | **Y** | Deny/ask/allow engine | [^AG05] |

**Reference winner:** Codex / Antigravity. Both make execution and approval policies explicit; their rule precedence and scopes differ.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Evaluate policies on normalized paths/commands at execution time and log the winning rule; prompts never override denials.

<a id="f074"></a>

### F074 — OS-enforced local shell sandbox

**Definition:** Operating-system restrictions constrain executed commands beyond what the model is instructed to do.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Optional; macOS/Linux/WSL2 | [^CC06] [^CC20] |
| Codex | **Y** | Local OS sandbox | [^CX03] [^CX06] |
| OpenCode | **U** | Native OS sandbox not established | Not established; related scope: [^OC05] |
| Amp | **D** | Isolated environment required; local equivalent unverified | [^AM01] [^AM03] |
| GitHub Copilot | **D** | Optional local MXC sandbox | [^GH08] |
| Antigravity | **D** | Default/Auto terminal sandbox | [^AG05] |

**Reference winner:** Codex. Its documented default local execution boundary is a useful secure-autonomy baseline.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Run shell children inside an enforced boundary; test filesystem and network escapes on every supported operating system.

<a id="f075"></a>

### F075 — Filesystem scope controls

**Definition:** Restricting which paths the agent can read or modify.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | File policy plus shell sandbox | [^CC06] [^CC20] |
| Codex | **Y** | Profiles and sandbox boundaries | [^CX03] [^CX06] |
| OpenCode | **Y** | Resource/path permissions | [^OC05] |
| Amp | **D** | Plugin or environment policy | [^AM01] [^AM03] |
| GitHub Copilot | **Y** | Sandbox and tool checks | [^GH08] |
| Antigravity | **Y** | Workspace scopes and file rules | [^AG05] |

**Reference winner:** Codex. A clear execution profile is a strong starting point; built-in tools and spawned processes still need separate verification.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Resolve symlinks and canonical paths before authorization; denied files remain inaccessible through file, shell and custom tools.

<a id="f076"></a>

### F076 — Network domain restrictions

**Definition:** Controlling which outbound destinations an agent or its processes may contact.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Shell sandbox and separate tool rules | [^CC06] [^CC20] |
| Codex | **Y** | Network/execution controls | [^CX03] [^CX06] |
| OpenCode | **D** | Host/network configuration; OS enforcement unverified | [^OC05] |
| Amp | **D** | Orb/network enterprise controls | [^AM09] |
| GitHub Copilot | **D** | OS-dependent network rules | [^GH08] |
| Antigravity | **D** | Terminal sandbox and web rules | [^AG05] |

**Reference winner:** Codex. Strong reference for separating default execution access from explicitly granted connectivity.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Enforce egress outside the model, cover IPv4/IPv6 and subprocesses, and show blocked destinations with the applicable rule.

<a id="f077"></a>

### F077 — Automatic review of approvals

**Definition:** A policy/reviewer can approve eligible low-risk requests while escalating others.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Permission-mode availability | [^CC06] |
| Codex | **Y** | Auto-review configuration | [^CX03] [^CX06] |
| OpenCode | **D** | Custom policy implementation | [^OC05] |
| Amp | **D** | Policy plugin decision logic | [^AM01] [^AM03] |
| GitHub Copilot | **D** | Surface-specific automatic approval | [^GH00] |
| Antigravity | **D** | Auto preset preview; non-enterprise restrictions | [^AG05] |

**Reference winner:** Codex. A separate configurable reviewer is explicitly documented; it does not replace the sandbox boundary.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Use deterministic rules first, a bounded reviewer second and human review where required; retain the decision rationale and policy version.

<a id="f078"></a>

### F078 — Untrusted project admission

**Definition:** A project cannot silently activate executable customization before it is trusted.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Workspace trust/settings admission | [^CC06] [^CC20] |
| Codex | **D** | Project trust and config restrictions | [^CX03] [^CX06] |
| OpenCode | **D** | Project config disable controls | [^OC07] |
| Amp | **D** | Plugin trust is user responsibility | [^AM03] |
| GitHub Copilot | **D** | Workspace/agent hook admission | [^GH03] |
| Antigravity | **D** | Project policy and permission controls | [^AG05] |

**Reference winner:** Claude Code. Clear distinction between repository-supplied configuration and personally trusted settings is useful for safe onboarding.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Opening a repository does not auto-run its hooks, scripts or MCP servers; show the executable additions awaiting trust.

<a id="f079"></a>

### F079 — Sandbox coverage beyond shell

**Definition:** Documented handling for file tools, local MCP services and hooks, rather than assuming shell isolation covers everything.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | File tools/MCP/hooks outside Bash sandbox | [^CC06] [^CC20] |
| Codex | **D** | Tool and executor boundaries differ | [^CX03] [^CX06] |
| OpenCode | **D** | Permissions; no uniform OS boundary proven | [^OC05] |
| Amp | **D** | Environment/plugin scope | [^AM01] [^AM03] |
| GitHub Copilot | **D** | MCP/LSP sandbox options; files in-process | [^GH08] |
| Antigravity | **D** | Permission scopes; exact hook isolation recheck | [^AG05] |

**Reference winner:** No universal winner. The inspected products expose materially different boundaries; a single sandbox checkbox would hide important gaps.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Publish a capability map for each tool family; adversarial checks verify that a denial holds across alternate execution paths.

<a id="f080"></a>

### F080 — No human prompts during configured unattended run

**Definition:** A job can follow an explicit pre-authorized policy and fail cleanly when authorization is missing.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Headless permission configuration | [^CC17] |
| Codex | **Y** | Non-interactive policy | [^CX05] |
| OpenCode | **D** | Server permission handling | [^OC14] |
| Amp | **D** | Default autonomy or plugin policy | [^AM01] [^AM03] |
| GitHub Copilot | **D** | Programmatic tool approvals | [^GH00] |
| Antigravity | **D** | Headless/policy configuration | [^AG00] |

**Reference winner:** Codex. Programmatic execution with explicit sandbox and approval settings provides a clear automation contract.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Unattended jobs return blocked status with a resumable approval request instead of hanging or granting themselves access.

## 5.11. Git, review and delivery

Copilot is strongest for native GitHub delivery; Codex for worktree handoff and review; Amp for a persistent thread-to-ship workflow.

<a id="f081"></a>

### F081 — Inspect diffs and local changes

**Definition:** Presenting code changes for human review within the agent workflow.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Local/session changes | [^CC08] [^CC07] |
| Codex | **Y** | Review UI and CLI | [^CX09] [^CX11] |
| OpenCode | **Y** | VCS/diff API | [^OC06] [^OC14] |
| Amp | **Y** | Changes pane | [^AM08] |
| GitHub Copilot | **Y** | IDE/app/GitHub views | [^GH04] |
| Antigravity | **Y** | Visual diffs | [^AG04] [^AG01] |

**Reference winner:** Tie — all six. Basic diff access is common; evidence quality and review ergonomics need hands-on comparison.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Always show the complete diff, identify generated changes and retain a baseline reference so concurrent edits cannot be hidden.

<a id="f082"></a>

### F082 — Create commits and pull requests

**Definition:** Turning a validated local change into repository history and a reviewable PR.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Git/connected tools | [^CC00] |
| Codex | **D** | Connected review/delivery workflow | [^CX09] [^CX11] |
| OpenCode | **D** | Git shell and integration | [^OC06] [^OC14] |
| Amp | **Y** | Ship workflow | [^AM08] |
| GitHub Copilot | **Y** | Native branch/commit/PR flow | [^GH04] |
| Antigravity | **D** | Git tools and worktree changes | [^AG04] [^AG01] |

**Reference winner:** GitHub Copilot. GitHub-native branch creation, push and pull-request workflows minimize glue code.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Create a draft PR only after required verification; include acceptance criteria, evidence and exact tested commit.

<a id="f083"></a>

### F083 — Automatic pull-request review

**Definition:** A supported repository-triggered agent review rather than only asking a local chat to read a diff.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Separate review product/surface | [^CC00] |
| Codex | **Y** | Connected automatic cloud review | [^CX09] [^CX11] |
| OpenCode | **D** | External integration/CI | [^OC06] [^OC14] |
| Amp | **D** | Integration/plugin setup | [^AM08] |
| GitHub Copilot | **Y** | Copilot code review | [^GH04] |
| Antigravity | **D** | External integration required | [^AG04] [^AG01] |

**Reference winner:** GitHub Copilot / Codex. Both document automatic repository review surfaces with findings attached to the change.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Trigger on new PR revisions, deduplicate findings and withdraw stale comments after the relevant code changes.

<a id="f084"></a>

### F084 — Git worktree lifecycle

**Definition:** Creating and managing isolated working copies as a first-party execution concept.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Agent/session worktree support | [^CC02] |
| Codex | **Y** | Worktree creation and handoff | [^CX09] [^CX11] |
| OpenCode | **Y** | Worktree operations | [^OC06] [^OC14] |
| Amp | **D** | Separate orb copies; not identical Git semantics | [^AM05] |
| GitHub Copilot | **D** | App working-tree/cloud mode | [^GH08] |
| Antigravity | **Y** | Worktree mode | [^AG04] [^AG01] |

**Reference winner:** Codex. The handoff workflow explicitly addresses movement between local checkout and background worktrees.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Create, name, inspect and safely remove worktrees; never discard uncommitted changes without an explicit retention decision.

<a id="f085"></a>

### F085 — Move work between foreground and background checkout

**Definition:** Transferring a task and its code between isolated work and a primary working copy.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Session/worktree workflow | [^CC08] [^CC07] |
| Codex | **Y** | Local/worktree Handoff | [^CX09] [^CX11] |
| OpenCode | **D** | Worktree/session move APIs | [^OC06] [^OC14] |
| Amp | **Y** | Sync orb branch to local | [^AM08] |
| GitHub Copilot | **D** | Session/cloud workflow | [^GH04] |
| Antigravity | **D** | Worktree/review workflow | [^AG04] [^AG01] |

**Reference winner:** Codex. Handoff is a documented product workflow, including the Git constraints behind it.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Move or integrate patches with conflict checks; preserve session lineage and do not overwrite unrelated local edits.

<a id="f086"></a>

### F086 — Undo conversation and code together

**Definition:** Rewinding an agent turn with its recorded file edits.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Checkpoint scope limitations | [^CC08] [^CC07] |
| Codex | **D** | Git checkpoint workflow; full turn rollback unverified | [^CX00] |
| OpenCode | **Y** | Undo/redo snapshots with exclusions | [^OC06] [^OC14] |
| Amp | **U** | Equivalent atomic turn rollback unverified | Not established; related scope: [^AM08] |
| GitHub Copilot | **U** | Exact rollback scope not established | Not established; related scope: [^GH04] |
| Antigravity | **D** | Undo exists; scope must verify | [^AGREL] |

**Reference winner:** OpenCode. The documented snapshot scope and staged undo/redo model are explicit, including what cannot be restored.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Restore only owned edits after checking current hashes; show excluded files, shell effects and external actions that cannot be undone.

<a id="f087"></a>

### F087 — Multi-repository task context

**Definition:** A task can operate with more than one repository when authorized.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Additional directories/scopes | [^CC14] |
| Codex | **D** | Multi-repo cloud environment | [^CX10] |
| OpenCode | **D** | Locations/references and custom workflow | [^OC14] |
| Amp | **Y** | Cross-project agent delegation | [^AM05] |
| GitHub Copilot | **D** | Local directories; cloud scope varies | [^GH04] |
| Antigravity | **Y** | Multi-folder projects | [^AG00] |

**Reference winner:** Amp. Cross-project delegation makes independent repositories explicit work units; shared-context tasks still need careful access control.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Bind each repository to a revision, permission scope and owner; cross-repository changes produce an explicit integration plan.

<a id="f088"></a>

### F088 — Shipping review with human approval

**Definition:** The product offers a clear review step before an external repository write or deployment.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Permissions and connected workflow | [^CC20] |
| Codex | **D** | Review plus permissions | [^CX09] [^CX11] |
| OpenCode | **D** | Permission and VCS UI | [^OC06] [^OC14] |
| Amp | **Y** | Ship prompt and change review | [^AM08] |
| GitHub Copilot | **Y** | PR review workflow | [^GH04] |
| Antigravity | **D** | Artifact review/policy | [^AG04] [^AG01] |

**Reference winner:** Amp. The Ship action and editable shipping prompt make final delivery a concrete, reviewable operation.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Freeze the reviewed diff and destination; execute exactly the authorized revision and invalidate approval if the diff changes.

## 5.12. Enterprise and governance

Governance scores are documentation-based, not security certification. Plan, region, deployment and contract can change every result here.

<a id="f089"></a>

### F089 — Centrally managed configuration

**Definition:** Administrators can apply organization-controlled defaults or requirements.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Managed settings | [^CC20] |
| Codex | **Y** | Managed requirements and hooks | [^CX03] [^CX04] |
| OpenCode | **D** | Enterprise centralized config | [^OC17] |
| Amp | **Y** | Workspace/enterprise controls | [^AM09] |
| GitHub Copilot | **Y** | Managed policy and hooks | [^GH03] [^GH08] |
| Antigravity | **D** | Enterprise project/configuration | [^AG10] |

**Reference winner:** GitHub Copilot / Codex. Strong references for explicit administrator-owned execution requirements and separate user settings.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Define immutable policy requirements separately from user preferences; report effective values and their origin.

<a id="f090"></a>

### F090 — Organization model restrictions

**Definition:** Administrators can restrict which models or inference routes users can select.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Managed model configuration | [^CC16] |
| Codex | **D** | Managed model/provider settings | [^CX06] |
| OpenCode | **D** | Central gateway/configuration | [^OC17] |
| Amp | **Y** | Shared routing and personal-route restrictions | [^AM09] |
| GitHub Copilot | **Y** | Model policies by client | [^GH05] |
| Antigravity | **D** | Enterprise model/plan catalog | [^AG06] |

**Reference winner:** Amp / GitHub Copilot. Both document organization-level routing or model-policy controls that affect real client availability.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Restrict model IDs, endpoints and data locations centrally; users cannot bypass the restriction by defining a new alias.

<a id="f091"></a>

### F091 — Enterprise SSO and identity federation

**Definition:** Organization identity integration rather than individually managed consumer logins.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Enterprise account controls | [^CC20] |
| Codex | **D** | Workspace identity plan | [^CX03] [^CX04] |
| OpenCode | **D** | SSO/internal gateway deployment | [^OC17] |
| Amp | **D** | SAML/OIDC and enterprise options | [^AM09] |
| GitHub Copilot | **D** | GitHub organization/enterprise identity | [^GH03] [^GH08] |
| Antigravity | **Y** | SSO/BYOID/WIF | [^AG10] |

**Reference winner:** Antigravity. Its enterprise documentation exposes detailed identity and Google Cloud project flows.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Use the company identity provider, short-lived service credentials and explicit project membership; revoke executor access when membership ends.

<a id="f092"></a>

### F092 — Enterprise audit and activity visibility

**Definition:** Administrators can obtain activity records relevant to agent operations.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | OTel events | [^CC18] |
| Codex | **D** | Enterprise audit/telemetry integration | [^CX04] |
| OpenCode | **U** | Equivalent complete audit surface not verified | Not established; related scope: [^OC17] |
| Amp | **D** | Enterprise audit logs | [^AM09] |
| GitHub Copilot | **D** | Policy/hooks and platform audit scope | [^GH03] [^GH08] |
| Antigravity | **D** | Cloud project logging | [^AG10] |

**Reference winner:** Claude Code / GitHub Copilot. Claude documents runtime events in detail; Copilot connects managed controls to GitHub workflows. Neither implies complete content capture.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Audit actor, model, tool, resource, approval and result; redact sensitive payloads and provide export without requiring full transcripts.

<a id="f093"></a>

### F093 — Data residency and regional routing

**Definition:** Selecting an approved processing region through supported deployment/provider choices.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Provider and contract | [^CC16] |
| Codex | **D** | Provider/gateway and contract | [^CX06] |
| OpenCode | **D** | Internal gateway/provider deployment | [^OC17] |
| Amp | **D** | Regional enterprise endpoints | [^AM09] |
| GitHub Copilot | **D** | GitHub plan and provider restrictions | [^GH03] [^GH08] |
| Antigravity | **D** | Enterprise project/location | [^AG10] |

**Reference winner:** No universal winner. Residency is a deployment and contract property; a feature matrix cannot establish legal or technical coverage by itself.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Record storage and processing region separately per provider/tool; block routes that do not satisfy project policy.

<a id="f094"></a>

### F094 — Governed extension distribution

**Definition:** Admins can limit executable hooks, plugins or tool servers available to users.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Managed plugin/settings controls | [^CC20] |
| Codex | **Y** | Managed-only hooks | [^CX03] [^CX04] |
| OpenCode | **D** | Central config and package governance | [^OC17] |
| Amp | **Y** | Workspace plugins/MCP allowlists | [^AM09] |
| GitHub Copilot | **Y** | Policy hooks and org settings | [^GH03] [^GH08] |
| Antigravity | **D** | Enterprise policy/configuration | [^AG10] |

**Reference winner:** Codex / GitHub Copilot. Administrator-owned customization controls are explicit; verify that local additions cannot weaken them.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Maintain an approved extension catalog, pinned hashes and scoped capabilities; reject revoked components before starting a job.

<a id="f095"></a>

### F095 — Team cost attribution

**Definition:** Attributing consumption to a user, project or team rather than only one shared total.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Telemetry attributes | [^CC18] |
| Codex | **D** | Runtime events plus workspace reporting | [^CX05] |
| OpenCode | **D** | Gateway and API statistics | [^OC14] |
| Amp | **Y** | Workspace users/groups and threads | [^AM09] |
| GitHub Copilot | **D** | GitHub billing entity/usage | [^GH09] |
| Antigravity | **D** | Licensed Cloud project logging | [^AG10] |

**Reference winner:** Amp. Threads, pooled credits and enterprise reporting create a clear attribution model.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Tag every inference, tool call and executor minute with job, user, project and cost centre; reconcile to provider invoices.

<a id="f096"></a>

### F096 — Self-hosting the complete control plane

**Definition:** Running the product’s session service and execution controller inside the organization, not merely connecting to a gateway.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Local runtime; hosted services separate | [^CC20] |
| Codex | **D** | Open CLI/App Server; cloud proprietary | [^CX13] |
| OpenCode | **Y** | Local server and enterprise deployment | [^OC12] |
| Amp | **D** | Runners/self-hosted orbs; control-plane scope varies | [^AM09] |
| GitHub Copilot | **N** | Proprietary service; SDK not equivalent | [^GH11] |
| Antigravity | **D** | SDK/local agents; full service unverified | [^AG11] |

**Reference winner:** OpenCode. Strongest fit when control-plane ownership and provider independence are core requirements.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Document all outbound dependencies; run sessions, tools, policies and metadata locally with an explicit offline mode.

## 5.13. Observability, budgets and efficiency

Claude Code leads detailed local cost/cache telemetry; Amp connects cost to threads and infrastructure. Real efficiency requires same-task measurements.

<a id="f097"></a>

### F097 — Per-session usage display

**Definition:** Showing consumption for the current coding session.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Usage by model and session | [^CC11] [^CC18] |
| Codex | **Y** | Usage events | [^CX05] [^CX06] |
| OpenCode | **Y** | Session statistics | [^OC14] |
| Amp | **Y** | Per-thread price/details | [^AM09] |
| GitHub Copilot | **Y** | AI credit consumption | [^GH09] |
| Antigravity | **Y** | Usage/credits surfaces | [^AG06] [^AGREL] |

**Reference winner:** Claude Code / Amp. Claude provides detailed local usage; Amp ties spending to persistent thread objects.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Show tokens, cache reads/writes, provider charges and infrastructure cost; distinguish estimates from invoice-authoritative charges.

<a id="f098"></a>

### F098 — Cache hit and miss visibility

**Definition:** Making prompt-cache behavior visible instead of only reporting total token use.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Prompt-cache statistics | [^CC11] [^CC18] |
| Codex | **D** | Cached token events | [^CX05] [^CX06] |
| OpenCode | **U** | Equivalent hit/miss UI not established | Not established; related scope: [^OC14] |
| Amp | **D** | Usage details; exact miss UI recheck | [^AM09] |
| GitHub Copilot | **D** | Cached tokens affect credits | [^GH09] |
| Antigravity | **U** | Comparable cache diagnostics not established | Not established; related scope: [^AG06] [^AGREL] |

**Reference winner:** Claude Code. The documented usage display includes cache share, misses and expected rebuilds.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Track cacheable-prefix hashes and cache-read ratio; attribute expensive rebuilds to model switches, tool changes or compaction.

<a id="f099"></a>

### F099 — Hard per-run spending ceiling

**Definition:** Stopping an individual job at a configured spend limit.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | max-budget-usd in programmatic mode | [^CC17] |
| Codex | **U** | Equivalent universal dollar cap not established | Not established; related scope: [^CX05] [^CX06] |
| OpenCode | **U** | Native per-run dollar ceiling unverified | Not established; related scope: [^OC14] |
| Amp | **D** | Enterprise spend controls; per-run cap recheck | [^AM09] |
| GitHub Copilot | **D** | Account budget/allowance; per-run cap recheck | [^GH09] |
| Antigravity | **D** | Credits/limits; per-run dollar cap unverified | [^AG06] [^AGREL] |

**Reference winner:** Claude Code. A documented programmatic run budget is a concrete reference; model-priced estimates and billed charges can differ.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Reserve budget before launching workers, include retries and tools, and stop with a partial result before exceeding the hard ceiling.

<a id="f100"></a>

### F100 — Token and step budgets

**Definition:** Bounding worker or job resource use even when dollar pricing is unknown.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Worker maxTurns | [^CC15] |
| Codex | **D** | Context/output/runtime configuration | [^CX05] [^CX06] |
| OpenCode | **D** | Provider/context controls | [^OC02] |
| Amp | **D** | Plugin continuation limits | [^AM03] |
| GitHub Copilot | **D** | Client/runtime limits | [^GH09] |
| Antigravity | **D** | Schedule iterations/nesting limits | [^AG07] [^AG01] |

**Reference winner:** Claude Code. Explicit worker turn limits are a useful primitive; all budgets need to include subordinate work.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Enforce shared job-level token, tool-call, wall-clock and child-agent limits; report which limit caused termination.

<a id="f101"></a>

### F101 — Structured execution event stream

**Definition:** Exporting machine-readable lifecycle events for external monitoring.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Stream JSON and OTel | [^CC17] |
| Codex | **Y** | JSONL thread/turn/item events | [^CX05] [^CX06] |
| OpenCode | **Y** | Session/event API | [^OC14] |
| Amp | **D** | Streaming JSON/plugin events | [^AM03] |
| GitHub Copilot | **D** | SDK event integration | [^GH11] |
| Antigravity | **D** | SDK streaming/lifecycle | [^AG11] |

**Reference winner:** Codex. The documented event stream covers threads, turns, tool items, failures and usage.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Use a versioned event schema with sequence IDs, correlation IDs and timestamps; rebuild a task view from the stream.

<a id="f102"></a>

### F102 — OpenTelemetry export

**Definition:** Native documented export through the standard OpenTelemetry ecosystem.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Metrics/events/traces | [^CC11] [^CC18] |
| Codex | **D** | Configurable OTel integration | [^CX05] [^CX06] |
| OpenCode | **U** | Native standard export not established | Not established; related scope: [^OC14] |
| Amp | **D** | Custom plugin exporter | [^AM03] |
| GitHub Copilot | **D** | SDK/custom instrumentation | [^GH11] |
| Antigravity | **D** | Cloud logging; OTel parity unverified | [^AG10] |

**Reference winner:** Claude Code. Most directly documented standard telemetry path in the inspected sources.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Export spans for model/tool/worker calls with redacted attributes; sampling never removes cost totals or critical policy events.

<a id="f103"></a>

### F103 — Infrastructure cost visibility

**Definition:** Accounting for execution environments in addition to inference tokens.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Provider/cloud billing separate | [^CC11] [^CC18] |
| Codex | **D** | Cloud environment charges depend on plan | [^CX10] |
| OpenCode | **D** | Self-hosted costs external | [^OC14] |
| Amp | **Y** | Orb-minute billing explained | [^AM09] |
| GitHub Copilot | **D** | Cloud sandbox usage billing | [^GH08] |
| Antigravity | **D** | Cloud/enterprise pricing | [^AG06] [^AGREL] |

**Reference winner:** Amp. The product explicitly separates model/tool usage from environment minutes and idle pauses.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Display compute/storage/network spend beside model spend; stop idle environments and show the next expected billing unit.

<a id="f104"></a>

### F104 — Quality-adjusted cost comparison

**Definition:** A trustworthy comparison measures accepted task outcomes, not just the cheapest token price.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | External evaluation needed | [^CC11] [^CC18] |
| Codex | **D** | External evaluation needed | [^CX05] [^CX06] |
| OpenCode | **D** | External evaluation needed | [^OC14] |
| Amp | **D** | External evaluation needed | [^AM09] |
| GitHub Copilot | **D** | External evaluation needed | [^GH09] |
| Antigravity | **D** | External evaluation needed | [^AG06] [^AGREL] |

**Reference winner:** No vendor winner established. Documentation cannot prove which harness has the lowest cost per accepted change on gb8’s workloads.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Measure accepted tasks per pound, human intervention, latency and regressions on the same repositories, budgets and task set.

## 5.14. SDKs, protocols and embedding

Codex has a rich client protocol; OpenCode supports direct in-process hosting; Copilot offers a broad SDK language surface.

<a id="f105"></a>

### F105 — Official programmable agent SDK

**Definition:** Controlling the coding agent from an application rather than scraping a terminal interface.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Agent SDK | [^CC13] [^CC17] |
| Codex | **Y** | Codex SDK | [^CX02] [^CX12] |
| OpenCode | **Y** | Embedded host SDK | [^OC13] [^OC15] |
| Amp | **D** | Plugin/API integration; generic SDK maturity recheck | [^AM03] [^AM10] |
| GitHub Copilot | **Y** | Copilot SDK | [^GH11] |
| Antigravity | **Y** | Python SDK | [^AG11] |

**Reference winner:** Codex / OpenCode. Strongest references for embedding an existing coding runtime into a custom gb8 interface.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Expose start, prompt, steer, stop, resume and artifact APIs; no UI automation is required to drive the runtime.

<a id="f106"></a>

### F106 — Multiple SDK languages

**Definition:** Official language bindings cover more than one implementation language.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | TypeScript and Python | [^CC13] [^CC17] |
| Codex | **Y** | TypeScript and Python | [^CX02] [^CX12] |
| OpenCode | **D** | JavaScript/Effect APIs | [^OC13] [^OC15] |
| Amp | **D** | JS/TS plugin/API surface | [^AM03] [^AM10] |
| GitHub Copilot | **Y** | Python/TS/Go/.NET/Java/Rust | [^GH11] |
| Antigravity | **D** | Python SDK documented | [^AG11] |

**Reference winner:** GitHub Copilot. The inspected SDK repository exposes the broadest language list.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Publish one transport contract and generate bindings; acceptance fixtures run against every supported language binding.

<a id="f107"></a>

### F107 — Bidirectional custom-client protocol

**Definition:** A custom UI can stream events and reply to approvals or forms over a supported protocol.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | SDK streaming/control | [^CC13] [^CC17] |
| Codex | **Y** | App Server JSON-RPC | [^CX02] [^CX12] |
| OpenCode | **D** | Client/API; HTTP surface experimental | [^OC14] |
| Amp | **D** | Plugin/API integration | [^AM03] [^AM10] |
| GitHub Copilot | **Y** | CLI server JSON-RPC | [^GH11] |
| Antigravity | **D** | SDK and remote interfaces | [^AG11] |

**Reference winner:** Codex. App Server explicitly targets rich clients with authentication, history, approvals and streamed events.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Clients can reconnect, answer an outstanding approval and continue the same task without spawning a duplicate execution.

<a id="f108"></a>

### F108 — Headless command for CI

**Definition:** A supported command runs one task without an interactive terminal UI.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | claude -p | [^CC13] [^CC17] |
| Codex | **Y** | codex exec | [^CX05] |
| OpenCode | **Y** | opencode run | [^OC12] |
| Amp | **Y** | amp -x | [^AM08] |
| GitHub Copilot | **Y** | copilot -p | [^GH00] |
| Antigravity | **Y** | Headless mode | [^AG00] |

**Reference winner:** Codex. Explicit non-interactive safety, events and resume behavior make it a strong CI reference.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Define exit codes for success, failure, blocked, cancelled and budget exhausted; output machine events separately from human diagnostics.

<a id="f109"></a>

### F109 — Typed event and result schemas

**Definition:** Clients can consume structured events or results rather than parse prose for state.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | SDK/JSON schema output | [^CC13] [^CC17] |
| Codex | **Y** | Generated protocol schemas | [^CX02] [^CX12] |
| OpenCode | **Y** | Generated API/client contracts | [^OC13] [^OC15] |
| Amp | **D** | Plugin schemas and streaming | [^AM03] [^AM10] |
| GitHub Copilot | **Y** | SDK data contracts | [^GH11] |
| Antigravity | **D** | Structured output in SDK | [^AG11] |

**Reference winner:** Codex. Version-specific schema generation is especially useful for durable client integrations.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Validate every event and result against a schema; unknown fields remain forward-compatible and schema versions are explicit.

<a id="f110"></a>

### F110 — ACP editor protocol

**Definition:** A documented Agent Client Protocol adapter lets editors connect without a custom vendor extension.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **U** | Current first-party ACP not verified | Not established; related scope: [^CC13] [^CC17] |
| Codex | **U** | Current first-party ACP not verified | Not established; related scope: [^CX02] [^CX12] |
| OpenCode | **Y** | ACP adapter | [^OC16] |
| Amp | **U** | First-party ACP not verified | Not established; related scope: [^AM03] [^AM10] |
| GitHub Copilot | **Y** | ACP supported | [^GH00] |
| Antigravity | **U** | First-party ACP not verified | Not established; related scope: [^AG11] |

**Reference winner:** OpenCode / GitHub Copilot. These inspected docs explicitly expose ACP; lack of verification for others is not a claim that no adapter exists.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Offer ACP as a thin adapter over the same session engine, preserving permissions, cancellations and artifact references.

<a id="f111"></a>

### F111 — Direct in-process runtime embedding

**Definition:** Hosting the agent server within the application without an external HTTP listener or CLI subprocess.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | SDK runtime implementation differs | [^CC13] [^CC17] |
| Codex | **N** | Documented SDK uses runtime/process interfaces | [^CX02] [^CX12] |
| OpenCode | **Y** | Embedded host uses in-memory router | [^OC13] [^OC15] |
| Amp | **N** | Plugin code is not full runtime embedding | [^AM03] [^AM10] |
| GitHub Copilot | **N** | SDK communicates with CLI server | [^GH11] |
| Antigravity | **D** | SDK manages local agent runtime | [^AG11] |

**Reference winner:** OpenCode. The embedded SDK explicitly states no HTTP listener or network hop between its client and host.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Make engine lifecycle and resource ownership explicit; closing an embedded host cancels tasks and releases all child processes.

<a id="f112"></a>

### F112 — Expose the agent as an MCP server

**Definition:** A supported first-party server interface wraps the coding agent for another orchestrator.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **U** | Current supported server mode not verified | Not established; related scope: [^CC13] [^CC17] |
| Codex | **N** | codex mcp-server removed | [^CX02] [^CX12] |
| OpenCode | **D** | MCP tools/client distinct from agent-server wrapper | [^OC13] [^OC15] |
| Amp | **D** | Plugin/custom wrapper required | [^AM03] [^AM10] |
| GitHub Copilot | **D** | SDK/custom wrapper required | [^GH11] |
| Antigravity | **D** | SDK/custom wrapper required | [^AG11] |

**Reference winner:** No verified native winner. Do not copy obsolete Codex MCP-server examples; a dedicated client protocol may provide richer control than MCP.

**gb8:** not audited · **P3** candidate. **Acceptance target:** If required, expose bounded job operations with IDs and cancellation; keep approvals and streaming semantics explicit.

## 5.15. Interaction, collaboration and supervision

Amp leads shared human work inside an agent thread; Antigravity leads visual artifact supervision. These are different from parallel agents.

<a id="f113"></a>

### F113 — Concurrent human collaboration in one agent thread

**Definition:** Several people can actively prompt the same session, rather than merely share a transcript link.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **U** | Equivalent multiplayer semantics not verified | Not established; related scope: [^CC07] [^CC14] |
| Codex | **U** | Equivalent multiplayer semantics not verified | Not established; related scope: [^CX00] [^CX02] |
| OpenCode | **U** | Equivalent built-in multiplayer not verified | Not established; related scope: [^OC12] [^OC14] |
| Amp | **Y** | Multiplayer orbs/shared runners | [^AM07] [^AM08] |
| GitHub Copilot | **D** | Shared repo sessions; simultaneous prompting varies | [^GH04] |
| Antigravity | **U** | Equivalent multiplayer semantics not verified | Not established; related scope: [^AG04] [^AGREL] |

**Reference winner:** Amp. Explicit multiplayer semantics, environment access and billing ownership are documented.

**gb8:** not audited · **P3** candidate. **Acceptance target:** Identify every human author, serialize conflicting instructions and show the access implications before enabling shared control.

<a id="f114"></a>

### F114 — Shareable session evidence

**Definition:** Sharing enough session context for another person to understand what happened.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Session/remote sharing | [^CC07] [^CC14] |
| Codex | **D** | App/history/provider permissions | [^CX00] [^CX02] |
| OpenCode | **D** | Export/import/session API | [^OC12] [^OC14] |
| Amp | **Y** | Shared thread URLs | [^AM07] [^AM08] |
| GitHub Copilot | **Y** | Session logs and PR linkage | [^GH04] |
| Antigravity | **D** | Artifacts and remote access | [^AG04] [^AGREL] |

**Reference winner:** Amp. Persistent threads are directly referenceable and reusable across clients and teammates.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Export a redacted evidence bundle containing goal, decisions, diffs, tests and source references without disclosing credentials.

<a id="f115"></a>

### F115 — Global activity dashboard

**Definition:** A surface aggregates several ongoing or completed agent tasks.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Agent/session management | [^CC00] |
| Codex | **Y** | Multi-chat/worker client views | [^CX01] |
| OpenCode | **D** | Session list and active APIs | [^OC12] [^OC14] |
| Amp | **Y** | Activity feed, labels and filters | [^AM07] [^AM08] |
| GitHub Copilot | **Y** | Agents/session surfaces | [^GH04] |
| Antigravity | **Y** | Agent and conversation overview | [^AG04] [^AGREL] |

**Reference winner:** Amp. Activity filters, project grouping and thread labels provide a strong reference for long-running work.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Show active, blocked and recently finished jobs across projects, including owner, age, cost and next required action.

<a id="f116"></a>

### F116 — Human questions without blocking text composition

**Definition:** An outstanding question or approval remains visible while the user can draft follow-up instructions.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Client UX varies | [^CC07] [^CC14] |
| Codex | **D** | Client UX varies | [^CX00] [^CX02] |
| OpenCode | **D** | Forms supported; exact UX varies | [^OCREL] |
| Amp | **D** | Plugin/conversation UI | [^AM07] [^AM08] |
| GitHub Copilot | **D** | Client UX varies | [^GH04] |
| Antigravity | **Y** | Docked prompts in current App release | [^AG04] [^AGREL] |

**Reference winner:** Antigravity. The current release explicitly improves docked question and permission prompts while preserving the composer.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Separate composer state from approval forms; drafts survive incoming events, reconnection and changes of selected task.

<a id="f117"></a>

### F117 — Notifications when work needs attention

**Definition:** A supported notification informs the user of completion or required input.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Terminal/remote client | [^CC07] [^CC14] |
| Codex | **D** | Client/event integration | [^CX00] [^CX02] |
| OpenCode | **D** | Client or plugin integration | [^OC12] [^OC14] |
| Amp | **Y** | Cross-client notifications | [^AM00] |
| GitHub Copilot | **D** | Surface-specific notifications | [^GH04] |
| Antigravity | **Y** | Notification settings/current release | [^AG04] [^AGREL] |

**Reference winner:** Amp / Antigravity. Both emphasize unattended supervision and actionable return-to-task cues.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Notify only on meaningful state changes, include a deep link and distinguish blocked, failed and complete; respect quiet hours.

<a id="f118"></a>

### F118 — Search, label and organize previous work

**Definition:** Finding sessions by project, task status or semantic/contextual clues.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Named/resumable sessions | [^CC07] [^CC14] |
| Codex | **D** | Client/thread history | [^CX00] [^CX02] |
| OpenCode | **D** | Session API/filtering | [^OC12] [^OC14] |
| Amp | **Y** | Search, labels and saved filters | [^AM07] [^AM08] |
| GitHub Copilot | **D** | Synced history and session logs | [^GH04] |
| Antigravity | **Y** | Conversation filters/search | [^AG04] [^AGREL] |

**Reference winner:** Amp. Strongest explicit organization model in the inspected documentation.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Support labels, archive, full-text search and links between related jobs; respect access restrictions in search results.

<a id="f119"></a>

### F119 — Artifact comments steer implementation

**Definition:** Review feedback is anchored to a particular plan or result and fed back into agent execution.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Plan/plugin feedback | [^CC07] [^CC14] |
| Codex | **D** | Client/review workflow | [^CX11] |
| OpenCode | **D** | Custom client implementation | [^OC12] [^OC14] |
| Amp | **D** | Changes/plugin UI | [^AM07] [^AM08] |
| GitHub Copilot | **D** | Review comments and browser feedback | [^GH12] |
| Antigravity | **Y** | Inline artifact feedback | [^AG04] [^AGREL] |

**Reference winner:** Antigravity. Artifact review is an explicit collaboration mechanism rather than an informal chat convention.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Anchor feedback to artifact revision and range; the agent marks it addressed only after linking a corresponding change or explanation.

<a id="f120"></a>

### F120 — Voice or video collaboration around agent work

**Definition:** The product integrates voice input or human voice/video discussion into its work surface.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Client-specific voice | [^CC07] [^CC14] |
| Codex | **D** | Desktop voice surface | [^CX00] [^CX02] |
| OpenCode | **D** | Voice API availability | [^OC14] |
| Amp | **Y** | Thread Space voice/video/screen sharing | [^AM07] [^AM08] |
| GitHub Copilot | **U** | Comparable built-in thread calls not verified | Not established; related scope: [^GH04] |
| Antigravity | **D** | Voice command | [^AG00] |

**Reference winner:** Amp. A thread-attached call and screen-sharing space is a distinctive team workflow.

**gb8:** not audited · **P3** candidate. **Acceptance target:** Only add this after core execution reliability; make recording, transcription and participant consent explicit product choices.

## 5.16. Verification, recovery and evaluation

No documentation-based feature matrix proves coding quality. Build a separate evaluation layer and verify recovery semantics on gb8 workloads.

<a id="f121"></a>

### F121 — Run existing tests after edits

**Definition:** The harness can invoke project tests and use the results to refine a change.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Tests via shell | [^CC08] [^CC15] |
| Codex | **Y** | Tests via execution | [^CX05] [^CX11] |
| OpenCode | **Y** | Tests via shell | [^OC06] [^OC11] |
| Amp | **Y** | Test tools/shell | [^AM01] |
| GitHub Copilot | **Y** | Local/cloud tests | [^GH00] [^GH04] |
| Antigravity | **Y** | Tool and browser verification | [^AG04] [^AGREL] |

**Reference winner:** Tie — all six. The capability is universal; test selection and correctness are model/task dependent.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Record the exact test command and exit code against the tested diff; do not mark a task verified if no relevant check ran.

<a id="f122"></a>

### F122 — Independent review worker

**Definition:** A distinct worker reviews a proposed change rather than having only the implementing context self-review.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **Y** | Reviewer subagent | [^CC02] |
| Codex | **D** | Review task/subagent | [^CX05] [^CX11] |
| OpenCode | **Y** | Reviewer agent | [^OC01] |
| Amp | **Y** | Reviewing Task role | [^AM02] |
| GitHub Copilot | **Y** | Code-review agent | [^GH02] |
| Antigravity | **Y** | Custom reviewer | [^AG01] |

**Reference winner:** Claude Code / GitHub Copilot. Both expose clear review roles; independence requires a separate brief and access to the intended behavior, not only the implementation.

**gb8:** not audited · **P1** candidate. **Acceptance target:** Reviewer receives requirements, diff and checks; it cannot edit silently and must justify findings with reproducible evidence.

<a id="f123"></a>

### F123 — Tie evidence to the final revision

**Definition:** Tests or screenshots remain valid only if they apply to the final code revision.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Workflow policy required | [^CC08] [^CC15] |
| Codex | **D** | Workflow policy required | [^CX05] [^CX11] |
| OpenCode | **D** | Workflow policy required | [^OC06] [^OC11] |
| Amp | **D** | Workflow policy required | [^AM01] |
| GitHub Copilot | **D** | CI/PR revision linkage | [^GH00] [^GH04] |
| Antigravity | **D** | Artifact policy required | [^AG04] [^AGREL] |

**Reference winner:** GitHub Copilot. GitHub-native checks and PR revisions provide useful provenance primitives; the agent still must not misrepresent them.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Hash the working diff or commit for every check; any later source edit invalidates affected evidence until rerun.

<a id="f124"></a>

### F124 — Useful partial result on interruption

**Definition:** Returning completed work and unresolved obligations when a task is cancelled or reaches a limit.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Partial workers/resume | [^CC02] |
| Codex | **D** | Turn failures and resume | [^CX05] [^CX11] |
| OpenCode | **D** | Snapshot/session state | [^OC06] [^OC11] |
| Amp | **D** | Thread state and summaries | [^AM01] |
| GitHub Copilot | **D** | Session logs and resume | [^GH00] [^GH04] |
| Antigravity | **D** | Persisted logs and task state | [^AG01] |

**Reference winner:** Claude Code / Codex. Documented partial worker and execution-event behavior provide useful primitives; task-level completeness still needs an explicit contract.

**gb8:** not audited · **P0** candidate. **Acceptance target:** On cancellation, emit changed files, completed checks, running processes and next steps; never present partial work as finished.

<a id="f125"></a>

### F125 — Recover from context overflow

**Definition:** A too-large prompt triggers controlled compaction or a useful recoverable error.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Auto-compaction/session behavior | [^CC07] |
| Codex | **D** | Compaction/provider compatibility | [^CX06] |
| OpenCode | **Y** | Overflow recovery and current fixes | [^OC04] [^OCREL] |
| Amp | **D** | Thread/worker compaction | [^AM02] |
| GitHub Copilot | **D** | Automatic context management | [^GH00] |
| Antigravity | **D** | Compact support | [^AGREL] |

**Reference winner:** OpenCode. Recent release notes and configurable compaction expose concrete recovery behavior; summary fidelity still needs evaluation.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Inject an oversized tool result in a fixture; retain the task goal and continue without dropping pending actions or corrupting the transcript.

<a id="f126"></a>

### F126 — Recover from network interruption

**Definition:** Transient transport failures do not silently truncate a result or duplicate execution.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **D** | Remote reconnect behavior | [^CC14] |
| Codex | **D** | Provider retry settings | [^CX06] |
| OpenCode | **D** | Service/client reconnect behavior | [^OC12] |
| Amp | **D** | Persistent thread/client connection | [^AM08] |
| GitHub Copilot | **D** | Current reconnect fixes | [^GHREL] |
| Antigravity | **D** | Current retry fixes | [^AGREL] |

**Reference winner:** No tested reliability winner. Release notes document fixes, not comparative failure rates or exactly-once execution.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Simulate disconnects before and after a tool write; reconcile state and recover the complete event stream with no repeated side effect.

<a id="f127"></a>

### F127 — Deterministic replay of an entire agent run

**Definition:** Recreating the same decisions and side effects from a stored run, rather than merely rereading its transcript.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **U** | Not established | Not established; related scope: [^CC08] [^CC15] |
| Codex | **U** | Not established | Not established; related scope: [^CX05] [^CX11] |
| OpenCode | **U** | Not established | Not established; related scope: [^OC06] [^OC11] |
| Amp | **U** | Not established | Not established; related scope: [^AM01] |
| GitHub Copilot | **U** | Not established | Not established; related scope: [^GH00] [^GH04] |
| Antigravity | **U** | Not established | Not established; related scope: [^AG04] [^AGREL] |

**Reference winner:** No verified winner. Stochastic models, evolving remote tools and external state make full replay a much stronger claim than session persistence.

**gb8:** not audited · **P2** candidate. **Acceptance target:** Offer deterministic replay of recorded events and mocked tool results; label live re-execution separately and require new authorization.

<a id="f128"></a>

### F128 — Comparable harness benchmark with current flagship models

**Definition:** An independent evaluation runs all six latest harnesses with declared models, versions and budgets.

| Harness | Support | Scope / condition | Evidence |
|---|:---:|---|---|
| Claude Code | **U** | No complete matched evaluation verified | Not established; related scope: [^CC08] [^CC15] |
| Codex | **U** | No complete matched evaluation verified | Not established; related scope: [^CX05] [^CX11] |
| OpenCode | **U** | No complete matched evaluation verified | Not established; related scope: [^OC06] [^OC11] |
| Amp | **U** | No complete matched evaluation verified | Not established; related scope: [^AM01] |
| GitHub Copilot | **U** | No complete matched evaluation verified | Not established; related scope: [^GH00] [^GH04] |
| Antigravity | **U** | No complete matched evaluation verified | Not established; related scope: [^AG04] [^AGREL] |

**Reference winner:** No verified winner. Do not turn model benchmark results or mixed SWE-bench splits into a six-harness performance ranking.

**gb8:** not audited · **P0** candidate. **Acceptance target:** Maintain a private task set with held-out acceptance tests; pin harness/model versions and report uncertainty, cost and human intervention.

## 6. gb8 implementation roadmap

### 6.1 Product recommendation

**Own the controller, session model, permissions, evidence and evaluation loop. Keep model/provider adapters replaceable.** Decide separately whether to reuse an external execution engine through an SDK or to implement the engine yourself. Building a custom interface around a mature engine and building a complete new harness are different investments.

The best gb8 differentiator is an agent that **finishes verifiable work predictably at a known cost**. Broad feature parity matters less than reducing retries, lost context, untracked side effects and human rescue work.

### 6.2 Audit before implementation

For every candidate, first classify gb8 as `not_audited`, `missing`, `prototype`, `partial`, `implemented`, `validated` or `retired`. Implemented means code exists; validated means a reproducible acceptance scenario passed on the recorded build. Keep these states separate from the competitors’ Y/N/D/U statuses.

Audit inputs:

- Repository and current commit, application and engine versions, platform and deployment topology.
- Provider interfaces, actual model IDs, supported protocols, default context and effort.
- Tool registry and schemas, permissions, process lifecycle, event transport and state storage.
- Existing skill/agent files, scheduler/watchers, retry rules, budgets and logs.
- UI-to-runtime mapping: which behaviors belong to g3po, gb8 or an external service.
- Current test/evaluation results, especially cancellation, context overflow and uncertain external actions.

### 6.3 Ordered engineering epics

Effort is a proposed relative size for an existing functioning harness: **S** is roughly a few focused days, **M** a focused sprint, **L** multiple sprints. Actual effort depends on current architecture and audit findings. These are planning estimates, not a delivery promise.

| Epic | Priority | Feature IDs | Reference | Size | Dependency | Concrete acceptance gate |
|---|---|---|---|---|---|---|
| R01 Audit and reproducible baseline | First | F001–F128, F128 | All | S | None | Publish gb8 capability inventory, commit and 12-task baseline; separate unknown from missing. |
| R02 Versioned event ledger | P0 | F037, F049, F101, F107 | Codex / OpenCode | M | R01 | Replay stored events into the UI and recover identical task state; no duplicate event IDs. |
| R03 Provider capability contract | P0 | F009–F016 | OpenCode / Amp | M | R01 | Two providers pass streaming, tools, cancellation and usage fixtures through the same interface. |
| R04 Tool execution contract | P0 | F025–F032 | All / OpenCode | M | R02 | Every tool returns typed success/error/cancel/timeout plus resource and evidence IDs. |
| R05 Permission and sandbox boundary | P0 | F041, F043, F073–F080 | Codex / Copilot | L | R04 | Denied paths/network/actions remain denied through shell, file tools, MCP and custom tools. |
| R06 Cost accounting and reservations | P0 | F097–F104 | Claude Code / Amp | M | R02, R03 | Main agent, workers, retries, tools and compute reconcile; budget stops produce partial results. |
| R07 Context and compaction state | P0 | F017–F024, F125 | Claude Code / OpenCode | M | R02, R03 | Long-context fixtures preserve goals, decisions, evidence and pending operations after compaction. |
| R08 Durable jobs and action ledger | P0 | F049–F056, F124, F126 | Amp / Codex | L | R02, R04 | Crash after uncertain remote write reconciles state before retry; no duplicate external action. |
| R09 Bounded specialist workers | P1 | F013, F041–F048 | Claude Code / Antigravity | M | R05–R08 | Parallel research and implementation workers have separate context, budgets and controlled tools. |
| R10 Worktree ownership and integration | P1 | F047, F084–F086 | Codex / Antigravity | M | R08, R09 | Write workers cannot collide silently; integration reports conflicts and preserves local user edits. |
| R11 Skills and lifecycle extensions | P1 | F057–F064 | Claude Code / OpenCode | M | R04, R05 | On-demand skills and versioned hooks work with a trust gate, timeout and rollback. |
| R12 Evidence-based completion | P0/P1 | F033–F040, F121–F128 | Antigravity / Copilot | M | R02, R04 | A job cannot become verified after an untested edit; final report links acceptance criteria to evidence. |
| R13 Reviewer workers and quality gates | P1 | F082, F083, F122, F123 | Copilot / Codex | M | R09, R12 | Reviewer finds seeded defects without mirroring implementation; findings tie to final revision. |
| R14 Scheduler and event subscriptions | P1 | F052–F055 | Amp / Claude Code | M | R06, R08 | Repeating jobs survive restart, use timezone-aware next-run state and deduplicate webhooks. |
| R15 Browser verification adapter | P1/P2 | F065–F072 | Antigravity / Copilot | M | R05, R12 | Validate one authenticated and one isolated test flow with screenshots and safe account boundaries. |
| R16 Thin UI and external protocol | P2 | F003–F005, F105–F112 | Codex / OpenCode | L | R02, R08 | Desktop/web client reconnects to the same executor; approvals and drafts survive disconnection. |
| R17 Project and team policy | P2 | F089–F096 | Copilot / Antigravity | L | R05, R06 | Centrally managed restrictions cannot be weakened by user/project configuration. |
| R18 Human collaboration | P3 | F113–F120 | Amp | L | R16, R17 | Multiple humans have explicit access, identity and conflicting-instruction handling. |
| R19 Advanced agent teams | P3 | F044–F048 | Claude Code / Antigravity | L | R09, R10, R12 | Shared work graph remains consistent during worker failure, replanning and cancellation. |
| R20 Optional visual assets/voice | P3 | F071, F120 | Amp / Antigravity | M | Core reliability | Demonstrate a measurable workflow benefit before adding ongoing complexity or spend. |

Feature-level P0 labels identify important engineering characteristics, not a mandate to implement dozens of independent projects immediately. The epics above combine them into delivery units. An audit can close an epic by proving it already works.

### 6.4 Suggested delivery sequence

**Stage 0 — establish truth.** Audit the current implementation and collect baseline traces. Choose three representative workflows: a focused bug fix, a repository-level refactor and a UI change. Agree what constitutes an accepted change. Output: a capability inventory and an evidence-backed starting scorecard.

**Stage 1 — make one agent dependable.** Deliver the event ledger, provider/tool contracts, cancellation, budgets and explicit execution boundaries. Add compaction and safe resume. Output: a single agent can complete a medium task, survive interruption and account for its spend. Do not add a swarm to compensate for an unreliable single-agent loop.

**Stage 2 — make verification decisive.** Add final-revision evidence, an independent reviewer and a clear definition of done. Deliver a worktree implementation path and two bounded worker types: read-only investigator and isolated implementer. Output: fewer human rescues and fewer unverified “done” messages on the baseline tasks.

**Stage 3 — make work persistent.** Add durable schedules, subscriptions, controlled wakeups and remote executor reconnection. Output: an unattended job wakes, works within budget, records results and stops or requests help for a concrete reason.

**Stage 4 — make supervision pleasant.** Add an activity dashboard, visual artifacts, browser verification and editor/mobile surfaces. Add multiplayer and elaborate agent teams only if the earlier stages demonstrate a bottleneck they resolve.

### 6.5 Engine architecture to target

These are proposed gb8 design decisions, not claims about proprietary internals.

| Component | Responsibilities | Key invariant |
|---|---|---|
| Session service | Conversation history, instruction provenance, decisions, summaries and artifact links | UI sessions are views over durable state; losing a window loses no accepted work. |
| Job controller | Work graph, state machine, dependencies, worker lifecycle and completion gates | A job has one authoritative state transition history. |
| Provider router | Model capabilities, gateway credentials, routing policy and usage normalization | Every inference identifies its real model, route and funding source. |
| Tool broker | Input validation, permission evaluation, execution, output limits and evidence capture | No tool bypasses authorization because it is called by another tool or worker. |
| Executor pool | Local, worktree, container and remote compute | Execution location and isolation strength are explicit. |
| Action ledger | External side effects, idempotency and reconciliation | An uncertain action is reconciled before it can be retried. |
| Context manager | Exact recent context, durable facts, summaries and retrieval | Summaries never grant authority or silently replace source evidence. |
| Budget controller | Reservations, parent/child quotas, pricing and exhaustion behavior | Worker fan-out cannot create unbounded spend outside the parent budget. |
| Evidence store | Logs, test results, screenshots, reviewer findings and revision hashes | Verification evidence is bound to the code it tested. |
| Scheduler/event gateway | Timers, recurrence, signatures, deduplication and wakeups | Delivery and execution are separate, auditable operations. |
| Policy service | User/project/organization requirements and trust decisions | Less-trusted scopes cannot weaken enforced requirements. |
| Protocol adapters | UI, CLI, SDK, ACP or other transports | One execution engine; each client reports unsupported capabilities explicitly. |

**Recommended state machine:** queued → preparing → running → verifying → completed. Side states are blocked, paused, failed and cancelled. A transition back to running after verification requires invalidating affected evidence. “Needs human input” is a blocked reason, not success. A disconnected UI is a connectivity state, not a job state.

### 6.6 Practical context and routing policy

- Start with one reliable default model and a fast read-only worker. Add a deep reasoning role only when evaluation shows it helps.
- Route at stable boundaries: session creation, a new worker or a deliberate escalation. Switching a long main conversation can destroy cache savings.
- Keep repository instructions concise. Load skills and tool descriptions progressively. Persist full logs outside the model’s prompt.
- Compaction retains the goal, constraints, authorization, decisions, current revision, evidence and unfinished actions. Keep a bounded recent verbatim window.
- Store durable facts separately from task state. Facts need provenance and expiry/revalidation; the event ledger is the authority for execution state.
- Escalate on evidence: repeated failed hypothesis, ambiguous architecture or failed independent checks. “Task seems hard” alone is not an unlimited-spend policy.
- Worker output is a finding or patch, not a new user instruction. The parent must validate it against the task and policy.
- Measure cache behavior before enlarging context windows or increasing worker counts. A higher token ceiling is not a context-management strategy.

### 6.7 Success measures for gb8

| Measure | Definition | Why it matters |
|---|---|---|
| Accepted-task rate | Tasks passing independent acceptance checks and human review divided by attempted tasks | Measures completed useful work. |
| Cost per accepted task | All inference, tools and compute costs divided by accepted tasks | Includes failed runs and retries. |
| Human rescue minutes | Time spent unblocking, restating context, correcting tools or salvaging work | Captures the burden hidden by pass rates. |
| First-pass verification | Tasks accepted without an additional user-requested repair round | Indicates dependable completion. |
| Evidence freshness | Verified tasks with evidence matching the final revision | Detects false completion. |
| Recovery correctness | Injected crashes/disconnects recovered without data loss or duplicate side effects | Tests durable execution claims. |
| Compaction retention | Required constraints and obligations preserved through forced summaries | Tests long-running continuity. |
| Policy enforcement | Prohibited fixture actions blocked through every tested path | Tests real boundaries, not persuasive prompts. |
| Cache-read ratio | Cached input divided by total eligible input, with provider semantics normalized | Helps explain cost changes. |
| Delegation benefit | Change in accepted-task cost, latency and rescue time with workers enabled | Avoids adding agents merely to create activity. |

Do not use lines generated, number of tool calls or PR count alone as success measures. They can increase while useful output and maintainability decline.

## 7. Evaluation plan before trusting the winners

### 7.1 Initial pilot

Start with **12 representative tasks**, using two configurations and two runs each: 48 runs. One configuration is current gb8; the other is a chosen reference harness available through approved access. Fix the model, effort and budget when isolating harness behavior. In a separate experiment, allow each harness its best supported model to compare the complete product experience. Never merge the two questions into one leaderboard.

The larger follow-up can use 30 tasks, six products and two runs: 360 runs. Set a total spend ceiling first. These are proposed experiments; **none were run for this document**.

### 7.2 Task families

| Task family | Example acceptance scenario | Failure to look for |
|---|---|---|
| Focused bug repair | Fix a regression with held-out normal and boundary tests | A patch that only satisfies visible examples. |
| Medium refactor | Move behavior across modules without changing public contracts | Lost edge behavior, unnecessary rewrites. |
| Repository-scale change | Apply an API migration across many consumers | Missed call sites or invalid task decomposition. |
| UI implementation | Implement a change and validate desktop/mobile behavior | Attractive screenshot with broken interactions. |
| Environment repair | Diagnose a deterministic build failure | Disabling checks or changing unrelated dependencies. |
| Long-context continuation | Force compaction after important constraints and decisions | Forgotten scope, budgets or unresolved work. |
| Parallel implementation | Two workers change independent modules with a shared dependency | Conflicting edits or falsely claimed integration. |
| Reviewer challenge | Seed several real defects and several tempting false positives | Noisy review or a reviewer copying the implementation’s assumptions. |
| Untrusted input | A repository/document tries to request an unauthorized external action | Treating tool output as authority. |
| Crash after side effect | Drop the connection immediately after a simulated remote write | Duplicate action or silent loss of completion state. |
| Budget exhaustion | Exhaust a shared parent/worker quota mid-task | Unbounded fan-out or missing partial results. |
| Windows/platform behavior | Run paths, subprocesses, cancellation and isolation fixtures | Platform-specific silent degradation. |

Use sandbox services and synthetic credentials for failure injection. Hold acceptance tests outside the agent workspace where possible. Review semantic correctness, not only exit codes.

### 7.3 Required run manifest

Record: task ID and revision; repository/base commit; harness product/version; surface; OS/executor; model/provider/effort; context limit; budgets; instructions/skills/plugins and hashes; tool permissions; network policy; initial prompt; start/end time; complete usage; artifact/evidence IDs; final patch/commit; acceptance verdict; interventions; failure classification.

Report uncertainty and repeated-run variation. A one-task win or a tiny score gap does not establish a reliable superiority claim. Do not mix SWE-bench Verified, Pro V1, Pro V2, Multilingual, Mobile or Terminal-Bench percentages. Model-only results cannot be assigned to a harness that did not run them.

## 8. Website handoff specification

### 8.1 Content structure

Build the eventual website from this document; do not invent extra current-product claims. Preserve feature IDs and source IDs as stable keys. Keep the complete detailed records available even if the default view is compact.

Required views:

1. **Overview:** overall editorial winner, alternative winners, research date and visible methodology qualifier.
2. **Mega matrix:** all 128 features, six competitors, common-to-all status, winner and gb8 audit/roadmap priority.
3. **Feature detail:** definition, six qualified support statements, evidence links, winner rationale and gb8 acceptance target.
4. **Harness profile:** surfaces, version baseline, strengths, limitations, feature distribution and evidence gaps.
5. **gb8 roadmap:** audit status, priority, engineering epics, dependencies and acceptance gates.
6. **Evidence/update centre:** source registry, version history, stale claims and open verification questions.

### 8.2 Interaction requirements

- Search by feature, term, product, source or ID.
- Filter category, Y/N/D/U, common-to-all, winner, priority, implementation state, preview and evidence confidence.
- Compare a selected pair without removing the full matrix view.
- Freeze feature and product headers; support horizontal scrolling and a mobile card layout.
- Show conditional support as a short badge plus an expandable explanation. Never reduce D to a green tick.
- Give U a neutral visual style and an explicit “not verified” label. Exclude it from support percentages unless the user chooses a stated assumption.
- Show the actual relevant surface next to a capability: CLI, IDE, app, cloud, SDK or custom extension.
- Let readers toggle **documented support** versus **editorial reference winner**. These answer different questions.
- Show roadmap dependencies and whether an item is absent, partial or simply unaudited in gb8.
- Make weights editable. Recalculate editorial fit from the published rating matrix, but never relabel it as benchmark accuracy.
- Keep citations one click away from a cell or detailed record; show the checked date and source title.
- Display a “changed since previous snapshot” view when later versions exist. Do not imply changes before a comparison is actually performed.
- Include export of filtered Markdown/CSV/JSON if useful, while preserving qualifiers and source IDs.
- Include keyboard access, clear text labels and accessible colors. Tooltips must not be the only way to read a qualification.

### 8.3 Suggested normalized data model

```json
{
  "schema_version": 1,
  "snapshot_date": "2026-10-26",
  "feature": {
    "id": "F001",
    "category_id": "A",
    "title": "Interactive terminal agent",
    "definition": "A first-party conversational terminal interface.",
    "support": {
      "claude-code": {
        "status": "Y",
        "surface": ["cli"],
        "condition": "Documented terminal CLI",
        "maturity": "not_separately_audited",
        "evidence_type": "official_documentation",
        "source_ids": ["CC00"],
        "checked_at": "2026-10-26",
        "tested_version": null
      }
    },
    "winner": {
      "products": ["claude-code", "codex", "opencode", "amp", "github-copilot", "antigravity"],
      "kind": "tie",
      "basis": "editorial_documented_reference",
      "reason": "Terminal access is baseline capability."
    },
    "gb8": {
      "status": "not_audited",
      "priority": "P0",
      "implementation_evidence": [],
      "acceptance_target": "A repository session supports cancellation and transcript persistence."
    }
  }
}
```

This is a **schema example**, not a second authoritative feature dataset. Parse the detailed feature records as the content source. Do not infer feature maturity from a Y; most rows have not been separately maturity-audited. For a live implementation, split support, availability, maturity, surface and evidence confidence into separate fields.

## 9. Maintenance protocol

### 9.1 Updating this document

Keep this Markdown as the canonical editable reference. Update its existing file identity when possible; do not create divergent copies unless explicitly requested. Preserve feature IDs and source IDs. Increment the document version and research date only after the relevant checks are complete.

For each update:

1. Read the current document and any gb8 feature inventory; do not rely on earlier chat summaries.
2. Check release tracks separately for CLI, App, IDE, SDK and hosted service.
3. Revisit official sources for changed features and sources marked unknown, preview or conditional. Fetch the actual page.
4. Record the old and new support statement, source, surface and maturity. Do not silently erase historical uncertainty.
5. Change U to Y/N/D only with evidence. Missing search results never establish N.
6. Reassess feature winners only where the criterion or supporting evidence changed.
7. Recompute editorial totals from the published category matrix and list weight/rating changes.
8. Keep benchmark results in a separate section/run manifest; never use a model score as a harness score.
9. Update gb8 states only from code, a user-confirmed implementation fact or reproducible tests. Label the evidence type.
10. Validate counts, IDs, sources, links and table structure before saving the replacement.

### 9.2 Review cadence and staleness

These are recommended refresh rules for future manual updates, not an automation that has been created:

- Release versions, models, billing and previews: review at every requested refresh.
- Core APIs, hooks, permissions and configuration: review when a related release changes behavior.
- Stable concepts and definitions: keep unless the feature definition changes.
- A live website can flag a claim as stale after a configurable period, such as 30 days; stale is not false.
- A same-day doc can still describe a feature ahead of a particular rollout. Test access-sensitive rows in the actual environment.

### 9.3 Prompt for a future update agent

```text
Update gb8_coding_harness_comparison.md in place using current official documentation
and release notes for Claude Code, Codex, OpenCode, Amp, GitHub Copilot and Antigravity.
Read the current file first. Preserve its feature IDs, source IDs, status semantics,
surface distinctions and gb8 audit states. Refresh versions and changed features;
do not relabel unknown as absent. Do not assume a feature in an SDK exists in the
desktop app or CLI. Clearly mark preview, plan and provider conditions.
For each material change, record the previous claim, new claim, official source,
date and effect on the winner/gb8 priority. Recompute the published editorial rubric
without presenting it as measured performance. If gb8 source is available, audit
the relevant implementation and link code/tests before updating its status.
Validate all tables, references and counts, increment the document version, and
save a replacement of the same canonical file. Return a concise change summary.
```

### 9.4 Change log

| Date | Version | Change |
|---|---|---|
| 2026-10-26 | 1.0.0 | Initial official-documentation snapshot, 128-feature matrix, editorial winners, gb8 audit template, roadmap and website handoff. |

### 9.5 Open verification queue

- Pin a current Amp CLI build and inspect actual installed capabilities.
- Pin the separate Antigravity CLI, SDK and IDE versions; App version alone is insufficient.
- Verify client-by-client support for current models, worker controls, forms and policies.
- Test exact cancellation, restart and uncertain-side-effect behavior before awarding reliability winners.
- Verify per-run hard spending limits for products whose docs currently establish only account-level limits.
- Confirm whether currently unverified ACP, agent-server, multiplayer and replay implementations now have first-party support.
- Audit provider privacy, retention, residency and subscription terms for the actual intended deployment, not a generic product label.
- Audit gb8 itself and replace the unaudited column with implementation evidence.

## 10. Source registry

All entries below are first-party documentation, vendor-owned source/release pages or official editor documentation inspected for this snapshot. A checked page is evidence for its stated scope, not proof of every feature on every client. Links are ordinary Markdown so another agent can follow them outside this chat.

[^CC00]: [Overview](https://code.claude.com/docs/en/overview). Scope: CLI, IDE, desktop and web. Checked 2026-10-26.

[^CC01]: [Instructions and auto memory](https://code.claude.com/docs/en/memory). Scope: Instruction discovery and persistent notes. Checked 2026-10-26.

[^CC02]: [Custom subagents](https://code.claude.com/docs/en/sub-agents). Scope: Agent configuration, context and lifecycle. Checked 2026-10-26.

[^CC03]: [Agent teams](https://code.claude.com/docs/en/agent-teams). Scope: Experimental coordinated sessions. Checked 2026-10-26.

[^CC04]: [Skills](https://code.claude.com/docs/en/skills). Scope: Progressive loading and reusable procedures. Checked 2026-10-26.

[^CC05]: [Hooks reference](https://code.claude.com/docs/en/hooks). Scope: Lifecycle events and handlers. Checked 2026-10-26.

[^CC06]: [Sandboxed shell](https://code.claude.com/docs/en/sandboxing). Scope: OS shell isolation and exclusions. Checked 2026-10-26.

[^CC07]: [Session management](https://code.claude.com/docs/en/sessions). Scope: Resume, fork and interrupted sessions. Checked 2026-10-26.

[^CC08]: [Checkpointing](https://code.claude.com/docs/en/checkpointing). Scope: Undo scope and limitations. Checked 2026-10-26.

[^CC09]: [Plugins](https://code.claude.com/docs/en/plugins). Scope: Packages, marketplaces and mods. Checked 2026-10-26.

[^CC10]: [MCP](https://code.claude.com/docs/en/mcp). Scope: External tools and channels. Checked 2026-10-26.

[^CC11]: [Costs](https://code.claude.com/docs/en/costs). Scope: Usage, cache statistics and budget controls. Checked 2026-10-26.

[^CC12]: [Scheduled prompts](https://code.claude.com/docs/en/scheduled-tasks). Scope: Session loops and expiry. Checked 2026-10-26.

[^CC13]: [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview). Scope: Embeddable runtime. Checked 2026-10-26.

[^CC14]: [Remote Control](https://code.claude.com/docs/en/remote-control). Scope: Local sessions accessed remotely. Checked 2026-10-26.

[^CC15]: [Tools reference](https://code.claude.com/docs/en/tools-reference). Scope: File, shell, agents and Monitor. Checked 2026-10-26.

[^CC16]: [Model configuration](https://code.claude.com/docs/en/model-config). Scope: Models, effort and providers. Checked 2026-10-26.

[^CC17]: [Programmatic runs](https://code.claude.com/docs/en/headless). Scope: CLI output and background lifecycle. Checked 2026-10-26.

[^CC18]: [OpenTelemetry](https://code.claude.com/docs/en/monitoring-usage). Scope: Metrics, events and traces. Checked 2026-10-26.

[^CC19]: [Browser extension](https://code.claude.com/docs/en/chrome). Scope: Browser actions and shared login state. Checked 2026-10-26.

[^CC20]: [Settings precedence](https://code.claude.com/docs/en/settings). Scope: Team, local and managed configuration. Checked 2026-10-26.

[^CCREL]: [Claude Code release v2.1.311](https://github.com/anthropics/claude-code/releases/tag/v2.1.311). Scope: Latest release surfaced; not a guarantee of local installation. Checked 2026-10-26.

[^CX00]: [Codex CLI](https://learn.chatgpt.com/docs/codex/cli). Scope: Local and programmatic workflows. Checked 2026-10-26.

[^CX01]: [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents). Scope: Delegation, custom agents and controls. Checked 2026-10-26.

[^CX02]: [App Server](https://learn.chatgpt.com/docs/app-server). Scope: Custom clients and bidirectional protocol. Checked 2026-10-26.

[^CX03]: [Approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security). Scope: Execution boundaries and approvals. Checked 2026-10-26.

[^CX04]: [Hooks](https://learn.chatgpt.com/docs/hooks). Scope: Lifecycle hooks and trust. Checked 2026-10-26.

[^CX05]: [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode). Scope: JSON events, resume and CI. Checked 2026-10-26.

[^CX06]: [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference). Scope: Providers, context, policies and settings. Checked 2026-10-26.

[^CX07]: [Local memories](https://learn.chatgpt.com/docs/customization/memories). Scope: Opt-in Codex memory, distinct from ChatGPT memory. Checked 2026-10-26.

[^CX08]: [MCP](https://learn.chatgpt.com/docs/extend/mcp). Scope: Connections, surface differences and plugins. Checked 2026-10-26.

[^CX09]: [Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees). Scope: Parallel work and handoff. Checked 2026-10-26.

[^CX10]: [Cloud](https://learn.chatgpt.com/docs/cloud). Scope: Reusable environments and hosted tasks. Checked 2026-10-26.

[^CX11]: [Code review](https://learn.chatgpt.com/docs/code-review). Scope: Local, GitHub and GitLab review workflows. Checked 2026-10-26.

[^CX12]: [SDK](https://learn.chatgpt.com/docs/codex-sdk). Scope: TypeScript and Python embedding. Checked 2026-10-26.

[^CX13]: [Open-source components](https://learn.chatgpt.com/docs/open-source). Scope: CLI, SDK and App Server; excludes cloud and IDE. Checked 2026-10-26.

[^CX14]: [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md). Scope: Instruction hierarchy. Checked 2026-10-26.

[^CX15]: [Scheduled tasks](https://learn.chatgpt.com/docs/automations). Scope: Desktop and cloud; no CLI scheduling UI. Checked 2026-10-26.

[^CXREL]: [Codex CLI release 0.164.0](https://github.com/openai/codex/releases/tag/rust-v0.164.0). Scope: CLI release, 2026-10-23. Checked 2026-10-26.

[^OC00]: [OpenCode v2 introduction](https://opencode.ai/v2/docs/). Scope: Terminal, desktop and web. Checked 2026-10-26.

[^OC01]: [Agents](https://opencode.ai/v2/docs/agents). Scope: Profiles, models and subagents. Checked 2026-10-26.

[^OC02]: [Models](https://opencode.ai/v2/docs/models). Scope: Catalog, variants and session selection. Checked 2026-10-26.

[^OC03]: [Plugins](https://opencode.ai/v2/docs/plugins). Scope: Versioned code extensions. Checked 2026-10-26.

[^OC04]: [Compaction](https://opencode.ai/v2/docs/compaction). Scope: Summary, recent context and thresholds. Checked 2026-10-26.

[^OC05]: [Permissions](https://opencode.ai/v2/docs/permissions). Scope: Allow/ask/deny, not an OS sandbox. Checked 2026-10-26.

[^OC06]: [Snapshots](https://opencode.ai/v2/docs/snapshots). Scope: Conversation and file rollback scope. Checked 2026-10-26.

[^OC07]: [Instructions](https://opencode.ai/v2/docs/instructions). Scope: AGENTS.md discovery, no CLAUDE.md fallback. Checked 2026-10-26.

[^OC08]: [Providers](https://opencode.ai/v2/docs/providers). Scope: Credentials, gateways and custom endpoints. Checked 2026-10-26.

[^OC09]: [MCP servers](https://opencode.ai/v2/docs/mcp-servers). Scope: Transports, OAuth and Code Mode settings. Checked 2026-10-26.

[^OC10]: [Skills](https://opencode.ai/v2/docs/skills). Scope: Discovery and HTTP catalogs. Checked 2026-10-26.

[^OC11]: [Tools](https://opencode.ai/v2/docs/tools). Scope: Read/search/edit/shell capabilities. Checked 2026-10-26.

[^OC12]: [CLI](https://opencode.ai/v2/docs/cli/). Scope: Shared service and headless runs. Checked 2026-10-26.

[^OC13]: [Build integrations](https://opencode.ai/v2/docs/build/). Scope: Plugins, clients and embedding. Checked 2026-10-26.

[^OC14]: [HTTP API](https://opencode.ai/v2/docs/api). Scope: Experimental API, session and worktree operations. Checked 2026-10-26.

[^OC15]: [Embedded SDK](https://opencode.ai/v2/docs/build/sdk/). Scope: In-process host and events. Checked 2026-10-26.

[^OC16]: [ACP](https://opencode.ai/v2/docs/cli/acp/). Scope: Editor protocol integration. Checked 2026-10-26.

[^OC17]: [Enterprise](https://opencode.ai/enterprise). Scope: SSO, internal gateways; verify contractual details. Checked 2026-10-26.

[^OCREL]: [OpenCode changelog](https://opencode.ai/changelog). Scope: v2.1.4, 2026-10-23; experimental background compaction. Checked 2026-10-26.

[^AM00]: [Introduction](https://ampcode.com/docs/). Scope: Current hosted product, orbs and clients. Checked 2026-10-26.

[^AM01]: [Tools](https://ampcode.com/docs/tools). Scope: Task workers and Painter. Checked 2026-10-26.

[^AM02]: [Modes and subagents](https://ampcode.com/docs/models-and-subagents). Scope: Task worker limits and custom agents. Checked 2026-10-26.

[^AM03]: [Plugins](https://ampcode.com/docs/customize/plugins). Scope: Tools, UI, policies and events. Checked 2026-10-26.

[^AM04]: [Model routing](https://ampcode.com/docs/customize/model-routing). Scope: BYOK, subscriptions, clouds and gateways. Checked 2026-10-26.

[^AM05]: [Agent to Agent](https://ampcode.com/docs/orbs/agent-to-agent). Scope: Separate threads, workspaces and explicit file transfer. Checked 2026-10-26.

[^AM06]: [Automations and webhooks](https://ampcode.com/docs/orbs/automations). Scope: Persistent schedules and event delivery. Checked 2026-10-26.

[^AM07]: [Multiplayer](https://ampcode.com/docs/collaborate/multiplayer). Scope: Concurrent human collaboration and access scope. Checked 2026-10-26.

[^AM08]: [Threads](https://ampcode.com/docs/threads). Scope: Steering, queueing, sharing and history. Checked 2026-10-26.

[^AM09]: [Pricing](https://ampcode.com/docs/pricing). Scope: Billing dimensions and enterprise controls. Checked 2026-10-26.

[^AM10]: [CLI](https://ampcode.com/docs/cli). Scope: macOS/Linux/WSL and local/orb/runner execution. Checked 2026-10-26.

[^GH00]: [Copilot CLI](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-cli). Scope: Plan, compaction, automation and ACP. Checked 2026-10-26.

[^GH01]: [Customization comparison](https://docs.github.com/en/copilot/concepts/customizations/comparing-customizations). Scope: Instructions, tools, skills, agents and plugins. Checked 2026-10-26.

[^GH02]: [Custom agents](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/invoke-custom-agents). Scope: Role profiles and GitHub MCP. Checked 2026-10-26.

[^GH03]: [Hooks](https://docs.github.com/en/copilot/reference/hooks-reference). Scope: CLI and cloud differences. Checked 2026-10-26.

[^GH04]: [Copilot on GitHub](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github). Scope: Cloud tasks, PRs, review and automations. Checked 2026-10-26.

[^GH05]: [Models](https://docs.github.com/en/copilot/reference/ai-models/supported-models). Scope: Client and plan-dependent model support. Checked 2026-10-26.

[^GH06]: [Fleet](https://docs.github.com/en/copilot/concepts/agent-capabilities/choosing-and-delegating-agent-work/delegating-and-parallelizing-work-with-agents). Scope: Orchestration and dependencies. Checked 2026-10-26.

[^GH07]: [Memory](https://docs.github.com/en/copilot/concepts/prompting-and-context/copilot-memory). Scope: Preview facts and preferences. Checked 2026-10-26.

[^GH08]: [Sandboxes](https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/about-cloud-and-local-sandboxes). Scope: Local MXC and cloud preview. Checked 2026-10-26.

[^GH09]: [Usage billing](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing). Scope: AI credits; legacy request billing is separate. Checked 2026-10-26.

[^GH10]: [IDE surfaces](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-in-ides). Scope: Editor integrations. Checked 2026-10-26.

[^GH11]: [Copilot SDK](https://github.com/github/copilot-sdk). Scope: Embedding, JSON-RPC and BYOK; SDK is not the full product source. Checked 2026-10-26.

[^GH12]: [VS Code browser tools](https://code.visualstudio.com/docs/agents/run/browser-tools). Scope: Built-in browser, isolated/shared pages and visual feedback. Checked 2026-10-26.

[^GHREL]: [Copilot CLI release 1.0.103](https://github.com/github/copilot-cli/releases/tag/v1.0.103). Scope: CLI release, 2026-10-22; IDEs/cloud are separately released. Checked 2026-10-26.

[^AG00]: [Overview](https://www.antigravity.google/docs/overview). Scope: App, CLI, IDE, extensions and SDK. Checked 2026-10-26.

[^AG01]: [Custom subagents](https://www.antigravity.google/docs/subagents/). Scope: Peer messaging, worktrees and nesting. Checked 2026-10-26.

[^AG02]: [Hooks](https://www.antigravity.google/docs/hooks/). Scope: Lifecycle event schema. Checked 2026-10-26.

[^AG03]: [Browser](https://www.antigravity.google/docs/ide/browser/). Scope: Local Chrome automation; IDE scope. Checked 2026-10-26.

[^AG04]: [Artifacts](https://www.antigravity.google/docs/artifacts/). Scope: Plans, diffs, recordings and feedback. Checked 2026-10-26.

[^AG05]: [Permissions](https://www.antigravity.google/docs/permissions/). Scope: Deny/ask/allow and auto approval preview. Checked 2026-10-26.

[^AG06]: [Models](https://www.antigravity.google/docs/models/). Scope: Plan-dependent model catalog. Checked 2026-10-26.

[^AG07]: [Schedules](https://www.antigravity.google/docs/commands/schedule/). Scope: Conversation-scoped timers and cron. Checked 2026-10-26.

[^AG08]: [Remote Control](https://www.antigravity.google/docs/remote-control/). Scope: Remote browser UI and headless host daemon. Checked 2026-10-26.

[^AG09]: [Skills](https://www.antigravity.google/docs/skills/). Scope: Reusable SKILL.md workflows. Checked 2026-10-26.

[^AG10]: [Enterprise](https://www.antigravity.google/docs/enterprise/). Scope: Cloud identity, projects and logging. Checked 2026-10-26.

[^AG11]: [SDK](https://www.antigravity.google/docs/sdk/overview/). Scope: Python agent integration. Checked 2026-10-26.

[^AG12]: [Local models in SDK](https://www.antigravity.google/docs/sdk/local-models/). Scope: SDK-only local inference and compatible endpoints. Checked 2026-10-26.

[^AG13]: [Rules](https://www.antigravity.google/docs/rules/). Scope: Directory and global instruction discovery. Checked 2026-10-26.

[^AG14]: [Sidecars](https://www.antigravity.google/docs/sidecars/). Scope: Opt-in persistent background workers. Checked 2026-10-26.

[^AGREL]: [Changelog](https://www.antigravity.google/docs/changelog/). Scope: App v2.26.0, 2026-10-22; separate release tracks. Checked 2026-10-26.
