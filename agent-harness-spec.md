# Agent Harness — Implementation Specification

Version: 1.1 draft  
Status: proposed architecture and implementation contract

## 1. Objective

Build a persistent agent runtime that carries authorized work to a verified outcome with minimal supervision. It must preserve continuity, recover from interruption, delegate selectively, discover capabilities on demand, and explain its progress and results.

The primary abstraction is a durable mission with a responsible coordinator. Model invocations, agent runs, UI sessions, and worker processes are replaceable execution mechanisms.

The main agent MUST remain available for conversation while its execution trajectory progresses independently in the background. Users must be able to ask questions, clarify intentions, change direction, or submit more work without waiting for execution to finish or implicitly interrupting it. This is a core architecture requirement, including when no subagents are used.

MUST denotes a release requirement. SHOULD denotes a default that may be overridden with a documented reason. MAY denotes an optional capability.

## 2. Design principles

- Keep the permanent model-facing tool surface small and typed.
- Separate agent judgment from runtime authority and enforcement.
- Persist intent and execution state before acknowledging consequential operations.
- Use events and durable timers to resume work; do not spend model calls polling.
- Delegate only when the expected benefit exceeds coordination, cost, and integration overhead.
- Share versioned artifacts and explicit knowledge; isolate conversational context and concurrent writes.
- Treat completion as an evidence-backed outcome, not a model assertion.
- Make failures, uncertainty, spending, and unfinished work visible.
- Preserve user steering and authorized scope across interruptions.
- Separate interactive conversation from background execution; neither owns the other's availability.
- Start with one deployable runtime; allow distributed workers without requiring a distributed architecture for basic use.

## 3. Responsibility boundary

| Agent judgment | Runtime authority |
| --- | --- |
| Interpret intent and define acceptance criteria | Persist missions, tasks, events, and checkpoints |
| Plan, prioritize, and revise work | Validate state transitions and dependency graphs |
| Choose whether and what to delegate | Schedule workers, enforce leases and concurrency |
| Request capabilities and execution profiles | Enforce permissions, budgets, model policy, and isolation |
| Interpret results and decide next actions | Deliver events, manage timers, retries, cancellation, and recovery |
| Select useful memories and propose updates | Enforce memory scope, provenance, retention, and access |
| Produce deliverables and completion evidence | Apply completion gates and retain audit records |

The runtime MUST remain correct when the model forgets an instruction, crashes, issues a duplicate request, or produces an invalid transition.

## 4. Durable domain model

All records MUST include a stable ID, schema version, creation/update timestamps, access scope, and revision for optimistic concurrency where mutable.

| Entity | Purpose and required content |
| --- | --- |
| Project | Workspace roots, repositories, configuration, permissions, memory scope |
| Mission | User objective, scope, constraints, acceptance criteria, coordinator, budget, status |
| Task | Mission, description, dependencies, required/optional designation, owner, acceptance criteria, status, attempts, blockers, artifacts |
| Agent | Logical identity, responsibility, parent/supervisor, allowed capabilities |
| Run | One execution attempt: agent/task IDs, execution profile, lease, status, usage, checkpoint |
| Operation | Tool invocation intent, normalized inputs, authorization decision, idempotency key, execution state, result reference |
| Artifact | Versioned output, URI, content hash, producer, provenance, validation evidence |
| Event | Durable notification with ordering and correlation metadata |
| Checkpoint | Versioned continuation state linked to an event cursor and artifact versions |
| Memory | Scoped durable knowledge with provenance and lifecycle metadata |
| Approval | Authorized action scope, concrete payload digest, resource, expiry, decision, policy revision |
| Conversation message | Durable client message ID, conversation sequence, content, reply-to references, interpretation, linked missions/tasks, handling state |
| Steering command | Source message, target mission/tasks, requested change, expected control revision, resulting revision, application status and receipts |
| Input request | Target task/mission, question, request ID, blocking scope, status, linked answer, expiry or resolution policy |

Tasks MUST outlive agent runs. Replacing an agent or model MUST NOT create a new logical task or erase prior attempts.

Task state is authoritative for open work. Memory MAY index or summarize open work but MUST NOT maintain a competing task ledger.

## 5. Small permanent tool surface

