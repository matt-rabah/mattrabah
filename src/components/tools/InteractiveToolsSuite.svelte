<script lang="ts">
  type ToolMode = 'handoff' | 'health';
  let activeTool = $state<ToolMode>('handoff');
  let copyFeedback = $state<string | null>(null);

  // --- Handoff Risk Checker State ---
  let scopeComplexity = $state<number>(1); // 0: Standard, 1: Moderate Custom, 2: Heavy Custom
  let sponsorStatus = $state<number>(1); // 0: Dedicated Champion, 1: Passive Sponsor, 2: Single Point / Absent
  let timelinePressure = $state<number>(1); // 0: Realistic Buffer, 1: Compressed, 2: Hard/Unrealistic SLA
  let dataReadiness = $state<number>(1); // 0: Clean / API Ready, 1: Partial / Legacy, 2: Unknown / Untested

  const scopeOptions = [
    { label: "Standard Off-the-Shelf", desc: "Out-of-box workflows and standard data models.", weight: 5 },
    { label: "Moderate Custom API / Config", desc: "Custom webhooks, role matrix, or light API integrations.", weight: 18 },
    { label: "Heavy Custom Engineering", desc: "Unscoped custom code, legacy migrations, or third-party blockers.", weight: 35 }
  ];

  const sponsorOptions = [
    { label: "Engaged Executive Sponsor", desc: "Attended final demo, owns business goals, committed cadence.", weight: 5 },
    { label: "Passive / Inferred Sponsor", desc: "Approved budget but has not participated in operational scoping.", weight: 18 },
    { label: "Absent / Single Point of Contact", desc: "Day-to-day user only; no economic buyer visibility or access.", weight: 30 }
  ];

  const timelineOptions = [
    { label: "Realistic with Buffer", desc: "Milestones aligned with customer IT capacity and holidays.", weight: 5 },
    { label: "Compressed by Sales Cycle", desc: "Go-live date fixed before technical feasibility completed.", weight: 18 },
    { label: "Emergency / Unrealistic SLA", desc: "Sub-30 day deadline tied to legacy contract expiration.", weight: 25 }
  ];

  const dataOptions = [
    { label: "Clean Exports & API Ready", desc: "Documented schemas, test environment, and dedicated IT liaison.", weight: 5 },
    { label: "Partial Exports / Legacy Format", desc: "CSV extracts with unvalidated historical fields and quirks.", weight: 14 },
    { label: "Unknown / No Sandbox Access", desc: "Customer cannot provide sample records or sandbox until kickoff.", weight: 25 }
  ];

  let handoffScore = $derived(
    Math.min(100, Math.round(
      scopeOptions[scopeComplexity].weight +
      sponsorOptions[sponsorStatus].weight +
      timelineOptions[timelinePressure].weight +
      dataOptions[dataReadiness].weight
    ))
  );

  let handoffRiskLevel = $derived.by(() => {
    if (handoffScore < 35) return { label: "LOW RISK", color: "var(--neon-cyan)", glow: "var(--glow-cyan)", status: "Controlled" };
    if (handoffScore < 65) return { label: "MODERATE RISK", color: "#f5a623", glow: "0 0 24px -4px rgba(245, 166, 35, 0.4)", status: "Needs Safeguards" };
    return { label: "CRITICAL RISK", color: "var(--neon-crimson)", glow: "var(--glow-crimson)", status: "High Probability of Stall" };
  });

  let handoffFailureModes = $derived.by(() => {
    const modes: string[] = [];
    if (scopeComplexity >= 1) modes.push("Scope Creep in SOW: Unbounded edge-case workflows will push the timeline 3–5 weeks.");
    if (sponsorStatus >= 1) modes.push("Sponsor Disconnect: If the core contact leaves or stalls, no executive escalation path exists.");
    if (timelinePressure >= 1) modes.push("Deployment Compression: UAT and training will be sacrificed to meet arbitrary deadline.");
    if (dataReadiness >= 1) modes.push("Data Cleansing Trap: Implementation engineering will spend 60%+ time fixing bad customer records.");
    if (modes.length === 0) modes.push("No major red flags detected. Maintain regular weekly stakeholder check-ins.");
    return modes;
  });

  let handoffPrescription = $derived.by(() => {
    if (handoffScore >= 65) {
      return "PAUSE SIGN-OFF: Require a Pre-Kickoff Technical Discovery session with the Economic Buyer. Strip non-core integrations out of Phase 1 and document them as Phase 2 expansion.";
    }
    if (handoffScore >= 35) {
      return "FLAG TO SALES: Establish a bilateral Mutual Action Plan (MAP) that conditions go-live milestones on customer providing validated data within 7 business days.";
    }
    return "PROCEED: Standard onboarding runbook applies. Schedule kickoff within 5 business days and lock executive sponsor into quarterly cadence.";
  });

  // --- Customer Health Signal Mapper State ---
  let signalUsageDrop = $state<boolean>(true);
  let signalChampionLeft = $state<boolean>(true);
  let signalSupportSpike = $state<boolean>(false);
  let signalRenewal90d = $state<boolean>(true);
  let signalExecMissed = $state<boolean>(false);
  let signalCoreFeatureIdle = $state<boolean>(false);

  let activeSignalCount = $derived(
    (signalUsageDrop ? 1 : 0) +
    (signalChampionLeft ? 1 : 0) +
    (signalSupportSpike ? 1 : 0) +
    (signalRenewal90d ? 1 : 0) +
    (signalExecMissed ? 1 : 0) +
    (signalCoreFeatureIdle ? 1 : 0)
  );

  let churnHazardScore = $derived.by(() => {
    let score = 10;
    if (signalUsageDrop) score += 20;
    if (signalChampionLeft) score += 25;
    if (signalSupportSpike) score += 12;
    if (signalRenewal90d) score += 18;
    if (signalExecMissed) score += 15;
    if (signalCoreFeatureIdle) score += 15;
    return Math.min(99, score);
  });

  let healthDiagnosis = $derived.by(() => {
    if (signalChampionLeft && signalRenewal90d) {
      return {
        title: "Orphaned Account Syndrome",
        severity: "CRITICAL",
        cause: "New management has inherited an unfamiliar tool with renewal impending and zero perceived allegiance.",
        play: "Bypass standard rep outreach. Have VP or Founder send a personalized executive value summary offering a complimentary re-onboarding briefing for the new lead."
      };
    }
    if (signalUsageDrop && signalCoreFeatureIdle) {
      return {
        title: "Shelfware Disillusionment",
        severity: "HIGH",
        cause: "Users defaulted to old legacy habits because the high-value workflow was never operationalized into daily muscle memory.",
        play: "Initiate targeted 'micro-enablement' sprint focusing solely on the single stickiest feature. Disable distracting secondary modules."
      };
    }
    if (signalSupportSpike) {
      return {
        title: "Product Friction Fatigue",
        severity: "MEDIUM",
        cause: "Repeated operational bugs or confusing UI states have eroded team confidence and consumed end-user patience.",
        play: "Establish a direct engineering bridge: deliver a dedicated root-cause memo to the customer with specific release fix dates within 48 hours."
      };
    }
    return {
      title: "Stabilized / Low Friction State",
      severity: "LOW",
      cause: "Signals indicate steady operating cadence without imminent churn indicators.",
      play: "Focus on identifying expansion opportunities and capturing quantitative customer case study metrics for upcoming QBR."
    };
  });

  function triggerCopy(text: string, label: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        copyFeedback = `${label} copied to clipboard!`;
        setTimeout(() => {
          copyFeedback = null;
        }, 2500);
      });
    }
  }

  function copyHandoffSummary() {
    const summary = `--- HANDOFF RISK SUMMARY ---
Risk Score: ${handoffScore}/100 (${handoffRiskLevel.label})
Status: ${handoffRiskLevel.status}

FAILURE MODES IDENTIFIED:
${handoffFailureModes.map(m => `• ${m}`).join('\n')}

TACTICAL MITIGATION PROTOCOL:
${handoffPrescription}
Generated via mattrabah.com/tools`;
    triggerCopy(summary, "Handoff Report");
  }

  function copyHealthSummary() {
    const summary = `--- ACCOUNT HEALTH DIAGNOSTIC ---
Churn Hazard Score: ${churnHazardScore}%
Active Warning Signals: ${activeSignalCount}
Pattern Identified: ${healthDiagnosis.title} (${healthDiagnosis.severity})

ROOT CAUSE:
${healthDiagnosis.cause}

72-HOUR RECOVERY PLAY:
${healthDiagnosis.play}
Generated via mattrabah.com/tools`;
    triggerCopy(summary, "Health Playbook");
  }
