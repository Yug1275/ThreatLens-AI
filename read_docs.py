import docx
import os
import glob

docs_dir = r"c:\Users\PATEL YUG\Desktop\All\Projects\ThreatLens AI\docs"
doc_files = glob.glob(os.path.join(docs_dir, "*.docx"))

for doc_path in doc_files:
    try:
        doc = docx.Document(doc_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        out_path = doc_path.replace(".docx", ".md")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Successfully converted {os.path.basename(doc_path)} to markdown.")
    except Exception as e:
        print(f"Error converting {os.path.basename(doc_path)}: {e}")
