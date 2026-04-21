#!/usr/bin/env python3
"""Generate background images for carousel via ComfyUI GeminiNanoBanana2.

Usage: python3 generate_bg_images.py data/2026-04-20-small-talk.json

Reads bg_prompt from cover + scene-card slides, queues ComfyUI jobs,
polls /history, downloads outputs, resizes to 1080x1350,
saves to public/images/{date}/{slot}.png, updates JSON with bg_image paths.
"""
import json
import os
import random
import sys
import time
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from PIL import Image
from io import BytesIO

SERVER = "http://127.0.0.1:8000"
CLIENT_ID = str(uuid.uuid4())
REPO = Path(__file__).resolve().parents[1]

NEG_SUFFIX = " No text, no watermark, no letters."


def load_api_key():
    env_paths = [
        Path.home() / "ComfyUI/.env",
        Path.home() / "Documents/ComfyUI/.env",
    ]
    cfg = {}
    for p in env_paths:
        if not p.exists():
            continue
        for line in p.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            cfg[k.strip()] = v.strip()
    account = cfg.get("COMFY_ACCOUNT", "work").upper()
    key = cfg.get(f"COMFY_KEY_{account}")
    if not key:
        sys.exit(f"❌ COMFY_KEY_{account} not found in .env")
    return key


def build_workflow(prompt: str, seed: int, filename_prefix: str) -> dict:
    return {
        "1": {
            "inputs": {
                "prompt": prompt + NEG_SUFFIX,
                "model": "Nano Banana 2 (Gemini 3.1 Flash Image)",
                "seed": seed,
                "aspect_ratio": "3:4",
                "resolution": "2K",
                "response_modalities": "IMAGE",
                "thinking_level": "MINIMAL",
            },
            "class_type": "GeminiNanoBanana2",
        },
        "2": {
            "inputs": {"filename_prefix": filename_prefix, "images": ["1", 0]},
            "class_type": "SaveImage",
        },
    }


def queue_prompt(workflow: dict, api_key: str) -> str:
    body = json.dumps({
        "prompt": workflow,
        "client_id": CLIENT_ID,
        "extra_data": {"api_key_comfy_org": api_key},
    }).encode()
    req = urllib.request.Request(
        f"{SERVER}/prompt",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["prompt_id"]


def wait_history(prompt_id: str, timeout: int = 300) -> dict:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{SERVER}/history/{prompt_id}") as resp:
                data = json.loads(resp.read())
            if prompt_id in data:
                entry = data[prompt_id]
                status = entry.get("status", {})
                if status.get("completed"):
                    return entry
                if status.get("status_str") == "error":
                    raise RuntimeError(f"ComfyUI error: {status}")
        except urllib.error.HTTPError:
            pass
        time.sleep(2)
    raise TimeoutError(f"Timeout waiting for {prompt_id}")


def download_first_image(entry: dict) -> bytes:
    outputs = entry.get("outputs", {})
    for node_out in outputs.values():
        images = node_out.get("images", [])
        if not images:
            continue
        img = images[0]
        params = urllib.parse.urlencode({
            "filename": img["filename"],
            "subfolder": img.get("subfolder", ""),
            "type": img.get("type", "output"),
        })
        with urllib.request.urlopen(f"{SERVER}/view?{params}") as resp:
            return resp.read()
    raise RuntimeError("No image in outputs")


def post_process(raw: bytes) -> Image.Image:
    im = Image.open(BytesIO(raw)).convert("RGB")
    target_w, target_h = 1080, 1350
    src_w, src_h = im.size
    src_ratio = src_w / src_h
    tgt_ratio = target_w / target_h
    if src_ratio > tgt_ratio:
        new_h = target_h
        new_w = int(round(new_h * src_ratio))
    else:
        new_w = target_w
        new_h = int(round(new_w / src_ratio))
    im = im.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return im.crop((left, top, left + target_w, top + target_h))


def generate_slot(slot_name: str, prompt: str, date: str, api_key: str) -> str:
    print(f"\n▶ {slot_name}: queueing...")
    seed = random.randint(1, 10**9)
    wf = build_workflow(prompt, seed, f"carousel_{date}_{slot_name}")
    pid = queue_prompt(wf, api_key)
    print(f"  prompt_id={pid} seed={seed}")
    entry = wait_history(pid)
    raw = download_first_image(entry)
    im = post_process(raw)
    out_dir = REPO / "public" / "images" / date
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"bg_{slot_name}.png"
    im.save(out_path, "PNG")
    rel = f"/images/{date}/bg_{slot_name}.png"
    print(f"  ✓ saved {out_path}")
    return rel


def main():
    args = sys.argv[1:]
    only_slot = None
    if "--slot" in args:
        i = args.index("--slot")
        only_slot = args[i + 1]
        args = args[:i] + args[i + 2:]
    if len(args) != 1:
        sys.exit("Usage: generate_bg_images.py [--slot cover|scene] <data/xxx.json>")
    json_rel = args[0]
    json_path = REPO / json_rel
    data = json.loads(json_path.read_text())
    date = data["meta"]["date"]

    api_key = load_api_key()

    slots = []
    for page in data["pages"]:
        comp = page.get("component")
        d = page.get("data", {})
        prompt = d.get("bg_prompt", "").strip()
        if comp == "cover" and prompt:
            slots.append(("cover", prompt, page))
        elif comp == "scene-card" and prompt:
            slots.append(("scene", prompt, page))
    if only_slot:
        slots = [s for s in slots if s[0] == only_slot]

    if not slots:
        sys.exit("No slots with bg_prompt found")

    print(f"Found {len(slots)} slots: {[s[0] for s in slots]}")

    for slot_name, prompt, page in slots:
        rel = generate_slot(slot_name, prompt, date, api_key)
        page["data"]["bg_image"] = rel

    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f"\n✓ Updated {json_path}")


if __name__ == "__main__":
    main()
