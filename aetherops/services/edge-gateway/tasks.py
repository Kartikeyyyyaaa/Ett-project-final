"""Background background tasks simulating orchestration operations."""
import asyncio
import random
from typing import Dict
from models import Pod
from metrics import POD_STATUS

async def self_heal_loop(pods_db: Dict[str, Pod], sync_fn) -> None:
    """
    Simulates Kubernetes reconciliation loop.
    Constantly scans for Failed pods and flips them to Running.
    """
    while True:
        await asyncio.sleep(2.0)
        healed_any = False
        for p in pods_db.values():
            if p.status == "Failed":
                if random.random() < 0.85:
                    p.status = "Running"
                    healed_any = True
        
        if healed_any:
            sync_fn()
