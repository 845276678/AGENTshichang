#!/bin/bash

# Deploy script for AI Agent Marketplace
SERVER_IP="139.155.232.19"
USERNAME="ubuntu"
PASSWORD='{y%OwD63Bi[7V?jEX'
PROJECT_NAME="project-68d4f29defadf4d878ac0583"
DOMAIN="www.aijiayuan.top"

echo "Starting deployment to $SERVER_IP..."

# Function to run SSH commands
run_ssh_command() {
    expect -c "
        set timeout 60
        spawn ssh -o StrictHostKeyChecking=no $USERNAME@$SERVER_IP \"$1\"
        expect {
            \"*password*\" {
                send \"$PASSWORD\r\"
                expect \"*\$*\"
                send \"exit\r\"
            }
            timeout {
                puts \"Connection timeout\"
                exit 1
            }
        }
        expect eof
    "
}

# Check if project directory exists
echo "Checking server status..."
run_ssh_command "whoami && pwd && ls -la"

echo "Deployment script ready. Manual steps needed due to interactive SSH."