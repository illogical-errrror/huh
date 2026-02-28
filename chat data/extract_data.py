import json
import re

def extract_lpa(text):
    # Find all mentions of LPA and return the max if multiple, or just the last chronological one.
    matches = re.findall(r'(\d+(?:\.\d+)?)\s*lpa', text, re.I)
    if matches:
        return float(matches[-1])
    # try looking for "X Lakhs per annum"
    matches = re.findall(r'inr\s*(\d+(?:\.\d+)?)\s*lakhs\s*per\s*annum', text, re.I)
    if matches:
        return float(matches[-1])
    return None

def extract_stipend(text):
    matches = re.findall(r'stipend[\s\w]*[:-]?\s*(?:inr|rs\.?)?\s*(\d{2,6})(?:\/-|\s*per month|\s*pm)', text, re.I)
    if matches:
        return float(matches[-1])
    matches = re.findall(r'(\d{2,6})(?:\/-|\s*per month|\s*pm)', text, re.I)
    if matches:
        return float(matches[-1])
    return None

def extract_profiles(messages, name):
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
            if len(role_clean) > 3 and not any(x in role_clean.lower() for x in ['package', 'base', 'bonus', 'ctc', 'stipend', 'pay']):
                profiles.append({"role": role_clean, "ctc_lpa": float(ctc)})
                
    # Capgemini exact matches since they are table formatted sometimes
    if name == "Capgemini":
        cap_roles = [
            (r'Software Engineer\s+A4\s+.*?Selection', 'Software Engineer A4', 4.25),
            (r'Software Engineer\s+A4\b(?!\s*P)', 'Software Engineer A4', 4.25),
            (r'Senior Software Engineer\s+A5', 'Senior Software Engineer A5', 7.5),
            (r'Software Engineer\s+A4P', 'Software Engineer A4P', 5.75)
        ]
        cap_profiles = []
        for pattern, r_name, ctc in cap_roles:
            if re.search(pattern, combined, re.IGNORECASE):
                # avoid duplicates
                if not any(p["role"] == r_name for p in cap_profiles):
                    cap_profiles.append({"role": r_name, "ctc_lpa": float(ctc)})
        if cap_profiles:
            profiles = cap_profiles
            
    # Infosys logic, they have known fixed packages
    if name == "Infosys":
        inf_roles = [
            (r'Specialist Programmer L3', 'Specialist Programmer L3 (Trainee)', 21.0),
            (r'Specialist Programmer L2', 'Specialist Programmer L2 (Trainee)', 16.0),
            (r'Specialist Programmer L1', 'Specialist Programmer L1 (Trainee)', 10.0),
            (r'Specialist Programmer(?!\s*L)', 'Specialist Programmer (Trainee)', 9.5),
            (r'Digital Specialist Engineer', 'Digital Specialist Engineer (Trainee)', 6.25),
            (r'Systems Engineer', 'Systems Engineer (Trainee)', 3.6),
        ]
        inf_profiles = []
        for pattern, r_name, ctc in inf_roles:
            if re.search(pattern, combined, re.IGNORECASE):
                if not any(p["role"] == r_name for p in inf_profiles):
                    inf_profiles.append({"role": r_name, "ctc_lpa": float(ctc)})
        if inf_profiles:
             # Merge with extracted to avoid weird parsed ones picking up noise, Infosys relies purely on this manual mapping 
             profiles = inf_profiles

    # Deduplicate by role name
    unique_profiles = []
    seen = set()
    for p in profiles:
        if p["role"].lower() not in seen:
            seen.add(p["role"].lower())
            unique_profiles.append(p)
            
    return unique_profiles

