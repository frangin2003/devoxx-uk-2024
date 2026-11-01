# GV8 — Human-Readable Agent Communication

## Prompt for GPT-6.1 Sol

You are improving the **language and clarity** of GV8's existing agent-to-human progress updates, not redesigning GV8.

### Background

GV8 already provides regular progress updates during autonomous coding tasks. Keep their frequency, triggers, content coverage, and existing autonomy unchanged.

As an agent investigates and implements a solution, it accumulates context that the supervising engineer hasn't seen. Its updates may then become hard to follow: not because they're too long, but because they use dense jargon, unexplained concepts, and conclusions whose rationale is missing.

### Your task

Inspect GV8's current system instructions and make the **smallest targeted change** needed to improve the language of progress updates, decision explanations, and completion reports.

Write as an excellent senior engineer explaining work to another experienced engineer who wasn't part of the investigation.

- Use natural, accessible technical English. Avoid unnecessary jargon, stacked abstractions, unexplained acronyms, and cryptic shorthand.
- Assume the reader **wasn't in your head**. Briefly bridge missing context before presenting a conclusion.
- Explain **why** a decision matters, not only **what** was done. State the practical problem and effect in terms the reader can understand.
- Keep technical accuracy and relevant detail. Don't oversimplify, over-explain, or make updates longer by default.
- Make each update understandable on its own when feasible, without repeatedly recapping the entire task.
- Clearly distinguish facts, hypotheses, completed work, and intended next steps.
- Adapt the explanation to the significance of the update; don't impose a rigid template.

### Example

**Before:** “Refactored the orchestration layer to implement asynchronous dispatch with improved state reconciliation.”

**After:** “I found that two agents could update the same task at once, risking conflicting changes. I've changed how those updates are coordinated so parallel execution is safer.”

Use examples only to illustrate the style; never assert that a fix works unless it has been verified.

### Constraints

Do **not** change execution behaviour, autonomy, progress-update frequency, checkpoint policy, tool use, or reporting format. Do not add new reporting stages or require user approval. This is a **communication-language improvement only**.

Avoid duplicating existing instructions or introducing a long prescriptive rule set.

### Implementation

1. Locate the existing communication instructions.
2. Make a minimal, coherent edit in the appropriate place.
3. Check for conflicts or unintended behavioural changes.
4. Show the precise instruction changes and briefly explain how they improve comprehensibility.

### Success criterion

An experienced engineer who did not follow the agent's investigation should understand each update on first reading, with fewer requests to “explain that,” “make it simpler,” or “what does that mean?”

This is a hypothesis to test, not a guaranteed result. Compare similar tasks before and after the change and track the **number of clarification requests per task**. Keep the improvement only if it measurably helps without reducing accuracy or useful information.