Expose seven permanent namespaces: `read`, `write`, `bash`, `task`, `agent`, `discover`, and `self`.

Task management is explicit because it is a first-class control operation. Do not hide scheduling, approval, or task transitions inside arbitrary file writes.

The following signatures are semantic contracts. Implementation MUST publish versioned, validated schemas before implementing adapters.

| Namespace | Required operations |
| --- | --- |
| `read` | Read/search files, artifacts, memory, and authorized runtime records; support ranges and output limits |
| `write` | Create/patch files and artifacts; propose memory updates; use expected revisions or content hashes |
| `bash` | Start sandboxed commands; return bounded output or a durable process handle; inspect/input/cancel by handle |
| `task` | Create, inspect, list, update, add dependencies, submit results, record blockers, request transitions; steer/pause/resume/cancel scoped work and answer input requests with revision checks |
| `agent` | Start, message, inspect, cancel, and request additional budget for child agents |
| `discover` | Search capability metadata, describe schemas, request activation, deactivate |
| `self` | Inspect execution state, request configuration changes, checkpoint, compact, suspend until events |

Common request fields: request ID, project/mission scope, target ID where applicable, expected revision for mutations, and deadline where relevant. Mutating requests MUST support deduplication.

Common responses MUST distinguish success, accepted/running, rejected, blocked, conflict, and unknown outcome. Errors MUST contain a machine-readable code, retryability, and actionable context. Long-running actions MUST return a durable handle and deliver completion events.

`self.suspend` MUST atomically register its event subscription and cursor before yielding so that an event cannot be lost between checking and sleeping.

`self.inspect` MUST expose remaining budgets, context utilization, active profile, capabilities, pending events, and policy constraints. Configuration requests MUST return requested versus effective values and reasons for any restrictions.

## 6. Capabilities and skills

Discovery MUST initially return compact metadata. Load full schemas or instructions only when selected.

A capability descriptor MUST include identity, version, provider, input/output schemas, permission requirements, side-effect classification, data destinations, cancellation behavior, retry/idempotency semantics, and health status. Cost estimates and execution limits SHOULD be included where available.

Activation MUST pass runtime authorization. Discovering or loading a tool MUST NOT itself grant permission to execute it. Tool metadata from external sources MUST be treated as untrusted claims until validated by host policy.

Support adapters for local tools, MCP servers, authenticated connectors, and remote workers. Pin activated versions per run; reject incompatible schema changes or explicitly renegotiate them.

Skills are versioned instruction/workflow packages discovered through the same mechanism. They MAY contribute templates and capability requirements. They MUST NOT override user scope or runtime policy, or silently install executable dependencies. A separate permanent `skill` tool is unnecessary.

## 7. Mission and task lifecycle

Mission statuses: `active`, `waiting`, `paused`, `succeeded`, `failed`, `cancelled`.

Task statuses and meaning:

| Status | Meaning |
| --- | --- |
| `pending` | Waiting for dependencies or scheduling |
| `running` | Held by a valid execution lease |
| `waiting` | Waiting for a known event, approval, external job, or retry timer |
| `blocked` | Requires a specified intervention with no currently scheduled resolution |
| `paused` | Deliberately suspended by an authorized controller |
| `completed` | Accepted result with required evidence |
| `failed` | Execution cannot continue under the current retry/recovery policy |
| `cancelled` | Explicitly ended without fulfilling the original requirement |

The runtime MUST maintain an explicit transition table. Typical flow is `pending → running → completed`; running work may enter waiting, blocked, paused, failed, or cancelled. Resolved waiting/blocked work returns to pending. Retrying a failed task requires an explicit retry decision and creates a new run. Terminal history remains retained.

Dependencies MUST form a DAG. Reject cycles atomically. A dependency is satisfied by accepted completion or an authorized scope change—not simply by being terminal. Dependency failure MUST propagate an explicit blocker or policy decision.

Task updates MUST preserve revision history. Deleting or cancelling a required task MUST NOT silently remove its mission acceptance criterion. Scope changes require authority granted by the user or project policy and must be recorded.

Use acceptance checklist progress where possible; model-estimated percentages are advisory only.

## 8. Planning and delegation

The coordinator MUST define a minimum useful plan, expected deliverables, and acceptance criteria before substantial execution. Simple work MAY remain a single task.

