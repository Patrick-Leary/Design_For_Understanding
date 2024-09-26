import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam

# Load the data from CSV file
data = pd.read_csv('data/StudentPerformanceFactors.csv')

# Select relevant features
features = ['Hours_Studied', 'Attendance', 'Sleep_Hours']
X = data[features]
y = data['Exam_Score']

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Create the neural network model
model = Sequential([
    Dense(64, activation='relu', input_shape=(3,)),
    Dense(32, activation='relu'),
    Dense(16, activation='relu'),
    Dense(1)
])

# Compile the model
model.compile(optimizer=Adam(learning_rate=0.001), loss='mean_squared_error')

# Train the model
history = model.fit(X_train_scaled, y_train, epochs=100, batch_size=32, validation_split=0.2, verbose=0)

# Evaluate the model
test_loss = model.evaluate(X_test_scaled, y_test, verbose=0)
print(f"Test Loss: {test_loss}")

# Function to predict exam score
def predict_exam_score(hours_studied, attendance, sleep_hours):
    input_data = np.array([[hours_studied, attendance, sleep_hours]])
    scaled_input = scaler.transform(input_data)
    prediction = model.predict(scaled_input)[0][0]
    return max(0, min(100, prediction))  # Clip prediction between 0 and 100

# Example prediction
example_hours_studied = 10
example_attendance = 95
example_sleep_hours = 8

predicted_score = predict_exam_score(example_hours_studied, example_attendance, example_sleep_hours)
print(f"Predicted exam score: {predicted_score:.2f}")