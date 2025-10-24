# Test local Redis setup
echo "🔍 Testing local Redis setup..."

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "❌ Redis is not installed"
    echo "💡 Install Redis:"
    echo "   Windows: Download from https://redis.io/download"
    echo "   WSL/Ubuntu: sudo apt update && sudo apt install redis-server"
    exit 1
fi

echo "✅ Redis is installed"

# Check if Redis is running
if pgrep -x "redis-server" > /dev/null 2>&1; then
    echo "✅ Redis is already running"
else
    echo "🚀 Starting Redis locally..."

    # Start Redis (adjust path for Windows)
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        redis-server --daemonize yes --bind 127.0.0.1
    else
        # Linux/WSL
        redis-server --daemonize yes --bind 127.0.0.1
    fi

    sleep 2

    if pgrep -x "redis-server" > /dev/null 2>&1; then
        echo "✅ Redis started successfully"
    else
        echo "❌ Failed to start Redis"
        exit 1
    fi
fi

# Test connection
echo "🧪 Testing Redis connection..."
if redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis connection successful!"
    echo "🎉 You can now use REDIS_HOST=127.0.0.1 in your .env file"
else
    echo "❌ Redis connection failed"
fi