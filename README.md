# `apex-quant-dsl`

**Zero-Dependency Quantitative Expression DSL Compiler, Recursive-Descent AST Parser & Vectorized Time-Series Engine in TypeScript**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/runtime_dependencies-0-10B981.svg)](#)
[![Compiler & AST](https://img.shields.io/badge/Parser-Recursive%20Descent%20AST-F59E0B.svg)](#grammar--compiler-pipeline)
[![License: MIT](https://img.shields.io/badge/license-MIT-10B981.svg)](LICENSE)

`apex-quant-dsl` is a deterministic, side-effect-free expression language and vectorized indicator engine designed for quantitative research pipelines and AI-driven financial analysis agents. Instead of executing arbitrary untrusted Python/`eval` code, `apex-quant-dsl` compiles a bounded pandas/vector expression grammar into a typed AST and evaluates it over multi-source OHLCV bar streams with Levenshtein `didYouMean` diagnostics.

---

## Grammar & Compiler Pipeline

```ebnf
program       := (assign NEWLINE)* expr NEWLINE?
assign        := NAME '=' expr
expr          := additive
additive      := multiplicative (('+' | '-') multiplicative)*
multiplicative:= unary (('*' | '/') unary)*
unary         := '-'? postfix
postfix       := primary ('.' NAME | '[' expr ']')*
primary       := NUMBER | STRING | list | dict | call | NAME | '(' expr ')'
call          := NAME '(' (arg (',' arg)*)? ')'
arg           := NAME '=' expr | expr
```

```text
DSL Script  ──►  Lexer (Token Stream + Line/Col Spans)
            ──►  Recursive-Descent Parser (Program AST + Keyword Guards)
            ──►  Total AST Evaluator (let* Bindings + Federated Bar Resolution)
            ──►  Vectorized Technical / Statistical Primitives
```

---

## Vectorized Indicator & Statistical Standard Library

| Category | Built-in Primitives |
| :--- | :--- |
| **Trend & Moving Averages** | `sma(series, period)`, `ema(series, period)`, `wma(series, period)` |
| **Momentum & Oscillators** | `rsi(series, period=14)`, `macd(series, fast=12, slow=26, signal=9)`, `roc(series, period)`, `stoch(high, low, close, k, d)` |
| **Volatility & Channels** | `bbands(series, period=20, std=2)`, `atr(high, low, close, period=14)`, `keltner(high, low, close, period, mult)` |
| **Cross-Asset Statistics** | `corr(a, b, window)`, `beta(asset, benchmark, window)`, `zscore(series, window)`, `sharpe(returns, rf=0)`, `max_drawdown(series)` |
| **Series Slicing & Transforms** | `pct_change(series, lag=1)`, `diff(series, lag=1)`, `log_return(series)`, `rank(series)`, `slice(series, start, end)` |

---

## Quick Example

```ts
import { runScript } from '@lbcron/apex-quant-dsl';

const script = `
  spy = bars("polygon|SPY", "1d", asset="equity", count=252)
  nvda = bars("polygon|NVDA", "1d", asset="equity", count=252)

  spread_z = zscore(pct_change(nvda.close, 20) - pct_change(spy.close, 20), 60)
  {
    rsi14: rsi(nvda.close, 14),
    rel_zscore: spread_z[-1],
    beta_60d: beta(nvda.close, spy.close, 60),
    max_dd: max_drawdown(nvda.close)
  }
`;

const result = await runScript(script, { barService });
// => {
//   value: { rsi14: 61.4208, rel_zscore: 1.8412, beta_60d: 1.7205, max_dd: -0.1842 },
//   dataRange: { "polygon|SPY": { ... }, "polygon|NVDA": { ... } }
// }
```

### Structured Self-Correction Diagnostics

When an expression contains a syntax error, type mismatch, or unknown function name, `runScript` never throws an untyped runtime exception; it returns a structured `CalcDiagnostic` with line/column spans and Levenshtein suggestions:

```json
{
  "error": {
    "kind": "unknown_function",
    "message": "Unknown function 'bolinger'",
    "line": 3,
    "col": 8,
    "suggestion": "Did you mean 'bollinger' or 'bbands'?"
  }
}
```

---

## License

MIT © [Ronan Chen-Lopes](https://github.com/LBCron)