Each delegated assignment MUST specify:

- Task and mission IDs, bounded objective, dependencies, expected output, acceptance criteria.
- Relevant files/artifacts with versions, constraints, and selected memory.
- Requested capability/reasoning profile and child permission scope.
- Budget allocation, priority, concurrency/resource constraints.
- Check interval or check deadline, hard deadline if applicable, and retry policy.
- Write ownership or isolated workspace, integration owner, and supervisor.

Defaults MAY supply these values, but effective assignments MUST be inspectable.

Start independent work concurrently when resources and write isolation permit. Do not spawn agents merely to simulate roles or repeat trivial checks. Bound fan-out, nesting depth, and outstanding tasks.

The background coordinator SHOULD continue useful work while children execute. When nothing useful remains, suspend that execution run on events; conversation remains independently available. Child outputs MUST include results, artifact references, validation evidence, unresolved questions, and recommended next steps.

Agents share read access to authorized project state. Concurrent edits SHOULD use isolated worktrees or versioned overlays with explicit integration. Non-code artifacts MUST use revision checks or exclusive write ownership. Stale writers MUST NOT overwrite newer results.

## 9. Event delivery and scheduling

Event envelope MUST contain event ID, type, schema version, project/mission/task/run IDs as applicable, timestamp, per-stream sequence, correlation/causation IDs, and payload or payload reference.

Required event families include run start/finish/failure, checkpoint, progress, input/approval requested, blocker change, budget threshold, timer due, deadline reached, cancellation, capability failure, and artifact/result submission.

Also persist message received/interpreted, input answered, steering committed/applied/superseded/rejected, and queued work scheduled. Correlate each resulting task or command with its originating message.

Delivery MUST be durable and at least once. Consumers MUST deduplicate. Ordering MUST be guaranteed within an aggregate stream, not assumed globally.

State changes and event publication MUST be atomic through a transactional outbox or equivalent mechanism. Event acknowledgments MUST survive process restart.

Workers MUST hold renewable task leases with fencing tokens. Every authoritative mutation MUST reject expired lease holders. The scheduler MUST enforce concurrency, priority, fairness, and resource availability.

Timers MUST persist across restarts. Define one-shot versus recurring behavior and compute due times using runtime clocks. Invalidate task timers when tasks become terminal, and stale run timers when a run is replaced. Past-due timers MUST be reconciled on restart without duplicate effects.

## 10. Durable execution and external effects

Before executing a consequential operation, persist its intent and authorization. Operation states MUST distinguish `prepared`, `dispatched`, `succeeded`, `failed`, and `unknown`.

Use provider idempotency keys where supported. Use host-side deduplication for local state mutations. Do not claim exactly-once execution across arbitrary external services.

If a worker crashes after an external action may have succeeded but before its result is committed, mark the outcome unknown. Reconcile using a provider receipt, status query, or observable postcondition. Retry only when duplicate execution is safe. Otherwise preserve the uncertainty and request intervention when necessary.

Classify failures as transient, permanent, policy-denied, budget-exhausted, or outcome-unknown. Retry transient failures with bounded exponential backoff and jitter. Use circuit breakers for unhealthy providers. Do not blindly retry permanent errors or policy denials.

Cancellation MUST stop new dispatch immediately, cancel supported external jobs, signal running processes, and terminate them after a configured grace period. Record any action that could not be cancelled. Cancellation is not rollback; compensation must be separately authorized.

## 11. Budgets and model adaptation

Track budgets hierarchically across workspace/project, mission, and run. A child allocation MUST reserve capacity from its parent; spawning agents MUST NOT multiply available budget.

Reserve interactive scheduling capacity and a bounded conversation budget independently of background mission allocations, within the overall project/account ceiling. Background workers MUST NOT consume that reserve. Mission budget exhaustion MUST NOT prevent users from inspecting, discussing, pausing, or reprioritizing work. At an exhausted overall ceiling or provider outage, keep durable message intake and deterministic status/control actions available and show that model replies are unavailable; do not silently queue them as if being answered.

Track tokens, monetary cost, tool calls, active execution time, elapsed deadlines, concurrency, and applicable compute resources separately. Context-window utilization is a separate limit, not a spending metric.

