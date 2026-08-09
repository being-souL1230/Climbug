from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ChallengeMeta:
    id: int
    check_key: str
    xp: int
    track_slug: str
    difficulty: str


DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Nightmare"]
XP_BY_DIFF = {"Beginner": 50, "Intermediate": 140, "Advanced": 250, "Nightmare": 320}


class ChallengeRegistry:
    """Server-side challenge key registry.

    The frontend can display challenge text, but only this registry decides whether
    submitted code solves a challenge. It derives keys from the repository's
    checked-in data file at server startup, so clients cannot alter the answer key.
    """

    def __init__(self, data_file: Path) -> None:
        self.data_file = data_file
        self._cache: dict[int, ChallengeMeta] | None = None

    def all(self) -> dict[int, ChallengeMeta]:
        if self._cache is None:
            self._cache = {}
            text = self.data_file.read_text(encoding="utf-8")
            self._cache.update(self._parse_explicit_challenges(text))
            self._cache.update(self._parse_generated_stack_templates(text))
        return self._cache

    def get(self, challenge_id: int) -> ChallengeMeta | None:
        return self.all().get(challenge_id)

    def _parse_explicit_challenges(self, text: str) -> dict[int, ChallengeMeta]:
        result: dict[int, ChallengeMeta] = {}
        blocks = re.finditer(r"ch\((\d+),([\s\S]*?)\n\s*\),", text)
        for match in blocks:
            challenge_id = int(match.group(1))
            if challenge_id >= 1000:
                continue
            block = match.group(2)
            strings = re.findall(r'"((?:\\.|[^"\\])*)"|\'((?:\\.|[^\'\\])*)\'', block)
            flattened = [a or b for a, b in strings]
            if not flattened:
                continue
            check_key = flattened[-1]
            # Difficulty is normally the string before the starter code template.
            difficulty = next((d for d in DIFFICULTIES if f'"{d}"' in block), "Beginner")
            track_slug = "python" if challenge_id < 101 else "javascript" if challenge_id < 201 else "sql"
            base = XP_BY_DIFF[difficulty]
            result[challenge_id] = ChallengeMeta(challenge_id, check_key, base, track_slug, difficulty)
        return result

    def _parse_generated_stack_templates(self, text: str) -> dict[int, ChallengeMeta]:
        result: dict[int, ChallengeMeta] = {}
        start = text.find("const stackTemplates")
        end = text.find("/* ========= ASSEMBLE TRACKS ========= */")
        if start == -1 or end == -1:
            return result
        section = text[start:end]
        track_blocks = re.finditer(
            r'slug:\s*"([^"]+)"[\s\S]*?problems:\s*\[([\s\S]*?)\n\s*\],\n\s*\},',
            section,
        )

        next_id = 1000
        for track_match in track_blocks:
            slug = track_match.group(1)
            problems_block = track_match.group(2)
            keys = []
            for key_match in re.finditer(r"checkKey:\s*(?:\"((?:\\.|[^\"\\])*)\"|'((?:\\.|[^'\\])*)')", problems_block):
                keys.append(key_match.group(1) or key_match.group(2) or "")
            if not keys:
                continue

            for diff in DIFFICULTIES:
                for i in range(10):
                    next_id += 1
                    # Mirrors buildTrack(): src = problems[(di * 10 + i) % len]
                    global_index = (DIFFICULTIES.index(diff) * 10) + i
                    check_key = keys[global_index % len(keys)]
                    result[next_id] = ChallengeMeta(
                        id=next_id,
                        check_key=check_key,
                        xp=XP_BY_DIFF[diff] + i * 4,
                        track_slug=slug,
                        difficulty=diff,
                    )
        return result


def normalize_code(code: str) -> str:
    return code.replace("\r\n", "\n").strip()
