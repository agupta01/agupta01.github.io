# Observed Reliability is Not Designed Reliability

I was running in Greenpoint earlier today — the plan was to run up from my apartment (in Williamsburg) to the Greenpoint Ave stop on the G train, then to take the train back down to get home. However, when I got to the Greenpoint Ave stop, I saw a sign stating "The G train is not running between Court Square and Bedford Nostrand Avs."

Shucks!

For those of you who live in the Williamsburg/Greenpoint neighborhoods, you probably know that recently, track maintenance on both the L and G lines have caused multiple sections of both lines to shut down every weekend. Sometimes it's just a stretch between two stops, which is not that bad — one can just walk between them. Other times (like today), it's a whole section, and riders must rely on slow, unreliable shuttle buses to get to their destination.

So this got me wondering: how is the reliability of a service actually experienced by users of it? I think about this often, partially because I work at an internet services company that asks the very same question. Internally, reliability metrics are almost *too good*. A service uptime of 95%, for example, is measured by a single "user" (usually a canary test suite) that hits the service at a fixed, constant interval. Real-life usage patterns are more sporadic; a population of users hit the service with different frequencies, and the service's reliability at the time of usage, over all usages, affects the user's "observed" reliability of the service. It turns out, the frequency of usage is an important predictor of a service's observed reliability.

Consider the following example:

1. A service (i.e. a subway line) is active 29/30 days in a month. One day per month, it is down for maintenance, repairs, etc.
2. Rider group A uses the subway line every day, rider group B uses the subway line twice per month, and rider group C uses the subway line every week (4/mo).
3. An uptime SLA of 96.67%. As far as the line's maintainers are concerned, their service meets the SLA as it's up 29/30 days in the month.

### Rider Group A
This group will always encounter the "down" day, so 100% of this group will experience exactly a 96.67% uptime. 100% of this rider group observes an uptime that meets the SLA.

### Rider Group B
This group can observe the service's health any 2 days in the month, sampled with replacement. We follow a hypergeometric distribution to calculate observed uptimes for the groups who observe 100% uptime (2/2 days) and 50% uptime (1/2 days) here:

$$P(100\\%~\text{uptime observed}) = \frac{\binom{29}{2}}{\binom{30}{2}} \approx 93.34 \\%$$

$$P(50\\%~\text{uptime observed}) = \frac{\binom{29}{1}}{\binom{30}{2}} \approx 6.67 \\%$$

So, in this rider group, **6.67%** of the group is expected to experience service that does not meet the line's self-imposed SLA. But it gets worse...

### Rider group C
This group can observe the service's health any 4 days in the month. Using the same approach as above to calculate the probability of expected uptimes (note that 1/4 and 2/4 cases are not possible given any observer can only observe max 1 down day a month):

$$P(100\\%~\text{uptime observed}) = \frac{\binom{29}{4}}{\binom{30}{4}} \approx 86.67 \\%$$

$$P(75\\%~\text{uptime observed}) = \frac{\binom{29}{3}}{\binom{30}{4}} \approx 13.34 \\%$$

So, in this rider group, **13.34%** of the group is expected to experience service that does not meet the line's self-imposed SLA.

### The Full Curve

If we play the above scenario for every single usage rate up until 1/day, we start to observe some patterns. The formula used here is an extension of the one used above, which is simplified because the only "SLA miss" case is one in which a rider hits the single day of downtime:

$$P(\text{SLA met} | n\~\text{days used}) = 1 - P(\text{1 down day observed}| n\~\text{days used}) = 1 - \frac{\binom{29}{n - 1}}{\binom{30}{n}}$$

![SLA hit rate vs. usage frequency](../blog/images/sla_hit_rate_scatterplot.png)

**In all cases, "observed" SLA never exceeds the "design" SLA of the service!** This reveals a counterintuitive trap: the more a user uses the service, the more likely they are to *feel* like it's broken, even if the service technically meets its SLA. The only case in which this equalizes is when a rider uses the service exactly enough to always force observe single failure, essentially guaranteeing an equal lower and upper bound on observed reliability.

## A worked example: S3 Express One Zone

For a more realistic version of this setting, consider AWS S3 Express One Zone, an ultra-low latency storage class of S3 that was launched in 2023 and boasts single-digit millisecond data access. According to AWS, this service is "designed" to deliver 99.95% availability<a href="#1"><sup>1</sup></a>.

Let's write a simulation to estimate what percentage of users will actually observe this SLA over an evaluation period of 1 year for 3 different usage tiers:
1. Once per day (365 invocations)
2. Once per hour ($365 \times 24 = 8760$ invocations)
3. Once per second ($365 \times 24 \times 3600 \approx 31.5$M invocations)

We'll use the normal distribution to approximate the binomial from the above formulas. Given the size of the numbers we are dealing with now, this is a reasonable approximation.

```python
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
```

```
Usage Frequency       Num Uses   User SLA Hit Rate (%)
once per day               365             77.13793676
once per hour             8760             52.28678229
once per second       31536000             49.84110903
```

Once again, we see the same pattern: as usage frequency increases, the probability that one meets or exceeds the designed availability drops. For users who use one-zone at least once per second (which is reasonable to assume for a low-latency high-throughput optimized storage tier), they should expect to miss the SLA more often than meet it (P = 49.84%)<a href="#3"><sup>3</sup></a>.

## Conclusion: Design SLA vs. Observed SLA

Closely looking at the numbers from the first example reveals that in all cases, the expected value of the observed uptime is at or close to 96.67% in all cases. This makes sense because over the span of "usages" to the service, the resulting response rate (the rate of instances the service is up/healthy) still averages about 96.67%.

This highlights a gap between "design" reliability and "observed" reliability. Customers experience the service (a) in isolation and (b) in a binary (it's either up or down)<a href="#2"><sup>2</sup></a>. I've often noticed "design" SLAs referred to in engineering discussions as the litmus test of user experience — yes, while design SLAs are a useful tool to determine, directionally, the trend of the service's reliability, it only represents an **upper bound** on the user experience. Meanwhile, observed reliability is both a function of the service's reliability as well as the user's frequency of usage. Crucially, the two are not independent.

---
<a name="thumbnail">*<a>: Thumbnail Credit: Photo by <a href="https://unsplash.com/@digitalunknown?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Piotr Osmenda</a> on <a href="https://unsplash.com/photos/grey-train-under-grey-clouds-WeNrlFHvG50?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
<a name="1"><sup>1</sup></a>: https://aws.amazon.com/s3/storage-classes/#topic-3
<a name="2"><sup>2</sup></a>: A caveat to this is that service latency, quality etc. also matter, but the uptime of a service is a prerequisite to all of those things.
<a name="3"><sup>3</sup></a>: S3 does offer [service credits](https://aws.amazon.com/s3/sla/) when service reliability dips below the guaranteed SLA, but this is still a guarantee for overall service reliability, not a single user's observed reliability.