Before dispatch, reserve a conservative bound or reject work that cannot fit. Reconcile actual usage afterward, including failed calls. For tools/providers without enforceable bounds, require configured exposure limits and report possible overshoot explicitly.

Default thresholds MAY be 80% warning and 90% graceful suspension preparation. Reserve a separate shutdown allowance for checkpointing and reporting. At the hard limit, the runtime MUST deny new normal work without relying on another model response. Extensions require available parent capacity and authorization.

Agents MAY request capability intent such as stronger reasoning, lower latency, lower cost, or multimodal support. The router MUST consider task needs, supported features, evaluated quality, latency, budgets, and allowed providers. Unsupported features MUST fail explicitly.

Switch profiles only at safe boundaries. Preserve task state, effective instructions, permissions, and pending operations; log requested/effective configuration and reason. Apply switch limits and hysteresis to avoid oscillation.

## 12. Context, memory, and compaction

Assemble context from the current objective, latest user steering, hard constraints, task state, selected evidence, relevant memory, and pending events. Do not inherit the full parent conversation by default.

Memory scopes: working, project, and private user/global. Shared project execution MUST NOT receive private global memory without authorization.

Durable memory MUST record type, scope, content, source references, creation time, validity/freshness metadata, confidence where useful, and supersession links. Distinguish explicit user preferences, observed facts, decisions, and inferences. Model-assigned confidence is advisory, not calibrated probability.

Automatic capture MUST filter sensitive material, deduplicate, detect conflicts, and preserve provenance. Untrusted retrieved content MUST NOT become a trusted instruction through memory. Promote inferred cross-project preferences conservatively. Support inspection, correction, export, deletion, and retention policy.

Compaction MUST first commit a checkpoint containing mission/scope, current task versions, decisions, unresolved issues, artifact references, pending operations/events, child run IDs, effective permissions, budget state, conversation cursor, unhandled messages, unresolved input requests, and steering revisions/receipts. It MUST preserve references to evidence rather than replace all evidence with prose summaries.

Activate a compacted context only after the checkpoint commits. It MUST remain possible to recover from the prior checkpoint if compaction fails. Compaction MUST NOT reset budgets, approvals, or task history.

## 13. Recovery and liveness

On startup, restore projects and active missions, reconcile operation outcomes, reclaim expired leases, recover subscriptions/timers, and resume eligible tasks automatically within their authorization and schedules.

Do not assume an operating-system process or in-flight model call survived. Inspect durable handles where supported; otherwise create a new run from committed state.

Detect expired heartbeats, overdue checks, repeated error signatures, repeated actions without changed evidence, unchanged artifact/state progress, orphaned children, and excessive queue age. Heartbeats prove availability, not useful progress.

Recovery policy MUST bound retries and escalation. It may wake the supervisor, reconcile state, replace a worker, change strategy/profile, or mark a task blocked/failed with a reason. If the supervisor disappears, runtime ownership MUST transfer to a replacement coordinator.

Background continuation requires a running durable service. If that service is unavailable, show the mission as suspended; never imply work continues after all execution has stopped.

## 14. Safety and authorization

Enforce tenant/project isolation, filesystem boundaries, network egress, tool permissions, secret access, resource limits, and cancellation outside the model. Shell execution MUST pass the same controls as connectors and MUST NOT be a policy bypass.

Delegate only equal or narrower permissions. Scope credential access to the operation; prefer injected short-lived references over exposing raw secrets to models. Redact secrets before persistence and UI display.

Treat external documents, web pages, tool outputs, and third-party instructions as data with provenance. They MUST NOT change the governing objective or authorization. Enforce data-destination restrictions at the tool gateway.

Reuse valid authorization for in-scope actions. Ask for approval only when a required permission is absent. Bind approval to the concrete action, resources, payload digest, policy revision, and expiry; material changes invalidate it. A denied operation MUST NOT be retried through a different tool to evade the denial.

## 15. User experience and observability

Opening a project MUST restore its active missions, recent artifacts, decisions, unfinished work, and blockers without requiring session IDs or handoff files. If several projects are plausible, request selection rather than guessing.

The UI MUST distinguish working, waiting, paused, blocked, failed, and completed. Show the next action, last meaningful progress, spend, and any required user input. Accept steering/cancellation while work runs; persist it and deliver at safe boundaries. Material steering MUST invalidate obsolete queued actions before dispatch.

