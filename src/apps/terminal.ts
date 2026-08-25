/* ============================================================
   terminal.ts — s9y shell on the virtual FS
   ============================================================ */

import { el } from "../os/dom";
import { tt, getLang, setLang } from "../os/i18n";
import * as fs from "../os/fs";
import { wm } from "../os/wm";
import { getSettings, patchSettings, WALLPAPERS, ACCENTS } from "../os/settings";
import { notify } from "../os/notifications";
import type { AppDef, AppWindow } from "../os/types";
import { str } from "./util";
import { APPS } from "./registry";

interface Line { text: string; cls?: string }

const LOGO = [
  "  ____           _         ____  ____ ",
  " / ___|   __ _  | |_      / ___||  _ \\",
  " \\___ \\  / _` | | __|    | |  _ | |_) |",
  "  ___) || (_| | | |_     | |_| ||  __/ ",
  " |____/  \\__,_|  \\__|     \\____||_|    ",
];

function help(win: AppWindow): Line[] {
  void win;
  const rows: [string, string][] = [
    ["help", tt("显示此帮助", "show this help")],
    ["ls [path]", tt("列出目录", "list directory")],
    ["cd <path>", tt("切换目录", "change directory")],
    ["pwd", tt("当前路径", "print working directory")],
    ["cat <file>", tt("显示文件内容", "print file")],
    ["mkdir <name>", tt("新建文件夹", "make directory")],
    ["touch <name>", tt("新建空文件", "create empty file")],
    ["rm <path>", tt("删除（进回收站）", "remove (to Recycle Bin)")],
    ["mv <a> <b>", tt("移动/重命名", "move / rename")],
    ["cp <a> <b>", tt("复制", "copy")],
    ["echo txt [>|>> file]", tt("输出文本，可重定向", "print text, optional redirect")],
    ["tree [path]", tt("目录树", "directory tree")],
    ["open <app|file>", tt("打开应用或文件", "open app or file")],
    ["apps", tt("列出应用", "list apps")],
    ["theme dark|light", tt("切换主题", "switch theme")],
    ["accent <name>", tt("设置强调色", "set accent color")],
    ["wallpaper <id>", tt("设置壁纸", "set wallpaper")],
    ["lang zh|en", tt("切换语言", "switch language")],
    ["date / whoami / df", tt("时间 / 用户 / 存储", "date / user / storage")],
    ["neofetch", tt("系统信息", "system info")],
    ["notify <text>", tt("发送通知", "send a notification")],
    ["clear", tt("清屏", "clear screen")],
    ["reboot / shutdown", tt("重启 / 关机", "reboot / shutdown")],
  ];
  return rows.map(([c, d]) => ({ text: `  ${c.padEnd(22)} ${d}`, cls: "t-cmd" }));
}

