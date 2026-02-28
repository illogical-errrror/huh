import json
import re

def extract_profiles(messages):
    combined = "\n".join(messages)
    profiles = []
    
    # Custom scanning logic for multi-roles
    lines = combined.split('\n')
    for line in lines:
        line_lower = line.lower()
        
        # Look for pattern: Role Name : Rs. X LPA or Role Name - X LPA
        # e.g. "Specialist Programmer L3 (Trainee): ₹21 LPA"
        matches = re.findall(r'([a-zA-Z\s0-9()/-]+?)\s*[:-]?\s*(?:inr|rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*lpa', line, re.IGNORECASE)
        for role, ctc in matches:
            role_clean = role.strip().strip('#').strip('*').strip()
            # Filter out generic words that aren't roles
            if len(role_clean) > 3 and not any(x in role_clean.lower() for x in ['package', 'base', 'bonus', 'ctc', 'stipend']):
                profiles.append({"role": role_clean, "ctc_lpa": float(ctc)})
                
    # Also look for Capgemini exact matches since they are table formatted sometimes
    if "Capgemini" in combined:
        cap_roles = [
            (r'Software Engineer\s+A4\s+.*?Selection', 'Software Engineer A4', 4.25),
            (r'Software Engineer\s+A4\b(?!\s*P)', 'Software Engineer A4', 4.25),
            (r'Senior Software Engineer\s+A5', 'Senior Software Engineer A5', 7.5),
            (r'Software Engineer\s+A4P', 'Software Engineer A4P', 5.75)
        ]
        pass # Handle separately in script if needed

    return profiles

with open('grouped_messages.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for comp, msgs in data.items():
    if comp in ['Infosys', 'Capgemini']:
        print(f"--- {comp} ---")
        profs = extract_profiles(msgs)
        for p in profs:
            print(p)
