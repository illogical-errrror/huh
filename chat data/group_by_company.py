import json
import re
from datetime import datetime

companies = [
    "LTI Mindtree", "LTIMindtree",
    "ITC Infotech",
    "Infosys",
    "Capgemini",
    "Google",
    "TCS", "TATA Consultancy Services",
    "Poornam",
    "Xempla",
    "Aantaric",
    "HSBC",
    "Reliance",
    "Windcare",
    "Quality Austria",
    "Accenture",
    "IBM",
    "A1 Fence", "A-1 Fence",
    "Manikaran",
    "Meditab",
    "Nuvoco Vistas",
    "Rane Group",
    "Cape Electric",
    "Apollo Tyres",
    "Vikram Solar",
    "BeatRoute",
    "PwC",
    "Consultadd",
    "Keeves",
    "Blueflame",
    "Cognizant",
    "DexGreen",
    "Rialto",
    "Vishakha",
    "PMT Machines"
]

def clean_message(msg):
    # Remove timestamps like '27/09/25, 3:28 pm - +91 98043 64389: '
    msg = re.sub(r'^\d{2}/\d{2}/\d{2}, \d{1,2}:\d{2}\s?(?:am|pm)\s-\s(?:[^:]+): ', '', msg)
    # Redact emails
    msg = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[EMAIL]', msg)
    # Redact phone numbers (with or without +91)
    msg = re.sub(r'(?:\+?91[\-\s]?)?[6789]\d{4}[\-\s]?\d{5}', '[PHONE]', msg)
    msg = re.sub(r'\b[6789]\d{9}\b', '[PHONE]', msg)
    return msg.strip()

grouped_data = {c: [] for c in companies}
unassigned = []

with open('filtered.txt', 'r', encoding='utf-8') as f:
    messages = f.read().split('\n---')

for msg in messages:
    cleaned = clean_message(msg)
    if not cleaned: continue
    
    assigned = False
    for comp in companies:
        if comp.lower() == "google":
            if re.search(r'\bgoogle\b(?!\s*(?:form|forms|chrome|meet|maps|classroom|docs|drive|link|sheet|sheets))', cleaned, re.IGNORECASE):
                grouped_data[comp].append(cleaned)
                assigned = True
        else:
            if comp.lower() in cleaned.lower():
                grouped_data[comp].append(cleaned)
                assigned = True
            
    if not assigned:
        unassigned.append(cleaned)

# Normalize company names
normalized = {
    "LTI Mindtree": grouped_data["LTI Mindtree"] + grouped_data.get("LTIMindtree", []),
    "TCS": grouped_data["TCS"] + grouped_data.get("TATA Consultancy Services", []),
    "Poornam Info Vision": grouped_data["Poornam"],
    "A1 Fence": grouped_data["A1 Fence"] + grouped_data.get("A-1 Fence", [])
}
for c in ["LTIMindtree", "TATA Consultancy Services", "A-1 Fence", "LTI Mindtree", "TCS", "Poornam", "A1 Fence"]:
    if c in grouped_data:
        del grouped_data[c]
        
grouped_data.update(normalized)

# Remove empty companies
grouped_data = {k: set(v) for k, v in grouped_data.items() if v}
grouped_data = {k: list(v) for k, v in grouped_data.items()}

with open('grouped_messages.json', 'w', encoding='utf-8') as f:
    json.dump(grouped_data, f, indent=4, ensure_ascii=False)

print(f"Grouped into {len(grouped_data)} companies.")
print("Companies found:", list(grouped_data.keys()))
