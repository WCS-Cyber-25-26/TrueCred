"""
generate.py
===========
Fills each template's placeholders with Faker data and saves
the output PNGs into:
    certificate-generator/dataset/genuine/template_a/
    certificate-generator/dataset/genuine/template_b/
    ...
    certificate-generator/dataset/genuine/template_m/

Usage:
    python generate.py
    python generate.py --count 300
"""

import os
import sys
import random
import argparse
from datetime import date

try:
    from faker import Faker
except ImportError:
    sys.exit("Faker not installed. Run:  py -m pip install faker")

from templates.template_a import generate_template_a
from templates.template_b import generate_template_b
from templates.template_c import generate_template_c
from templates.template_d import generate_template_d
from templates.template_e import generate_template_e
from templates.template_f import generate_template_f
from templates.template_j import generate_template_j
from templates.template_k import generate_template_k
from templates.template_l import generate_template_l
from templates.template_m import generate_template_m

# ── Output root ───────────────────────────────────────────────────────────────
BASE_DIR = os.path.join("certificate-generator", "dataset", "genuine")

# ── Template registry ─────────────────────────────────────────────────────────
TEMPLATE_FUNCS = {
    "template_a": generate_template_a,
    "template_b": generate_template_b,
    "template_c": generate_template_c,
    "template_d": generate_template_d,
    "template_e": generate_template_e,
    "template_f": generate_template_f,
    "template_j": generate_template_j,
    "template_k": generate_template_k,
    "template_l": generate_template_l,
    "template_m": generate_template_m,
}

# ── Program → Faculty mapping ────────────────────────────────────────────────
PROGRAM_FACULTY_MAP = {
    "Bachelor of Science in Computer Science": "the Faculty of Computing and Information Studies",
    "Bachelor of Arts in Political Science": "the Faculty of Arts and Science",
    "Bachelor of Commerce in Finance": "the School of Business",
    "Master of Science in Data Analytics": "the Faculty of Computing and Information Studies",
    "Master of Engineering in Electrical Engineering": "the Faculty of Engineering and Applied Science",
    "Master of Business Administration": "the School of Business",
    "Bachelor of Applied Science in Civil Engineering": "the Faculty of Engineering and Applied Science",
    "Doctor of Philosophy in Biochemistry": "the Faculty of Health Sciences",
    "Bachelor of Education": "the Faculty of Education",
    "Master of Arts in English Literature": "the Faculty of Arts and Science",
    "Bachelor of Science in Nursing": "the Faculty of Health Sciences",
    "Bachelor of Laws (LLB)": "the Faculty of Law",
    "Master of Public Administration": "the Faculty of Arts and Science",
    "Bachelor of Fine Arts": "the Faculty of Arts and Science",
    "Master of Science in Environmental Science": "the Faculty of Arts and Science",
}

PROGRAMS = list(PROGRAM_FACULTY_MAP.keys())

HONOURS = [
    "with First Class Honours",
    "with Second Class Honours (Upper Division)",
    "with Second Class Honours (Lower Division)",
    "with Distinction",
    "with High Distinction",
    "",
    "",
    "",
]

# Optional: more realistic dean assignment by faculty
FACULTY_DEANS = {
    "the Faculty of Engineering and Applied Science": [
        "Dr. Margaret L. Henderson",
        "Dr. Robert J. Ashworth",
    ],
    "the Faculty of Arts and Science": [
        "Dr. Eleanor J. Whitfield",
        "Dr. Thomas F. MacKenzie",
    ],
    "the Faculty of Law": [
        "Dr. Priya N. Sharma",
    ],
    "the School of Business": [
        "Dr. Thomas F. MacKenzie",
        "Dr. William H. Cartwright",
    ],
    "the Faculty of Education": [
        "Dr. Catherine M. Brooks",
    ],
    "the Faculty of Health Sciences": [
        "Dr. Amelia C. Osei",
    ],
    "the Faculty of Computing and Information Studies": [
        "Dr. William H. Cartwright",
        "Dr. Nadia R. Templeton",
    ],
}

# Fallback pool if a faculty is missing from FACULTY_DEANS
DEANS = [
    "Dr. Margaret L. Henderson",
    "Dr. Robert J. Ashworth",
    "Dr. Priya N. Sharma",
    "Dr. Thomas F. MacKenzie",
    "Dr. Amelia C. Osei",
    "Dr. William H. Cartwright",
]

