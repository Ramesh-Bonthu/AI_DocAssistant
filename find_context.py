import re

log_path = r"C:\Users\VISHNU VARDHAN\.gemini\antigravity\brain\8b6172a1-d1d3-4e64-93f5-0b196748a658\.system_generated\logs\overview.txt"
try:
    with open(log_path, "r", encoding="utf-8") as f:
        content = f.read()

    queries = ["pis", "pic", "clients", "candidate"]
    for q in queries:
        matches = [m.start() for m in re.finditer(q, content, re.IGNORECASE)]
        print(f"Query: {q} - Found {len(matches)} matches")
        for start in matches[:5]:
            start_idx = max(0, start - 100)
            end_idx = min(len(content), start + 100)
            print(f"--- MATCH AT {start} ---")
            print(content[start_idx:end_idx].replace('\n', ' '))
except Exception as e:
    print("Error:", e)
