import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8")
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

function findRepoRoot(startDir) {
  let current = path.resolve(startDir)
  while (true) {
    const candidate = path.join(current, "pnpm-workspace.yaml")
    if (fileExists(candidate)) return current
    const parent = path.dirname(current)
    if (parent === current) return null
    current = parent
  }
}

function parseArgs(argv) {
  const args = { format: "md", skipPnpm: false, root: null }
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i]
    if (token === "--skip-pnpm") {
      args.skipPnpm = true
      continue
    }
    if (token === "--format") {
      const value = argv[i + 1]
      if (!value) throw new Error("Missing value for --format (md|json)")
      args.format = value
      i++
      continue
    }
    if (token === "--root") {
      const value = argv[i + 1]
      if (!value) throw new Error("Missing value for --root <path>")
      args.root = value
      i++
      continue
    }
    throw new Error(`Unknown argument: ${token}`)
  }
  if (args.format !== "md" && args.format !== "json") {
    throw new Error(`Invalid --format: ${args.format}. Expected md|json`)
  }
  return args
}

function parseWorkspacePatterns(yamlText) {
  const lines = yamlText.split(/\r?\n/)
  const patterns = []
  let inPackages = false
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (line.startsWith("#")) continue
    if (line === "packages:" || line.startsWith("packages:")) {
      inPackages = true
      continue
    }
    if (!inPackages) continue
    if (!line.startsWith("-")) continue
    const value = line.slice(1).trim()
    const unquoted = value.replace(/^['"]|['"]$/g, "")
    if (unquoted) patterns.push(unquoted)
  }
  return patterns
}

function toPosix(relPath) {
  return relPath.split(path.sep).join("/")
}

function globToRegExp(glob) {
  const escaped = glob
    .split("")
    .map((ch) => {
      if ("\\^$+?.()|{}[]".includes(ch)) return `\\${ch}`
      return ch
    })
    .join("")
  const withGlob = escaped
    .replaceAll("\\*\\*", "___GLOBSTAR___")
    .replaceAll("\\*", "___STAR___")
    .replaceAll("___GLOBSTAR___", ".*")
    .replaceAll("___STAR___", "[^/]*")
  return new RegExp(`^${withGlob}$`)
}

function walkFiles(rootDir, options) {
  const { ignoreDirNames, maxDepth } = options
  const files = []
  const stack = [{ dir: rootDir, depth: 0 }]
  while (stack.length > 0) {
    const { dir, depth } = stack.pop()
    if (depth > maxDepth) continue
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (ignoreDirNames.has(entry.name)) continue
        stack.push({ dir: path.join(dir, entry.name), depth: depth + 1 })
        continue
      }
      if (entry.isFile()) files.push(path.join(dir, entry.name))
    }
  }
  return files
}

function readJson(filePath) {
  const text = readText(filePath)
  return JSON.parse(text)
}

function collectWorkspacePackages(repoRoot, workspacePatterns) {
  const packageJsonFiles = walkFiles(repoRoot, {
    ignoreDirNames: new Set(["node_modules", ".git", "dist", "build", "coverage"]),
    maxDepth: 8,
  }).filter((p) => path.basename(p) === "package.json")

  const matchers = workspacePatterns.map((pattern) => globToRegExp(pattern))
  function isWorkspacePkg(packageJsonPath) {
    const dir = path.dirname(packageJsonPath)
    const rel = toPosix(path.relative(repoRoot, dir))
    return matchers.some((re) => re.test(rel))
  }

  const workspacePkgJsonPaths = packageJsonFiles.filter(isWorkspacePkg)
  const rootPkgJsonPath = path.join(repoRoot, "package.json")
  const hasRoot = workspacePkgJsonPaths.some((p) => path.resolve(p) === path.resolve(rootPkgJsonPath))
  const allPkgJsonPaths = hasRoot ? workspacePkgJsonPaths : [rootPkgJsonPath, ...workspacePkgJsonPaths]

  const packages = []
  for (const pkgJsonPath of allPkgJsonPaths) {
    if (!fileExists(pkgJsonPath)) continue
    const pkg = readJson(pkgJsonPath)
    packages.push({
      name: typeof pkg.name === "string" ? pkg.name : path.relative(repoRoot, path.dirname(pkgJsonPath)),
      path: pkgJsonPath,
      dir: path.dirname(pkgJsonPath),
      scripts: typeof pkg.scripts === "object" && pkg.scripts ? pkg.scripts : {},
      dependencies: pkg.dependencies ?? {},
      devDependencies: pkg.devDependencies ?? {},
      peerDependencies: pkg.peerDependencies ?? {},
      packageManager: pkg.packageManager,
    })
  }
  return packages
}