PRINCIPALS = [
    "Dr. James R. Whitmore",
    "Dr. Susan E. Blackwell",
    "Dr. David A. Nguyen",
    "Dr. Catherine O. Flynn",
]

SENATE_SECS = [
    "Dr. Patricia A. Flemming",
    "Dr. Oliver J. Marsh",
    "Dr. Nadia S. Kowalski",
    "Dr. Ethan P. Douglas",
]

GRAD_MONTHS = [5, 5, 6, 10, 11]


# ── Helpers ───────────────────────────────────────────────────────────────────
def ordinal_date(d: date) -> str:
    """Format a date as 'the Twenty-Third Day of May, 2025'."""
    ordinals = {
        1: "First", 2: "Second", 3: "Third", 4: "Fourth", 5: "Fifth",
        6: "Sixth", 7: "Seventh", 8: "Eighth", 9: "Ninth", 10: "Tenth",
        11: "Eleventh", 12: "Twelfth", 13: "Thirteenth", 14: "Fourteenth",
        15: "Fifteenth", 16: "Sixteenth", 17: "Seventeenth", 18: "Eighteenth",
        19: "Nineteenth", 20: "Twentieth", 21: "Twenty-First",
        22: "Twenty-Second", 23: "Twenty-Third", 24: "Twenty-Fourth",
        25: "Twenty-Fifth", 26: "Twenty-Sixth", 27: "Twenty-Seventh",
        28: "Twenty-Eighth", 29: "Twenty-Ninth", 30: "Thirtieth",
        31: "Thirty-First",
    }
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]
    return f"the {ordinals[d.day]} Day of {months[d.month - 1]}, {d.year}"


def make_student(fake: Faker, index: int) -> dict:
    """Build one student data dict using Faker and matched program/faculty pairs."""
    grad_year = random.randint(2019, 2025)
    grad_month = random.choice(GRAD_MONTHS)
    grad_day = random.randint(1, 28)

    program = random.choice(PROGRAMS)
    faculty = PROGRAM_FACULTY_MAP[program]
    dean_name = random.choice(FACULTY_DEANS.get(faculty, DEANS))

    return {
        "certificate_id": f"LU-{grad_year}-{index:05d}",
        "student_name": fake.name(),
        "program": program,
        "faculty": faculty,
        "honours": random.choice(HONOURS),
        "date_line": ordinal_date(date(grad_year, grad_month, grad_day)),
        "dean_name": dean_name,
        "principal_name": random.choice(PRINCIPALS),
        "senate_sec_name": random.choice(SENATE_SECS),
    }


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Generate genuine certificate dataset using Faker."
    )
    parser.add_argument(
        "--count",
        type=int,
        default=500,
        help="Number of unique students (default: 2 for testing)"
    )
    args = parser.parse_args()

    fake = Faker()
    Faker.seed(43)
    random.seed(43)

    total = args.count * len(TEMPLATE_FUNCS)

    print(f"\n{'─' * 58}")
    print("  Lionsgate University  —  Certificate Generator")
    print(f"  Students  : {args.count}")
    print(f"  Templates : {len(TEMPLATE_FUNCS)}")
    print(f"  Output    : {total} PNGs  ->  {BASE_DIR}/")
    print(f"{'─' * 58}\n")

    generated = 0
    pad = len(str(total))

    for idx in range(1, args.count + 1):
        student = make_student(fake, idx)

        for template_name, template_fn in TEMPLATE_FUNCS.items():
            output_dir = os.path.join(BASE_DIR, template_name)
            os.makedirs(output_dir, exist_ok=True)

            output_path = os.path.join(
                output_dir,
                f"{student['certificate_id']}.png"
            )

            try:
                template_fn(output_path, student)
                generated += 1
                print(
                    f"[{generated:>{pad}}/{total}]  "
                    f"{template_name}  |  {student['student_name']:<28}  "
                    f"| {student['program']:<45} "
                    f"->  {output_path}"
                )
            except Exception as e:
                print(f"ERROR in {template_name} for {student['student_name']}: {e}")

    print(f"\nDone — {generated} certificates saved to '{BASE_DIR}/'")


if __name__ == "__main__":
    main()