n = int(input())
for i in range(1, n+1):
    print(" " * (n-i) + " ".join(str(x) for x in range(1, i+1)))
for i in range(n-1, 0, -1):
    print(" " * (n-i) + " ".join(str(x) for x in range(1, i+1)))
