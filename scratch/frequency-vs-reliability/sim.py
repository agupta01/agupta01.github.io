import matplotlib.pyplot as plt
from math import comb

# Constants
TOTAL_DAYS = 30
UP_DAYS = 29
TRUE_UPTIME = UP_DAYS / TOTAL_DAYS  # 0.9667

n_values = []
sla_hit_rates = []

for n in range(1, TOTAL_DAYS + 1):
    # Probability of observing all up days (never hit the down day)
    if n > UP_DAYS:
        p_all_up = 0
    else:
        p_all_up = comb(UP_DAYS, n) / comb(TOTAL_DAYS, n)

    # Probability of observing one down day (hit the down day once)
    if n - 1 > UP_DAYS or n < 1:
        p_one_down = 0
    else:
        p_one_down = comb(UP_DAYS, n - 1) / comb(TOTAL_DAYS, n)

    # Observed uptimes
    uptime_all_up = 1.0
    uptime_one_down = (n - 1) / n if n > 1 else 0.0

    # Count cases where observed uptime > true uptime
    percent_cases = 0.0
    if uptime_all_up >= TRUE_UPTIME:
        percent_cases += p_all_up * 100
    if uptime_one_down >= TRUE_UPTIME:
        percent_cases += p_one_down * 100

    n_values.append(n)
    sla_hit_rates.append(percent_cases)

# Plotting
plt.style.use('ggplot')
plt.figure(figsize=(8, 5))
plt.scatter(n_values, sla_hit_rates, color='#cd9c9c', marker='o')
plt.title("SLA Hit Rate vs. Number of Usages in Month")
plt.xlabel("Number of Usages in Month")
plt.ylabel("SLA Hit Rate (% cases > 96.67% observed uptime)")
plt.ylim(0, 105)
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('sla_hit_rate_scatterplot.png')
