

import random

# List of tracks, opt-in prizes, and categories
tracks_options = ["Cloud Computing", "ML/AI", "AR/VR", "IOT", "OSM", "Open Innovation"]
opt_in_prizes_options = [
    "Best Domain Name from GoDaddy Registry",
    "Best Use of Streamlit",
    "Most Creative Use of Redis Cloud",
    "Best Use of Auth0",
    "Best Use of Soroban",
    "Best Use of Hedera",
]
category_options = [
    "Education",
    "E-governance",
    "Sustainable Development & Infrastructure",
    "Health and Informatics",
    "Tourism",
    "Out-Of-The-Box",
]

random_github_repos = [
  "https://github.com/rishadbaniya/hackfest_script",
  "https://github.com/ItsAash/lib_dsa",
  "https://github.com/ItsAash/GuitarTunes",
  "https://github.com/rishadbaniya/OneDegreeEquationStandardizer",
  "https://github.com/rishadbaniya/BhojanWithRojan",
  "https://github.com/nobel-sh/numerical_methods",
  "https://github.com/nobel-sh/port_scanner",
  "https://github.com/abhiyandhakal/team404-ku-pasal",
]


# Function to format a list with "and" separator for the last item
def format_with_and(lst):
    if len(lst) > 1:
        return ", ".join(lst[:-1]) + ", and " + lst[-1]
    elif len(lst) == 1:
        return lst[0]
    else:
        return ""


# Generate 50 dummy data entries
dummy_data = []
for _ in range(10):
    team_name = "Team " + "".join(random.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(random.randint(4, 10)))
    github_repo = random.choice(random_github_repos)
    tracks = '"' + format_with_and(random.sample(tracks_options, random.randint(1, len(tracks_options)))) + '"'
    opt_in_prizes = '"' + ", ".join(random.sample(opt_in_prizes_options, random.randint(1, len(opt_in_prizes_options)))) + '"'
    category = random.choice(category_options)
    dummy_data.append([team_name, github_repo, tracks, opt_in_prizes, category])

# Write the data to a CSV file
with open("dummy_data.csv", "w") as csv_file:
    csv_file.write("Team Name,Github Repository,Tracks,Opt-In Prizes,Category\n")
    for entry in dummy_data:
        csv_file.write(",".join(entry) + "\n")

print("Dummy data has been generated and saved to dummy_data.csv.")