function render(win: AppWindow): void {
  let cwd = str(win, "cwd", "/Documents");
  if (!fs.exists(cwd)) cwd = "/";
  win.store.set("cwd", cwd);
  const lines = (win.store.get("lines") as Line[]) ?? [
    { text: tt("s9y OS 终端 · 输入 help 查看命令", "s9y OS terminal · type help for commands"), cls: "t-dim" },
    { text: "" },
  ];
  win.store.set("lines", lines);
  const hist = (win.store.get("hist") as string[]) ?? [];
  let histIdx = hist.length;
  win.store.set("hist", hist);
  win.setTitle(tt("终端", "Terminal"));

  const out = el("div", { cls: "tm-out", attrs: { tabindex: "0" } });
  const input = el("input", { cls: "tm-in", attrs: { type: "text", spellcheck: "false", autocomplete: "off" } }) as HTMLInputElement;
  const prompt = el("span", { cls: "tm-prompt" });

  const paintPrompt = (): void => {
    prompt.innerHTML = `<span class="t-accent">s9y</span>:<span class="t-path">${cwd === "/" ? "/" : fs.basename(cwd)}</span>$ `;
  };
  paintPrompt();

  const paint = (): void => {
    out.replaceChildren(
      ...lines.map((l) => el("div", { cls: "tm-line " + (l.cls ?? ""), text: l.text })),
    );
    out.scrollTop = out.scrollHeight;
  };
  paint();

  const push = (text: string, cls?: string): void => {
    lines.push({ text, cls });
    if (lines.length > 800) lines.splice(0, lines.length - 800);
    paint();
  };

  const resolve = (p: string): string =>
    p.startsWith("/") ? fs.normalize(p) : fs.join(cwd, p);

  const exec = (raw: string): void => {
    const cmdline = raw.trim();
    push(prompt.textContent! + cmdline, "t-in");
    if (!cmdline) return;
    hist.push(cmdline);
    histIdx = hist.length;

    // redirection for echo
    let redirect: { file: string; append: boolean } | null = null;
    let body = cmdline;
    const m = body.match(/\s(>>?)\s*(\S+)\s*$/);
    if (m) {
      redirect = { file: m[2], append: m[1] === ">>" };
      body = body.slice(0, m.index);
    }
    const [cmd, ...args] = body.split(/\s+/);
    const echoText = (): string => args.join(" ").replace(/^["']|["']$/g, "");
    let outText: string[] | null = null;
    const say = (t: string, cls?: string): void => {
      if (outText) outText.push(t);
      else push(t, cls);
    };

    switch (cmd) {
      case "help": for (const l of help(win)) push(l.text, l.cls); break;
      case "ls":
      case "dir": {
        const target = resolve(args[0] ?? ".");
        const n = fs.node(target);
        if (!n) say(tt(`ls: ${args[0]}: 不存在`, `ls: ${args[0]}: no such path`), "t-err");
        else if (n.type === "file") say(fs.basename(target));
        else {
          const items = fs.list(target);
          if (!items.length) say(tt("（空）", "(empty)"), "t-dim");
          for (const c of items)
            say(`${c.type === "dir" ? "d" : "-"}  ${c.name}${c.type === "dir" ? "/" : ""}`, c.type === "dir" ? "t-accent" : undefined);
        }
        break;
      }
      case "cd": {
        const target = resolve(args[0] ?? "/");
        const n = fs.node(target);
        if (n && n.type === "dir") { cwd = target; win.store.set("cwd", cwd); paintPrompt(); }
        else say(tt(`cd: ${args[0]}: 不是目录`, `cd: ${args[0]}: not a directory`), "t-err");
        break;
      }
      case "pwd": say(cwd); break;
      case "cat":
      case "type": {
        const target = resolve(args[0] ?? "");
        const n = fs.node(target);
        if (!n || n.type !== "file") say(tt(`cat: ${args[0]}: 不是文件`, `cat: ${args[0]}: not a file`), "t-err");
        else (fs.readFile(target) || tt("（空文件）", "(empty file)")).split("\n").forEach((l) => say(l));
        break;
      }
      case "mkdir": {
        if (!args[0]) { say("mkdir: ?", "t-err"); break; }
        const target = resolve(args[0]);
        fs.mkdir(fs.parentOf(target), fs.basename(target));
        say(tt(`已创建 ${target}`, `created ${target}`), "t-dim");
        break;
      }
      case "touch": {
        if (!args[0]) { say("touch: ?", "t-err"); break; }
        const target = resolve(args[0]);
        if (!fs.exists(target)) fs.createFile(fs.parentOf(target), fs.basename(target), "txt", "");
        say(tt(`已创建 ${target}`, `created ${target}`), "t-dim");
        break;
      }
      case "rm":
      case "del": {
        const target = resolve(args[0] ?? "");
        if (!fs.exists(target) || target === "/") { say(tt("rm: 无效路径", "rm: invalid path"), "t-err"); break; }
        fs.trash(target);
        say(tt(`已移入回收站：${target}`, `moved to Recycle Bin: ${target}`), "t-dim");
        break;
      }
      case "mv": {
        const a = resolve(args[0] ?? ""), b = resolve(args[1] ?? "");
        if (!fs.exists(a) || !args[1]) { say("mv: ?", "t-err"); break; }
        const src = fs.node(a)!;
        const destDir = fs.exists(b) && fs.node(b)!.type === "dir" ? b : fs.parentOf(b);
        const destName = fs.exists(b) && fs.node(b)!.type === "dir" ? fs.basename(a) : fs.basename(b);
        fs.purge(a);
        if (src.type === "dir") {
          const p = fs.mkdir(destDir, destName);
          void p;
          // move children (simple shallow fs: recreate tree via JSON)
          const destNode = fs.node(p);
          if (destNode) {
            destNode.children = src.children ?? [];
            window.dispatchEvent(new Event("fs-changed"));
          }
        } else {
          fs.createFile(destDir, destName, src.kind ?? "txt", src.content ?? "");
        }
        say(tt(`已移动 → ${fs.join(destDir, destName)}`, `moved → ${fs.join(destDir, destName)}`), "t-dim");
        break;
      }
      case "cp": {
        const a = resolve(args[0] ?? ""), b = resolve(args[1] ?? "");
        if (!fs.exists(a) || !args[1]) { say("cp: ?", "t-err"); break; }
        const src = fs.node(a)!;
        const destDir = fs.exists(b) && fs.node(b)!.type === "dir" ? b : fs.parentOf(b);
        const destName = fs.exists(b) && fs.node(b)!.type === "dir" ? fs.basename(a) : fs.basename(b);
        if (src.type === "file") fs.createFile(destDir, destName, src.kind ?? "txt", src.content ?? "");
        else { say(tt("cp: 仅支持文件", "cp: files only"), "t-err"); break; }
        say(tt(`已复制 → ${fs.join(destDir, destName)}`, `copied → ${fs.join(destDir, destName)}`), "t-dim");
        break;
      }
      case "echo": {
        outText = [];
        say(echoText());
        break;
      }
      case "tree": {
        const start = resolve(args[0] ?? ".");
        const walk = (path: string, prefix: string): void => {
          const items = fs.list(path);
          items.forEach((c, i) => {
            const last = i === items.length - 1;
            say(`${prefix}${last ? "└─ " : "├─ "}${c.name}${c.type === "dir" ? "/" : ""}`, c.type === "dir" ? "t-accent" : undefined);
            if (c.type === "dir") walk(fs.join(path, c.name), prefix + (last ? "   " : "│  "));
          });
        };
        say(start, "t-accent");
        walk(start, "");
        break;
      }
      case "open": {
        const target = args[0] ?? "";
        if (APPS.some((a) => a.id === target)) wm.open(target);
        else if (fs.exists(resolve(target))) {
          const n = fs.node(resolve(target))!;
          if (n.type === "dir") wm.open("files", resolve(target));
          else if (n.kind === "img") wm.open("photos", resolve(target));
          else wm.open("notepad", resolve(target));
        } else say(tt(`open: ${target}: 未找到`, `open: ${target}: not found`), "t-err");
        break;
      }
      case "apps":
        for (const a of APPS) say(`  ${a.id.padEnd(12)} ${tt(a.zh, a.en)}`);
        break;
      case "theme": {
        const t = args[0] === "dark" ? "dark" : args[0] === "light" ? "light" : null;
        if (!t) { say(tt(`当前主题：${getSettings().theme}`, `current theme: ${getSettings().theme}`)); break; }
        patchSettings({ theme: t });
        say(tt(`主题 → ${t}`, `theme → ${t}`), "t-dim");
        break;
      }
      case "accent": {
        const a = ACCENTS.find((x) => x.id === (args[0] ?? ""));
        if (!a) { say(tt(`强调色：${ACCENTS.map((x) => x.id).join(", ")}`, `accents: ${ACCENTS.map((x) => x.id).join(", ")}`)); break; }
        patchSettings({ accent: a.id });
        say(tt(`强调色 → ${a.id}`, `accent → ${a.id}`), "t-dim");
        break;
      }
      case "wallpaper": {
        const w = WALLPAPERS.find((x) => x.id === (args[0] ?? ""));
        if (!w) { say(tt(`壁纸：${WALLPAPERS.map((x) => x.id).join(", ")}`, `wallpapers: ${WALLPAPERS.map((x) => x.id).join(", ")}`)); break; }
        patchSettings({ wallpaper: w.id });
        say(tt(`壁纸 → ${w.id}`, `wallpaper → ${w.id}`), "t-dim");
        break;
      }
      case "lang": {
        if (args[0] === "zh" || args[0] === "en") { setLang(args[0]); say("ok", "t-dim"); }
        else say(`lang: ${getLang()}`);
        break;
      }
      case "date": say(new Date().toLocaleString(getLang() === "zh" ? "zh-CN" : "en-US")); break;
      case "whoami": say(`${getSettings().user}@s9y-os`); break;
      case "df": {
        const used = fs.storageBytes() + localStorage.getItem("wos.settings")!.length;
        say(tt(`存储：${(used / 1024).toFixed(1)} KiB / ~5 MiB (localStorage)`, `storage: ${(used / 1024).toFixed(1)} KiB / ~5 MiB (localStorage)`));
        break;
      }
      case "neofetch": {
        const s = getSettings();
        LOGO.forEach((l) => say(l, "t-accent"));
        say("");
        say(`${tt("用户", "user")}      ${s.user}@s9y-os`);
        say(`${tt("系统", "os")}       s9y OS 1.0 (TypeScript)`);
        say(`${tt("内核", "kernel")}    ${navigator.userAgent.split(" ").slice(-2).join(" ")}`);
        say(`${tt("语言", "lang")}      ${getLang()} · ${tt("主题", "theme")} ${s.theme} · ${s.accent}`);
        say(`${tt("分辨率", "display")}   ${screen.width}×${screen.height}`);
        say("");
        break;
      }
      case "notify": notify(tt("终端", "Terminal"), args.join(" ") || "👋", "terminal"); break;
      case "clear":
      case "cls": lines.length = 0; paint(); break;
      case "reboot": location.reload(); break;
      case "shutdown":
        window.dispatchEvent(new Event("os-shutdown"));
        break;
      default:
        say(tt(`未知的命令：${cmd}（输入 help 查看）`, `unknown command: ${cmd} (try help)`), "t-err");
    }

    if (redirect && outText) {
      const target = resolve(redirect.file);
      const prev = redirect.append && fs.exists(target) ? fs.readFile(target) + "\n" : "";
      if (fs.exists(target)) fs.writeFile(target, prev + outText.join("\n"));
      else fs.createFile(fs.parentOf(target), fs.basename(target), "txt", prev + outText.join("\n"));
    } else if (outText) {
      outText.forEach((t) => push(t));
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      exec(input.value);
      input.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx > 0) input.value = hist[--histIdx] ?? "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < hist.length - 1) input.value = hist[++histIdx] ?? "";
      else { histIdx = hist.length; input.value = ""; }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      lines.length = 0;
      paint();
    }
  });

  const wrap = el("div", { cls: "tm", on: { click: () => input.focus() } }, [
    out,
    el("div", { cls: "tm-row" }, [prompt, input]),
  ]);
  win.body.replaceChildren(wrap);
  input.focus();
}

export const terminalApp: AppDef = {
  id: "terminal",
  zh: "终端",
  en: "Terminal",
  icon: "terminal",
  tile: "linear-gradient(135deg,#20232A,#0F1116)",
  w: 760, h: 480, minW: 420, minH: 240,
  render,
};
