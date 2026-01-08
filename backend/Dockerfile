FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements first (better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose Hugging Face port
EXPOSE 7860

# Start FastAPI app (NO --reload)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]