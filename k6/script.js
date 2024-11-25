import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

// custom metrics
const timeToFirstByte = new Trend("time_to_first_byte_ms");
const tokensPerSecond = new Trend("tokens_per_second");
const totalTokensGenerated = new Counter("total_tokens_generated");

// payload configuration
const SERVER_URL = "http://3.147.7.119:8080/completion";
const PROMPT = "Once upon a time";

// select test type via environment variable
const TEST_TYPE = __ENV.TEST_TYPE || "smoke";

// tests
const testConfigurations = {
  smoke: {
    stages: [
      { duration: "30s", target: 1 }, // Ramp-up to 1 user over 30 seconds
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
    },
  },
  average: {
    stages: [
      { duration: "1m", target: 1 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 2 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 3 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 4 }, // Ramp-up to 5 users over 1 minute
      { duration: "10m", target: 3 }, // Maintain 5 users for 10 minutes
      { duration: "1m", target: 0 }, // Ramp-down to 0 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
      http_req_failed: ["rate<0.01"], // Less than 1% of requests can fail
    },
  },
  average25: {
    stages: [
      { duration: "1m", target: 5 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 10 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 15 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 20 }, // Ramp-up to 5 users over 1 minute
      { duration: "10m", target: 25 }, // Maintain 5 users for 10 minutes
      { duration: "1m", target: 0 }, // Ramp-down to 0 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
      http_req_failed: ["rate<0.01"], // Less than 1% of requests can fail
    },
  },
  average20: {
    stages: [
      { duration: "1m", target: 5 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 10 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 15 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 20 }, // Ramp-up to 5 users over 1 minute
      { duration: "10m", target: 20 }, // Maintain 5 users for 10 minutes
      { duration: "1m", target: 0 }, // Ramp-down to 0 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
      http_req_failed: ["rate<0.01"], // Less than 1% of requests can fail
    },
  },
  average15: {
    stages: [
      { duration: "1m", target: 5 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 10 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 15 }, // Ramp-up to 5 users over 1 minute
      { duration: "10m", target: 15 }, // Maintain 5 users for 10 minutes
      { duration: "1m", target: 0 }, // Ramp-down to 0 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
      http_req_failed: ["rate<0.01"], // Less than 1% of requests can fail
    },
  },
  average10: {
    stages: [
      { duration: "1m", target: 5 }, // Ramp-up to 5 users over 1 minute
      { duration: "1m", target: 10 }, // Ramp-up to 5 users over 1 minute
      { duration: "5m", target: 10 }, // Ramp-up to 5 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
      http_req_failed: ["rate<0.01"], // Less than 1% of requests can fail
    },
  },
  ramp: {
    stages: [
      { duration: "1m", target: 1 },
      { duration: "5m", target: 2 },
      { duration: "5m", target: 4 },
      { duration: "5m", target: 8 },
      { duration: "5m", target: 16 },
      { duration: "5m", target: 32 },
      { duration: "5m", target: 50 },
      { duration: "5m", target: 64 },
      { duration: "5m", target: 80 },
      { duration: "5m", target: 128 },
      { duration: "1m", target: 0 }, // Ramp-down to 0 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
      http_req_failed: ["rate<0.01"], // Less than 1% of requests can fail
    },
  },
  ramp200: {
    stages: [
      { duration: "5m", target: 20 },
      { duration: "5m", target: 50 },
      { duration: "5m", target: 100 },
      { duration: "5m", target: 150 },
      { duration: "5m", target: 200 },
      { duration: "5m", target: 200 },
      { duration: "1m", target: 0 }, // Ramp-down to 0 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
      http_req_failed: ["rate<0.01"], // Less than 1% of requests can fail
    },
  },
  stress: {
    stages: [
      { duration: "2m", target: 20 }, // Ramp-up to 20 users over 2 minutes
      { duration: "5m", target: 20 }, // Maintain 20 users for 5 minutes
      { duration: "2m", target: 30 }, // Ramp-up to 30 users over 2 minutes
      { duration: "5m", target: 30 }, // Maintain 30 users for 5 minutes
      { duration: "2m", target: 0 }, // Ramp-down to 0 users over 2 minutes
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<1000"], // Average time to first byte under 1 second
    },
  },
  soak: {
    stages: [
      { duration: "10m", target: 10 }, // Ramp-up to 10 users over 10 minutes
      { duration: "10", target: 10 }, // Maintain 10 users for 2 hours
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<500"], // Average time to first byte under 500ms
    },
  },
  spike: {
    stages: [
      { duration: "1m", target: 10 }, // Ramp-up to 50 users over 1 minute
      { duration: "30s", target: 100 }, // Spike to 500 users over 30 seconds
      { duration: "2m", target: 20 }, // Drop back to 50 users over 2 minutes
      { duration: "1m", target: 0 }, // Ramp-down to 0 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<1000"], // Average time to first byte under 1 second
    },
  },
  breakpoint: {
    stages: [
      { duration: "1m", target: 1000 }, // Ramp-up to 1000 users over 1 minute
    ],
    thresholds: {
      http_req_duration: ["p(95)<15000"], // 95% of requests should be under 15 seconds
      time_to_first_byte_ms: ["avg<1000"], // Average time to first byte under 1 second
    },
  },
};

export let options = testConfigurations[TEST_TYPE] || testConfigurations.smoke;

export default function () {
  group("Completion Endpoint Test", function () {
    const payload = JSON.stringify({
      prompt: PROMPT,
      n_predict: 50,
      stream: true,
    });

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = http.post(SERVER_URL, payload, params);

    // Record time to first byte
    timeToFirstByte.add(res.timings.waiting);

    if (res.status === 200) {
      let tokensGenerated = 0;
      const lines = res.body.split("\n");

      // Process each line in the response
      for (let line of lines) {
        if (line.startsWith("data:")) {
          const dataContent = line.substring(5).trim();
          if (dataContent !== "[DONE]") {
            const tokenData = JSON.parse(dataContent);
            if (tokenData.content) {
              tokensGenerated++;
            }
          }
        }
      }

      totalTokensGenerated.add(tokensGenerated);

      // Calculate tokens per second
      const totalDuration = res.timings.duration / 1000;
      tokensPerSecond.add(tokensGenerated / totalDuration); // tokens per sec
    } else {
      console.error(`Request failed with status ${res.status}`);
    }

    sleep(1);
  });
}
