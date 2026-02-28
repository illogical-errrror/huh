import os
import json
import re
import fitz  # PyMuPDF
import pandas as pd
from docx import Document

MEDIA_DIR = 'media'
PLACEMENT_FILE = '../backend/data/placement_data.json'

def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return ""

def extract_text_from_docx(docx_path):
    try:
        doc = Document(docx_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Error reading DOCX {docx_path}: {e}")
        return ""

def extract_excel_row_count(excel_path):
    # Useful for shortlists and final selects
    try:
        # Read the first sheet
        df = pd.read_excel(excel_path, engine='openpyxl')
        # We can assume the number of rows is roughly the number of students
        # Need to subtract header rows if any, but len(df) is a good proxy.
        return len(df)
    except Exception as e:
        print(f"Error reading Excel {excel_path}: {e}")
        return 0

def process_media_files(companies):
    # Mapping of files to companies
    # Very rudimentary but allows us to match filenames to company names
    company_names = {c["company_name"].lower(): c for c in companies}
    
    if not os.path.exists(MEDIA_DIR):
        print("Media directory not found.")
        return companies
        
    files = os.listdir(MEDIA_DIR)
    
    for filename in files:
        filepath = os.path.join(MEDIA_DIR, filename)
        fname_lower = filename.lower()
        
        # Try to match the filename to a company
        matched_company = None
        for c_name, c_data in company_names.items():
            # A bit naive: if company name is in filename
            # Some names are short like "IEM" or "TCS"
            if c_name in fname_lower:
                matched_company = c_data
                break
                
        # Handle some edge cases or special names
        if not matched_company:
            if "hackwithinfy" in fname_lower:
                matched_company = company_names.get("infosys")
            elif "infy" in fname_lower:
                matched_company = company_names.get("infosys")
            elif "capgemini" in fname_lower:
                matched_company = company_names.get("capgemini")
            elif "ibm" in fname_lower:
                matched_company = company_names.get("ibm")

        if not matched_company:
            # If no company matches, we skip for now.
            continue
            
        print(f"Processing {filename} for {matched_company['company_name']}")
            
        # 1. Processing Excel Files (Shortlists / Final Selects)
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            count = extract_excel_row_count(filepath)
            if count > 0:
                if "shortlist" in fname_lower:
                    current = matched_company["selection_stats"]["students_shortlisted"] or 0
                    matched_company["selection_stats"]["students_shortlisted"] = max(current, count)
                elif "select" in fname_lower or "final" in fname_lower:
                    current = matched_company["selection_stats"]["students_selected"] or 0
                    # Only update if the generic chat parsing was likely wrong or smaller
                    matched_company["selection_stats"]["students_selected"] = max(current, count)
                    matched_company["flags"]["is_result_confirmed"] = True

        # 2. Processing PDF & Word (JDs)
        text = ""
        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(filepath)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(filepath)
            
        if text:
            # Extract CGPA Cutoffs from JD
            cgpa_matches = re.findall(r'(\d+(?:\.\d+)?)\s*(?:cgpa|%)', text, re.IGNORECASE)
            if cgpa_matches:
                # Be careful picking the right one, usually it's something like 6.0, 6.5, 7.0
                valid_cgpas = [float(c) for c in cgpa_matches if 5.0 <= float(c) <= 10.0]
                if valid_cgpas:
                    matched_company["eligibility"]["cgpa_cutoff"] = max(valid_cgpas)
                    
            # Extract detailed allowed branches from JD
            branches = matched_company["eligibility"]["allowed_branches"]
            if "computer science" in text.lower() or "cse" in text.lower():
                if "CSE" not in branches: branches.append("CSE")
            if "information technology" in text.lower() or "it" in text.lower().split():
                if "IT" not in branches: branches.append("IT")
            if "electronics and communication" in text.lower() or "ece" in text.lower():
                if "ECE" not in branches: branches.append("ECE")
            if "electrical" in text.lower() or "eee" in text.lower() or "ee" in text.lower().split():
                if "EEE" not in branches: branches.append("EEE")
            if "mechanical" in text.lower() or "me" in text.lower().split():
                if "ME" not in branches: branches.append("ME")
                
            matched_company["eligibility"]["allowed_branches"] = list(set(branches))
            
            # Extract better CTC if available
            ctc_matches = re.findall(r'(\d+(?:\.\d+)?)\s*lpa', text, re.IGNORECASE)
            if ctc_matches:
                valid_ctcs = [float(c) for c in ctc_matches if 2.0 <= float(c) <= 50.0]
                if valid_ctcs:
                    highest_ctc = max(valid_ctcs)
                    current_ctc = matched_company["compensation"]["ctc_lpa"]
                    if not current_ctc or highest_ctc > current_ctc:
                        matched_company["compensation"]["ctc_lpa"] = highest_ctc
    
    return companies

def main():
    if not os.path.exists(PLACEMENT_FILE):
        print(f"Could not find {PLACEMENT_FILE}")
        return
        
    print(f"Loading {PLACEMENT_FILE}...")
    with open(PLACEMENT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    companies = data.get("companies", [])
    if not companies:
        print("No companies found in placement data.")
        return
        
    updated_companies = process_media_files(companies)
    
    data["companies"] = updated_companies
    
    # Save back to backend
    print(f"Saving updated data to {PLACEMENT_FILE}...")
    with open(PLACEMENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
        
    # Also save to local root
    local_file = 'media_extracted_data.json'
    with open(local_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
        
    print("Done!")

if __name__ == "__main__":
    main()