### 15.1. One main agent, independent conversation and execution

Present one coherent main agent identity with two independently scheduled activities:

- Interactive conversation: answer the user, discuss options, explain current work, resolve clarification, accept new work, and issue steering commands.
- Background execution: plan and perform missions, run tools, supervise children, validate results, and publish progress.

These activities MUST use separate invocation lifecycles and bounded context assemblies over shared durable state. Do not concurrently mutate one model transcript or hold a conversation lock for the duration of a mission. A background tool call, long reasoning run, child wait, checkpoint, or compaction MUST NOT hold the interactive request queue.

Brief answers and bounded state reads MAY run interactively. Work requiring a sustained trajectory MUST become a background task with a durable handle. The interactive agent MUST be able to understand, explain, and redirect real execution through shared state; a generic acknowledgment bot beside an opaque worker does not meet this requirement.

Reserve model-request admission capacity as well as local worker capacity for conversation. Background saturation MUST NOT cause head-of-line blocking. Use bounded concurrency, interactive priority, and fair background scheduling. The user MUST NOT need a special command, side chat, separate agent, or stop button merely to talk.

### 15.2. Message handling contract

Persist every accepted user message before showing a receipt. Give it a stable client deduplication key and conversation sequence. Track receipt separately from interpretation and application: `received`, `interpreted`, then `answered`, `scheduled`, `applied`, `needs_clarification`, or `rejected`. A message with several intents MUST track each part independently.

Infer intent from natural language and context, then make the operational consequence clear in the reply or an attached status indicator:

| User intent | Required behavior |
| --- | --- |
| Side question, explanation, or hypothetical | Answer promptly; execution continues under its existing objective |
| Status question | Read committed progress and relevant evidence; identify pending or uncertain operations |
| Answer to a clarification | Resolve the linked input request and resume only the affected work |
| Correction or change of direction | Commit scoped steering, acknowledge the change, and reconcile affected execution |
| New independent task | Create durable work immediately; start if capacity permits, otherwise show it as queued with a reason |
| Follow-on task | Persist it immediately with the appropriate dependency and visible scheduling state |
| Pause, stop, or replace current work | Apply the scoped control command; report disposition of running effects and preserved progress |

Conversation topic changes MUST NOT themselves cancel or replace a mission. A new request MUST NOT be silently appended to the current worker's prompt, overwrite existing work, or remain undisclosed until that worker finishes. Explicit user instructions about parallel, subsequent, or replacement work take precedence over inferred routing.

When intent or target is materially ambiguous, ask one focused question and retain the message as unresolved. Continue unaffected work. If the ambiguity signals a possible stop or scope restriction, hold dispatch of the affected consequential actions pending resolution; do not freeze every mission.

Users MAY correct the interpretation directly. Preserve the correction and original message relationship; reconcile already scheduled work rather than creating accidental duplicates. Rapid messages MUST be interpreted with sequence and reply-to context. A newer explicit correction supersedes an older command only in its stated scope.

### 15.3. Steering without conflicting coordinators

Conversation and execution MUST submit changes through the same authoritative task/control service. Each mission MUST have a monotonically increasing control revision. Serialize control mutations using transactions/revision checks; no conversation or background run may overwrite a newer user decision from a stale snapshot.

On an accepted material change:

1. Persist the command and new control revision atomically, identifying affected tasks, constraints, and acceptance criteria.
2. Fence obsolete action dispatch for that scope immediately; do not wait for the background model to finish reasoning.
3. Deliver the revision to the coordinator and affected children. Cancel or suspend stale runs where needed and replan from committed evidence.
4. Validate proposed effects and result submissions against the current revision. Reuse unaffected work through an explicit compatibility decision; retain superseded artifacts as history.
5. Record application receipts or a specific unresolved condition and update the user-visible state.

Revision validation and operation dispatch admission MUST be serialized with control changes. An operation already admitted may be in flight: attempt cancellation where supported and disclose any irreversible or unknown effect. Never claim that steering rolled back an action merely because its model run was stopped.

Distinguish “change received” from “change applied.” The interactive reply need not wait for every worker acknowledgment, but MUST show pending application and surface failures. Policy checks and approvals still apply to the changed scope.