function detectPnpmUsage(repoRoot, rootPkg) {
  const pnpmWorkspace = fileExists(path.join(repoRoot, "pnpm-workspace.yaml"))
  const pnpmLock = fileExists(path.join(repoRoot, "pnpm-lock.yaml"))
  const pkgManager = typeof rootPkg.packageManager === "string" ? rootPkg.packageManager : ""
  const isPnpmPkgManager = pkgManager.startsWith("pnpm@")
  const ok = pnpmWorkspace || pnpmLock || isPnpmPkgManager
  const reasons = []
  if (pnpmWorkspace) reasons.push("pnpm-workspace.yaml")
  if (pnpmLock) reasons.push("pnpm-lock.yaml")
  if (isPnpmPkgManager) reasons.push("packageManager=pnpm@*")
  return { ok, reasons, pnpmWorkspace, pnpmLock, packageManager: pkgManager }
}

function quoteCmdArg(value) {
  const text = String(value)
  if (text.length === 0) return '""'
  if (!/[ \t"&|<>^]/.test(text)) return text
  return `"${text.replaceAll('"', '\\"')}"`
}

function runPnpmWin32(repoRoot, args) {
  const comspec = process.env.comspec || "cmd.exe"
  const command = ["pnpm", ...args].map(quoteCmdArg).join(" ")
  const cmdArgs = ["/d", "/s", "/c", command]
  return execFileSync(comspec, cmdArgs, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
}

function tryRunPnpm(repoRoot, args) {
  const result = { ok: false, stdout: "", stderr: "", error: null, cmd: ["pnpm", ...args].join(" ") }
  try {
    const stdout =
      process.platform === "win32"
        ? runPnpmWin32(repoRoot, args)
        : execFileSync("pnpm", args, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
    result.ok = true
    result.stdout = stdout
    result.cmd = process.platform === "win32" ? `cmd.exe /c ${result.cmd}` : result.cmd
    return result
  } catch (error) {
    result.ok = false
    result.error = error instanceof Error ? error.message : String(error)
    try {
      const stdout = error?.stdout?.toString?.() ?? ""
      const stderr = error?.stderr?.toString?.() ?? ""
      result.stdout = stdout
      result.stderr = stderr
    } catch {
      result.stdout = ""
      result.stderr = ""
    }
    return result
  }
}

function getAllScripts(packages) {
  const items = []
  for (const pkg of packages) {
    for (const [name, command] of Object.entries(pkg.scripts)) {
      if (typeof command !== "string") continue
      items.push({ packageName: pkg.name, packageJsonPath: pkg.path, script: name, command })
    }
  }
  return items
}

function hasWorkspaceSelector(command) {
  return (
    command.includes("pnpm -r") ||
    command.includes("pnpm --recursive") ||
    command.includes("pnpm --filter") ||
    command.includes("pnpm -F") ||
    command.includes("pnpm --workspace-root") ||
    command.includes("pnpm -w")
  )
}

function analyzeCommand(command) {
  const usesNpm = /\bnpm(\.cmd)?\b/.test(command)
  const usesYarn = /\byarn(\.cmd)?\b/.test(command)
  const usesPnpm = /\bpnpm(\.cmd)?\b/.test(command)
  const hasParallel = command.includes("--parallel")
  const hasRecursive = command.includes("pnpm -r") || command.includes("pnpm --recursive")
  const hasFilter = command.includes("pnpm --filter") || command.includes("pnpm -F")

  const issues = []
  if (usesNpm || usesYarn) {
    issues.push({ level: "error", message: "检测到 npm/yarn 命令；按规范必须使用 pnpm（workspace 兼容）" })
  }
  if (hasParallel && !(hasRecursive || hasFilter)) {
    issues.push({ level: "error", message: "检测到 --parallel 但未使用 -r/--filter；并行跨工作区需用 pnpm run -r --parallel 或 pnpm --filter ... --parallel" })
  }
  if (usesPnpm) {
    const likelyCrossWorkspace = /\bpackages\/|\bapp\/|--filter|-r|--recursive/.test(command)
    if (likelyCrossWorkspace && !hasWorkspaceSelector(command)) {
      issues.push({ level: "error", message: "疑似跨工作区操作但未使用 -r/--filter/--workspace-root；请补充 workspace 选择器" })
    }
  }

  const ok = issues.every((i) => i.level !== "error")
  const status = ok ? "ok" : "error"
  return { status, issues, usesPnpm, usesNpm, usesYarn, hasParallel, hasRecursive, hasFilter }
}

function collectWorkspaceProtocolViolations(workspacePackages) {
  const workspaceNames = new Set(workspacePackages.map((p) => p.name))
  const violations = []

  function checkDeps(pkg, deps, field) {
    for (const [depName, depRange] of Object.entries(deps)) {
      if (!workspaceNames.has(depName)) continue
      if (typeof depRange !== "string") continue
      if (!depRange.startsWith("workspace:")) {
        violations.push({
          packageName: pkg.name,
          packageJsonPath: pkg.path,
          dependency: depName,
          field,
          range: depRange,
          expected: "workspace:* / workspace:^ / workspace:~",
        })
      }
    }
  }

  for (const pkg of workspacePackages) {
    checkDeps(pkg, pkg.dependencies, "dependencies")
    checkDeps(pkg, pkg.devDependencies, "devDependencies")
    checkDeps(pkg, pkg.peerDependencies, "peerDependencies")
  }

  return violations
}

function mdEscape(text) {
  return String(text).replaceAll("|", "\\|").replaceAll("\n", " ")
}

function buildMarkdownReport(report) {
  const lines = []
  lines.push("# pnpm 工作区命令验证报告")
  lines.push("")
  lines.push("## 环境与项目结构")
  lines.push(`- 仓库根目录：\`${report.repoRoot}\``)
  lines.push(`- pnpm 识别：${report.pnpm.ok ? "通过" : "未通过"}（${report.pnpm.reasons.join(", ") || "无"}）`)
  if (!report.pnpm.pnpmLock) lines.push("- pnpm-lock.yaml：未发现（可能尚未安装依赖或未提交）")
  if (!report.pnpm.packageManager) lines.push("- package.json: 未声明 packageManager（建议补充 pnpm@*）")
  lines.push("")
  lines.push("## 命令检查流程结果")
  lines.push(`- pnpm ls：${report.pnpmLs.ok ? "通过" : "失败/跳过"}`)
  if (!report.pnpmLs.ok && report.pnpmLs.error) lines.push(`  - 错误：${mdEscape(report.pnpmLs.error)}`)
  lines.push(`- pnpm run：${report.pnpmRun.ok ? "通过" : "失败/跳过"}`)
  if (!report.pnpmRun.ok && report.pnpmRun.error) lines.push(`  - 错误：${mdEscape(report.pnpmRun.error)}`)
  lines.push("")
  lines.push("## 可执行命令清单（来自 package.json scripts）")
  lines.push("")
  lines.push("| Package | scripts 来源 | Script | Command | pnpm workspace 合规 | 说明 |")
  lines.push("|---|---|---|---|---|---|")
  for (const item of report.scripts) {
    const notes = item.issues.length > 0 ? item.issues.map((i) => i.message).join("; ") : ""
    const compliance = item.status === "ok" ? "符合" : "不符合"
    lines.push(
      `| ${mdEscape(item.packageName)} | ${mdEscape(item.packageJsonPath)} | ${mdEscape(item.script)} | ${mdEscape(item.command)} | ${compliance} | ${mdEscape(notes)} |`,
    )
  }
  lines.push("")
  lines.push("## workspace 协议引用检查")
  lines.push("")
  if (report.workspaceProtocolViolations.length === 0) {
    lines.push("- 未发现 workspace: 协议引用问题")
  } else {
    lines.push("| Package | package.json | 依赖字段 | 依赖名 | 当前版本 | 期望 |")
    lines.push("|---|---|---|---|---|---|")
    for (const v of report.workspaceProtocolViolations) {
      lines.push(
        `| ${mdEscape(v.packageName)} | ${mdEscape(v.packageJsonPath)} | ${mdEscape(v.field)} | ${mdEscape(v.dependency)} | ${mdEscape(v.range)} | ${mdEscape(v.expected)} |`,
      )
    }
  }
  lines.push("")
  lines.push("## 执行建议与注意事项")
  lines.push("- 跨工作区执行脚本：优先使用 `pnpm -r run <script>` 或 `pnpm --filter <pkg> run <script>`")
  lines.push("- 并行执行：必须使用 `pnpm run -r --parallel <script>`（或 filter + parallel），避免单包内误用 --parallel")
  lines.push("- 共享依赖：工作区包互相依赖必须使用 `workspace:` 协议，避免版本漂移与重复安装")
  lines.push("- 命令前置校验：先跑 `pnpm ls` 与 `pnpm run`，再执行真实操作；校验失败时先修复而不是强行继续")
  lines.push("")
  return lines.join("\n")
}

function main() {
  const args = parseArgs(process.argv)
  const startDir = process.cwd()
  const repoRoot = args.root ? path.resolve(args.root) : findRepoRoot(startDir)
  if (!repoRoot) {
    const message = "未找到 pnpm-workspace.yaml；请在 pnpm workspace 仓库根目录执行，或使用 --root 指定根目录"
    process.stderr.write(`${message}\n`)
    process.exit(2)
  }

  const workspaceYamlPath = path.join(repoRoot, "pnpm-workspace.yaml")
  const workspacePatterns = parseWorkspacePatterns(readText(workspaceYamlPath))
  const packages = collectWorkspacePackages(repoRoot, workspacePatterns)
  const rootPackageJsonPath = path.join(repoRoot, "package.json")
  const rootPkg = packages.find((p) => path.resolve(p.path) === path.resolve(rootPackageJsonPath)) ?? packages[0]
  const pnpm = detectPnpmUsage(repoRoot, rootPkg)

  const pnpmLs = args.skipPnpm ? { ok: false, error: "skipped (--skip-pnpm)" } : tryRunPnpm(repoRoot, ["ls"])
  const pnpmRun = args.skipPnpm ? { ok: false, error: "skipped (--skip-pnpm)" } : tryRunPnpm(repoRoot, ["run"])

  const scripts = getAllScripts(packages).map((s) => {
    const analysis = analyzeCommand(s.command)
    return { ...s, status: analysis.status, issues: analysis.issues }
  })

  const workspaceOnly = packages.filter((p) => path.resolve(p.path) !== path.resolve(rootPackageJsonPath))
  const workspaceProtocolViolations = collectWorkspaceProtocolViolations(workspaceOnly)

  const report = {
    repoRoot,
    pnpm,
    pnpmLs: { ok: pnpmLs.ok, error: pnpmLs.ok ? null : pnpmLs.error },
    pnpmRun: { ok: pnpmRun.ok, error: pnpmRun.ok ? null : pnpmRun.error },
    scripts,
    workspaceProtocolViolations,
  }

  if (args.format === "json") {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
    return
  }
  process.stdout.write(buildMarkdownReport(report))
}

main()
