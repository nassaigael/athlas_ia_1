import csv
import json
import os
import statistics
from collections import defaultdict, OrderedDict

SRC = os.path.join(os.path.dirname(__file__), "..", "source-data", "air_quality_clean.csv")

rows = []
with open(SRC, newline='', encoding='utf-8') as f:
	reader = csv.DictReader(f)
	for i, r in enumerate(reader):
		def num(k):
			v = r.get(k, "")
			if v is None or v == "":
				return None
			try:
				return float(v)
			except ValueError:
				return None


		item = {
			"id": i + 1,
			"ville": r["ville"],
			"pays": r["pays"],
			"latitude": float(r["latitude"]),
			"longitude": float(r["longitude"]),
			"timestamp_utc": r["timestamp_utc"],
			"date": r["date"],
			"heure": int(r["heure"]),
			"jour_semaine": r["jour_semaine"],
			"is_weekend": r["is_weekend"] == "True",
			"aqi": int(num("aqi")) if num("aqi") is not None else None,
			"co": num("co"),
			"no": num("no"),
			"no2": num("no2"),
			"o3": num("o3"),
			"so2": num("so2"),
			"pm2_5": num("pm2_5"),
			"pm10": num("pm10"),
			"nh3": num("nh3"),
		}
		rows.append(item)

print("total rows", len(rows))

cities = OrderedDict()
for r in rows:
	if r["ville"] not in cities:
		cities[r["ville"]] = {
			"id": r["ville"],
			"ville": r["ville"],
			"pays": r["pays"],
			"latitude": r["latitude"],
			"longitude": r["longitude"],
		}
cities_list = list(cities.values())

POLLUTANTS = ["co", "no", "no2", "o3", "so2", "pm2_5", "pm10", "nh3"]

city_rows = defaultdict(list)
for r in rows:
	city_rows[r["ville"]].append(r)

for c in cities_list:
	crows = sorted(city_rows[c["ville"]], key=lambda x: x["timestamp_utc"])
	c["nb_mesures"] = len(crows)
	c["date_min"] = crows[0]["timestamp_utc"]
	c["date_max"] = crows[-1]["timestamp_utc"]
	aqis = [x["aqi"] for x in crows if x["aqi"] is not None]
	c["aqi_moyen"] = round(statistics.mean(aqis), 2) if aqis else None
	c["aqi_dernier"] = crows[-1]["aqi"]
	c["derniere_mesure"] = crows[-1]["timestamp_utc"]
	for p in POLLUTANTS:
		vals = [x[p] for x in crows if x[p] is not None]
		c[f"{p}_moyen"] = round(statistics.mean(vals), 3) if vals else None
	c["nh3_missing"] = sum(1 for x in crows if x["nh3"] is None)
	c["co_missing"] = sum(1 for x in crows if x["co"] is None)

daily = defaultdict(lambda: defaultdict(list))
daily_pm = defaultdict(lambda: defaultdict(list))
for r in rows:
	if r["aqi"] is not None:
		daily[r["date"]][r["ville"]].append(r["aqi"])
	if r["pm2_5"] is not None:
		daily_pm[r["date"]][r["ville"]].append(r["pm2_5"])

dates_sorted = sorted(daily.keys())
daily_trend = []
for d in dates_sorted:
	entry = {"date": d}
	for c in cities_list:
		v = daily[d].get(c["ville"])
		entry[c["ville"]] = round(statistics.mean(v), 2) if v else None
	daily_trend.append(entry)

JOURS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
heat = defaultdict(list)  # (jour, heure) -> [aqi]
for r in rows:
	if r["aqi"] is not None:
		heat[(r["jour_semaine"], r["heure"])].append(r["aqi"])

heatmap = []
for j in JOURS:
	for h in range(24):
		vals = heat.get((j, h), [])
		heatmap.append({
			"jour": j,
			"heure": h,
			"aqi_moyen": round(statistics.mean(vals), 2) if vals else None,
			"n": len(vals),
		})

cat_dist = []
for c in cities_list:
	crows = city_rows[c["ville"]]
	counts = {str(k): 0 for k in range(1, 6)}
	for x in crows:
		if x["aqi"] is not None:
			counts[str(x["aqi"])] += 1
	entry = {"ville": c["ville"]}
	entry.update(counts)
	cat_dist.append(entry)

pollutant_by_city = []
for c in cities_list:
	entry = {"ville": c["ville"]}
	for p in POLLUTANTS:
		entry[p] = c[f"{p}_moyen"]
	pollutant_by_city.append(entry)

out_dir = os.path.join(os.path.dirname(__file__), "..", "src", "data")
with open(f"{out_dir}/measures.json", "w", encoding="utf-8") as f:
	json.dump(rows, f, ensure_ascii=False)
with open(f"{out_dir}/cities.json", "w", encoding="utf-8") as f:
	json.dump(cities_list, f, ensure_ascii=False, indent=2)
with open(f"{out_dir}/daily_trend.json", "w", encoding="utf-8") as f:
	json.dump(daily_trend, f, ensure_ascii=False)
with open(f"{out_dir}/hourly_heatmap.json", "w", encoding="utf-8") as f:
	json.dump(heatmap, f, ensure_ascii=False)
with open(f"{out_dir}/aqi_category_distribution.json", "w", encoding="utf-8") as f:
	json.dump(cat_dist, f, ensure_ascii=False, indent=2)
with open(f"{out_dir}/pollutant_by_city.json", "w", encoding="utf-8") as f:
	json.dump(pollutant_by_city, f, ensure_ascii=False, indent=2)

print("cities:", [c["ville"] for c in cities_list])
print("date range:", dates_sorted[0], "->", dates_sorted[-1])
print("wrote files to", out_dir)