### 15.4. Clarification, shared awareness, and presentation

Background clarification MUST create a durable input request with a stable ID and minimal blocking scope. Surface it in chat and mission state. The user can discuss the question, answer it later, or ask unrelated questions while other work proceeds. Match answers using explicit reply-to references or unambiguous context; ask when several requests are plausible.

Build conversational awareness from current mission/task revisions, recent progress, artifact references, pending operations, and steering receipts. Do not rely solely on the last natural-language progress summary. Background runs receive relevant user decisions and answers rather than every unrelated chat message. Both activities retain access to authorized source evidence.

Keep the composer enabled while work runs. Show execution in a persistent activity surface with mission-linked progress and controls. Coalesce routine background updates so they do not flood or interleave with an interactive answer. Deliver urgent blockers and completion notices without losing their task association. Finishing a chat reply MUST NOT imply that background work has finished.

### 15.5. Availability and measurable guarantees

“Always accessible” means background execution never intentionally gates chat intake, interactive scheduling, or controls while the service is healthy. It is not a promise of model service availability during network/provider failure.

Define separate SLOs for durable receipt, interactive queue delay, first response token, steering commit, and steering application. Reference release targets under declared supported load: p95 receipt within 500 ms of server arrival and p95 interactive queue delay within 1 second with background workers saturated. Measure provider generation/network latency separately. Configure timeouts and visibly report missed application deadlines; do not hide them behind an acknowledgment.

Reconnect/restart MUST restore unhandled messages and pending commands without duplicate task creation. The UI MUST distinguish unsent, durably received, awaiting interpretation, scheduled, and applied states. A receipt MUST NOT be shown before persistence succeeds.

Persist a chronological trajectory of plans, concise decision rationales, tool operations/results, agent messages, events, transitions, approvals, usage, configuration changes, checkpoints, memory changes, validation, and deliverables. Do not require hidden chain-of-thought or provider-private reasoning.

Use trace IDs across delegation and tool calls. Support a readable timeline plus filters by mission, task, run, operation, error, and cost. Large payloads SHOULD live in access-controlled artifact storage with references in the log.

Define replay modes separately:

- Audit replay: display recorded activity without execution.
- State reconstruction: rebuild projections from events/checkpoints.
- Evaluation replay: run against recorded or mocked tool results in an isolated environment.

Live re-execution is a new run, requires current authorization, and MUST NOT be called deterministic replay. Model outputs need not be reproducible.

## 16. Completion contract

A mission may be marked `succeeded` only when all required acceptance criteria are satisfied, required task results are accepted, deliverables are accessible, and required validation evidence is recorded.

Blocked work is unfinished. Cancelled work is unfulfilled unless an authorized scope revision removes that requirement. A mission with unresolved required work MUST remain waiting/paused or end as failed/cancelled with an explicit outcome.

Task submission MUST include evidence. The runtime MUST enforce configured machine-verifiable gates; qualitative work requires a designated acceptance evaluator and recorded rationale. A child agent declaring completion is a submission, not sufficient proof of success.

Final reporting MUST state delivered results, verification, limitations, and remaining required work. The harness MUST NOT manufacture additional scope after acceptance criteria are met.

## 17. Reference architecture and delivery sequence

Use a modular runtime with a transactional durable store, artifact store, interactive conversation dispatcher, authoritative task/control service, background scheduler/event dispatcher, worker supervisor, policy/tool gateway, model adapter/router, context-memory service, and API/UI. These are logical boundaries, not a requirement for separate services. Interactive and background dispatch MUST have independent queues and reserved capacity from the first increment.

Recommended first deployment: one service, a transactional relational database, filesystem/object artifact storage, and sandboxed workers. SQLite with appropriate durability settings is suitable for a single-host edition; use a server database for distributed writers. Do not add a vector database, broker, or microservices until a measured need justifies them.

Deliver in gated increments:

1. Durable main-agent conversation and background execution: independent interactive/background scheduling, durable message intake, intent routing, revisioned steering, task transitions, operation journal, checkpoints, recovery, policy gateway, basic CLI/timeline, budgets, cancellation. Demonstrate talking and steering during a long-running mission before adding subagents.
2. Reliable delegation: leases, durable messages/timers, child budgets, bounded concurrency, isolated writes, integration and acceptance.
3. Selective capability/context management: MCP/connectors, versioned skills, automatic memory, compaction, permission-aware retrieval.
4. Adaptation and production hardening: evaluated routing, failure injection, replay tooling, performance instrumentation, retention/export, distributed workers if required.

