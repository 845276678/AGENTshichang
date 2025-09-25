# PowerShell SSH Deployment Script for AI Agent Marketplace
param(
    [string]$Server = "139.155.232.19",
    [string]$Username = "ubuntu",
    [string]$Password = "{y%OwD63Bi[7V?jEX",
    [string]$ProjectName = "project-68d4f29defadf4d878ac0583"
)

Write-Host "🚀 Starting deployment to $Server..." -ForegroundColor Green

# Function to execute SSH command with password
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Description = ""
    )

    if ($Description) {
        Write-Host "📋 $Description" -ForegroundColor Cyan
    }

    try {
        # Create a secure string for password
        $SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
        $Credential = New-Object System.Management.Automation.PSCredential($Username, $SecurePassword)

        # Execute SSH command (this requires PowerShell SSH module or similar)
        Write-Host "Executing: $Command" -ForegroundColor Yellow

        # For now, let's output the command that would be run
        Write-Host "SSH Command: ssh $Username@$Server '$Command'" -ForegroundColor Gray

    } catch {
        Write-Error "Failed to execute command: $Command"
        Write-Error $_.Exception.Message
    }
}

# Deployment steps
Write-Host "🔍 Step 1: Checking server status..."
Invoke-SSHCommand "whoami && pwd && ls -la" "Checking server environment"

Write-Host "📁 Step 2: Setting up project directory..."
Invoke-SSHCommand "if [ -d '$ProjectName' ]; then cd $ProjectName && git pull origin master; else git clone https://github.com/845276678/AGENTshichang.git $ProjectName && cd $ProjectName; fi" "Clone/update project"

Write-Host "📦 Step 3: Installing dependencies..."
Invoke-SSHCommand "cd $ProjectName && npm install" "Installing npm packages"

Write-Host "🔨 Step 4: Building application..."
Invoke-SSHCommand "cd $ProjectName && npm run build" "Building Next.js application"

Write-Host "🚀 Step 5: Starting application..."
Invoke-SSHCommand "cd $ProjectName && chmod +x quick_deploy.sh && ./quick_deploy.sh" "Running deployment script"

Write-Host "✅ Deployment commands prepared. Manual execution may be required." -ForegroundColor Green

# Output manual commands for reference
Write-Host "`n📋 Manual SSH Commands:" -ForegroundColor Yellow
Write-Host "ssh $Username@$Server" -ForegroundColor White
Write-Host "# Password: $Password" -ForegroundColor Gray
Write-Host "cd $ProjectName" -ForegroundColor White
Write-Host "git pull origin master" -ForegroundColor White
Write-Host "./quick_deploy.sh" -ForegroundColor White