import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from registry import ChallengeRegistry, DIFFICULTIES  # noqa: E402

DATA = Path(__file__).resolve().parents[1] / "src" / "data.ts"
NO_BUG = {40, 130, 240, 280, 320, 360}


def main() -> None:
    registry = ChallengeRegistry(DATA)
    all_ids = registry.all()
    print(f"total challenges parsed: {len(all_ids)}")

    # Expected: 6 explicit 40-problem tracks + 19 stack tracks * 12
    expected = 6 * 40 + 19 * 12
    assert len(all_ids) == expected, f"expected {expected}, got {len(all_ids)}"

    text = DATA.read_text(encoding="utf-8")

    # --- Per-track counts for the new explicit tracks ---
    for slug, start, end in (
        ("c", 241, 280),
        ("cpp", 281, 320),
        ("java", 321, 360),
    ):
        ids = [cid for cid in all_ids if start <= cid <= end]
        assert len(ids) == 40, f"{slug}: expected 40, got {len(ids)}"
        by_diff = {}
        for cid in ids:
            d = all_ids[cid].difficulty
            by_diff[d] = by_diff.get(d, 0) + 1
        print(f"{slug}: {len(ids)} challenges, per difficulty {by_diff}")
        for d in DIFFICULTIES:
            assert by_diff.get(d) == 10, f"{slug} {d}: expected 10, got {by_diff.get(d)}"
        assert all_ids[start].track_slug == slug, f"{slug}: wrong slug mapping"

    # --- XP parity: backend must award exactly what the frontend displays ---
    xp_re = re.compile(r'ch\((\d+),\s*"(?:[^"\\]|\\.)*",\s*"(?:[^"\\]|\\.)*",\s*(\d+),')
    bad_xp = []
    for m in xp_re.finditer(text):
        cid, xp = int(m.group(1)), int(m.group(2))
        if cid < 1000 and all_ids[cid].xp != xp:
            bad_xp.append((cid, xp, all_ids[cid].xp))
    assert not bad_xp, f"XP mismatch frontend/backend: {bad_xp}"
    print(f"XP parity OK: {len([m for m in xp_re.finditer(text) if int(m.group(1)) < 1000])} explicit challenges match backend XP")

    # --- Auto-solve check: checkKey should not appear in the starter code ---
    auto = []
    blocks = re.finditer(r"ch\((\d+),([\s\S]*?)\n\s*\),", text)
    for m in blocks:
        cid = int(m.group(1))
        if cid >= 1000:
            continue
        block = m.group(2)
        strings = re.findall(r'"((?:\\.|[^"\\])*)"|\'((?:\\.|[^\'\\])*)\'', block)
        flattened = [a or b for a, b in strings]
        check_key = flattened[-1]
        # starter code = the first template literal in the block
        code_match = re.search(r"`((?:\\`|[^`])*)`", block)
        starter = code_match.group(1) if code_match else ""
        if check_key and check_key in starter:
            auto.append((cid, check_key))
    print("auto-solvable:", auto)
    bad = [a for a in auto if a[0] not in NO_BUG]
    assert not bad, f"unexpected auto-solve: {bad}"
    missing = NO_BUG - {a[0] for a in auto}
    print(f"intentional no-bug challenges present: {NO_BUG - missing}")

    print("VERIFY OK")


if __name__ == "__main__":
    main()
