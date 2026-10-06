import zipfile
import xml.etree.ElementTree as ET

def extract_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            texts = []
            for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                p_text = ''.join(node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text)
                if p_text:
                    texts.append(p_text)
            return '\n'.join(texts)
    except Exception as e:
        return f"Error reading {docx_path}: {e}"

files = [
    ('Ý tưởng trò chơi giao lưu.docx', 'extracted_ideas.txt'),
    ('KỊCH BẢN 1 – GIAO LƯU TRUYỀN THỐNG LTT XXVIII.docx', 'extracted_kich_ban.txt')
]

for doc, out in files:
    content = extract_text(doc)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(content)
print("Extracted all files successfully")
