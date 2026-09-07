"""Synthetic ECO queue dataset generator — not clinical data."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd


def generate(n: int, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    hour = rng.integers(8, 17, size=n)
    dow = rng.integers(0, 5, size=n)
    queue_length = rng.integers(0, 25, size=n)
    priority = rng.choice(["normal", "urgent"], size=n, p=[0.85, 0.15])
    room_load = rng.uniform(0.1, 1.0, size=n)
    wait = (
        8
        + queue_length * 4.2
        + (hour >= 12) * 6
        + (dow == 0) * 3
        + room_load * 10
        + rng.normal(0, 4, size=n)
    )
    wait = np.clip(wait, 2, None)
    wait = np.where(priority == "urgent", wait * 0.7, wait)
    return pd.DataFrame(
        {
            "hour_of_day": hour,
            "day_of_week": dow,
            "queue_length": queue_length,
            "priority": priority,
            "room_load": room_load,
            "actual_wait_minutes": wait.round(1),
            "data_provenance": "synthetic",
        }
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=2000)
    parser.add_argument("--out", type=Path, default=Path("artifacts/synthetic_queue.csv"))
    args = parser.parse_args()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    df = generate(args.n)
    df.to_csv(args.out, index=False)
    print(f"Wrote {len(df)} synthetic rows to {args.out}")


if __name__ == "__main__":
    main()
