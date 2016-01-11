#!/bin/bash
#
# Simple benchmark test suite for toxy
#
# You must have vegeta installed:
# go get github.com/tsenart/vegeta
#

#
# Benchmark config
#
url="http://localhost:9000" # default rocky proxy URL
rate=100                    # concurrent requests per second
duration=120s                # benchmark duration in human friendly format

#
# Overwrite from arguments, if present
#
[ ! -z $1 ] && url=$1
[ ! -z $2 ] && rate=$2
[ ! -z $3 ] && duration=$3

#
# Private variables
#
current=0
proxyPid=0
serverPid=0

if [ -z `which vegeta` ]; then
  echo "Error: vegeta binary not found. Run: go get github.com/tsenart/vegeta"
  exit 1
fi

cd `dirname $0`

target_server() {
  node servers & > /dev/null
  serverPid=$!
}

proxy_server() {
  node suites/$1 & > /dev/null
  proxyPid=$!
}

before() {
  proxy_server $1
  target_server
  sleep 1
}

after() {
  disown $serverPid
  disown $proxyPid
  kill -9 $serverPid
  kill -9 $proxyPid
}

get_benchmark() {
  echo "GET $url" \
  | vegeta attack \
    -duration=$duration \
    -rate=$rate \
  | vegeta report
}

post_benchmark() {
  echo "POST $url" \
  | vegeta attack \
    -duration=$duration \
    -rate=60 \
    -timeout=60s \
    -body="../test/fixtures/$1.json" \
  | vegeta report
}

post_payload_benchmark() {
  post_benchmark "sample"
}

test() {
  before $2

  echo "# Running benchmark suite: $1"
  $3 # run test function!
  echo

  after
}

#
# Run suites
#
test "forward" "forward" get_benchmark
test "forward+payload" "forward-with-payload" post_payload_benchmark
test "forward+payload+bandwidth" "forward-with-payload-bandwidth" post_payload_benchmark
test "forward+payload+slow-read" "forward-with-payload-slowread" post_payload_benchmark

exit $?
