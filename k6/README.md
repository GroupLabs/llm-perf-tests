# Existing Bench
One of the recommended bench scripts from the llama.cpp repository is forked and modified as llamacpp_bench/llamacpp_bench.js. Note that this approach samples prompts from a dataset.

To use do the following:
```
# build k6 with the sse extension through the xk6 system

go install go.k6.io/xk6/cmd/xk6@latest
xk6 build v0.51.0 --with github.com/phymbert/xk6-sse@v0.1.2

# download a dataset

wget https://huggingface.co/datasets/anon8231489123/ShareGPT_Vicuna_unfiltered/resolve/main/ShareGPT_V3_unfiltered_cleaned_split.json

# this will build a binary that may be different than the one in the system path. So from the k6/ directory, run:

./k6 run llamacpp_bench.js --duration 10m --iterations 500 --vus 8
```

# Recommended Benches

The following is an improved version designed to:
  a. not perturb the input; this may affect the prompt eval time unfairly
  b. add (proxied) measurements for the time to first token, and other metrics

> Note: Since the server starts generating the body right away, we use the time_to_first_byte_ms as a proxy measurement for the time to first token.

Make sure to check that this is the latest k6 (v0.54.0 or greater) with:

`k6 --version`

Run the various test types with:

`TEST_TYPE=<test-type> k6 run script.js`

For example, for the smoke test run:

`TEST_TYPE=smoke k6 run script.js`

This will default to a smoke test if no options are given.

The options include:
- smoke
- average
- stress
- soak
- spike
- breakpoint

To start a web dashboard:

`K6_WEB_DASHBOARD=true TEST_TYPE=smoke k6 run script.js`

To generate HTML reports:

`K6_WEB_DASHBOARD_EXPORT=<html-name>.html TEST_TYPE=smoke k6 run script.js`
