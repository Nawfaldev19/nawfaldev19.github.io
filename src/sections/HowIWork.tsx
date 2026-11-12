import { SectionHead } from '../components/SectionHead';

const AI = [
  ['Daily tools', 'Claude Code and Cursor, with subagents, MCP servers and custom skills.'],
  ['Rules', 'Each project has rule files (CLAUDE.md) that the agents must follow.'],
  ['Guardrails', 'Scoped permissions, one agent per file, and humans own every irreversible step.'],
  ['Verification', 'A written spec, tests, cross-checked reviews, and I review every diff.'],
];

const REMOTE = [
  ['Async first', 'Decisions, questions and handoffs go in writing, so nobody waits on a call.'],
  ['Written updates', 'Short, regular notes on what shipped, what is blocked and what is next.'],
  ['Overlap', 'Flexible overlap with US and European hours.'],
];

export function HowIWork() {
  return (
    <section id="how-i-work" className="section page" aria-labelledby="how-title">
      <SectionHead code="S.05" label="How I work" id="how-title">
        How I work
      </SectionHead>

      <div className="how">
        <div>
          <h3 className="how__title mono-label">With AI agents</h3>
          <dl className="how__list">
            {AI.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="how__quote">AI makes me faster; it doesn’t replace the judgement.</p>
        </div>
        <div>
          <h3 className="how__title mono-label">Remote</h3>
          <dl className="how__list">
            {REMOTE.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
