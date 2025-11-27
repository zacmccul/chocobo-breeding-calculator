# Chocobo Breeding Calculator!

## Breeding Mechanics


### Chocobo Ranking
A chocobo has two parents. Each parent has 5 stats, 1-5.
Breeding requires two chocobos.
When a child chocobo is bred, it selects from the father a value randomly from the father's parents for each stat, and for the mother it does the same. This means that when a chocobo has for its father and mother 5 and 5 stars, it will always pass on that 5 star. Additionally, it means two parents for say Max Speed have, the stats [1,5] and [5, 1] there's a 1/4 chance their offspring will get [5,5]. Because two chocobos can be bred 9 times, this means we expect when having multiple children to get one chocobo who hits our criteria to raise and bring to the next level. In all cases, we choose the best pairing.

What's the best pairing? It's one that maximizes if we breed them fully i.e. 9 times, since we always just pick the highest quality offspring. 

How do we determine what's a singular best chocobo? It's one that has the most stats with a 5 in it, followed by the most "locked" stats i.e. double 5 stats, followed by a complex rating system that penalizes high low-quality stats.

Here's an example using the following format:
Chocobo: [(5,1), (3,5), ...] 
wherein 5,1 means its father had a 5 in that stat, and its mother had a 1, with the stats in some fixed order.
Consider the chocobos
A: [(5,1), (3,5), (1,5)]
B: [(5,5), (5,5), (1,4)]
C: [(5,5), (1,3), (4,2)]
The order of most to least valuable chocobo would be A, B, C. The reason is B has no possible chance of giving its offspring a 5 in the third stat, meaning inbreeding will never result in a perfect chocobo without fresh blood.

### Breeding Choice
Now that we understand what the most valuable chocobo is, how do we optimize pairing to get the best possible chocobo in minimal racing steps?
Because we can breed 9 chocobos from a parent, only selecting the best one to raise, we need to look at expected value of the best possible chocobo from those 9 pairings, not the expected value of a single chocobo breeding.

Since there are only 1024 possibilities for a single chocobo breeding, 