def parse_company(name, messages):
    comp = {
        "company_name": name,
        "role": [],
        "offer_profiles": [],
        "engagement_type": [],
        "compensation": {
            "ctc_lpa": None,
            "base_lpa": None,
            "variable_lpa": None,
            "bonus_lpa": None,
            "esop_lpa": None,
            "stipend_monthly": None
        },
        "selection_stats": {
            "students_selected": None,
            "students_shortlisted": None,
            "offered_internship": None,
            "converted_to_ppo": None
        },
        "eligibility": {
            "cgpa_cutoff": None,
            "allowed_branches": []
        },
        "timeline": {
            "selection_date": None,
            "internship_duration_months": None
        },
        "flags": {
            "is_result_confirmed": False,
            "is_withdrawn": False,
            "data_confidence_score": 0.8
        },
        "notes": "",
        "metadata": {
            "raw_messages": []
        }
    }
    
    roles = set()
    engagements = set()
    branches = set()
    
    combined_text = "\n".join(messages)
    
    for msg in messages:
        text = msg.lower()
        
        # Flags
        if 'withdrawn' in text or 'cancelled' in text:
            comp["flags"]["is_withdrawn"] = True
        if 'final selects' in text or 'selected candidates' in text or 'final results' in text or 'selected students' in text:
            comp["flags"]["is_result_confirmed"] = True
            
        # Stats
        selects = re.findall(r'selection\s+(\d+)', text)
        if selects:
            comp["selection_stats"]["students_selected"] = (comp["selection_stats"]["students_selected"] or 0) + sum(int(x) for x in selects)
        
        shortlists = re.findall(r'(\d+)\s+shortlisted', text)
        if shortlists:
            comp["selection_stats"]["students_shortlisted"] = int(shortlists[-1])
            
        # Compensation
        ctc = extract_lpa(msg)
        if ctc:
            comp["compensation"]["ctc_lpa"] = ctc
            
        stipend = extract_stipend(msg)
        if stipend:
            if stipend < 1000:
                pass # probably not stipend
            else:
                comp["compensation"]["stipend_monthly"] = stipend
                
        # Base/bonus
        bases = re.findall(r'base\s*(?:package)?\s*[:-]?\s*(?:inr|rs\.?)?\s*(\d+(?:\.\d+)?)\s*lpa', text)
        if bases:
            comp["compensation"]["base_lpa"] = float(bases[-1])
            
        bonuses = re.findall(r'bonus\s*[:-]?\s*(?:inr|rs\.?)?\s*(\d+(?:\.\d+)?)\s*lpa', text)
        if bonuses:
            comp["compensation"]["bonus_lpa"] = float(bonuses[-1])
            
        # Engagements
        if 'full time' in text or 'fte' in text or 'full-time' in text or 'graduate engineer trainee' in text or 'get' in text:
            engagements.add("Full Time")
        if 'intern' in text or 'internship' in text:
            engagements.add("Internship")
        if 'ppo' in text:
            engagements.add("PPO")
            
        # Role
        if 'software engineer' in text or 'se' in text.split():
            roles.add('Software Engineer')
        if 'digital specialist engineer' in text:
            roles.add('Digital Specialist Engineer')
        if 'specialist programmer' in text:
            roles.add('Specialist Programmer')
        if 'junior support engineer' in text:
            roles.add('Junior Support Engineer')
        if 'graduate engineer trainee' in text or 'get' in text.split():
            roles.add('Graduate Engineer Trainee')
        if 'system engineer' in text or 'associate system engineer' in text:
            roles.add('System Engineer')
            
        # Eligibility
        cgpas = re.findall(r'(\d+(?:\.\d+)?)\s*cgpa', text)
        if cgpas:
            comp['eligibility']["cgpa_cutoff"] = float(cgpas[-1])
            
        if 'cse' in text: branches.add('CSE')
        if 'it' in text.split(): branches.add('IT')
        if 'ece' in text: branches.add('ECE')
        if 'eee' in text: branches.add('EEE')
        if 'mechanical' in text: branches.add('ME')
        if 'civil' in text: branches.add('CE')
            
        comp["metadata"]["raw_messages"].append(msg.strip())
        
    comp["offer_profiles"] = extract_profiles(messages, name)
    
    # Capgemini multiple roles logic: they had A4, A4P, A5
    if name == 'Capgemini':
        roles.update(['Software Engineer A4', 'Software Engineer A4P', 'Senior Software Engineer A5'])
        comp["compensation"]["ctc_lpa"] = 7.5 # highest
        
    # Infosys logic: Fix highest CTC based on parsed roles
    if name == 'Infosys':
        if comp["offer_profiles"]:
            highest = max(p["ctc_lpa"] for p in comp["offer_profiles"])
            comp["compensation"]["ctc_lpa"] = highest
            roles.update([p["role"] for p in comp["offer_profiles"]])
        elif not comp["compensation"]["ctc_lpa"]:
            comp["compensation"]["ctc_lpa"] = 9.5
        
    comp["role"] = list(roles)
    comp["engagement_type"] = list(engagements)
    comp["eligibility"]["allowed_branches"] = list(branches)
    
    return comp

with open('grouped_messages.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

result = {"companies": [], "unresolved_conflicts": []}

for comp_name, messages in data.items():
    parsed = parse_company(comp_name, messages)
    result["companies"].append(parsed)

with open('placement_data.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("Data extraction complete.")
