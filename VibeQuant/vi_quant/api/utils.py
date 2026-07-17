"""
Simplified ThreadPoolManager for local vi_quant (stub — no tracing, no GsSession).
Replaces gs_quant.api.utils.ThreadPoolManager.
"""
import concurrent
from concurrent.futures.thread import ThreadPoolExecutor


class ThreadPoolManager:
    @staticmethod
    def run_async(calls):
        with ThreadPoolExecutor(max_workers=min(len(calls), 4)) as executor:
            futures = [executor.submit(c) for c in calls]
            results = [f.result() for f in futures]
        return results
