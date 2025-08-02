import math
from scipy.stats import norm

SLA = 0.9995  # 99.95% availability
YEAR_DAYS = 365
YEAR_HOURS = 365 * 24
YEAR_SECONDS = 365 * 24 * 60 * 60

frequencies = {
    "once per day": YEAR_DAYS,
    "once per hour": YEAR_HOURS,
    "once per second": YEAR_SECONDS,
}

def user_sla_hit_rate_normal_approx(n, sla):
    """
    Returns the probability that a user observes at least SLA reliability,
    using the normal approximation to the binomial distribution.
    """
    allowed_failures = math.floor(n * (1 - sla))
    mu = n * (1 - sla)
    sigma = math.sqrt(n * sla * (1 - sla))
    z = (allowed_failures + 0.5 - mu) / sigma
    prob = norm.cdf(z)
    return prob * 100

print(f"{'Usage Frequency':<18}{'Num Uses':>12}{'User SLA Hit Rate (%)':>24}")
for label, n in frequencies.items():
    hit_rate = user_sla_hit_rate_normal_approx(n, SLA)
    print(f"{label:<18}{n:>12}{hit_rate:>24.8f}")
