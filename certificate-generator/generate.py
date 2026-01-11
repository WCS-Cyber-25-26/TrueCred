import os
import json

from templates.template_a import generate_template_a
from templates.template_b import generate_template_b
from templates.template_c import generate_template_c
from templates.template_d import generate_template_d
from templates.template_e import generate_template_e
from templates.template_f import generate_template_f
from templates.template_g import generate_template_g
from templates.template_h import generate_template_h
from templates.template_i import generate_template_i
from templates.template_j import generate_template_j

BASE_DIR = "dataset/genuine"

TEMPLATES = [
    "template_a", "template_b", "template_c", "template_d", "template_e",
    "template_f", "template_g", "template_h", "template_i", "template_j"
]

#Map template names to functions
template_funcs = {
    "template_a": generate_template_a,
    "template_b": generate_template_b,
    "template_c": generate_template_c,
    "template_d": generate_template_d,
    "template_e": generate_template_e,
    "template_f": generate_template_f,
    "template_g": generate_template_g,
    "template_h": generate_template_h,
    "template_i": generate_template_i,
    "template_j": generate_template_j
}

#load student data
with open("students.json", "r") as f:
    students_data = json.load(f)

#generate
for student in students_data:
    student_data = student.copy()

    for template_name in TEMPLATES:
        output_dir = os.path.join(BASE_DIR, template_name)
        os.makedirs(output_dir, exist_ok=True)

        filename = f"{student_data['certificate_id']}.pdf"
        output_path = os.path.join(output_dir, filename)

        template_funcs[template_name](output_path, student_data)

        print(
            f"{template_name} generated for {student_data['student_name']} "
            f"({student_data['university']}) -> {output_path}"
        )
