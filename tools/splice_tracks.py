import re
from pathlib import Path

DATA = Path("src/data.ts")
TOOLS = Path("tools")
ANCHOR = "/* ========= ASSEMBLE TRACKS ========= */"


def section(name: str) -> str:
    return (TOOLS / f"{name}.ts").read_text(encoding="utf-8").rstrip() + "\n"


def main() -> None:
    text = DATA.read_text(encoding="utf-8")

    arrays = "".join(
        section(n)
        for n in ("c_part1", "c_part2", "cpp_part1", "cpp_part2", "java_part1", "java_part2")
    )

    track_defs = """
const cTrack: Track = {
  slug: "c",
  name: "C",
  icon: "c",
  desc: "Fix segfaults, leaks, and pointer bugs in C",
  done: 0,
  total: 40,
  accent: "#3b82f6",
  challenges: [...cBeginner, ...cIntermediate, ...cAdvanced, ...cNightmare].map(c => ({ ...c, lang: "C", monacoLang: "c" })),
};

const cppTrack: Track = {
  slug: "cpp",
  name: "C++",
  icon: "cpp",
  desc: "Debug modern C++ code, STL, and templates",
  done: 0,
  total: 40,
  accent: "#60a5fa",
  challenges: [...cppBeginner, ...cppIntermediate, ...cppAdvanced, ...cppNightmare].map(c => ({ ...c, lang: "C++", monacoLang: "cpp" })),
};

const javaTrack: Track = {
  slug: "java",
  name: "Java",
  icon: "java",
  desc: "Fix Java code and enterprise patterns",
  done: 0,
  total: 40,
  accent: "#f97316",
  challenges: [...javaBeginner, ...javaIntermediate, ...javaAdvanced, ...javaNightmare].map(c => ({ ...c, lang: "Java", monacoLang: "java" })),
};
"""

    if ANCHOR not in text:
        raise SystemExit("anchor not found")
    text = text.replace(ANCHOR, arrays + track_defs + "\n" + ANCHOR, 1)

    for slug in ("c", "cpp", "java"):
        pattern = re.compile(r'  \{\n    slug: "' + slug + r'",[\s\S]*?\n    \},\n  \},\n')
        text, n = pattern.subn("", text, count=1)
        if n != 1:
            raise SystemExit(f"FAILED to remove stack template '{slug}'")

    old_tracks = "  pythonTrack,\n  javascriptTrack,\n  sqlTrack,\n"
    new_tracks = "  pythonTrack,\n  javascriptTrack,\n  sqlTrack,\n  cTrack,\n  cppTrack,\n  javaTrack,\n"
    if old_tracks not in text:
        raise SystemExit("tracks array not found")
    text = text.replace(old_tracks, new_tracks, 1)

    DATA.write_text(text, encoding="utf-8")
    print("SPLICE OK")


if __name__ == "__main__":
    main()
