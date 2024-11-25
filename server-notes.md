Here’s how the server is configured on an Amazon EC2 instance (m6i.xlarge) running Ubuntu (x86 architecture):
	•	Instance Type: Amazon EC2 m6i.xlarge
	•	Operating System: Ubuntu (x86)
	•	Number of Processors (nproc): 4

Summary of System and Server Configuration

	•	Build Info:
  	•	Build Version: 4104 (commit 0fff7fd7)
  	•	Compiler: cc (Ubuntu 13.2.0-23ubuntu4) 13.2.0
  	•	Target Architecture: x86_64-linux-gnu
	•	System Info:
  	•	Threads:
     	•	Number of Threads (n_threads): 2
     	•	Batch Threads (n_threads_batch): 2
     	•	Total Threads: 4
	•	Supported Features:
  	•	Enabled: AVX, AVX2, FMA, F16C, SSE3, SSSE3, LLAMAFILE
	•	Server Info:
  	•	HTTP Threads: 3

# llama.cpp setup

Prerequisites

Ensure your system is up-to-date and you have git and curl installed. Below are the step-by-step instructions for installing and configuring llama.cpp with OpenBLAS and downloading a model using ollama-dl.

Step 0: Essentials

sudo apt update
sudo apt install build-essential

Step 1: Install OpenBLAS

OpenBLAS is a high-performance library used for linear algebra computations. Install it using the following commands:

sudo apt update
sudo apt install libopenblas-dev pkg-config

Step 2: Verify OpenBLAS Installation

Run this command to ensure OpenBLAS is installed:

dpkg -l | grep openblas

Step 3: Build llama.cpp with OpenBLAS

Clone the llama.cpp repository and follow its documentation to build with OpenBLAS support:

git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
make GGML_OPENBLAS=1

Step 4: Download Model with Ollama-dl

Use Ollama-dl to download a model. This example uses Mistral v0.3.

Clone the Ollama-dl Repository

git clone https://github.com/akx/ollama-dl.git
cd ollama-dl

Install uv

Download and install the uv runner, which is required to execute ollama_dl.py:

curl -LsSf https://astral.sh/uv/install.sh | sh

Download Model Weights

Run the following command to download the Mistral v0.3 model weights:

uv run ollama_dl.py mistral

Step 5: Run a Test Command

Navigate back to your llama.cpp directory and run the CLI test:

./llama-cli -m ../ollama-dl/library-<model>/<model-id>.gguf -p "We're no strangers to love"
./llama-cli -m ../ollama-dl/library-mistral/model-ff82381e2bea.gguf -p "We're no strangers to love"

Step 6: Start the llama.cpp Server

Run the server to host the model:

./llama-server -m ../ollama-dl/library-gemma-2b/model-c1864a5eb193.gguf -c 2048 --host 0.0.0.0 --metrics
./llama-server -m ../ollama-dl/library-mistral/model-ff82381e2bea.gguf -c 2048 --host 0.0.0.0 --metrics

Step 7: Interact with the Server

Make a Completion Request

Use curl to send a POST request to the server:

curl --request POST \
    --url http://3.22.112.35:8080/completion \
    --header "Content-Type: application/json" \
    --data '{"prompt": "Building a website can be done in 10 simple steps:","n_predict": 128, "stream": true}'

Check Server Health

Replace localhost with your server’s IP if applicable:

curl http://localhost:8080/health

Notes

	•	Ensure the paths to the model weights (model-ff82381e2bea.gguf) are correct.
	•	Replace the host IP and port as needed for your environment.
	•	If any issues arise, consult the respective repositories’ documentation for troubleshooting.
