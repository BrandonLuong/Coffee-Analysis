import pandas as pd
import numpy as np

coffee = pd.read_csv('/Users/brandonluong/DSC106/Final Project/coffee_analysis.csv')

coffee.rename(columns={'100g_USD':'price'}, inplace=True)

coffee.to_csv('final_coffee.csv', index=False)