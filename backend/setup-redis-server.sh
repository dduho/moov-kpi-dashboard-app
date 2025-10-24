# Redis setup script for 10.80.3.159
# Run this script on the Redis server (10.80.3.159)

echo "🔍 Checking Redis status..."

# Check if Redis is running
if pgrep -x "redis-server" > /dev/null; then
    echo "✅ Redis is already running"
    redis-cli ping
else
    echo "❌ Redis is not running"

    # Try to start Redis with systemctl
    if command -v systemctl &> /dev/null; then
        echo "🚀 Starting Redis with systemctl..."
        sudo systemctl start redis-server
        sleep 2

        if sudo systemctl is-active --quiet redis-server; then
            echo "✅ Redis started successfully with systemctl"
            redis-cli ping
        else
            echo "❌ Failed to start Redis with systemctl"
        fi
    fi

    # If systemctl failed, try starting directly
    if ! pgrep -x "redis-server" > /dev/null; then
        echo "🚀 Starting Redis directly..."
        redis-server --daemonize yes --bind 0.0.0.0
        sleep 2

        if pgrep -x "redis-server" > /dev/null; then
            echo "✅ Redis started successfully"
            redis-cli ping
        else
            echo "❌ Failed to start Redis"
            echo "💡 Try installing Redis: sudo apt update && sudo apt install redis-server"
        fi
    fi
fi

echo ""
echo "🔧 Redis configuration check:"
echo "📄 Redis config location: /etc/redis/redis.conf"
echo "🔍 Check these settings:"
echo "   - bind 0.0.0.0  (allows external connections)"
echo "   - protected-mode no  (if needed)"
echo "   - requirepass yourpassword  (if authentication needed)"

echo ""
echo "🧪 Test connection from application server:"
echo "   redis-cli -h 10.80.3.159 ping"