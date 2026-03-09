// ============================================================
// YieldPulse — Risk Scoring Algorithm
// Computes a 0-100 risk score for each pool
// ============================================================

import type { Pool, RiskBreakdown, RiskLevel, RiskScore } from "@/types"
import { RISK_THRESHOLDS } from "@/lib/constants"

/**
 * Compute a risk score (0-100) for a pool.
 * 0 = lowest risk, 100 = highest risk.
 */
export function computeRiskScore(pool: Pool): RiskScore {
  let tvlFactor = 0
  let apySustainability = 0
  let rewardDependency = 0
  let ilRisk = 0
  let apyVolatility = 0

  // 1. TVL Factor (0-25 pts) — lower TVL = higher risk
  if (pool.tvlUsd < 100_000) tvlFactor = 25
  else if (pool.tvlUsd < 1_000_000) tvlFactor = 20
  else if (pool.tvlUsd < 10_000_000) tvlFactor = 15
  else if (pool.tvlUsd < 100_000_000) tvlFactor = 10
  else if (pool.tvlUsd < 1_000_000_000) tvlFactor = 5
  else tvlFactor = 0

  // 2. APY Sustainability (0-25 pts) — very high APY = suspicious
  const apy = pool.apy ?? 0
  if (apy > 100) apySustainability = 25
  else if (apy > 50) apySustainability = 20
  else if (apy > 20) apySustainability = 12
  else if (apy > 10) apySustainability = 5
  else apySustainability = 0

  // 3. Reward Dependency (0-20 pts) — high reward vs base = less sustainable
  const apyNum = pool.apy ?? 0
  const denominator = Math.max(apyNum, 0.01)
  const rewardRatio = (pool.apyReward ?? 0) / denominator
  if (rewardRatio > 0.8) rewardDependency = 20
  else if (rewardRatio > 0.5) rewardDependency = 12
  else if (rewardRatio > 0.2) rewardDependency = 5
  else rewardDependency = 0

  // 4. Impermanent Loss Risk (0-15 pts)
  if (pool.ilRisk === "yes") ilRisk = 15
  else if (pool.exposure === "multi") ilRisk = 8
  else ilRisk = 0

  // 5. APY Volatility (0-15 pts) — big 30d swings = less predictable
  const apyChange30d = Math.abs(pool.apyPct30D ?? 0)
  if (apyChange30d > 50) apyVolatility = 15
  else if (apyChange30d > 20) apyVolatility = 10
  else if (apyChange30d > 10) apyVolatility = 5
  else apyVolatility = 0

  const score =
    tvlFactor +
    apySustainability +
    rewardDependency +
    ilRisk +
    apyVolatility

  const level: RiskLevel =
    score <= RISK_THRESHOLDS.low
      ? "low"
      : score <= RISK_THRESHOLDS.medium
        ? "medium"
        : "high"

  const breakdown: RiskBreakdown = {
    tvlFactor,
    apySustainability,
    rewardDependency,
    ilRisk,
    apyVolatility,
  }

  return { score, level, breakdown }
}
