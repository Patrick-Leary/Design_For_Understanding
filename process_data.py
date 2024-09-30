import pandas as pd

data = pd.read_csv('data/US_Lightning_Forest_Fires.csv')

# Convert 'Fire_Date' to datetime
data['Fire_Date'] = pd.to_datetime(data['Fire_Date'], format='%m-%d-%Y')

# Extract year
data['Year'] = data['Fire_Date'].dt.year

# Group by year and state, then calculate totals
processed_data = data.groupby(['Year', 'STATE']).agg(
    Total_Fires=('FIRE_SIZE', 'size'),  # Count of fires
    Total_Fire_Size=('FIRE_SIZE', 'sum')
).reset_index()

# Save the processed data to a new CSV file
processed_data.to_csv('data/processed_wildfire_data_yearly.csv', index=False)

print("Processed data has been saved to 'data/processed_wildfire_data_yearly.csv'")


# Calculating average fire size per year
yearly_firesize = data.groupby(['Year']).agg(
    Total_Fires=('FIRE_SIZE', 'size'),  # Count of fires
    Total_Fire_Size=(
        'FIRE_SIZE', 'sum')
).reset_index()

yearly_firesize['Average_Fire_Size'] = yearly_firesize['Total_Fire_Size'] / \
    yearly_firesize['Total_Fires']

# Save AVG FIRE SIZE YEARLY data to csv
yearly_firesize.to_csv('data/avg_firesize_yearly.csv', index=False)
