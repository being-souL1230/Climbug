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
            if challenge_id < 101:
                track_slug = "python"
            elif challenge_id < 201:
                track_slug = "javascript"
            elif challenge_id < 241:
                track_slug = "sql"
            elif challenge_id < 281:
                track_slug = "c"
            elif challenge_id < 321:
                track_slug = "cpp"
            else:
                track_slug = "java"
            xp = self._parse_xp(block)
            if xp is None:
                xp = XP_BY_DIFF[difficulty]
            result[challenge_id] = ChallengeMeta(challenge_id, check_key, xp, track_slug, difficulty)
        return result

    @staticmethod
    def _parse_xp(block: str) -> int | None:
        """Read the per-challenge XP (4th ch() argument) so the backend awards
        exactly what the frontend displays. Falls back to None when missing.

        ch(id, "title", "desc", <xp>, timeMin, lang, difficulty, ...)
        """
        match = re.match(r'\s*"(?:[^"\\]|\\.)*",\s*"(?:[^"\\]|\\.)*",\s*(\d+),', block)
        return int(match.group(1)) if match else None

    def _parse_generated_stack_templates(self, text: str) -> dict[int, ChallengeMeta]:
        """Parse the per-difficulty `problems` pools in the stack templates.

        Mirrors buildTrack() in src/data.ts exactly: ids are assigned in
        difficulty order (Beginner -> Nightmare), and within a difficulty,
        problems keep their array order. XP is XP_BY_DIFF[diff] + i*4.
        """
        result: dict[int, ChallengeMeta] = {}
        start = text.find("const stackTemplates")
        end = text.find("/* ========= ASSEMBLE TRACKS ========= */")
        if start == -1 or end == -1:
            return result
        section = text[start:end]
        track_blocks = re.finditer(
            r'slug:\s*"([^"]+)"[\s\S]*?problems:\s*\{(.*?)\n\s*\},\n\s*\},',
            section,
            re.DOTALL,
        )

        next_id = 1000
        for track_match in track_blocks:
            slug = track_match.group(1)
            problems_block = track_match.group(2)
            keys_by_diff: dict[str, list[str]] = {}
            for diff in DIFFICULTIES:
                array = re.search(rf"{re.escape(diff)}:\s*\[(.*?)\n\s*\],", problems_block, re.DOTALL)
                keys: list[str] = []
                if array:
                    for key_match in re.finditer(
                        r"checkKey:\s*(?:\"((?:\\.|[^\"\\])*)\"|'((?:\\.|[^'\\])*)')",
                        array.group(1),
                    ):
                        keys.append(key_match.group(1) or key_match.group(2) or "")
                keys_by_diff[diff] = keys

            for diff in DIFFICULTIES:
                for i, check_key in enumerate(keys_by_diff[diff]):
                    next_id += 1
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