</script>

<div class="tools-suite">
  <!-- Nav Tabs -->
  <div class="tools-nav" role="tablist" aria-label="Tool Selection">
    <button
      role="tab"
      class="nav-tab {activeTool === 'handoff' ? 'nav-tab--active' : ''}"
      aria-selected={activeTool === 'handoff'}
      onclick={() => (activeTool = 'handoff')}
    >
      <span class="tab-indicator" aria-hidden="true"></span>
      <span class="tab-title">Handoff Risk Checker</span>
      <span class="tab-badge">Interactive</span>
    </button>
    <button
      role="tab"
      class="nav-tab {activeTool === 'health' ? 'nav-tab--active' : ''}"
      aria-selected={activeTool === 'health'}
      onclick={() => (activeTool = 'health')}
    >
      <span class="tab-indicator" aria-hidden="true"></span>
      <span class="tab-title">Customer Health Signal Mapper</span>
      <span class="tab-badge">Interactive</span>
    </button>
  </div>

  <!-- Toast Notification -->
  {#if copyFeedback}
    <div class="copy-toast" role="status" aria-live="polite">
      <span class="toast-dot"></span>
      {copyFeedback}
    </div>
  {/if}

  <!-- Tool 1: Handoff Risk Checker -->
  {#if activeTool === 'handoff'}
    <div class="tool-canvas" role="tabpanel" aria-labelledby="tab-handoff">
      <div class="canvas-header">
        <div>
          <span class="sub-label">DIAGNOSTIC ENGINE 01</span>
          <h2 class="h3 canvas-title">Handoff Risk Checker</h2>
          <p class="canvas-desc">
            Calculate the hidden implementation landmines embedded in sales commitments before kickoff.
          </p>
        </div>
        <button class="action-btn" onclick={copyHandoffSummary}>
          <svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Export Summary
        </button>
      </div>

      <div class="grid-layout">
        <!-- Input Matrix -->
        <div class="input-panel">
          <!-- Parameter 1: Scope -->
          <fieldset class="param-group">
            <legend class="param-title">1. Sales Promise & Scope Complexity</legend>
            <div class="option-stack">
              {#each scopeOptions as opt, idx}
                <label class="option-card {scopeComplexity === idx ? 'option-card--active' : ''}">
                  <input
                    type="radio"
                    name="scope"
                    value={idx}
                    checked={scopeComplexity === idx}
                    onchange={() => (scopeComplexity = idx)}
                    class="sr-only"
                  />
                  <div class="option-check" aria-hidden="true"></div>
                  <div class="option-text">
                    <span class="opt-label">{opt.label}</span>
                    <span class="opt-desc">{opt.desc}</span>
                  </div>
                </label>
              {/each}
            </div>
          </fieldset>

          <!-- Parameter 2: Sponsor -->
          <fieldset class="param-group">
            <legend class="param-title">2. Executive Sponsor Alignment</legend>
            <div class="option-stack">
              {#each sponsorOptions as opt, idx}
                <label class="option-card {sponsorStatus === idx ? 'option-card--active' : ''}">
                  <input
                    type="radio"
                    name="sponsor"
                    value={idx}
                    checked={sponsorStatus === idx}
                    onchange={() => (sponsorStatus = idx)}
                    class="sr-only"
                  />
                  <div class="option-check" aria-hidden="true"></div>
                  <div class="option-text">
                    <span class="opt-label">{opt.label}</span>
                    <span class="opt-desc">{opt.desc}</span>
                  </div>
                </label>
              {/each}
            </div>
          </fieldset>

          <!-- Parameter 3: Timeline -->
          <fieldset class="param-group">
            <legend class="param-title">3. Go-Live Timeline & SLA Pressure</legend>
            <div class="option-stack">
              {#each timelineOptions as opt, idx}
                <label class="option-card {timelinePressure === idx ? 'option-card--active' : ''}">
                  <input
                    type="radio"
                    name="timeline"
                    value={idx}
                    checked={timelinePressure === idx}
                    onchange={() => (timelinePressure = idx)}
                    class="sr-only"
                  />
                  <div class="option-check" aria-hidden="true"></div>
                  <div class="option-text">
                    <span class="opt-label">{opt.label}</span>
                    <span class="opt-desc">{opt.desc}</span>
                  </div>
                </label>
              {/each}
            </div>
          </fieldset>

          <!-- Parameter 4: Data Readiness -->
          <fieldset class="param-group">
            <legend class="param-title">4. Customer Data & System Readiness</legend>
            <div class="option-stack">
              {#each dataOptions as opt, idx}
                <label class="option-card {dataReadiness === idx ? 'option-card--active' : ''}">
                  <input
                    type="radio"
                    name="data"
                    value={idx}
                    checked={dataReadiness === idx}
                    onchange={() => (dataReadiness = idx)}
                    class="sr-only"
                  />
                  <div class="option-check" aria-hidden="true"></div>
                  <div class="option-text">
                    <span class="opt-label">{opt.label}</span>
                    <span class="opt-desc">{opt.desc}</span>
                  </div>
                </label>
              {/each}
            </div>
          </fieldset>
        </div>

        <!-- Telemetry & Diagnostic Output -->
        <div class="telemetry-panel">
          <div class="metric-card" style="box-shadow: {handoffRiskLevel.glow}">
            <div class="metric-head">
              <span class="telemetry-tag">REALTIME HAZARD INDEX</span>
              <span class="status-indicator" style="color: {handoffRiskLevel.color};">
                ● {handoffRiskLevel.status}
              </span>
            </div>

            <div class="score-display">
              <div class="score-number" style="color: {handoffRiskLevel.color};">
                {handoffScore}
              </div>
              <div class="score-meta">
                <span class="score-ceiling">/ 100</span>
                <span class="score-badge" style="border-color: {handoffRiskLevel.color}; color: {handoffRiskLevel.color}">
                  {handoffRiskLevel.label}
                </span>
              </div>
            </div>

            <div class="progress-track" aria-hidden="true">
              <div
                class="progress-fill"
                style="width: {handoffScore}%; background-color: {handoffRiskLevel.color};"
              ></div>
            </div>
          </div>

          <!-- Risk Factors -->
          <div class="report-section">
            <h3 class="section-title">Identified Failure Modes</h3>
            <ul class="failure-list">
              {#each handoffFailureModes as mode}
                <li class="failure-item">
                  <span class="bullet-cross" aria-hidden="true">✕</span>
                  <span>{mode}</span>
                </li>
              {/each}
            </ul>
          </div>

          <!-- Tactical Mitigation Protocol -->
          <div class="report-section prescription-card">
            <h3 class="section-title text-accent">Recommended Mitigation Protocol</h3>
            <p class="prescription-text">{handoffPrescription}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Tool 2: Customer Health Signal Mapper -->
  {#if activeTool === 'health'}
    <div class="tool-canvas" role="tabpanel" aria-labelledby="tab-health">
      <div class="canvas-header">
        <div>
          <span class="sub-label">DIAGNOSTIC ENGINE 02</span>
          <h2 class="h3 canvas-title">Customer Health Signal Mapper</h2>
          <p class="canvas-desc">
            Map leading indicators of customer attrition into prescriptive turnaround plays.
          </p>
        </div>
        <button class="action-btn" onclick={copyHealthSummary}>
          <svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Export Playbook
        </button>
      </div>

      <div class="grid-layout">
        <!-- Signal Switchboard -->
        <div class="input-panel">
          <div class="switchboard-head">
            <span class="param-title">Active Risk Indicators</span>
            <span class="active-count">{activeSignalCount} active triggers</span>
          </div>

          <div class="toggle-stack">
            <label class="toggle-card {signalUsageDrop ? 'toggle-card--active' : ''}">
              <input type="checkbox" bind:checked={signalUsageDrop} class="sr-only" />
              <div class="toggle-switch" aria-hidden="true">
                <div class="switch-thumb"></div>
              </div>
              <div class="toggle-info">
                <span class="opt-label">30%+ Drop in Weekly Active Users</span>
                <span class="opt-desc">Team logins and core workflow activity declining week-over-week.</span>
              </div>
            </label>

            <label class="toggle-card {signalChampionLeft ? 'toggle-card--active' : ''}">
              <input type="checkbox" bind:checked={signalChampionLeft} class="sr-only" />
              <div class="toggle-switch" aria-hidden="true">
                <div class="switch-thumb"></div>
              </div>
              <div class="toggle-info">
                <span class="opt-label">Primary Champion / Executive Departed</span>
                <span class="opt-desc">Key internal advocate left the org or transitioned to an unrelated role.</span>
              </div>
            </label>

            <label class="toggle-card {signalRenewal90d ? 'toggle-card--active' : ''}">
              <input type="checkbox" bind:checked={signalRenewal90d} class="sr-only" />
              <div class="toggle-switch" aria-hidden="true">
                <div class="switch-thumb"></div>
              </div>
              <div class="toggle-info">
                <span class="opt-label">Contract Renewal within 90 Days</span>
                <span class="opt-desc">Commercial renegotiation window open; procurement reviewing software spend.</span>
              </div>
            </label>

            <label class="toggle-card {signalSupportSpike ? 'toggle-card--active' : ''}">
              <input type="checkbox" bind:checked={signalSupportSpike} class="sr-only" />
              <div class="toggle-switch" aria-hidden="true">
                <div class="switch-thumb"></div>
              </div>
              <div class="toggle-info">
                <span class="opt-label">Escalation Spike (3+ Open High-Severity Tickets)</span>
                <span class="opt-desc">Frustration building around unresolved bugs or broken integration syncs.</span>
              </div>
            </label>

            <label class="toggle-card {signalExecMissed ? 'toggle-card--active' : ''}">
              <input type="checkbox" bind:checked={signalExecMissed} class="sr-only" />
              <div class="toggle-switch" aria-hidden="true">
                <div class="switch-thumb"></div>
              </div>
              <div class="toggle-info">
                <span class="opt-label">Executive Touchpoint Postponed / Ghosted</span>
                <span class="opt-desc">Last two QBRs or review invites were declined or delegated downward.</span>
              </div>
            </label>

            <label class="toggle-card {signalCoreFeatureIdle ? 'toggle-card--active' : ''}">
              <input type="checkbox" bind:checked={signalCoreFeatureIdle} class="sr-only" />
              <div class="toggle-switch" aria-hidden="true">
                <div class="switch-thumb"></div>
              </div>
              <div class="toggle-info">
                <span class="opt-label">Primary ROI Driver Feature Unactivated</span>
                <span class="opt-desc">Customer uses basic features only; core capability driving deal ROI sits idle.</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Telemetry & Diagnostic Output -->
        <div class="telemetry-panel">
          <div class="metric-card" style="box-shadow: 0 0 28px -4px rgba(240, 68, 86, 0.35);">
            <div class="metric-head">
              <span class="telemetry-tag">CHURN HAZARD PROBABILITY</span>
              <span class="status-indicator" style="color: var(--neon-crimson);">
                ● {healthDiagnosis.severity}
              </span>
            </div>

            <div class="score-display">
              <div class="score-number" style="color: var(--neon-crimson);">
                {churnHazardScore}<span style="font-size: 0.55em">%</span>
              </div>
              <div class="score-meta">
                <span class="score-ceiling">Estimated Risk</span>
                <span class="score-badge" style="border-color: var(--neon-crimson); color: var(--neon-crimson)">
                  {healthDiagnosis.title}
                </span>
              </div>
            </div>

            <div class="progress-track" aria-hidden="true">
              <div
                class="progress-fill"
                style="width: {churnHazardScore}%; background-color: var(--neon-crimson);"
              ></div>
            </div>
          </div>

          <!-- Root Cause -->
          <div class="report-section">
            <h3 class="section-title">Root Cause Analysis</h3>
            <p class="body-sm text-subtle">{healthDiagnosis.cause}</p>
          </div>

          <!-- Prescriptive Playbook -->
          <div class="report-section prescription-card">
            <h3 class="section-title text-accent">Prescriptive 72-Hour Turnaround Play</h3>
            <p class="prescription-text">{healthDiagnosis.play}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .tools-suite {
    margin-top: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Nav Tabs */
  .tools-nav {
    display: flex;
    gap: var(--space-3);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-2);
    overflow-x: auto;
  }
  .nav-tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: transparent;
    border: 1px solid transparent;
    color: var(--color-text-subtle);
    font-family: var(--font-sans);
    font-size: var(--fs-body-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 180ms ease;
    white-space: nowrap;
  }
  .nav-tab:hover {
    color: var(--color-text);
    background: var(--color-surface-hover);
  }
  .nav-tab--active {
    color: var(--color-text);
    background: var(--color-surface-raised);
    border-color: var(--color-border-strong);
  }
  .tab-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-border-heavy);
    transition: background-color 200ms ease;
  }
  .nav-tab--active .tab-indicator {
    background: var(--neon-cyan);
    box-shadow: 0 0 8px var(--neon-cyan);
  }
  .tab-badge {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    padding: 0.15rem 0.45rem;
    border-radius: var(--radius-pill);
    background: rgba(0, 229, 255, 0.12);
    color: var(--neon-cyan);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Canvas Panel */
  .tool-canvas {
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-xl);
    background: color-mix(in srgb, var(--color-surface-raised) 70%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: clamp(var(--space-5), 4vw, var(--space-7));
  }

  .canvas-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-5);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }
  .sub-label {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.08em;
    color: var(--neon-cyan);
    margin-bottom: var(--space-2);
  }
  .canvas-title {
    letter-spacing: -0.025em;
    margin: 0;
  }
  .canvas-desc {
    color: var(--color-text-subtle);
    font-size: var(--fs-body-sm);
    margin-top: var(--space-2);
    max-width: 55ch;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0.55rem 1rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--color-border-strong);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: var(--fs-meta);
    font-weight: 500;
    cursor: pointer;
    transition: all 180ms ease;
  }
  .action-btn:hover {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
    background: rgba(0, 229, 255, 0.08);
  }

  /* Layout Grid */
  .grid-layout {
    display: grid;
    gap: var(--space-6);
  }
  @media (min-width: 56rem) {
    .grid-layout {
      grid-template-columns: 1.4fr 1fr;
    }
  }

  /* Input Options */
  .input-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }
  .param-group {
    border: none;
    padding: 0;
    margin: 0;
  }
  .param-title {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    font-weight: 600;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: var(--space-3);
  }

  .option-stack {
    display: grid;
    gap: var(--space-2);
  }
  .option-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 150ms ease;
  }
  .option-card:hover {
    border-color: var(--color-border-strong);
    background: var(--color-surface-hover);
  }
  .option-card--active {
    border-color: var(--neon-cyan);
    background: rgba(0, 229, 255, 0.05);
  }
  .option-check {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 1.5px solid var(--color-border-heavy);
    margin-top: 0.15rem;
    flex-shrink: 0;
    transition: all 150ms ease;
  }
  .option-card--active .option-check {
    border-color: var(--neon-cyan);
    background: var(--neon-cyan);
    box-shadow: 0 0 8px var(--neon-cyan);
  }
  .option-text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .opt-label {
    font-weight: 500;
    font-size: var(--fs-body-sm);
    color: var(--color-text);
  }
  .opt-desc {
    font-size: var(--fs-meta);
    color: var(--color-text-faint);
    line-height: 1.4;
  }

  /* Telemetry Panel */
  .telemetry-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .metric-card {
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    transition: box-shadow 300ms ease;
  }
  .metric-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }
  .telemetry-tag {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.06em;
    color: var(--color-text-faint);
  }
  .status-indicator {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    font-weight: 600;
  }

  .score-display {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
  }
  .score-number {
    font-size: clamp(3.2rem, 6vw, 4.5rem);
    font-weight: 700;
    line-height: 1;
    font-family: var(--font-sans);
    letter-spacing: -0.04em;
    transition: color 250ms ease;
  }
  .score-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .score-ceiling {
    font-size: var(--fs-body-sm);
    color: var(--color-text-faint);
    font-family: var(--font-mono);
  }
  .score-badge {
    display: inline-block;
    border: 1px solid;
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .progress-track {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: var(--color-surface-hover);
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 300ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms ease;
  }

  /* Reports */
  .report-section {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    padding: var(--space-5);
  }
  .prescription-card {
    border-color: var(--color-border-accent);
    background: color-mix(in srgb, var(--color-surface) 90%, rgba(0, 229, 255, 0.05));
  }
  .section-title {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin: 0 0 var(--space-3) 0;
    color: var(--color-text);
  }
  .text-accent {
    color: var(--neon-cyan);
  }
  .failure-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--space-2);
  }
  .failure-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    font-size: var(--fs-body-sm);
    color: var(--color-text-subtle);
    line-height: 1.45;
  }
  .bullet-cross {
    color: var(--neon-crimson);
    font-weight: bold;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
  .prescription-text {
    font-size: var(--fs-body-sm);
    line-height: 1.55;
    color: var(--color-text);
    margin: 0;
  }

  /* Switchboard for Tool 2 */
  .switchboard-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-3);
  }
  .active-count {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    color: var(--neon-crimson);
  }
  .toggle-stack {
    display: grid;
    gap: var(--space-2);
  }
  .toggle-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 150ms ease;
  }
  .toggle-card:hover {
    border-color: var(--color-border-strong);
    background: var(--color-surface-hover);
  }
  .toggle-card--active {
    border-color: rgba(240, 68, 86, 0.4);
    background: rgba(240, 68, 86, 0.05);
  }
  .toggle-switch {
    width: 2.2rem;
    height: 1.25rem;
    border-radius: 999px;
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-strong);
    position: relative;
    flex-shrink: 0;
    transition: all 200ms ease;
  }
  .toggle-card--active .toggle-switch {
    background: var(--neon-crimson);
    border-color: var(--neon-crimson);
  }
  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 0.95rem;
    height: 0.95rem;
    border-radius: 50%;
    background: var(--color-text);
    transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .toggle-card--active .switch-thumb {
    transform: translateX(0.95rem);
    background: #000;
  }
  .toggle-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  /* Toast */
  .copy-toast {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    z-index: 1000;
    background: var(--color-surface-raised);
    border: 1px solid var(--neon-cyan);
    box-shadow: var(--glow-cyan);
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-pill);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    animation: toast-in 200ms ease-out;
  }
  .toast-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--neon-cyan);
  }
  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
