#!/usr/bin/env python3
"""
Simple sshpass replacement using Python
Usage: python3 ssh_with_password.py <password> <ssh_command>
"""

import sys
import subprocess
import os
from subprocess import Popen, PIPE, STDOUT

def ssh_with_password(password, ssh_command):
    """Execute SSH command with password using Python"""

    # Create the full command
    cmd = ssh_command.split()

    try:
        # Start the SSH process
        process = Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=STDOUT, text=True)

        # Send the password when prompted
        stdout, _ = process.communicate(input=password + '\n', timeout=30)

        print(stdout)
        return process.returncode

    except subprocess.TimeoutExpired:
        process.kill()
        print("SSH connection timed out")
        return 1
    except Exception as e:
        print(f"Error: {e}")
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 ssh_with_password.py <password> '<ssh_command>'")
        sys.exit(1)

    password = sys.argv[1]
    ssh_command = ' '.join(sys.argv[2:])

    exit_code = ssh_with_password(password, ssh_command)
    sys.exit(exit_code)