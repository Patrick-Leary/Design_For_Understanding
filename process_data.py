import pandas as pd

# Read the data
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

# Get the unique years and states
years = data['Year'].unique()
states = data['STATE'].unique()

# Create a complete set of year-state combinations
all_combinations = pd.MultiIndex.from_product([years, states], names=['Year', 'STATE']).to_frame(index=False)

# Merge the complete set with the processed data
complete_data = all_combinations.merge(processed_data, on=['Year', 'STATE'], how='left')

# Fill NaN values with 0
complete_data['Total_Fires'] = complete_data['Total_Fires'].fillna(0)
complete_data['Total_Fire_Size'] = complete_data['Total_Fire_Size'].fillna(0)

# Sort the data by Year and STATE
complete_data = complete_data.sort_values(['Year', 'STATE'])

# Save the processed data to a new CSV file
complete_data.to_csv('data/processed_wildfire_data_yearly.csv', index=False)

print("Processed data has been saved to 'data/processed_wildfire_data_yearly.csv'")


# Filter the data to remove rows where FIRE_SIZE is greater than 50,000
# TO DO ; to narrow down by fire size or not?
filtered_data = data[(data['FIRE_SIZE'] > 10000) & (data['FIRE_SIZE'] <= 50000)] 

# Save the filtered data to a new CSV file
filtered_data.to_csv("data/filtered_firesize_data.csv", index=False)

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


# Calculating average extinuishing time per year
yearly_exting = data.groupby(['Year']).agg(
    Total_Fires=('FIRE_SIZE', 'size'),  # Count of fires
    Total_Extinguish=(
        'Days_to_extinguish_fire', 'sum') #sum of time taken to extinguish all fires yearly
).reset_index()

yearly_exting['Average_Extinguish_Time'] = yearly_exting['Total_Extinguish'] / \
    yearly_exting['Total_Fires']

# Save AVG FIRE SIZE YEARLY data to csv
yearly_exting.to_csv('data/avg_extinguishing_yearly.csv', index=False)
