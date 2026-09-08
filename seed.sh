#!/bin/bash

# Supabase Configurations
URL="https://lxksoojimkleldsjiofu.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4a3Nvb2ppbWtsZWxkc2ppb2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzgwMzcsImV4cCI6MjA5NDkxNDAzN30.tzJu0UrILv0Cisx2606aLMY4W5yhjOHGEVk4aEWKTGk"

# Helper function to insert a student and get their ID
insert_student_and_result() {
  local first_name=$1
  local last_name=$2
  local father_name=$3
  local dob=$4
  local gender=$5
  local email=$6
  local phone=$7
  local state=$8
  local city=$9
  local course_category=${10}
  local course=${11}
  local board_type=${12}
  local group12th=${13}
  local marks10=${14}
  local marks12=${15}
  local score10=${16}
  local score12=${17}
  local ug_status=${18}
  local ug_score=${19}
  
  # Exam result variables
  local exam_set=${20}
  local total_score=${21}
  local percentage=${22}
  local status=${23}
  local raw_answers_json=${24}
  local ai_feedback=${25}

  echo "Inserting Student: $first_name $last_name ($course)..."

  # Post Student
  response=$(curl -s -X POST -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" -H "Prefer: return=representation" \
    -d "{
      \"first_name\": \"$first_name\",
      \"last_name\": \"$last_name\",
      \"father_name\": \"$father_name\",
      \"name\": \"$first_name $last_name\",
      \"dob\": \"$dob\",
      \"gender\": \"$gender\",
      \"email\": \"$email\",
      \"phone\": \"$phone\",
      \"state\": \"$state\",
      \"city\": \"$city\",
      \"course_category\": \"$course_category\",
      \"course\": \"$course\",
      \"board_type\": \"$board_type\",
      \"group12th\": \"$group12th\",
      \"marks10\": $marks10,
      \"marks12\": $marks12,
      \"score10\": $score10,
      \"score12\": $score12,
      \"ug_status\": \"$ug_status\",
      \"ug_score\": $ug_score
    }" "$URL/rest/v1/students")

  # Extract ID using grep/cut
  student_id=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

  if [ -n "$student_id" ]; then
    echo "  Student created successfully with ID: $student_id"
    
    # Post Exam Result
    exam_response=$(curl -s -X POST -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
      -H "Content-Type: application/json" -H "Prefer: return=representation" \
      -d "{
        \"student_id\": \"$student_id\",
        \"exam_set\": \"$exam_set\",
        \"total_score\": $total_score,
        \"percentage\": $percentage,
        \"status\": \"$status\",
        \"raw_answers\": $raw_answers_json,
        \"ai_feedback\": \"$ai_feedback\"
      }" "$URL/rest/v1/exam_results")
    
    echo "  Exam result inserted!"
  else
    echo "  FAILED to insert student. Response: $response"
  fi
  echo "--------------------------------------------------------"
}

# Clean existing data first
echo "Cleaning existing exam results and students..."
curl -s -X DELETE -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rest/v1/exam_results?student_id=not.is.null" > /dev/null
curl -s -X DELETE -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rest/v1/students?id=not.is.null" > /dev/null
echo "Database cleaned successfully."
echo "========================================================"

# --- SEED DATA ---

# 1. BBA Student - High Performer
insert_student_and_result \
  "Alex" "Mercer" "Gerald Mercer" "2005-04-12" "Male" "alex@mercer.edu" "9876543210" "Karnataka" "Bengaluru" "bba" "BBA" "CBSE" "Commerce" "480" "460" "96.0" "92.0" "Pursuing" "null" \
  "Set A" "88" "88.0" "Evaluated" \
  "{\"logical_reasoning_score\": 22, \"general_awareness_score\": 23, \"verbal_ability_score\": 21, \"comprehensive_reading_score\": 22}" \
  "Candidate displays extraordinary verbal fluidity, analytical accuracy, and fast reading skills. Highly recommended for top tier business cohorts."

# 2. BBA Student - Average Performer
insert_student_and_result \
  "Karan" "Patel" "Vijay Patel" "2005-09-22" "Male" "karan@patel.co" "9123456780" "Gujarat" "Ahmedabad" "bba" "BBA" "State Board" "Commerce" "390" "370" "78.0" "74.0" "Completed" "null" \
  "Set B" "54" "54.0" "Evaluated" \
  "{\"logical_reasoning_score\": 12, \"general_awareness_score\": 14, \"verbal_ability_score\": 13, \"comprehensive_reading_score\": 15}" \
  "Reasonable comprehension levels. General awareness is average. Might require soft skill alignment in initial semesters."

# 3. Engineering Student - Outstanding Math/Tech
insert_student_and_result \
  "Priyanka" "Sen" "Asok Sen" "2005-02-15" "Female" "priya@sen.org" "9940123456" "Tamil Nadu" "Chennai" "engineering" "Engineering" "CBSE" "MPC" "492" "488" "98.4" "97.6" "Pursuing" "null" \
  "Set C" "94" "94.0" "Evaluated" \
  "{\"physics_score\": 10, \"chemistry_score\": 9, \"mathematics_score\": 15, \"tech_awareness_score\": 5, \"aptitude_score\": 25, \"communication_score\": 13, \"programming_score\": 17}" \
  "Exceptional mathematics and core technical understanding. Excellent spatial reasoning and prompt engineering abilities."

# 4. Engineering Student - Flagged for Malpractice
insert_student_and_result \
  "Vijay" "Kumar" "Ramesh Kumar" "2004-11-05" "Male" "vijay@kumar.com" "9845012345" "Andhra Pradesh" "Vijayawada" "engineering" "Engineering" "State Board" "MPC" "420" "380" "84.0" "76.0" "Completed" "null" \
  "Set C" "30" "30.0" "Malpractice" \
  "{\"physics_score\": 3, \"chemistry_score\": 2, \"mathematics_score\": 5, \"tech_awareness_score\": 1, \"aptitude_score\": 10, \"communication_score\": 4, \"programming_score\": 5}" \
  "Flagged by automated proctoring AI for multiple tab switches and unauthorized speech detection during the technical coding section."

# 5. Arts & Science - High Performer
insert_student_and_result \
  "Sneha" "Paul" "Subir Paul" "2005-08-19" "Female" "sneha@paul.in" "9007012345" "West Bengal" "Kolkata" "arts_science" "Arts & Science" "ISC" "Humanities" "460" "450" "92.0" "90.0" "Pursuing" "null" \
  "Set A" "82" "82.0" "Evaluated" \
  "{\"accounts_score\": 8, \"commerce_score\": 9, \"mathematics_score\": 13, \"tech_awareness_score\": 4, \"aptitude_score\": 22, \"communication_score\": 12, \"programming_score\": 14}" \
  "Very clear logic, excellent scoring in commerce and communicative english. Consistent across both verbal and mathematical sections."

# 6. MBA Student - High Performer (with UG details)
insert_student_and_result \
  "Lakshmi" "Reddy" "M. Reddy" "2003-01-20" "Female" "lakshmi@reddy.edu" "9848012345" "Telangana" "Hyderabad" "mba" "MBA" "CBSE" "Commerce" "440" "430" "88.0" "86.0" "Completed" "8.8" \
  "Set C" "89" "89.0" "Evaluated" \
  "{\"logical_reasoning_score\": 23, \"managerial_aptitude_score\": 23, \"ai_knowledge_score\": 21, \"verbal_ability_score\": 22}" \
  "Shows mature leadership insights, strong structured thinking, and modern knowledge of commercial AI systems. Premium cohort standard."

# 7. MBA Student - Low Performer
insert_student_and_result \
  "Rahul" "Deshmukh" "A. Deshmukh" "2002-10-14" "Male" "rahul@deshmukh.co" "9766012345" "Maharashtra" "Pune" "mba" "MBA" "State Board" "Arts" "350" "340" "70.0" "68.0" "Completed" "6.2" \
  "Set B" "41" "41.0" "Evaluated" \
  "{\"logical_reasoning_score\": 10, \"managerial_aptitude_score\": 11, \"ai_knowledge_score\": 9, \"verbal_ability_score\": 11}" \
  "Struggles with numeric analytical concepts. Shows potential in verbal expression, but requires foundation quantitative coaching."

# 8. MCA Student - Technical Standout
insert_student_and_result \
  "Rohit" "Sharma" "Prasad Sharma" "2003-06-30" "Male" "rohit@sharma.dev" "9920012345" "Maharashtra" "Mumbai" "mca" "MCA" "State Board" "Computer Science" "415" "420" "83.0" "84.0" "Completed" "8.2" \
  "Set D" "82" "82.0" "Evaluated" \
  "{\"logical_reasoning_score\": 21, \"mca_core_aptitude_score\": 22, \"ai_knowledge_score\": 19, \"verbal_ability_score\": 20}" \
  "Solid logic, core object-oriented knowledge, and high readiness for software roles. Recommended for fast-track developer slots."

# 9. MCA Student - Malpractice Case
insert_student_and_result \
  "Anusha" "Rao" "Krishna Rao" "2004-03-02" "Female" "anusha@rao.org" "9177012345" "Karnataka" "Mangaluru" "mca" "MCA" "CBSE" "MPC" "460" "440" "92.0" "88.0" "Completed" "7.9" \
  "Set A" "22" "22.0" "Malpractice" \
  "{\"logical_reasoning_score\": 5, \"mca_core_aptitude_score\": 6, \"ai_knowledge_score\": 6, \"verbal_ability_score\": 5}" \
  "Proctoring algorithm registered persistent secondary screen presence and unauthorized device utilization during the exam."

# 10. Engineering Student - Proficient Band
insert_student_and_result \
  "Aditya" "Verma" "Rajesh Verma" "2005-12-01" "Male" "aditya@verma.net" "9810012345" "Delhi" "New Delhi" "engineering" "Engineering" "CBSE" "MPC" "440" "450" "88.0" "90.0" "Pursuing" "null" \
  "Set B" "74" "74.0" "Evaluated" \
  "{\"physics_score\": 7, \"chemistry_score\": 8, \"mathematics_score\": 12, \"tech_awareness_score\": 4, \"aptitude_score\": 18, \"communication_score\": 11, \"programming_score\": 14}" \
  "Good performance overall. Analytical thinking and conceptual grasp are highly satisfactory. Recommended for mainstream engineering."

echo "Seeding completed successfully!"
