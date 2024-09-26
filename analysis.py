import pandas as pd
import numpy as np

# Read the CSV file
df = pd.read_csv('data/StudentPerformanceFactors.csv')

# Calculate the statistics
min_score = df['Exam_Score'].min()
avg_score = df['Exam_Score'].mean()
median_score = df['Exam_Score'].median()
max_score = df['Exam_Score'].max()

# Print the results
print(f"Minimum Exam Score: {min_score}")
print(f"Average Exam Score: {avg_score:.2f}")
print(f"Median Exam Score: {median_score}")
print(f"Maximum Exam Score: {max_score}")