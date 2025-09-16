#!/usr/bin/env python3
"""
Simple DNS Server for dailymeeting.ocp
Automatically detects current IP and serves DNS records
"""

import socket
import struct
import threading
import time
import subprocess
import sys
from datetime import datetime

class SimpleDNSServer:
    def __init__(self, domain="dailymeeting.ocp", port=53):
        self.domain = domain
        self.port = port
        self.current_ip = None
        self.update_ip()
        
    def get_current_ip(self):
        """Get the current IP address of this machine"""
        try:
            # Method 1: Try to get the actual network IP by connecting to external service
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            
            # Only return if it's not localhost
            if ip != "127.0.0.1" and not ip.startswith("169.254"):
                return ip
                
        except Exception as e:
            print(f"Method 1 failed: {e}")
        
        try:
            # Method 2: Get all network interfaces
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            
            if local_ip != "127.0.0.1" and not local_ip.startswith("169.254"):
                return local_ip
                
        except Exception as e:
            print(f"Method 2 failed: {e}")
        
        try:
            # Method 3: Use subprocess to get IP from ipconfig
            if sys.platform == "win32":
                result = subprocess.run(['ipconfig'], capture_output=True, text=True)
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'IPv4 Address' in line and '172.23.' in line:
                        ip = line.split(':')[1].strip()
                        return ip
        except Exception as e:
            print(f"Method 3 failed: {e}")
        
        print("Warning: Could not detect network IP, using localhost")
        return "127.0.0.1"
    
    def update_ip(self):
        """Update the current IP address"""
        new_ip = self.get_current_ip()
        if new_ip != self.current_ip:
            self.current_ip = new_ip
            print(f"[{datetime.now()}] IP updated to: {self.current_ip}")
        return self.current_ip
    
    def create_dns_response(self, query_name, query_type):
        """Create a DNS response packet"""
        # DNS header (12 bytes)
        header = struct.pack('!HHHHHH', 
            0x8180,  # ID and flags (response, no error)
            1,       # Questions count
            1,       # Answers count
            0,       # Authority count
            0        # Additional count
        )
        
        # Question section
        question = b''
        for part in query_name.split('.'):
            question += struct.pack('B', len(part))
            question += part.encode()
        question += b'\x00'  # End of name
        question += struct.pack('!HH', query_type, 1)  # Type and class
        
        # Answer section
        answer = b''
        for part in query_name.split('.'):
            answer += struct.pack('B', len(part))
            answer += part.encode()
        answer += b'\x00'  # End of name
        answer += struct.pack('!HHIH', 
            1,      # Type (A record)
            1,      # Class (IN)
            300,    # TTL (5 minutes)
            4       # Data length (IPv4 = 4 bytes)
        )
        
        # Convert IP to bytes
        ip_parts = self.current_ip.split('.')
        answer += struct.pack('BBBB', 
            int(ip_parts[0]), int(ip_parts[1]), 
            int(ip_parts[2]), int(ip_parts[3])
        )
        
        return header + question + answer
    
    def handle_dns_query(self, data, addr):
        """Handle incoming DNS query"""
        try:
            # Parse DNS query
            if len(data) < 12:
                return
            
            # Extract query name
            pos = 12
            name_parts = []
            while pos < len(data) and data[pos] != 0:
                length = data[pos]
                pos += 1
                if pos + length > len(data):
                    return
                name_parts.append(data[pos:pos+length].decode())
                pos += length
            
            query_name = '.'.join(name_parts)
            query_type = struct.unpack('!H', data[pos+1:pos+3])[0]
            
            print(f"[{datetime.now()}] DNS query: {query_name} (type: {query_type}) from {addr[0]}")
            
            # Check if this is our domain
            if query_name.lower() == self.domain.lower() and query_type == 1:  # A record
                response = self.create_dns_response(query_name, query_type)
                return response
            else:
                print(f"[{datetime.now()}] Ignoring query for: {query_name}")
                
        except Exception as e:
            print(f"Error handling DNS query: {e}")
    
    def start_server(self):
        """Start the DNS server"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.bind(('0.0.0.0', self.port))
            print(f"[{datetime.now()}] DNS server started on port {self.port}")
            print(f"[{datetime.now()}] Serving {self.domain} -> {self.current_ip}")
            print(f"[{datetime.now()}] Others can now use: http://{self.domain}")
            
            while True:
                try:
                    data, addr = sock.recvfrom(512)
                    response = self.handle_dns_query(data, addr)
                    if response:
                        sock.sendto(response, addr)
                except Exception as e:
                    print(f"Error in main loop: {e}")
                    
        except PermissionError:
            print("ERROR: Port 53 requires administrator privileges!")
            print("Please run this script as administrator")
            print("Right-click and select 'Run as administrator'")
        except Exception as e:
            print(f"Error starting server: {e}")

def main():
    print("=== Local DNS Server for dailymeeting.ocp ===")
    print("This server will automatically detect your IP and serve DNS records")
    print("Others on the network can use: http://dailymeeting.ocp")
    print()
    
    server = SimpleDNSServer()
    
    # Start IP monitoring in background
    def monitor_ip():
        while True:
            time.sleep(60)  # Check every minute
            server.update_ip()
    
    monitor_thread = threading.Thread(target=monitor_ip, daemon=True)
    monitor_thread.start()
    
    # Start DNS server
    server.start_server()

if __name__ == "__main__":
    main() 