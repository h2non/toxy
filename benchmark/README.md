# Benchmarking `toxy`

## Requirements

- Go +1.3
- vegeta - `go get github.com/tsenart/vegeta`

## Running benchmark

```
bash benchmark/run.sh
```

Supported optional arguments:
```
bash benchmark/run.sh [url] [rate] [duration]
```

Example:
```
bash benchmark/run.sh http://toxy.server:8080 200 15s
```

## Results

Using a Macbook Pro i7 2.7 Ghz 16 GB OSX Yosemite and `node.js@5.1.0`

##### Simple forward (100 req/sec)

```
# Running benchmark suite: forward
Requests  [total]       1000
Duration  [total, attack, wait]   9.991026326s, 9.988061106s, 2.96522ms
Latencies [mean, 50, 95, 99, max]   3.421935ms, 3.129796ms, 6.06351ms, 45.753661ms, 45.753661ms
Bytes In  [total, mean]     12000, 12.00
Bytes Out [total, mean]     0, 0.00
Success   [ratio]       100.00%
Status Codes  [code:count]      200:1000
```

##### Forward with payload with out poisoning (~2KB) (60 req/sec)

```
# Running benchmark suite: forward+payload
Requests  [total]       600
Duration  [total, attack, wait]   9.985138274s, 9.981650875s, 3.487399ms
Latencies [mean, 50, 95, 99, max]   3.791901ms, 3.414426ms, 7.079892ms, 49.46512ms, 49.46512ms
Bytes In  [total, mean]     7200, 12.00
Bytes Out [total, mean]     1033800, 1723.00
Success   [ratio]       100.00%
Status Codes  [code:count]      200:600
```

##### Forward with payload and bandwidth limit poison (~2KB) (60 req/sec)

```
# Running benchmark suite: forward+payload+bandwidth
Requests  [total]       600
Duration  [total, attack, wait]   10.990647856s, 9.983678999s, 1.006968857s
Latencies [mean, 50, 95, 99, max]   1.004988522s, 1.004387943s, 1.007819375s, 1.050843636s, 1.050843636s
Bytes In  [total, mean]     7200, 12.00
Bytes Out [total, mean]     1033800, 1723.00
Success   [ratio]       100.00%
Status Codes  [code:count]      200:600
```

##### Forward with payload with slow read poison (~2KB) (60 req/sec)

```
# Running benchmark suite: forward+payload+slow-read
Requests  [total]       600
Duration  [total, attack, wait]   10.988356629s, 9.982611119s, 1.00574551s
Latencies [mean, 50, 95, 99, max]   1.005915476s, 1.00415752s, 1.006969035s, 1.121979025s, 1.121979025s
Bytes In  [total, mean]     7200, 12.00
Bytes Out [total, mean]     1033800, 1723.00
Success   [ratio]       100.00%
Status Codes  [code:count]      200:600
```