Every increment MUST be runnable with documented setup, schema migrations, configuration defaults, and meaningful automated verification. Do not implement simulated persistence, fake background execution, or placeholder policy enforcement as completed functionality.

## 18. Required acceptance scenarios

| Scenario | Pass condition |
| --- | --- |
| Restart during work | Mission/task IDs and committed progress survive; eligible work resumes |
| Crash around external write | Known idempotent action reconciles safely; uncertain non-idempotent action is not blindly repeated |
| Duplicate/out-of-order event | No duplicate transition/effect; sequence gaps are handled |
| Lease expiry and stale worker | Replacement proceeds; stale worker cannot commit authoritative writes |
| Parent crash with active children | Replacement coordinator receives retained child results |
| Parallel edits to one resource | Isolation or conflict detection prevents lost updates |
| Aggregate budget exhaustion | Sibling runs cannot overspend reserved parent capacity; continuation state survives |
| Timer while runtime is offline | Due event is recovered once logically after restart |
| Dependency failure/cycle | Cycle rejected; failed prerequisite does not unlock dependent work |
| Compaction/model switch | Constraints, evidence references, open work, and permissions remain intact |
| Malicious tool/document content | Cannot elevate permissions or redirect protected data |
| Cancellation and user steering | New obsolete actions stop; running action outcomes remain visible |
| Chat during long execution | Questions receive substantive replies while a tool/reasoning run continues; the composer and interactive scheduler remain available |
| Saturated background capacity | Interactive admission meets its declared queue/receipt SLOs without waiting for a mission to finish |
| Side question during work | Answer does not pause, replace, or alter the mission |
| New work during execution | Request becomes a visible durable task immediately, marked running or queued with a reason |
| Rapid mixed-intent messages | Every intent is accounted for; corrections apply in order and no tasks are silently lost or duplicated |
| Steering races with dispatch | Obsolete actions cannot be newly admitted after the scoped revision commits; previously admitted effects are reconciled and reported |
| Stale coordinator/child result | Cannot overwrite newer user direction or satisfy revised criteria without compatibility validation |
| Clarification alongside chat | Only dependent work waits; unrelated conversation and tasks proceed; the correct answer resumes the correct task |
| Message acknowledgment followed by crash | Accepted message and pending steering survive, with no duplicate scheduling on reconnect |
| Background budget exhaustion | Conversation reserve and deterministic controls remain usable within the overall account limit |
| Required task blocked/cancelled | Mission cannot be reported as succeeded without authorized scope revision |
| Replay | Audit/evaluation replay cannot trigger production side effects |
| Memory scope/deletion | Private memory stays private; deletion removes retrieval/index copies and follows documented backup retention |

Use deterministic fake models/tools for recovery and state-machine tests, plus a small real-provider integration suite. Measure completion quality, intervention rate, recovery success, cost per accepted result, latency, duplicate-effect incidents, and task abandonment. Set numeric performance targets after defining the deployment environment and baseline workload.

## 19. Instructions to the implementation agent

First inspect the existing repository and preserve its established stack unless it conflicts with these requirements. Document concrete defaults and unresolved deployment assumptions; ask only for decisions that block correct implementation.

Implement increment 1 end to end before broadening the tool ecosystem. Publish executable schemas, state transitions, and a minimal working vertical slice. Then implement the remaining increments with migration and recovery tests at each boundary. Track unfinished requirements explicitly; never present scaffolding as a working harness.

## 20. Design references

These references inform interoperability and durability. The architecture above is a proposed design, not a claim that these protocols supply the whole harness.

- [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28): protocol contracts and host responsibility for tool access.
- [MCP security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices): connector security considerations.
- [Azure Durable Task orchestration overview](https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-orchestrations): durable orchestration model.
- [Durable Task replay semantics](https://learn.microsoft.com/en-us/dotnet/api/microsoft.durabletask.taskorchestrationcontext.isreplaying?view=durabletask-dotnet-1.x): reuse of recorded task results during replay.
